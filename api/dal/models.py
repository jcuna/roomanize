import json
from dal import db
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
import jwt
from flask import current_app

user_roles = db.Table('user_roles',
                      db.Column('id', db.BigInteger, primary_key=True),
                      db.Column('user_id', db.BigInteger, db.ForeignKey('users.id'), index=True),
                      db.Column('role_id', db.BigInteger, db.ForeignKey('roles.id'), index=True)
                      )


class User(db.Model):
    fillable = ['password', 'email', 'first_name', 'last_name', 'deleted']
    __tablename__ = 'users'
    id = db.Column(db.BigInteger, primary_key=True)
    email = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.String(80), nullable=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    deleted = db.Column(db.Boolean, nullable=False, server_default='0', index=True)
    roles = db.relationship('Role',
                            secondary=user_roles, lazy='subquery',
                            backref=db.backref('users', lazy='dynamic'),
                            # cascade="all, delete-orphan",
                            # single_parent=True
                            )

    def hash_password(self):
        self.password = generate_password_hash(self.password, method='sha256')

    def password_correct(self, plain_password):
        return check_password_hash(self.password, plain_password)

    def get_token(self):
        exp = datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
        return {
            'value': jwt.encode({'email': self.email, 'exp': exp}, current_app.config['SECRET_KEY']).decode('utf-8'),
            'expires': round(exp.timestamp())
        }


class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.BigInteger, primary_key=True)
    name = db.Column(db.String(30), index=True)
    permissions = db.Column(db.Text)

    @property
    def get_permissions(self):
        if self.permissions:
            return json.loads(self.permissions)

        return {}
