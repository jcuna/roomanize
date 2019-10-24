import json
from sqlalchemy import UniqueConstraint, and_, Sequence
from sqlalchemy.ext.mutable import MutableList
from config import random_token
from dal import db
from sqlalchemy.orm import relationship
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import jwt
from config.routes import default_access
from dal.shared import ModelIter
from config import configs
from sqlalchemy.dialects import sqlite

# sqlite is used for testing and it does not auto increment Big Int since there's no support
BigInteger = db.BigInteger().with_variant(sqlite.INTEGER(), 'sqlite')

admin_access = {
    'projects': '*'
}

admin_preferences = {}

user_roles = db.Table(
    'user_roles',
    db.Column('id', BigInteger, primary_key=True),
    db.Column('user_id', BigInteger, db.ForeignKey('users.id'), index=True),
    db.Column('role_id', BigInteger, db.ForeignKey('roles.id'), index=True)
)


class User(db.Model, ModelIter):
    __tablename__ = 'users'
    fillable = ['password', 'email', 'first_name', 'last_name', 'deleted']

    id = db.Column(BigInteger, primary_key=True)
    email = db.Column(db.String(50, collation=configs.DB_COLLATION), nullable=False, unique=True)
    password = db.Column(db.String(80, collation=configs.DB_COLLATION), nullable=True)
    first_name = db.Column(db.String(50, collation=configs.DB_COLLATION), nullable=False, index=True)
    last_name = db.Column(db.String(50, collation=configs.DB_COLLATION), nullable=False, index=True)
    created_at = db.Column(db.DateTime(), nullable=False, default=datetime.utcnow)
    deleted = db.Column(db.Boolean, nullable=False, server_default='0', index=True)
    roles = relationship('Role', secondary=user_roles, lazy='joined', backref=db.backref('users', lazy='dynamic'))
    tokens = relationship('UserToken', back_populates='user')
    attributes = relationship('UserAttributes', back_populates='user', lazy='joined', uselist=False)
    audit = relationship('Audit')

    def hash_password(self):
        self.password = generate_password_hash(str(self.password).encode('ascii'), method='sha256')

    def password_correct(self, plain_password):
        return check_password_hash(self.password, plain_password)

    def get_token(self):
        exp = datetime.utcnow() + timedelta(minutes=30)
        return {
            'value': jwt.encode(
                {'email': self.email, 'exp': exp},
                configs.SECRET_KEY,
                algorithm='HS256').decode('utf-8'),
            'expires': round(exp.timestamp())
        }


class UserAttributes(db.Model, ModelIter):
    __tablename__ = 'user_attributes'

    ua_id = db.Column(BigInteger, primary_key=True)
    user_id = db.Column(BigInteger, db.ForeignKey('users.id'), index=True)
    user_access = db.Column(
        db.Text(collation=configs.DB_COLLATION),
        comment='A JSON schema of table/rows access',
        nullable=False,
        default='{}'
    )
    user_preferences = db.Column(
        db.Text(collation=configs.DB_COLLATION),
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


class UserToken(db.Model, ModelIter):
    __tablename__ = 'user_tokens'

    id = db.Column(BigInteger, primary_key=True)
    user_id = db.Column(BigInteger, db.ForeignKey('users.id'), index=True)
    token = db.Column(db.String(64, collation=configs.DB_COLLATION, ), unique=True, nullable=False)
    expires = db.Column(db.DateTime(), nullable=False)
    target = db.Column(
        db.String(250, collation=configs.DB_COLLATION),
        comment='Target api url where token will be validated',
        nullable=False
    )

    user = relationship(User, back_populates='tokens')

    def new_token(self, email: str, expires: datetime = None):
        while not self.token:
            temp_token = random_token(email)
            so = self.query.filter_by(token=temp_token).count()

            if not so:
                self.token = temp_token

        self.expires = expires if expires else datetime.utcnow() + timedelta(hours=4)


class Role(db.Model, ModelIter):
    __tablename__ = 'roles'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30, collation=configs.DB_COLLATION), index=True)
    permissions = db.Column(db.Text(collation=configs.DB_COLLATION))

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


