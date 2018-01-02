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

    def post(self):
        data = get_fillable(User, **request.get_json())
        user = User(**data)
        user.hash_password()

        db.session.add(user)
        db.session.commit()

        return {'id': user.id}


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


class Permissions(Resource):
    @token_required
    @access_required
    def get(self):
        return list(permissions.values())


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
