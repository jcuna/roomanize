from flask_restful import Resource, request
from dal.shared import get_fillable
from dal.models import User, db


class Users(Resource):
    def get(self):
        user = User.query.first()

        if user:
            return {
                'user': {
                    'email': user.email,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                },
                'token': user.get_token()
            }

        return {'message': 'no session'}, 403

    def post(self):
        data = get_fillable(User, **request.get_json())
        user = User(**data)
        user.hash_password()

        db.session.add(user)
        db.session.commit()

        return {'id': user.id}


class Login(Resource):
    def post(self):
        auth = request.authorization

        error = {'error': 'Could not verify'}
        header = {'WWW-Authenticate': 'Basic realm="Login required!"'}

        if not auth or not auth.username or not auth.password:
            return error, 401, header

        user = User.query.filter_by(username=auth.username).first()

        if not user:
            return error, 401, header

        if user.password_correct(auth.password):
            return {'token': user.get_token()}

        return error, 401, header
