from flask_restful import Resource, request
from flask import session
from dal.shared import get_fillable
from dal.models import User, db


class Users(Resource):
    def get(self):

        if 'logged_in' in session:
            user = User.query.filter_by(email=session['user_email']).first()
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


def user_to_dict(user: User) -> dict:
    return {
        'user': {
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name
        },
        'token': user.get_token()
    }

