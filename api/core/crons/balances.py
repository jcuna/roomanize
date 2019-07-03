from datetime import datetime, timedelta
from pprint import pprint

from sqlalchemy.orm import joinedload

from core import get_logger
from dal import db
from dal.models import Balance, RentalAgreement


def balances_cron():
    logger = get_logger('balances_cron')
    logger.debug('')
    logger.debug('Initiating daily balance creator')
    today = datetime.utcnow()
    yesterday = today - timedelta(days=1)
    bef_yesterday = yesterday - timedelta(days=1)
    agreements = RentalAgreement.query.options(joinedload('balances')).filter(RentalAgreement.terminated_on.is_(None))\
        .filter(RentalAgreement.id.notin_(
            Balance.query.with_entities(Balance.agreement_id).filter(Balance.due_date >= today.date()).all()
        )
    ).join(Balance).filter(Balance.due_date.between(yesterday.date(), bef_yesterday.date))

    logger.debug(agreements.statement.compile())

    for agreement in agreements.all():
        pprint(agreement)
