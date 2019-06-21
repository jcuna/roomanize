import sqlalchemy
from flask import request
from sqlalchemy.orm import joinedload
from core import API
from dal.models import Tenant, Balance, Payment
from dal.shared import token_required, access_required, db, get_fillable, Paginator, row2dict
from views import Result


class Tenants(API):

    @token_required
    @access_required
    def get(self, tenant_id=None):
        if tenant_id:
            return self.get_tenant(tenant_id)

        result = []
        page = request.args.get('page') if 'page' in request.args else 1
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
                result.append(row2dict(tenant))

        return {'list': result, 'page': page, 'total_pages': total_pages}

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

        return dict(id=tenant.id)

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

        tenant = Tenant.query.options(joinedload('history.rental_agreement.room')).filter_by(id=tenant_id).first()
        result = row2dict(tenant)
        result['history'] = []
        rental_ids = []

        for stay in tenant.history:
            history = row2dict(stay)
            history['rental_agreement'] = {}
            if stay.rental_agreement:
                if not stay.rental_agreement.terminated_on:
                    rental_ids.append(stay.rental_agreement.id)
                history['rental_agreement'] = row2dict(stay.rental_agreement)
                history['rental_agreement']['room'] = row2dict(stay.rental_agreement.room)
                history['rental_agreement']['balance'] = []
            result['history'].append(history)

        balances = Balance.query.filter(Balance.agreement_id.in_(rental_ids)). \
            group_by(Balance.id).order_by(Balance.due_date.desc()).limit(2)

        for row in result['history']:
            for balance in balances:
                if balance.agreement_id == int(row['rental_agreement']['id']):
                    dict_balance = row2dict(balance)
                    dict_balance['last_payment'] = row2dict(
                        Payment.query.filter_by(balance_id=balance.id).order_by(Payment.paid_date.desc()).first()
                    )
                    row['rental_agreement']['balance'].append(dict_balance)

        return result
