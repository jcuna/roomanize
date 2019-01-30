from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import joinedload
from functools import wraps
import jwt

db = SQLAlchemy()


def get_fillable(model: db.Model, **kwargs):

    if not hasattr(model, 'fillable') and any(kwargs):
        raise Exception('Must declare a fillable on class ' + model.__name__)

    fillable = {}
    for attribute_name in model.fillable:
        if attribute_name in kwargs:
            fillable[attribute_name] = kwargs[attribute_name][0] if isinstance(kwargs[attribute_name], list) else\
                kwargs[attribute_name]

    return fillable


def token_required(f):

    from dal.models import User
    from flask import current_app, request

    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']

        if not token:
            return {'message': 'Token is missing!'}, 401

        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'])
            current_user = User.query.options(joinedload('roles')).filter_by(email=data['email']).first()
        except any:
            return {'message': 'Token is invalid!'}, 401

        request.user = current_user
        return f(*args, **kwargs)

    return decorated


def access_required(f):

    from flask import request
    from core.router import permissions

    @wraps(f)
    def access_decorator(*args, **kwargs):

        if not request.user:
            return {'message': 'Invalid user'}

        has_access = False

        for role in request.user.roles:
            for name, grant in role.get_permissions.items():
                if name == permissions[request.endpoint]:
                    for access in grant:
                        if access == access_map()[request.method]:
                            has_access = True
                            break

        if not has_access:
            return {'message': 'Access denied'}, 403

        return f(*args, **kwargs)

    return access_decorator


def access_map():
    return {
        'GET': 'read',
        'PUT': 'write',
        'POST': 'write',
        'DELETE': 'delete'
    }
