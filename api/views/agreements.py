from flask import request
from core import API
from dal.models import RentalAgreement
from dal.models import Policy
from dal.shared import token_required, access_required, db


class Agreements(API):

    @token_required
    @access_required
    def get(self):
        pass

    @token_required
    @access_required
    def post(self):
        pass

    @token_required
    @access_required
    def put(self):
        pass


class Policies(API):

    @token_required
    @access_required
    def get(self):
        pass

    @token_required
    @access_required
    def post(self):
        pass

    @token_required
    @access_required
    def put(self):
        pass
