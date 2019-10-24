import sqlalchemy
from flask import request
from sqlalchemy.orm import joinedload
from sqlalchemy.sql import functions
from core import API
from dal.models import Tenant, Balance, Payment, TenantHistory, RentalAgreement
from dal.shared import token_required, access_required, db, get_fillable, Paginator
from views import Result


class Tenants(API):

    @token_required
    @access_required
    def get(self, tenant_id=None):
        if tenant_id:
            return self.get_tenant(tenant_id)

        result = []
        page = request.args.get('page', 1)
        total_pages = 1

        q = request.args.get('query')
        if q:
            tenants = Tenant.query.filter(
                (Tenant.identification_number.like('%' + q + '%')) |
                (Tenant.phone.like('%' + q + '%')) |
                (Tenant.email.like('%' + q + '%'))
            ).all()
        else:
            order_by = request.args.get('orderBy') if 'orderBy' in request.args else 'id'
            paginator = Paginator(Tenant.query, int(page), order_by, request.args.get('orderDir'))
            total_pages = paginator.total_pages
            tenants = paginator.get_result()

        if tenants:
            for tenant in tenants:
                result.append(dict(tenant))

        return Result.paginate(result, page, total_pages)

    @token_required
    @access_required
    def post(self):
        data = request.get_json()
        if not data:
            return Result.error('tenant object is required')

        tenant_data = get_fillable(Tenant, **data)
        tenant = Tenant(**tenant_data)
        db.session.add(tenant)

        try:
            db.session.commit()
        except sqlalchemy.exc.IntegrityError:
            used_key = 'email'
            return Result.error(used_key + ' ya ha sido utilizado')

        return Result.id(tenant.id)

    @token_required
    @access_required
    def put(self, tenant_id):

        tenant = Tenant.query.filter_by(id=tenant_id).first()

        data = get_fillable(Tenant, **request.get_json())

        for col in data.keys():
            setattr(tenant, col, data[col])

        db.session.commit()

        return tenant.id

    @staticmethod
    def get_tenant(tenant_id):

        tenant: Tenant = Tenant.query.filter_by(id=tenant_id).first()
        result = dict(tenant)
        result['history'] = []
        rental_ids = []

        agreements = RentalAgreement.query.options(
            joinedload('tenant_history'), joinedload('room')
        ).join('tenant_history').join('room')\
            .filter(TenantHistory.tenant_id == tenant_id)\
            .order_by(RentalAgreement.created_on.desc()).limit(10).all()

        agreement: RentalAgreement
        for agreement in agreements:
            history = dict(agreement.tenant_history)
            history['rental_agreement'] = {}
            rental_ids.append(agreement.id)
            history['rental_agreement'] = dict(agreement)
            history['rental_agreement']['last_payment'] = None
            history['rental_agreement']['room'] = dict(agreement.room)
            history['rental_agreement']['balance'] = []
            result['history'].append(history)

        sub_join = db.session.query(
            Balance.id.label('id'),
            functions.max(Balance.due_date).label('due_date')
        ).distinct(Balance.id).group_by('agreement_id', 'id').subquery()

        balances = Balance.query.options(joinedload('payments')).join(
            sub_join,
            Balance.id == sub_join.columns.id
        ).filter(Balance.agreement_id.in_(rental_ids))\
            .order_by(Balance.due_date.desc()).all()

        last_payments = db.session.query(
            Balance.agreement_id.label('agreement_id'),
            Payment.amount.label('amount'),
            functions.max(Payment.paid_date).label('paid_date')).join(Payment)\
            .distinct('agreement_id')\
            .group_by('agreement_id', 'amount')\
            .filter(Balance.agreement_id.in_(rental_ids)).all()

        for row in result['history']:
            for last_pay in last_payments:
                if last_pay.agreement_id == row['rental_agreement']['id']:
                    row['rental_agreement']['last_payment'] = {
                        'date': str(last_pay.paid_date),
                        'amount': str(last_pay.amount)
                    }
            for balance in balances:
                if balance.agreement_id == row['rental_agreement']['id']:
                    dict_balance = dict(balance)
                    dict_balance['payments'] = list(map(lambda pay: dict(pay), balance.payments))
                    row['rental_agreement']['balance'].append(dict_balance)

        return result
