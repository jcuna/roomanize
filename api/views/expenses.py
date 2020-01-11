import os
import base64
import hashlib
import threading
from datetime import datetime
from io import BytesIO
from mimetypes import guess_all_extensions

from flask_socketio import emit
from sqlalchemy.orm import joinedload
from sqlalchemy.orm.attributes import flag_modified
from flask import request
from PIL import Image, ExifTags, ImageOps

from config import configs
from config.constants import RECEIPT_STORAGE_PATH, RECEIPT_STORAGE_THUMBNAILS
from core import API, Cache
from core.AWS import Storage
from core.middleware import HttpException
from core.utils import local_to_utc
from dal.models import UserToken, Expense, db
from dal.shared import token_required, access_required, Paginator
from views import Result


class Expenses(API):

    @token_required
    @access_required
    def get(self, expense_id=None):
        page = int(request.args.get('page', 1))

        if expense_id:
            ex = Expense.query.filter_by(id=expense_id).first()
            if ex:
                s3 = Storage(configs.AWS_FILE_MANAGER_BUCKET_NAME)
                row = dict(ex)
                row['signed_urls'] = []
                if ex.receipt_scans:
                    [row['signed_urls'].append({
                        'object': obj_key,
                        'thumbnail': Cache.remember(
                            't_%s' % obj_key,
                            lambda: s3.sign_url(RECEIPT_STORAGE_THUMBNAILS + obj_key),
                            14400
                        ),
                        'full': Cache.remember(
                            'f_%s' % obj_key,
                            lambda: s3.sign_url(RECEIPT_STORAGE_PATH + obj_key),
                            14400
                        )
                    }
                    ) for obj_key in ex.receipt_scans]

                return row
            else:
                raise HttpException('Not found')

        else:
            paginator = Paginator(Expense.query, page, request.args.get('orderBy'), request.args.get('orderDir'))
            total_pages = paginator.total_pages
            result = paginator.get_items()

        return Result.paginate(result, page, total_pages)

    def put(self):
        data = request.get_json()
        if 'expire' in data and 'token' in data:
            ut = UserToken.query.filter_by(token=data['token']).first()
            ut.expires = datetime.utcnow()
            db.session.commit()

        return Result.success()

    @token_required
    @access_required
    def post(self, expense_id=None):
        # upon clicking continue on front end,
        # user will post current expense data and this will return a token to upload scans
        data = request.get_json()

        if expense_id:
            expense = Expense.query.filter_by(id=expense_id).first()
            if not expense:
                raise HttpException('Invalid id')
        elif 'amount' in data and 'description' in data and 'date' in data:
            expense = Expense(
                amount=data['amount'],
                project_id=request.user.attributes.preferences['default_project'],
                expense_date=local_to_utc(data['date']),
                description=data['description']
            )
            db.session.add(expense)
            db.session.commit()
        else:
            raise HttpException('Invalid Request')

        if 'nonce' in data:
            domain = configs.EXTERNAL_DEV_URL if hasattr(configs, 'EXTERNAL_DEV_URL') else ''
            ut = UserToken(user_id=request.user.id)
            ut.new_token(data['nonce'])

            ut.target = '/expense-scans/' + ut.token + '/' + str(expense.id)
            db.session.add(ut)
            db.session.commit()

            return Result.custom({'token': ut.token, 'domain': domain, 'id': expense.id})

        raise HttpException('Invalid Request')


