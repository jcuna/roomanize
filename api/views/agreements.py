from datetime import datetime
from flask import request
from core import API
from core.middleware import HttpException
from dal.models import RentalAgreement, TenantHistory, Room, TimeInterval, Policy, Balance, Payment
from dal.shared import token_required, access_required, db, get_fillable, row2dict
from views import Result


class Agreements(API):

    @token_required
    @access_required
    def get(self, agreement_id=None):
        pass

    @token_required
    @access_required
    def post(self):

        data = request.get_json()
        tenant_data = {
            'tenant_id': data['tenant_id'],
            'reference1_phone': data['reference1']
        }

        if datetime.strptime(data['date'], '%Y-%m-%d').date() < datetime.utcnow().date():
            raise HttpException('Invalid date', 400)

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

        balance = Balance(
            agreement=agreement,
            balance=agreement.rate,
            previous_balance=0.00,
            due_date=agreement.entered_on
        )

        db.session.add(agreement)
        db.session.add(balance)
        db.session.commit()

        return Result.id(agreement.id)

    @token_required
    @access_required
    def put(self, agreement_id):

        data = request.get_json()

        if datetime.strptime(data['terminated_on'], '%Y-%m-%d').date() > datetime.utcnow().date():
            raise HttpException('Invalid date', 400)

        agreement = RentalAgreement.query.filter_by(id=agreement_id).first()
        for item in get_fillable(RentalAgreement, ):
            agreement.set_attribute(**item)

        db.session.add(agreement)
        db.session.commit()

        return Result.success()


class BalancePayments(API):

    @token_required
    @access_required
    def post(self):

        data = request.get_json()

        balance = Balance.query.filter_by(id=data['balance_id']).first()
        balance.payments.append(Payment(**get_fillable(Payment, **data)))

        db.session.commit()

        return Result.id(balance.id)

    def delete(self, payment_id):
        pass

    def get(self, payment_id):
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
