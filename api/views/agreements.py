from flask import request
from core import API
from dal.models import RentalAgreement, TenantHistory, Room, TimeInterval, Policy
from dal.shared import token_required, access_required, db


class Agreements(API):

    @token_required
    @access_required
    def get(self):
        pass

    @token_required
    @access_required
    def post(self):

        data = request.get_json()
        tenant_data = {
            'tenant_id': data['tenant_id'],
            'reference1_phone': data['reference1']
        }
        if data['reference2']:
            tenant_data['reference2_phone'] = data['reference2']
        if data['reference3']:
            tenant_data['reference3_phone'] = data['reference3']

        tenant_history = TenantHistory(**tenant_data)
        room = Room.query.filter_by(id=data['room_id']).first()
        interval = TimeInterval.query.filter_by(id=data['interval']).first()
        project_id = request.user.attributes.preferences['default_project']
        agreement = RentalAgreement(
            tenant_history=tenant_history,
            room=room, interval=interval,
            project_id=project_id,
            rate=data['rate'],
            entered_on=data['date']
        )

        db.session.add(agreement)
        db.session.commit()

        return dict(id=agreement.id)

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
