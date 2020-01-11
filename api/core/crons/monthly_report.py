"""
    Runs all queries necessary to generate a monthly reports and and sticks it into DynamoDB as a json object
    Reports can be retrieved from DynamoDB via api and can be used to generate a template report for presentation
"""
from datetime import datetime, timedelta, time as d_time
from logging import Logger
from time import time

import pytz

from dateutil.relativedelta import relativedelta

from app import init_app
from core import get_logger
from core.AWS import Resource
from dal.models import Project


def get_expenses(project: Project, from_date: datetime, to_date: datetime, logger: Logger):
    result = []
    return result

def get_income(project: Project, from_date: datetime, to_date: datetime, logger: Logger):
    result = []
    return result

def generate_report(first_date: datetime.date, project_id):

    start = time()

    logger = get_logger('monthly_report')
    logger.info('')
    logger.info('Initiating monthly report job')

    assert first_date.day == 1

    app = init_app('sys')

    with app.app_context():

        from_date = datetime.combine(first_date, d_time.min).astimezone(pytz.timezone(app.config['TIME_ZONE']))
        to_date = datetime.combine(
            (datetime(from_date.year, from_date.month, from_date.day) + relativedelta(months=1, days=-1)).date(),
            d_time.max
        ).astimezone(pytz.timezone(app.config['TIME_ZONE']))

        project = Project.query.filter_by(id=project_id).first()

        assert project is not None

        expenses = get_expenses(project, from_date, to_date, logger)
        income = get_income(project, from_date, to_date, logger)

        rsrc = Resource()
        rsrc.insert_monthly_report({
            'project': project.name,
            'address': project.address,
            'report_day': str(datetime.utcnow().astimezone(pytz.timezone(app.config['TIME_ZONE'])).date()),
            'from_date': str(from_date.date()),
            'to_date': str(to_date.date()),
            'expenses': expenses,
            'income': income,
            'total_income': sum(map(lambda x: x.amount, income)),
            'total_expenses': sum(map(lambda x: x.amount, expenses)),
        })

    logger.info('Took: ' + str(timedelta(seconds=(time() - start))))
