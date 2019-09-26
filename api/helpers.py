from flask_sqlalchemy import SQLAlchemy
from app import db, init_app
from config.constants import *
from dal.models import TimeInterval, PaymentType


def seed_time_intervals(db: SQLAlchemy):
    time_intervals = [
        TimeInterval(id=100, interval=SEMANAL),
        TimeInterval(id=200, interval=QUINCENAL),
        TimeInterval(id=400, interval=MENSUAL)
    ]

    db.session.bulk_save_objects(time_intervals)
    db.session.commit()


def seed_payment_types(db: SQLAlchemy):
    payment_types = [
        PaymentType(id=100, type=EFFECTIVO),
        PaymentType(id=200, type=CREDITO),
        PaymentType(id=400, type=CHEQUE),
        PaymentType(id=600, type=REEMBOLSO),
    ]

    db.session.bulk_save_objects(payment_types)
    db.session.commit()


def run_migration():
    app = init_app('sys')
    with app.app_context():

        db.create_all()
        db.session.commit()
        seed_time_intervals(db)
        seed_payment_types(db)


def clear_cache():
    from core import cache
    cache.clear()