class Project(db.Model, ModelIter):
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30, collation=configs.DB_COLLATION), unique=True)
    address = db.Column(db.Text(collation=configs.DB_COLLATION))
    contact = db.Column(db.String(10, collation=configs.DB_COLLATION))
    deleted = db.Column(db.DateTime(), nullable=True, index=True)

    rooms = relationship('Room', back_populates='project')


class TimeInterval(db.Model, ModelIter):
    __tablename__ = 'time_intervals'
    id = db.Column(db.Integer, primary_key=True)
    interval = db.Column(db.String(15, collation=configs.DB_COLLATION))


class Tenant(db.Model, ModelIter):
    __tablename__ = 'tenants'
    fillable = ['first_name', 'last_name', 'email', 'phone', 'identification_number']

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(30, collation=configs.DB_COLLATION), nullable=False)
    last_name = db.Column(db.String(30, collation=configs.DB_COLLATION), nullable=False, index=True)
    email = db.Column(db.String(50, collation=configs.DB_COLLATION), nullable=True, unique=True)
    identification_number = db.Column(
        db.String(25, collation=configs.DB_COLLATION),
        comment='National ID. i.e. Cedula, License',
        unique=True
    )
    phone = db.Column(db.String(10, collation=configs.DB_COLLATION), nullable=True, unique=True)
    created_on = db.Column(db.DateTime(), nullable=False, default=datetime.utcnow)
    updated_on = db.Column(
        db.DateTime(),
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    history = relationship('TenantHistory', back_populates='tenant')


class TenantHistory(db.Model, ModelIter):
    __tablename__ = 'tenants_history'

    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'), index=True, nullable=False)
    reference1_phone = db.Column(db.String(10, collation=configs.DB_COLLATION), nullable=False)
    reference2_phone = db.Column(db.String(10, collation=configs.DB_COLLATION), nullable=True)
    reference3_phone = db.Column(db.String(10, collation=configs.DB_COLLATION), nullable=True)

    tenant = relationship(Tenant, back_populates='history')
    rental_agreement = relationship('RentalAgreement', uselist=False)


class RentalAgreement(db.Model, ModelIter):
    __tablename__ = 'rental_agreements'
    fillable = ['tenant_history_id', 'room_id', 'project_id', 'time_interval_id', 'rate', 'entered_on', 'deposit']

    id = db.Column(db.Integer, primary_key=True)
    tenant_history_id = db.Column(db.Integer, db.ForeignKey('tenants_history.id'), index=True, nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id'), index=True, nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), index=True, nullable=False)
    time_interval_id = db.Column(db.Integer, db.ForeignKey('time_intervals.id'), nullable=False)
    rate = db.Column(db.Numeric(10, 2), nullable=False)
    deposit = db.Column(db.Numeric(10, 2), nullable=False)
    created_on = db.Column('created_on', db.DateTime(), nullable=False, default=datetime.utcnow)
    entered_on = db.Column(db.DateTime(), nullable=False)
    terminated_on = db.Column(db.DateTime())

    tenant_history = relationship(TenantHistory, uselist=False, back_populates='rental_agreement',
                                  cascade='all, delete')
    room = relationship('Room', uselist=False)
    project = relationship(Project, uselist=False)
    interval = relationship(TimeInterval, uselist=False)


class Room(db.Model, ModelIter):
    __tablename__ = 'rooms'
    fillable = ['project_id', 'name', 'rent', 'time_interval_id', 'description', 'picture']

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), index=True, nullable=False)
    name = db.Column(db.String(30, collation=configs.DB_COLLATION))
    description = db.Column(db.Text(collation=configs.DB_COLLATION))
    picture = db.Column(db.String(255, collation=configs.DB_COLLATION))

    project = relationship(Project, back_populates='rooms')
    rental_agreement = relationship(
        'RentalAgreement',
        uselist=False,
        primaryjoin=and_(RentalAgreement.room_id == id, RentalAgreement.terminated_on.is_(None))
    )

    __table_args__ = (
        UniqueConstraint('project_id', 'name', name='project_id_name_uc'),
    )


