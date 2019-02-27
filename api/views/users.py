import datetime
import re
from flask_socketio import emit
import sqlalchemy
from flask_restful import Resource, request
from flask import session, json, current_app, render_template, url_for
from sqlalchemy.orm import joinedload
from core.middleware import HttpException
from core.router import permissions
from dal.shared import get_fillable, token_required, access_required, Paginator
from dal.models import User, db, Role, UserToken, UserAttributes
from flask_mail import Message


class Users(Resource):

    def get(self):

        if 'logged_in' in session:
            user = User.query.filter_by(email=session['user_email']).first()
            if user:
                return user_to_dict(user)

        return {'message': 'no session'}, 403

    @token_required
    def put(self):
        user = request.user
        raw_data = request.get_json()

        if 'first_name' in raw_data:
            user.first_name = raw_data['first_name']

        if 'last_name' in raw_data:
            user.last_name = raw_data['last_name']

        access = user.attributes.access
        preferences = user.attributes.preferences

        if raw_data['attributes']:
            if 'access' in raw_data['attributes']:
                user.attributes.user_access = json.dumps({**access, **raw_data['attributes']['access']})

            if 'preferences' in raw_data['attributes']:
                user.attributes.user_preferences = json.dumps({**preferences, **raw_data['attributes']['preferences']})

        db.session.commit()
        emit('USER_WS_CHANGED', {'data': user.id}, namespace='/' + str(user.id), broadcast=True)
        return {'message': 'success'}


class UsersManager(Resource):

    @token_required
    @access_required
    def get(self):

        page = request.args.get('page') if 'page' in request.args else 1
        total_pages = 1
        q = request.args.get('query')
        if q:
            users = User.query.filter(
                (User.first_name.like('%' + q + '%')) |
                (User.last_name.like('%' + q + '%')) |
                (User.email.like('%' + q + '%'))
            ).all()
        else:
            paginator = Paginator(User.query, int(page), request.args.get('orderBy'), request.args.get('orderDir'))
            total_pages = paginator.total_pages
            users = paginator.get_result()

        user_list = list(map(lambda user: {
            'first_name': user.first_name,
            'last_name': user.last_name,
            'name': user.first_name + ' ' + user.last_name,
            'id': user.id,
            'email': user.email,
            'attributes': get_user_attr(user),
            'roles': list(map(lambda r: {
                'name': r.name,
                'id': r.id
            }, user.roles))
        }, users))

        return {
            'page': page,
            'total_pages': total_pages,
            'list': user_list
        }

    @token_required
    @access_required
    def post(self):
        raw_data = request.get_json()
        user_data = get_fillable(User, **raw_data)
        user = User(**user_data)
        if 'password' in raw_data:
            user.hash_password()

        if raw_data['roles']:
            for role in Role.query.filter(Role.id.in_(raw_data['roles'])):
                user.roles.append(role)

        user.attributes = UserAttributes()
        if raw_data['attributes'] and 'access' in raw_data['attributes']:
            user.attributes.user_access = json.dumps(raw_data['attributes']['access'])

        if raw_data['attributes'] and 'preferences' in raw_data['attributes']:
            user.attributes.user_preferences = json.dumps(raw_data['attributes']['preferences'])

        db.session.add(user)
        db.session.commit()

        if not user.password:
            ut = UserToken(target=request.host_url.rstrip('/') + url_for('user_activate_url'))
            ut.new_token(user.email)
            user.tokens.append(ut)
            db.session.commit()
            msg = Message('Verifica Tu Cuenta', recipients=[user.email])
            msg.html = render_template(
                'email/account_activate.html',
                name=user.first_name,
                url=request.host_url,
                token='account/activate/' + ut.token
            )
            current_app.mail(msg)

        return dict(id=user.id)

    @token_required
    @access_required
    def put(self, user_id):
        raw_data = request.get_json()
        user = User.query.options(joinedload('roles')).filter_by(id=user_id).first()

        if not user:
            return {'error': 'User does not exist'}

        user.first_name = raw_data['first_name']
        user.last_name = raw_data['last_name']
        user.roles = []

        if raw_data['attributes']:
            if raw_data['attributes'] and 'access' in raw_data['attributes']:
                user.attributes.user_access = json.dumps(raw_data['attributes']['access'])

            if raw_data['attributes'] and 'preferences' in raw_data['attributes']:
                user.attributes.user_preferences = json.dumps(raw_data['attributes']['preferences'])

        if raw_data['roles']:
            for role in Role.query.filter(Role.id.in_(
                    list(map(
                        lambda r: r['id'], raw_data['roles'])
                    ))):
                user.roles.append(role)

        db.session.commit()
        emit('USER_WS_CHANGED', {'data': user.id}, namespace='/' + str(user.id), broadcast=True)

        return {'message': 'success'}

    @token_required
    @access_required
    def delete(self, user_id):
        user = User.query.options(joinedload('roles')).filter_by(id=user_id).first()
        user.roles = []
        db.session.delete(user)
        db.session.commit()
        return {'message': 'success'}


