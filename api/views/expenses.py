from core import API
from flask import request, current_app
from dal.shared import token_required, access_required
from views import Result


class Expenses(API):

    def get(self):
        return {}

    def put(self):
        return {}

    @token_required
    @access_required
    def post(self):
        if 'get_scan_token' in request.args:
            domain = current_app.config['EXTERNAL_DEV_URL'] if 'EXTERNAL_DEV_URL' in current_app.config else ''
            return Result.custom({'token': 'somethingweird', 'domain': domain})
            pass
        return {}


class ExpenseToken(API):

    @token_required
    def get(self, token):
        # return all scanned pics thus far
        return token
