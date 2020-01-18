"""
    Runs all queries necessary to generate a monthly reports and and sticks it into DynamoDB as a json object
    Reports can be retrieved from DynamoDB via api and can be used to generate a template report for presentation
"""
import json
from datetime import datetime, time as d_time, timedelta
from typing import List
from urllib import request, parse

import pytz

from dateutil.relativedelta import relativedelta
from flask import render_template
from flask_mail import Message
from sqlalchemy.orm import joinedload, defer, lazyload, sessionmaker, scoped_session

from app import init_app
from config.constants import MONTHS_SPANISH
from core import get_logger
from core.AWS import Resource
from core.utils import TimeLogger, dynamo_db_encode
from dal import db
from dal.models import Project, Expense, Payment, RentalAgreement, Balance, User, UserAttributes


def get_expenses(project: Project, from_date: datetime, to_date: datetime) -> List[Expense]:
    return Expense.query.options(defer(Expense.receipt_scans)).filter(
        Expense.expense_date.between(from_date, to_date),
        Expense.project_id == project.id
    ).all()


def get_income(project: Project, from_date: datetime, to_date: datetime) -> List[Payment]:
    return Payment.query.options(
        joinedload('balance'),
        joinedload('balance.agreement')
    ).join(Balance, (Balance.id == Payment.balance_id)).join(RentalAgreement).filter(
        Payment.paid_date.between(from_date, to_date),
        RentalAgreement.project_id == project.id
    ).all()


def send_notifications(project: Project, from_date: datetime.date, to_date: datetime.date, app, logger):
    from_date = from_date.astimezone(pytz.utc).date()
    to_date = to_date.astimezone(pytz.utc).date()

    user: User
    for user in db.session.query(User).filter_by(deleted=False).join(UserAttributes).options(lazyload('*')).yield_per(50):
        if 'projects' in user.attributes.access and \
                (user.attributes.access['projects'] == '*' or project.id in user.attributes.access['projects']):
            body = render_template(
                'email/monthly_statement_report.html',
                url='http://hi.cm',
                name=user.first_name,
                month=MONTHS_SPANISH[from_date.month],
                start_date=from_date.strftime('%m-%d-%Y'),
                end_date=to_date.strftime('%m-%d-%Y'),
                project=project.name
            )
            subject = 'Reporte mensual (%s)' % project.name

            msg = Message(subject, recipients=[user.email])
            msg.html = body
            app.mail(msg)

            data = {
                'user_id': user.id,
                'subject': subject,
                'body': body
            }
            headers = {'X-System-Token': app.config['SECRET_KEY'], 'Content-Type': 'application/json'}
            req = request.Request(
                '%s/notifications' % app.config['DOMAIN_URL'],
                method='POST',
                data=json.dumps(data).encode(),
                headers=headers
            )
            op = request.urlopen(req)
            if op.getcode() != 200:
                logger.error('Could not send notification')
                logger.error(str(op.info()))


def generate_report(first_date: datetime.date, project_id: int, tz: str):
    assert first_date.day == 1

    from_date = datetime.combine(first_date, d_time.min)
    to_date = datetime.combine(
        (from_date + relativedelta(months=1, days=-1)).date(),
        d_time.max
    )
    from_utc = from_date.astimezone(pytz.utc)
    to_utc = to_date.astimezone(pytz.utc)

    project = Project.query.filter_by(id=project_id).first()

    assert project is not None

    expenses = get_expenses(project, from_utc, to_utc)
    income = get_income(project, from_utc, to_utc)

    total_expenses = sum(map(lambda x: x.amount, expenses))
    total_income = sum(map(lambda x: x.amount, income))

    rsrc = Resource()
    rsrc.insert_monthly_report({
        'uid': {'S': '%s-%s' % (project.id, from_date.date())},
        'project_id': {'N': str(project.id)},
        'project': {'S': project.name},
        'address': {'S': project.address},
        'report_day': {'S': str(datetime.utcnow().date())},
        'from_date': {'S': str(from_date.date())},
        'to_date': {'S': str(to_date.date())},
        'expenses': dynamo_db_encode(expenses),
        'income': dynamo_db_encode(income),
        'total_income': {'N': '{0:.2f}'.format(total_income)},
        'total_expenses': {'N': '{0:.2f}'.format(total_expenses)},
        'revenue': {'N': '{0:.2f}'.format(total_income - total_expenses)},
    })
    return project, from_date, to_date


def generate_all_reports():
    from flask_socketio import SocketIO

    logger = get_logger('monthly_report')
    logger.info('')
    logger.info('Initiating monthly report job')
    with TimeLogger(logger):
        app = init_app('sys')
        sio = SocketIO(app)
        this_month_first = datetime.utcnow().date().replace(day=1)
        last_month_first = (this_month_first - timedelta(days=1)).replace(day=1)
        with app.app_context():
            for project_id in db.session.query().add_columns(Project.id).all():
                try:
                    logger.info('processing report for project id: %s' % project_id.id)
                    project, from_date, to_date = generate_report(last_month_first, project_id.id, app.config['TIME_ZONE'])
                    send_notifications(project, from_date, to_date, app, logger)
                except Exception as e:
                    logger.exception(str(e))
