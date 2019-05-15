import sqlalchemy

from flask import request
from flask_restful import Resource
from sqlalchemy.orm import joinedload

from dal.models import RentalAgreement, Tenant
from dal.shared import token_required, access_required, db, get_fillable, Paginator, row2dict


class Tenants(Resource):

    @token_required
    @access_required
    def get(self, tenant_id=None):
        if tenant_id:
            tenant = Tenant.query.options(joinedload('history.rental_agreement.room')).filter_by(id=tenant_id).first()
            result = row2dict(tenant)
            result['history'] = []

            for stay in tenant.history:
                history = row2dict(stay)
                history['rental_agreement'] = {}
                if stay.rental_agreement:
                    history['rental_agreement'] = row2dict(stay.rental_agreement)
                    history['rental_agreement']['room'] = row2dict(stay.rental_agreement.room)
                result['history'].append(history)

            return result

        result = []
        page = request.args.get('page') if 'page' in request.args else 1
        total_pages = 1

        if 'query' in request.args:
            # searching
            tenants = []
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
            return {'error': 'tenant object is required'}, 400

        tenant_data = get_fillable(Tenant, **data)
        tenant = Tenant(**tenant_data)
        db.session.add(tenant)

        try:
            db.session.commit()
        except sqlalchemy.exc.IntegrityError:
            used_key = 'email'
            return {'error': used_key + ' ya ha sido utilizado'}, 400

        return dict(tenant_id=tenant.id)

    @token_required
    @access_required
    def put(self, tenant_id):
        pass

