from flask_sqlalchemy import SQLAlchemy, request
from functools import wraps
import jwt

db = SQLAlchemy()


def get_fillable(model: db.Model, **kwargs):

    if not hasattr(model, 'fillable') and any(kwargs):
        raise Exception('Must declare a fillable on class ' + model.__name__)

    fillable = {}
    for attribute_name in model.fillable:
        if attribute_name in kwargs:
            fillable[attribute_name] = kwargs[attribute_name]

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
            current_user = User.query.filter_by(email=data['email']).first()
        except:
            return {'message': 'Token is invalid!'}, 401

        request.user = current_user
        return f(*args, **kwargs)

    return decorated
