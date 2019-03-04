import json

from sqlalchemy import UniqueConstraint

from config import random_token
from dal import db
from sqlalchemy.orm import relationship
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
import jwt
from flask import current_app
from config.routes import default_access

collation = 'utf8mb4_unicode_ci'

admin_access = {
    'projects': '*'
}

admin_preferences = {
}

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
    first_name = db.Column(db.String(50, collation=collation), nullable=False, index=True)
    last_name = db.Column(db.String(50, collation=collation), nullable=False, index=True)
    created_at = db.Column(db.DateTime(), nullable=False, default=datetime.datetime.utcnow())
    deleted = db.Column(db.Boolean, nullable=False, server_default='0', index=True)
    roles = relationship('Role',
                         secondary=user_roles, lazy='joined',
                         backref=db.backref('users', lazy='dynamic'),
                         # cascade="all, delete-orphan",
                         # single_parent=True
                         )
    tokens = relationship('UserToken', back_populates='user')
    attributes = relationship('UserAttributes', back_populates='user', lazy='joined', uselist=False)

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


class UserAttributes(db.Model):
    __tablename__ = 'user_attributes'
    ua_id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), index=True)
    user_access = db.Column(
        db.Text(collation=collation),
        comment='A JSON schema of table/rows access',
        nullable=False,
        default='{}'
    )
    user_preferences = db.Column(
        db.Text(collation=collation),
        comment='A JSON schema user preferences',
        nullable=False,
        default='{}'
    )

    user = relationship(User, back_populates='attributes', uselist=False)

    @property
    def preferences(self):
        return json.loads(self.user_preferences)

    @property
    def access(self):
        return json.loads(self.user_access)


class UserToken(db.Model):

    __tablename__ = 'user_tokens'
    id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), index=True)
    token = db.Column(db.String(64, collation=collation,), unique=True, nullable=False)
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
    address = db.Column(db.Text(collation=collation))
    contact = db.Column(db.String(10, collation=collation))
    deleted = db.Column(db.DateTime(), nullable=True, index=True)

    rooms = relationship('Room', back_populates='project')


class TimeInterval(db.Model):
    __tablename__ = 'time_intervals'
    id = db.Column(db.Integer, primary_key=True)
    interval = db.Column(db.String(15, collation=collation), primary_key=True)


class Room(db.Model):
    __tablename__ = 'rooms'
    fillable = ['project_id', 'name', 'rent', 'time_interval_id', 'description', 'picture']

    id = db.Column(db.BigInteger, primary_key=True)
    project_id = db.Column(db.BigInteger, db.ForeignKey('projects.id'), index=True, nullable=False)
    name = db.Column(db.String(30, collation=collation))
    rent = db.Column(db.Integer, nullable=True)
    time_interval_id = db.Column(db.Integer, db.ForeignKey('time_intervals.id'), nullable=True)
    description = db.Column(db.Text(collation=collation))
    picture = db.Column(db.String(255, collation=collation))

    project = relationship(Project, back_populates='rooms')
    time_interval = relationship(TimeInterval)

    __table_args__ = (
        UniqueConstraint('project_id', 'name', name='project_id_name_uc'),
    )


class Tenant(db.Model):
    __tablename__ = 'tenants'
    id = db.Column(db.BigInteger, primary_key=True)
    first_name = db.Column(db.String(30, collation=collation), nullable=False)
    last_name = db.Column(db.String(30, collation=collation), nullable=False, index=True)
    email = db.Column(db.String(50, collation=collation), nullable=True, unique=True)
    phone = db.Column(db.String(10, collation=collation), nullable=True, unique=True)
    identification_number = db.Column(
        db.String(25, collation=collation),
        comment='National ID. i.e. Cedula, License',
        unique=True
    )

    history = relationship('TenantHistory', back_populates='tenant')


class TenantHistory(db.Model):
    __tablename__ = 'tenant_history'
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
    tenant_history_id = db.Column(db.BigInteger, db.ForeignKey('tenant_history.id'), index=True, nullable=False)
    room_id = db.Column(db.BigInteger, db.ForeignKey('rooms.id'), index=True, nullable=False)
    time_interval_id = db.Column(db.Integer, db.ForeignKey('time_intervals.id'), nullable=False)
    entered_on = db.Column(db.DateTime(), nullable=False)
    terminated_on = db.Column(db.DateTime())

    tenant_history = relationship(TenantHistory)
    room = relationship(Room)
    interval = relationship(TimeInterval)


class Policy(db.Model):
    __tablename__ = 'policies'
    id = db.Column(db.BigInteger, primary_key=True)
    title = db.Column(db.String(30, collation=collation), index=True, nullable=False)
    text = db.Column(db.Text(collation=collation))
    start_ttv = db.Column(db.DateTime(), nullable=False, index=True, default=datetime.datetime.utcnow())
    end_ttv = db.Column(db.DateTime(), nullable=False, index=True, default=datetime.datetime(
        9999, 12, 31, 23, 59, 59, 999999)
    )


class Receipt(db.Model):
    __tablename__ = 'receipts'
    id = db.Column(db.BigInteger, primary_key=True)
    date = db.Column(db.DateTime(), nullable=False, index=True, default=datetime.datetime.utcnow())
    agreement_id = db.Column(db.BigInteger, index=True)
    amount = db.Column(db.DECIMAL(10, 2), nullable=False)
    balance = db.Column(db.DECIMAL(10, 2), nullable=False)
