import json

from config import random_token
from dal import db
from sqlalchemy.orm import relationship
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
import jwt
from flask import current_app
from config.routes import default_access

collation = 'utf8mb4_unicode_ci'


def row2dict(row):
    d = {}
    for column in row.__table__.columns:
        d[column.name] = getattr(row, column.name)

    return d


user_roles = db.Table('user_roles',
                      db.Column('id', db.BigInteger, primary_key=True),
                      db.Column('user_id', db.BigInteger, db.ForeignKey('users.id'), index=True),
                      db.Column('role_id', db.BigInteger, db.ForeignKey('roles.id'), index=True)
                      )


class User(db.Model):
    fillable = ['password', 'email', 'first_name', 'last_name', 'deleted']
    __tablename__ = 'users'
    id = db.Column(db.BigInteger, primary_key=True)
    email = db.Column(db.String(50, collation=collation), nullable=False, unique=True)
    password = db.Column(db.String(80, collation=collation), nullable=True)
    first_name = db.Column(db.String(50, collation=collation), nullable=False)
    last_name = db.Column(db.String(50, collation=collation), nullable=False)
    created_at = db.Column(db.DateTime(), nullable=False, default=datetime.datetime.utcnow())
    deleted = db.Column(db.Boolean, nullable=False, server_default='0', index=True)
    roles = relationship('Role',
                         secondary=user_roles, lazy='subquery',
                         backref=db.backref('users', lazy='dynamic'),
                         # cascade="all, delete-orphan",
                         # single_parent=True
                         )

    tokens = relationship('UserToken', back_populates='user')

    def hash_password(self):
        self.password = generate_password_hash(str(self.password).encode("ascii"), method='sha256')

    def password_correct(self, plain_password):
        return check_password_hash(self.password, plain_password)

    def get_token(self):
        exp = datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
        return {
            'value': jwt.encode({'email': self.email, 'exp': exp}, current_app.config['SECRET_KEY']).decode('utf-8'),
            'expires': round(exp.timestamp())
        }


class UserToken(db.Model):

    __tablename__ = 'user_tokens'
    id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), index=True)
    token = db.Column(db.VARCHAR(64, collation=collation,), unique=True, nullable=False)
    expires = db.Column(db.DateTime(), nullable=False)
    target = db.Column(
        db.String(250, collation=collation),
        comment='Target api url where token will be validated',
        nullable=False
    )

    user = relationship(User, back_populates='tokens')

    def new_token(self, email):
        while not self.token:
            temp_token = random_token(email)
            so = self.query.filter_by(token=temp_token).count()

            if not so:
                self.token = temp_token

        self.expires = datetime.datetime.utcnow() + datetime.timedelta(hours=4)


class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.BigInteger, primary_key=True)
    name = db.Column(db.String(30, collation=collation), index=True)
    permissions = db.Column(db.Text(collation=collation))

    @property
    def get_permissions(self):

        combined_permissions = default_access.copy()

        if self.permissions:
            for key, userGrants in json.loads(self.permissions).items():
                for defaultKey, defaultGrants in default_access.items():
                    if key == defaultKey:
                        for grant in defaultGrants:
                            if grant not in userGrants:
                                userGrants.append(grant)

                combined_permissions.update({key: userGrants})

        return combined_permissions


class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.BigInteger, primary_key=True)
    name = db.Column(db.String(30, collation=collation), unique=True)
    active = db.Column(db.Boolean(), index=True)
    address = db.Column(db.Text(collation=collation))
    contact = db.Column(db.VARCHAR(10, collation=collation))
    deleted = db.Column(db.DateTime(), nullable=True, index=True)

    rooms = relationship('Room', back_populates='project')


class TimeInterval(db.Model):
    __tablename__ = 'time_intervals'
    id = db.Column(db.Integer, primary_key=True)
    interval = db.Column(db.String(15, collation=collation), primary_key=True)


class Room(db.Model):
    __tablename__ = 'rooms'
    id = db.Column(db.BigInteger, primary_key=True)
    project_id = db.Column(db.BigInteger, db.ForeignKey('projects.id'), index=True, nullable=False)
    name = db.Column(db.String(30, collation=collation), index=True)
    rent = db.Column(db.Integer, nullable=True)
    time_interval_id = db.Column(db.Integer, db.ForeignKey('time_intervals.id'), nullable=True)
    description = db.Column(db.Text(collation=collation))
    picture = db.Column(db.String(255, collation=collation))

    project = relationship(Project, back_populates='rooms')
    time_interval = relationship(TimeInterval)


class Tenant(db.Model):
    __tablename__ = 'tenants'
    id = db.Column(db.BigInteger, primary_key=True)
    first_name = db.Column(db.String(30, collation=collation), index=True, nullable=False)
    last_name = db.Column(db.Integer, nullable=False)
    identification_number = db.Column(db.Text(collation=collation), comment='National ID. i.e. Cedula, License')
    email = db.Column(db.String(50, collation=collation), nullable=True, unique=True)
    phone = db.Column(db.String(10, collation=collation), nullable=True, unique=True)

    history = relationship('TenantHistory', back_populates='tenant')


class TenantHistory(db.Model):
    __tablename__ = 'tenant_histories'
    id = db.Column(db.BigInteger, primary_key=True)
    tenant_id = db.Column(db.BigInteger, db.ForeignKey('tenants.id'), index=True, nullable=False)
    validated_on = db.Column(db.DateTime())
    reference1_phone = db.Column(db.String(10, collation=collation), nullable=False)
    reference2_phone = db.Column(db.String(10, collation=collation), nullable=True)
    reference3_phone = db.Column(db.String(10, collation=collation), nullable=True)

    tenant = relationship(Tenant, back_populates='history')


class RentalAgreement(db.Model):
    __tablename__ = 'rental_agreements'
    id = db.Column(db.BigInteger, primary_key=True)
    tenant_history_id = db.Column(db.BigInteger, db.ForeignKey('tenant_histories.id'), index=True, nullable=False)
    room_id = db.Column(db.BigInteger, db.ForeignKey('rooms.id'), index=True, nullable=False)
    time_interval_id = db.Column(db.Integer, db.ForeignKey('time_intervals.id'), nullable=False)
    entered_on = db.Column(db.DateTime(), nullable=False)
    terminated_on = db.Column(db.DateTime())

    tenant_history = relationship(TenantHistory)
    room = relationship(Room)
    interval = relationship(TimeInterval)
