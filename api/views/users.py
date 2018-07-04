
import sqlalchemy
from flask_restful import Resource, request
from flask import session, json
from sqlalchemy.orm import joinedload
from core.router import permissions
from dal.shared import get_fillable, token_required, access_required
from dal.models import User, db, Role


class Users(Resource):
    def get(self):

        if 'logged_in' in session:
            user = User.query.options(joinedload('roles')).filter_by(email=session['user_email']).first()
            if user:
                return user_to_dict(user)

        return {'message': 'no session'}, 403


class UsersManager(Resource):
    @token_required
    @access_required
    def get(self):

        limit = request.args.get('limit')
        order_by = getattr(User, request.args.get('orderBy'))
        order_dir = getattr(order_by, request.args.get('orderDir'))

        users = User.query.options(joinedload('roles')).order_by(order_dir()).limit(limit)

        return list(map(lambda user: {
            'first_name': user.first_name,
            'last_name': user.last_name,
            'name': user.first_name + ' ' + user.last_name,
            'id': user.id,
            'email': user.email,
            'roles': list(map(lambda r: {
                'name': r.name,
                'id': r.id
            }, user.roles))
        }, users))

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

        db.session.add(user)
        db.session.commit()

        return {'id': user.id}

    @token_required
    @access_required
    def put(self):
        return {}

    @token_required
    @access_required
    def delete(self, user_id):
        return {'user_id': user_id}


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


def user_to_dict(user: User) -> dict:
    return {
        'user': {
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'roles':
                list(map(lambda r: {
                    'name': r.name,
                    'id': r.id,
                    'permissions': r.get_permissions
                }, user.roles))
        },
        'token': user.get_token()
    }