class Session(Resource):
    def post(self):
        auth = request.authorization

        error = {'error': 'Could not verify'}

        if not auth or not auth.username or not auth.password:
            return error, 401

        user = User.query.filter_by(email=auth.username).first()

        if not user:
            return error, 401

        if user.password_correct(auth.password):
            session['logged_in'] = True
            session['user_email'] = user.email
            return user_to_dict(user)

        return error, 401

    def delete(self):

        if 'logged_in' in session:
            session.pop('logged_in')
            session.pop('user_email')
            return {}

        return {'error': "no session"}, 401


class Roles(Resource):

    @token_required
    @access_required
    def post(self):
        role = request.get_json()

        if not role:
            return {'error': 'name is required'}, 400

        current = Role.query.filter_by(name=role).count()

        if current > 0:
            return {'error': 'name already in used'}, 400

        role = Role(name=role.title())
        db.session.add(role)
        db.session.commit()

        return {
            'id': role.id,
            'name': role.name,
            'permissions': role.permissions
        }

    @token_required
    @access_required
    def get(self):
        roles = Role.query.all()
        data = []
        for role in roles:
            data.append({
                'id': role.id,
                'name': role.name,
                'permissions': role.get_permissions
            })

        return data

    @token_required
    @access_required
    def put(self):
        data = request.get_json()
        role = Role.query.filter_by(id=data['id']).first()
        role.permissions = json.dumps(data['permissions'])
        db.session.commit()
        emit('ROLE_WS_CHANGED', {'data': role.name}, namespace='/' + role.name, broadcast=True)
        return {'message': 'success'}, 201

    @token_required
    @access_required
    def delete(self):
        role_id = request.get_json()
        try:
            Role.query.filter_by(id=role_id).delete()
            db.session.commit()
        except sqlalchemy.exc.IntegrityError as e:
            return {'message': 'integrity constraint'}, 409

        return {'message': 'success'}


class Permissions(Resource):
    @token_required
    def get(self):
        return permissions


class UserTokens(Resource):

    def get(self, user_token):
        re = UserToken.query.filter_by(token=user_token).first()

        time = datetime.datetime.utcnow()

        if re and re.expires > time:
            return {'isValid': True}

        return {'isValid': False}


class Activate(Resource):

    def post(self):
        data = request.get_json()
        ut = UserToken.query.filter_by(token=data['token']).first()

        if not ut or ut.expires <= datetime.datetime.utcnow():
            raise HttpException('Invalid token')

        if ut.target != request.base_url:
            raise HttpException('Invalid target')

        parsed = r'^(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&*(),.?":{}|<>])'

        if len(data['pw']) < 6 or not re.match(parsed, data['pw']) or data['pw'] != data['pw2']:
            raise HttpException('Invalid password')

        user = ut.user
        user.password = data['pw']
        user.hash_password()
        ut.expires = datetime.datetime.utcnow()
        db.session.commit()

        return {'message': 'success'}


def get_user_attr(user: User):
    return {
        'preferences': json.loads(
            user.attributes.user_preferences
        ) if hasattr(user.attributes, 'user_preferences') else {},
        'access': json.loads(
            user.attributes.user_access
        ) if hasattr(user.attributes, 'user_access') else {}
    }


def user_to_dict(user: User) -> dict:
    return {
        'user': {
            'email': user.email,
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'roles':
                list(map(lambda r: {
                    'name': r.name,
                    'id': r.id,
                    'permissions': r.get_permissions
                }, user.roles)),
            'attributes': get_user_attr(user)

        },
        'token': user.get_token()
    }
