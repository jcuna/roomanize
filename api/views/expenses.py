from datetime import datetime

from sqlalchemy.orm import joinedload

from core import API
from flask import request, current_app, url_for

from core.middleware import HttpException
from core.utils import local_to_utc
from dal.models import UserToken, Expense
from dal.shared import token_required, access_required, db
from views import Result


class Expenses(API):

    def get(self):
        return {}

    def put(self):
        return {}

    @token_required
    @access_required
    def post(self):
        # upon clicking continue on front end,
        # user will post current expense data and this will return a token to upload scans
        data = request.get_json()
        if 'nonce' in data and 'amount' in data and 'description' in data:
            expense = Expense(
                amount=data['amount'],
                project_id=request.user.attributes.preferences['default_project'],
                input_date=local_to_utc(data['date']),
                description=data['description']
            )
            domain = current_app.config['EXTERNAL_DEV_URL'] if 'EXTERNAL_DEV_URL' in current_app.config else ''
            ut = UserToken(
                user_id=request.user.id
            )
            ut.new_token(data['nonce'])
            db.session.add(expense)
            db.session.commit()
            ut.target = '/expense-scans/' + ut.token + '/' + str(expense.id)
            db.session.add(ut)
            db.session.commit()

            return Result.custom({'token': ut.token, 'domain': domain, 'id': expense.id})

        return Result.error('Invalid request')


class ExpenseScans(API):
    def get(self, token, expense_id):
        # return basic user ino upon validating token so front end can show an upload scan form
        ut = UserToken.query.options(joinedload('user')).filter_by(token=token).first()

        if not ut or ut.expires <= datetime.utcnow():
            raise HttpException('Invalid token')

        if ut.target not in request.path:
            raise HttpException('Invalid target')

        return {
            'user': ut.user.first_name + ' ' + ut.user.last_name
        }

    def post(self):
        # uploads new scan
        files = request.files
        pass
