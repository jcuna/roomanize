from datetime import datetime, timedelta, time as d_time
from logging import Logger

from dateutil.relativedelta import relativedelta
import sqlalchemy
from sqlalchemy.orm import joinedload
from sqlalchemy.sql import functions

from config.constants import *
from core import get_logger
from core.utils import TimeLogger
from dal import db
from dal.models import Balance, RentalAgreement
from app import init_app


def balances_cron():

    logger = get_logger('balances_cron')
    logger.info('')
    logger.info('Initiating daily balance creator')

    app = init_app('sys')
    with TimeLogger(logger):
        with app.app_context():
            today = datetime.combine(datetime.utcnow().date(), d_time.max)
            yesterday = today - timedelta(days=1)

            balances = Balance.query.options(
                joinedload(Balance.agreement),
                joinedload(Balance.payments)).filter(
                Balance.due_date <= yesterday,
                Balance.id.in_(db.session.query(functions.max(Balance.id)).group_by(Balance.agreement_id).subquery())
            ).join(
                Balance.agreement, isouter=True
            ).filter(RentalAgreement.terminated_on.is_(None))
            try:
                process_agreements(balances.all(), logger)

            except (sqlalchemy.exc.OperationalError, Exception) as e:
                logger.error('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^')
                logger.error('View exception below')
                logger.exception('Error: ')


def process_agreements(balances: list, logger: Logger):
    # this should only contain distinct values
    agreement_ids = []
    cycle_balance: Balance
    for cycle_balance in balances:

        assert cycle_balance.agreement_id not in agreement_ids
        agreement_ids.append(cycle_balance.agreement_id)

        logger.info('Processing agreement id: ' + str(cycle_balance.agreement_id))

        payments = sum(map(lambda b: b.amount, cycle_balance.payments))

        logger.info(str(len(cycle_balance.payments)) + ' Payments processed Total:' + str(payments))

        previous_balance = cycle_balance.balance - payments
        new_balance = previous_balance + cycle_balance.agreement.rate

        logger.info('Previous balance: ' + str(previous_balance) + ' | New balance: ' + str(new_balance))

        if cycle_balance.agreement.interval.interval == SEMANAL:
            delta = timedelta(weeks=1)
        elif cycle_balance.agreement.interval.interval == QUINCENAL:
            delta = timedelta(days=14)
        else:
            delta = relativedelta(months=1)

        new_cycle_balance = Balance(
            agreement=cycle_balance.agreement,
            balance=new_balance,
            previous_balance=previous_balance,
            due_date=cycle_balance.due_date + delta,
        )
        logger.info('Agreement entered on: ' + str(cycle_balance.agreement.entered_on))
        logger.info('Pay cycle: ' + cycle_balance.agreement.interval.interval)
        logger.info('Last due date: ' + str(cycle_balance.due_date))
        logger.info('Next due date: ' + str(new_cycle_balance.due_date))

        db.session.add(new_cycle_balance)

    db.session.commit()
