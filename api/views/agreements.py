from _decimal import Decimal
from datetime import datetime, timedelta
from flask import request
from sqlalchemy.orm import joinedload, Load
from core import API
from core.middleware import HttpException
from core.utils import local_to_utc
from dal.models import RentalAgreement, TenantHistory, Room, TimeInterval, Policy, Balance, Payment, Tenant
from dal.shared import token_required, access_required, db, get_fillable, Paginator
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
        utc_date = local_to_utc(data['date'])

        if utc_date.date() < (datetime.utcnow().date() - timedelta(days=5)):
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
            deposit=data['deposit'],
            entered_on=utc_date
        )

        balance = Balance(
            agreement=agreement,
            balance=Decimal(agreement.rate) + Decimal(agreement.deposit),
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
        agreement = RentalAgreement.query.filter_by(id=agreement_id).first()

        if 'terminated_on' in data:
            date = local_to_utc(data['terminated_on']).date()
            if date > datetime.utcnow().date():
                raise HttpException('Invalid date', 400)
            agreement.terminated_on = date

        for item in get_fillable(RentalAgreement, **data):
            setattr(agreement, item, data[item])

        if data['refund']:
            # find current balance and deduct refund from it and make a negative payment
            balance = Balance.query.options(joinedload('payments')).filter_by(agreement_id=agreement.id).order_by(
                Balance.due_date.desc()
            ).first()
            refund = Decimal(data['refund'])
            balance.balance -= refund
            last_pay: Payment = balance.payments[-1]
            balance.payments.append(Payment(amount=-refund, payment_type_id=last_pay.payment_type_id))

        db.session.commit()

        return Result.success()


class BalancePayments(API):

    @token_required
    @access_required
    def post(self):

        data = request.get_json()

        balance = Balance.query.filter_by(id=data['balance_id']).first()
        payment = Payment(**get_fillable(Payment, **data))
        balance.payments.append(payment)

        db.session.commit()

        return Result.id(payment.id)

    @token_required
    @access_required
    def get(self, agreement_id):
        balance = Balance.query.filter_by(agreement_id=agreement_id)\
            .options(joinedload(Balance.payments).load_only(Payment.amount))\
            .order_by(Balance.due_date.desc()).first()

        payments = sum(map(lambda b: b.amount, balance.payments))
        rate = balance.balance - balance.previous_balance
        remaining_balance = balance.balance - payments
        amount_due = 0
        if remaining_balance > rate:
            amount_due = remaining_balance - rate

        result = dict(balance)

        result.update({
            'balance': '{0:.2f}'.format(remaining_balance),
            'amount_due': '{0:.2f}'.format(amount_due)
        })
        return result


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


class Receipts(API):

    @token_required
    @access_required
    def get(self):

        project_id = request.user.attributes.preferences['default_project']
        result = []

        query = Payment.query.options(
            joinedload('balance'),
            joinedload('balance.agreement'),
            joinedload('balance.agreement.tenant_history'),
            joinedload('balance.agreement.tenant_history.tenant'),
        ).join(Balance, (Balance.id == Payment.balance_id)).join(RentalAgreement).join(TenantHistory).options(
            Load(TenantHistory).load_only('id'),
        ).join(Tenant).filter(RentalAgreement.project_id == project_id)
        page = request.args.get('page', 1)

        if 'tenant' in request.args:
            query = query.filter(Tenant.id == request.args.get('tenant'))
        elif 'receipt' in request.args:
            query = query.filter(Payment.id == request.args.get('receipt'))
        elif 'room' in request.args:
            query = query.filter(RentalAgreement.room_id == request.args.get('room'))
        elif 'paid_date' in request.args:
            day_start = request.args.get('paid_date') + ' 00:00:00'
            day_end = request.args.get('paid_date') + ' 23:59:59'
            query = query.filter(Payment.paid_date.between(local_to_utc(day_start), local_to_utc(day_end)))

        order_by = request.args.get('orderBy') if 'orderBy' in request.args else 'id'
        paginator = Paginator(query, int(page), order_by, request.args.get('orderDir'))
        total_pages = paginator.total_pages
        receipts = paginator.get_result()

        if receipts:
            for row in receipts:
                receipt = dict(row)
                receipt['user'] = dict(row.balance.agreement.tenant_history.tenant)
                receipt['balance'] = dict(row.balance)
                receipt['balance']['agreement'] = dict(row.balance.agreement)
                result.append(receipt)

        return Result.paginate(result, page, total_pages)

    @token_required
    @access_required
    def post(self):
        pass

    @token_required
    @access_required
    def put(self):
        pass