class ExpenseScans(API):
    def get(self, token, expense_id):
        # return basic user ino upon validating token so front end can show an upload scan form
        ut = self.validate_token(token, request)

        return {
            'user': ut.user.first_name + ' ' + ut.user.last_name
        }

    def put(self, token, expense_id):
        self.validate_token(token, request)
        expense = Expense.query.filter_by(id=expense_id).first()

        if not expense:
            raise HttpException('Invalid id')

        obj_key = request.get_json()['object_name']
        dir = -90 if request.get_json()['dir'] == 'right' else 90
        ext = obj_key.split('.')[1]
        s3 = Storage(configs.AWS_FILE_MANAGER_BUCKET_NAME)

        b_thumb = s3.get_file(RECEIPT_STORAGE_THUMBNAILS + obj_key)

        if not b_thumb:
            raise HttpException('Invalid object name')

        thumb = Image.open(BytesIO(b_thumb['Body'].read()))
        thumb_out = thumb.rotate(dir, Image.NEAREST, expand = 1)

        with BytesIO() as output2:
            thumb_out.save(output2, ext)
            s3.put_new(output2.getvalue(), RECEIPT_STORAGE_THUMBNAILS + obj_key)

        b_full = s3.get_file(RECEIPT_STORAGE_PATH + obj_key)
        full = Image.open(BytesIO(b_full['Body'].read()))
        full_out = full.rotate(dir, Image.NEAREST, expand = 1)
        with BytesIO() as output1:
            full_out.save(output1, ext)
            s3.put_new(output1.getvalue(), RECEIPT_STORAGE_PATH + obj_key)

        return Result.success()


    def delete(self, token, expense_id):

        self.validate_token(token, request)
        expense = Expense.query.filter_by(id=expense_id).first()

        if not expense:
            raise HttpException('Invalid id')

        obj_key = request.get_json()['object_name']
        s3 = Storage(configs.AWS_FILE_MANAGER_BUCKET_NAME)

        s3.remove(RECEIPT_STORAGE_PATH + obj_key)
        s3.remove(RECEIPT_STORAGE_THUMBNAILS + obj_key)
        expense.receipt_scans.remove(obj_key)

        db.session.commit()

        return Result.success()


    def post(self, token, expense_id):
        self.validate_token(token, request)

        expense = Expense.query.filter_by(id=expense_id).first()

        if not expense:
            raise HttpException('Invalid id')

        img_handler = request.files.get('image')

        if not img_handler:
            raise HttpException('Missing image')

        s3 = Storage(configs.AWS_FILE_MANAGER_BUCKET_NAME)

        filename = img_handler.filename
        ext = max(guess_all_extensions(img_handler.mimetype), key=len)
        key_name = hashlib.sha256(
            (str(datetime.utcnow().timestamp()) + filename + ext + token).encode('utf8')
        ).hexdigest() + ext

        img_obj = Image.open(img_handler)
        try:
            img_obj = ImageOps.exif_transpose(img_obj)
        except TypeError: # bug with PIL.image forces me to do this. https://github.com/python-pillow/Pillow/pull/3980
            pass

        orig_width, orig_height = img_obj.size
        thumb_width = 128
        height = int(orig_height * thumb_width / orig_width)
        size = thumb_width, height
        thumb = img_obj.resize(size)

        with BytesIO() as output:
            thumb.save(output, ext.strip('.'), optimize=True)
            s3.put_new(output.getvalue(), RECEIPT_STORAGE_THUMBNAILS + key_name, img_handler.content_type)

        with BytesIO() as output_full:
            img_obj.save(output_full, ext.strip('.'), optimize=True, quality=70)
            s3.put_new(output_full.getvalue(), RECEIPT_STORAGE_PATH + key_name, img_handler.content_type)
        img_obj.close()
        expense.receipt_scans.append(key_name)
        flag_modified(expense, 'receipt_scans')
        db.session.commit()
        emit(
            'EXPENSE_TOKEN_ADDED',
            {'data': expense.id},
            namespace='/expense-scans/' + token + '/' + str(expense_id),
            broadcast=True
        )
        return expense.receipt_scans

    @staticmethod
    def validate_token(token, req):
        ut = UserToken.query.options(joinedload('user')).filter_by(token=token).first()

        if not ut or ut.expires <= datetime.utcnow():
            raise HttpException('Invalid token')

        if ut.target not in req.path:
            raise HttpException('Invalid target')

        return ut