class Policy(db.Model, ModelIter):
    __tablename__ = 'policies'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(30, collation=configs.DB_COLLATION), index=True, nullable=False)
    text = db.Column(db.Text(collation=configs.DB_COLLATION))
    start_ttv = db.Column(db.DateTime(), nullable=False, index=True, default=datetime.utcnow)
    end_ttv = db.Column(db.DateTime(), nullable=False, index=True, default=datetime(
        9999, 12, 31, 23, 59, 59, 999999)
                        )


class Balance(db.Model, ModelIter):
    __tablename__ = 'balances'

    id = db.Column(BigInteger, primary_key=True)
    agreement_id = db.Column(BigInteger, db.ForeignKey('rental_agreements.id'), index=True)
    balance = db.Column(db.Numeric(10, 2), nullable=False)
    previous_balance = db.Column(db.Numeric(10, 2), nullable=False)
    created_on = db.Column(db.DateTime(), nullable=False, index=True, default=datetime.utcnow)
    due_date = db.Column(db.DateTime(), nullable=False, index=True)

    agreement = relationship(RentalAgreement, uselist=False, backref='balances', cascade='all, delete')
    payments = relationship('Payment', backref='balances', cascade='all, delete')


class PaymentType(db.Model, ModelIter):
    __tablename__ = 'payment_types'
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(15, collation=configs.DB_COLLATION))


class Payment(db.Model, ModelIter):
    __tablename__ = 'payments'
    fillable = ['amount', 'payment_type_id']

    id = db.Column(BigInteger, Sequence('payments_id_seq', start=1000, increment=1), primary_key=True)
    balance_id = db.Column(BigInteger, db.ForeignKey('balances.id'), index=True)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    paid_date = db.Column(db.DateTime(), nullable=False, index=True, default=datetime.utcnow)
    payment_type_id = db.Column(db.Integer, db.ForeignKey('payment_types.id'), nullable=False)

    payment_type = relationship(PaymentType, uselist=False)

    @property
    def type(self):
        return self.payment_type.type


class Expense(db.Model, ModelIter):
    __tablename__ = 'expenses'
    fillable = ['amount', 'expense_date']

    id = db.Column(BigInteger, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), index=True, nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    description = db.Column(db.String(512), nullable=False)
    input_date = db.Column(db.DateTime(), nullable=False, default=datetime.utcnow)
    expense_date = db.Column(db.DateTime(), nullable=False, index=True, default=datetime.utcnow)
    receipt_scans = db.Column(
        MutableList.as_mutable(db.JSON),
        comment='A JSON schema of scanned receipts',
        nullable=False,
        server_default='[]')

    project = relationship(Project, uselist=False)


class CompanyProfile(db.Model, ModelIter):
    __tablename__ = 'company_profile'
    fillable = ['name', 'address', 'contact']

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30, collation=configs.DB_COLLATION), unique=True, nullable=False)
    address = db.Column(db.Text(collation=configs.DB_COLLATION), nullable=False)
    contact = db.Column(db.String(10, collation=configs.DB_COLLATION), nullable=False)
    logo = db.Column(db.LargeBinary)


class Audit(db.Model, ModelIter):
    __tablename__ = 'audits'

    id = db.Column(BigInteger, primary_key=True)
    date = db.Column(db.DateTime(), nullable=False, index=True, default=datetime.utcnow)
    user_id = db.Column(BigInteger, db.ForeignKey('users.id'), index=True, nullable=True)
    ip = db.Column(db.String(15), nullable=False)
    endpoint = db.Column(db.String(255, collation=configs.DB_COLLATION), nullable=False)
    method = db.Column(db.String(7, collation=configs.DB_COLLATION), nullable=False)
    headers = db.Column(db.Text(collation=configs.DB_COLLATION))
    payload = db.Column(db.Text(collation=configs.DB_COLLATION))
    response = db.Column(db.Text(collation=configs.DB_COLLATION))

    user = relationship(User, uselist=False)
