from datetime import datetime, timedelta, time as d_time
from time import time
from dateutil.relativedelta import *
import sqlalchemy
from sqlalchemy.orm import joinedload, load_only, defer
from config.constants import *
from core import get_logger
from dal import db
from dal.models import Balance, RentalAgreement
from app import init_app


def balances_cron():
    start = time()

    logger = get_logger('balances_cron')
    logger.info('')
    logger.info('Initiating daily balance creator')

    app = init_app('sys')

    with app.app_context():
        today = datetime.combine(datetime.utcnow().date(), d_time.max)
        yesterday = today - timedelta(days=1)
        five_days_ago = yesterday - timedelta(days=5)

        try:
            agreements = RentalAgreement.query.options(
                joinedload('balances'), joinedload('balances.payments'), joinedload('interval')).filter(
                RentalAgreement.terminated_on.is_(None)).filter(RentalAgreement.id.notin_(
                    Balance.query.options(
                        defer(Balance.id),
                        load_only(Balance.agreement_id)
                    ).filter(Balance.due_date >= today).subquery()))\
                .join(Balance).filter(
                (Balance.due_date.between(five_days_ago, yesterday)) &
                (Balance.created_on < five_days_ago) | (Balance.init_processed.is_(False)))

            process_agreements(agreements.all(), logger)

        except (sqlalchemy.exc.OperationalError, Exception) as e:
            logger.error('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^')
            logger.error('View exception below')
            logger.exception('Error: ')

        logger.info('Took: ' + str(timedelta(seconds=(time() - start))))


def process_agreements(agreements, logger):

    agreement: RentalAgreement
    for agreement in agreements:
        if len(agreement.balances) > 1:
            logger.error('Invalid agreement was setup with more than two balances per cycle ' + str(agreement.id))

        logger.info('Processing agreement id: ' + str(agreement.id))

        cycle_balance: Balance = agreement.balances[0]
        if not cycle_balance.init_processed:
            cycle_balance.init_processed = True

        payments = sum(map(lambda b: b.amount, cycle_balance.payments))

        logger.info(str(len(cycle_balance.payments)) + ' Payments processed Total:' + str(payments))

        previous_balance = cycle_balance.balance - payments
        new_balance = previous_balance + agreement.rate

        logger.info('Previous balance: ' + str(previous_balance) + ' | New balance: ' + str(new_balance))

        if agreement.interval.interval == SEMANAL:
            delta = timedelta(weeks=1)
        elif agreement.interval.interval == QUINCENAL:
            delta = timedelta(days=14)
        else:
            delta = relativedelta(months=1)

        new_cycle_balance = Balance(
            agreement=agreement,
            balance=new_balance,
            previous_balance=previous_balance,
            due_date=cycle_balance.due_date + delta,
            init_processed=True,
        )
        logger.info('Agreement entered on: ' + str(agreement.entered_on))
        logger.info('Pay cycle: ' + agreement.interval.interval)
        logger.info('Last due date: ' + str(cycle_balance.due_date))
        logger.info('Next due date: ' + str(new_cycle_balance.due_date))

        db.session.add(new_cycle_balance)

    db.session.commit()
