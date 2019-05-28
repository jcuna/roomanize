from flask_sqlalchemy import SQLAlchemy
from app import db, init_app
from dal.models import collation, TimeInterval, PaymentType

app = init_app()


def seed_time_intervals(db: SQLAlchemy):
    time_intervals = [
        TimeInterval(id=100, interval="Semanal"),
        TimeInterval(id=200, interval="Quincenal"),
        TimeInterval(id=400, interval="Mensual")
    ]

    db.session.bulk_save_objects(time_intervals)
    db.session.commit()


def seed_payment_types(db: SQLAlchemy):
    payment_types = [
        PaymentType(id=100, type='Effectivo'),
        PaymentType(id=200, type='Credito'),
        PaymentType(id=400, type='Cheque'),
    ]

    db.session.bulk_save_objects(payment_types)
    db.session.commit()


def run_migration():
    with app.app_context():
        connection = db.engine.raw_connection()
        connection.cursor().execute("SET NAMES 'utf8mb4' COLLATE '" + collation + "'")

        db.create_all()

        seed_time_intervals(db)
        seed_payment_types(db)


def clear_cache():
    from app import cache
    cache.clear()
