from flask import request
from flask_restful import Resource

from dal.models import RentalAgreement
from dal.shared import token_required, access_required, db


class Agreements(Resource):

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

