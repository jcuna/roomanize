from base64 import b64encode
from datetime import datetime
from decimal import Decimal
from math import ceil

from flask_sqlalchemy import SQLAlchemy, BaseQuery
from sqlalchemy import orm
from sqlalchemy.orm import joinedload
from functools import wraps
import jwt
from sqlalchemy.orm.state import InstanceState

from views import Result

db = SQLAlchemy()


def get_fillable(model: db.Model, get_attr_object=False, **kwargs):
    if len(kwargs) == 0:
        raise Exception('Model keywords are missing. Try ** or spread key values')

    if not hasattr(model, 'fillable') and any(kwargs):
        raise Exception('Must declare a fillable on class ' + model.__name__)

    fillable = {}
    for attribute_name in model.fillable:
        if attribute_name in kwargs:
            if get_attr_object:
                key = getattr(model, attribute_name)
            else:
                key = attribute_name
            fillable[key] = kwargs[attribute_name][0] if isinstance(kwargs[attribute_name], list) else \
                kwargs[attribute_name]

    return fillable


def token_required(f):
    from dal.models import User
    from flask import current_app, request

    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'X-Access-Token' in request.headers:
            token = request.headers.get('X-ACCESS-TOKEN')

        if not token:
            return Result.error('Token is missing!', 401)

        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.options(joinedload('roles')).filter_by(email=data['email']).first()
        except Exception:
            return Result.error('Token is invalid!', 401)

        request.user = current_user
        return f(*args, **kwargs)

    return decorated


def system_call(f):
    """
    meant to be called from within server instance, this is a temporary solution until an API key system is created
    :param f:
    :return:
    """
    from flask import current_app, request

    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'X-System-Token' in request.headers:
            token = request.headers.get('X-SYSTEM-TOKEN')

        if not token or token != current_app.config['SECRET_KEY']:
            return Result.error('Token is missing!', 401)

        return f(*args, **kwargs)

    return decorated


def access_required(f):
    from flask import request
    from core.router import permissions

    @wraps(f)
    def access_decorator(*args, **kwargs):

        if not request.user:
            return Result.error('Invalid user', 401)

        if not has_access(request.user.roles, request.endpoint, request.method, permissions):
            return Result.error('Access denied', 403)

        return f(*args, **kwargs)

    return access_decorator


access_map = {
    'GET': 'read',
    'PUT': 'write',
    'POST': 'write',
    'DELETE': 'delete'
}

def has_access(roles, endpoint, method, permissions):
    access = False

    for role in roles:
        for name, grant in role.get_permissions.items():
            if name == permissions[endpoint]:
                for access in grant:
                    if access == access_map[method]:
                        access = True
                        break

    return access

class Paginator:
    per_page = 20

    def __init__(self, query: BaseQuery, page: int = 1, order_by: str = None, order_dir: str = None):
        self.total = query.count()
        self.offset = (page * self.per_page) - self.per_page
        self.total_pages = ceil(self.total / self.per_page)
        self.query = query
        self.page = page

        if order_by:
            order_by = getattr(self.query.column_descriptions[0]['type'], order_by)
            order_dir = getattr(order_by, order_dir if order_dir else 'asc')
            self.query = self.query.order_by(order_dir())

    def get_items(self) -> list:
        items = self.get_result()
        return list(map(lambda row: dict(row), items))

    def get_result(self):
        return self.query.offset(self.offset).limit(self.per_page).all()


class ModelIter(object):
    allowed_widget = False
    def __init__(self, *args, **kwargs):
        super(self, *args, **kwargs)

    def __iter__(self):
        if isinstance(self, db.Model):
            for column in self.__dict__.keys():
                attr = getattr(self, column)

                if isinstance(attr, InstanceState) or hasattr(self.__mapper__.attrs, column) and \
                        hasattr(getattr(self.__mapper__.attrs, column), 'deferred') and \
                        getattr(self.__mapper__.attrs, column).deferred:
                    continue

                if isinstance(attr, bool) or isinstance(attr, int) or isinstance(attr, float) or isinstance(attr, dict) \
                        or attr is None:
                    yield column, attr
                elif isinstance(attr, Decimal):
                    yield column, '{0:.2f}'.format(attr)
                elif isinstance(attr, datetime):
                    yield column, str(attr.isoformat())
                elif isinstance(attr, bytes):
                    yield column, b64encode(attr).decode()
                elif not isinstance(attr, str):
                    yield column, str(attr)
                else:
                    yield column, attr
        if hasattr(self, '__mapper__'):
            # models that have not been loaded
            unloaded = orm.attributes.instance_state(self).unloaded
            for relationship in self.__mapper__.relationships:
                if relationship.key not in unloaded and hasattr(self, relationship.key):
                    value = getattr(self, relationship.key)
                    if isinstance(value, list):
                        yield relationship.key, list(map(dict, value))
                    else:
                        yield relationship.key, dict(value) if value else value
