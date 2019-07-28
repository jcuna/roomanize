import hashlib
from datetime import datetime
import os
from flask_socketio import emit
from sqlalchemy.orm import joinedload
from core import API
from flask import request, current_app
from core.AWS import Storage
from core.middleware import HttpException
from core.utils import local_to_utc
from dal.models import UserToken, Expense, db
from dal.shared import token_required, access_required, Paginator, row2dict
from views import Result


class Expenses(API):

    @token_required
    @access_required
    def get(self, expense_id=None):
        page = int(request.args.get('page')) if 'page' in request.args else 1
        total_pages = 1

        if expense_id:
            ex = Expense.query.filter_by(id=expense_id).first()
            if ex:
                s3 = Storage(current_app.config['AWS_FILE_MANAGER_BUCKET_NAME'])
                row = row2dict(ex)
                row['signed_urls'] = []
                if ex.receipt_scans:
                    [row['signed_urls'].append(s3.sign_url(url)) for url in ex.receipt_scans]

                result = [row]
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
                input_date=local_to_utc(data['date']),
                description=data['description']
            )
            db.session.add(expense)
            db.session.commit()
        else:
            raise HttpException('Invalid Request')

        if 'nonce' in data:
            domain = current_app.config['EXTERNAL_DEV_URL'] if 'EXTERNAL_DEV_URL' in current_app.config else ''
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
        pass

    def post(self, token, expense_id):
        # uploads new scan
        self.validate_token(token, request)

        expense = Expense.query.filter_by(id=expense_id).first()
        if not expense.receipt_scans:
            expense.receipt_scans = []

        if not expense:
            raise HttpException('Invalid id')

        s3 = Storage(current_app.config['AWS_FILE_MANAGER_BUCKET_NAME'])

        for file in request.files:
            filename, extension = os.path.splitext(file)
            key_name = 'receipts/' + hashlib.sha256(
                (str(datetime.utcnow().timestamp()) + filename + extension + token).encode('utf8')
            ).hexdigest() + extension

            expense.receipt_scans.append(key_name)

            s3.put_new(request.files[file], key_name)

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
