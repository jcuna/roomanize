from datetime import datetime, time as d_time, timedelta

import pytz
from flask.testing import FlaskClient

from tests import front_end_date, endpoint, Mock
from tests.injectors import resources
from tests.seeders import seed_project, seed_room, seed_tenant, seed_new_agreement

project = Mock()
project.id = None
project.id2 = None


def test_report_format(client: FlaskClient, aws, admin_login):
    from core.crons.monthly_report import generate_report

    from_date = datetime.utcnow().astimezone(pytz.timezone('America/New_York')).date().replace(day=1)

    resp = seed_project(client, admin_login, {'name': 'ProjectName', 'address': '123 Micksburg St'})
    assert resp.status_code == 200
    project_id = resp.json['id']

    generate_report(from_date, project_id)

    assert 'monthly_report' in aws.dynamo
    assert len(aws.dynamo['monthly_report']) == 1

    key = '%s-%s' % \
          (project_id, from_date)

    assert 'uid' in aws.dynamo['monthly_report'][0]
    assert key in aws.dynamo['monthly_report'][0]['uid']['S']
    assert 'project' in aws.dynamo['monthly_report'][0]
    assert 'project_id' in aws.dynamo['monthly_report'][0]
    assert 'address' in aws.dynamo['monthly_report'][0]

    assert aws.dynamo['monthly_report'][0]['project']['S'] == 'ProjectName'
    assert aws.dynamo['monthly_report'][0]['address']['S'] == '123 Micksburg St'

    assert 'report_day' in aws.dynamo['monthly_report'][0]
    assert 'expenses' in aws.dynamo['monthly_report'][0]
    assert 'income' in aws.dynamo['monthly_report'][0]
    assert 'from_date' in aws.dynamo['monthly_report'][0]
    assert 'to_date' in aws.dynamo['monthly_report'][0]
    assert 'total_income' in aws.dynamo['monthly_report'][0]
    assert 'total_expenses' in aws.dynamo['monthly_report'][0]
    assert 'revenue' in aws.dynamo['monthly_report'][0]


def test_seed_monthly_data(client: FlaskClient, admin_login):
    from dal.models import RentalAgreement

    resp = seed_project(client, admin_login, {'name': 'ProjectName1', 'address': '321 Cheeksburg Ave'})
    project.id = project_id = resp.json['id']

    resp_room = seed_room(client, admin_login, {'project_id': project_id, 'name': 'RM-111'}).json['id']

    resp_room2 = seed_room(client, admin_login, {'project_id': project_id, 'name': 'RM-112'}).json['id']

    tenant_override1 = {
        'email': 'tenant5@tenant.com',
        'first_name': 'Sample5',
        'last_name': 'Tenant5',
        'identification_number': '555-1234567-9',
        'phone': '5555555546'
    }

    tenant_override2 = {
        'email': 'tenant6@tenant.com',
        'first_name': 'Sample6',
        'last_name': 'Tenant6',
        'identification_number': '666-1234567-8',
        'phone': '775555556'
    }

    tenant_id = seed_tenant(client, admin_login, tenant_override1).json['id']
    tenant_id2 = seed_tenant(client, admin_login, tenant_override2).json['id']

    registration_override1 = {
        'date': front_end_date(),  # defaults to today
        'deposit': '3000.00',
        'interval': '100',  # weekly, 200 every two weeks and 400 monthly
        'rate': '1500.00',
        'reference1': '1234561324',
        'reference2': '',
        'reference3': '',
        'room_id': resp_room,
        'tenant_id': tenant_id
    }
    registration_override2 = {
        'date': front_end_date(),  # defaults to today
        'deposit': '3000.00',
        'interval': '200',  # weekly, 200 every two weeks and 400 monthly
        'rate': '2000.00',
        'reference1': '8293421324',
        'reference2': '8095643214',
        'reference3': '8095020212',
        'room_id': resp_room2,
        'tenant_id': tenant_id2
    }

    r1 = seed_new_agreement(client, admin_login, registration_override1)
    r2 = seed_new_agreement(client, admin_login, registration_override2)

    balance1 = RentalAgreement.query.filter(RentalAgreement.id == r1.json['id']).first().balances[0].id
    balance2 = RentalAgreement.query.filter(RentalAgreement.id == r2.json['id']).first().balances[0].id

    payment_a1_1 = client.post(
        endpoint('/pay-balance'),
        json={'balance_id': balance1, 'payment_type_id': 1, 'amount': 500},
        headers=admin_login
    )
    assert payment_a1_1.status_code == 200

    payment_a1_2 = client.post(
        endpoint('/pay-balance'),
        json={'balance_id': balance1, 'payment_type_id': 1, 'amount': 2500},
        headers=admin_login
    )
    assert payment_a1_2.status_code == 200

    payment_a2_1 = client.post(
        endpoint('/pay-balance'),
        json={'balance_id': balance2, 'payment_type_id': 1, 'amount': 800},
        headers=admin_login
    )
    assert payment_a2_1.status_code == 200

    payment_a2_2 = client.post(
        endpoint('/pay-balance'),
        json={'balance_id': balance2, 'payment_type_id': 1, 'amount': 5000},
        headers=admin_login
    )
    assert payment_a2_2.status_code == 200

    payment_a2_4 = client.post(
        endpoint('/pay-balance'),
        json={'balance_id': balance2, 'payment_type_id': 1, 'amount': 225.25},
        headers=admin_login
    )
    assert payment_a2_4.status_code == 200
    assert 'id' in payment_a2_4.json

    payment_a2_3 = client.post(
        endpoint('/pay-balance'),
        json={'balance_id': balance2, 'payment_type_id': 1, 'amount': -1000},
        headers=admin_login
    )
    assert payment_a2_3.status_code == 200
    assert 'id' in payment_a2_3.json

    expense1 = client.post(endpoint('/expenses'), json={
        'nonce': "randome1234",
        'amount': "600.00",
        'description': "Something",
        'date': front_end_date(),
    }, headers=admin_login)
    assert expense1.status_code == 200

    expense2 = client.post(endpoint('/expenses'), json={
        'nonce': "random54321",
        'amount': "1500.00",
        'description': "Another expense",
        'date': front_end_date(),
    }, headers=admin_login)
    assert expense2.status_code == 200

    expense3 = client.post(endpoint('/expenses'), json={
        'nonce': "random94932",
        'amount': "620.00",
        'description': "A thrid expense",
        'date': front_end_date(),
    }, headers=admin_login)

    assert expense3.status_code == 200
    assert 'token' in expense3.json
    assert 'domain' in expense3.json
    assert 'id' in expense3.json


def test_report_generated(aws):
    from core.crons.monthly_report import generate_report

    from_date = datetime.utcnow().astimezone(pytz.timezone('America/New_York')).date().replace(day=1)
    generate_report(from_date, project.id)

    # if from_date is the same, then report gets overwritten
    assert len(aws.dynamo['monthly_report']) == 2

    key = '%s-%s' % \
          (project.id, datetime.combine(from_date, d_time.min).astimezone(pytz.utc).date())

    assert 'expenses' in aws.dynamo['monthly_report'][1]
    assert 'income' in aws.dynamo['monthly_report'][1]
    assert 'total_income' in aws.dynamo['monthly_report'][1]
    assert 'total_expenses' in aws.dynamo['monthly_report'][1]
    assert 'revenue' in aws.dynamo['monthly_report'][1]

    assert aws.dynamo['monthly_report'][1]['uid']['S'] == key
    assert len(aws.dynamo['monthly_report'][1]['expenses']['L']) == 3
    assert aws.dynamo['monthly_report'][1]['total_expenses']['S'] == '2720.00'

    assert len(aws.dynamo['monthly_report'][1]['income']['L']) == 6
    assert aws.dynamo['monthly_report'][1]['total_income']['S'] == '8025.25'

    assert aws.dynamo['monthly_report'][1]['revenue']['S'] == '5305.25'


def test_seed_second_project(client: FlaskClient, admin_login):
    from dal.models import RentalAgreement

    resp2 = seed_project(client, admin_login, {'name': 'ProjectName2', 'address': '555 Beverly Bottoms St'})

    assert resp2.status_code == 200
    project.id2 = resp2.json['id']

    change_proj = client.put(endpoint('/projects/%s' % project.id2), json={
        'id': project.id2,
        'active': True,
    }, headers=admin_login)

    assert change_proj.status_code == 200

    tenant_override3 = {
        'email': 'tenant8@tenant.com',
        'first_name': 'Sample8',
        'last_name': 'Tenant8',
        'identification_number': '888-1234567-8',
        'phone': '775555888'
    }
    tenant_id3 = seed_tenant(client, admin_login, tenant_override3).json['id']

    resp_room3 = seed_room(client, admin_login, {'project_id': project.id2, 'name': 'RM-404'}).json['id']

    registration_override3 = {
        'date': front_end_date(),  # defaults to today
        'deposit': '3000.00',
        'interval': '400',  # weekly, 200 every two weeks and 400 monthly
        'rate': '4000.00',
        'reference1': '8293429565',
        'reference2': '8095645542',
        'reference3': '8095023124',
        'room_id': resp_room3,
        'tenant_id': tenant_id3
    }

    r3 = seed_new_agreement(client, admin_login, registration_override3)

    balance3 = RentalAgreement.query.filter(RentalAgreement.id == r3.json['id']).first().balances[0].id

    expense4 = client.post(endpoint('/expenses'), json={
        'nonce': "randome9656",
        'amount': "600.00",
        'description': "Something for project 2",
        'date': front_end_date(),
    }, headers=admin_login)

    assert expense4.status_code == 200

    payment_a3_1 = client.post(
        endpoint('/pay-balance'),
        json={'balance_id': balance3, 'payment_type_id': 1, 'amount': 4000},
        headers=admin_login
    )
    assert payment_a3_1.status_code == 200
    assert 'id' in payment_a3_1.json


def test_project_2_monthly_report(aws):
    from core.crons.monthly_report import generate_report

    from_date = datetime.utcnow().astimezone(pytz.timezone('America/New_York')).date().replace(day=1)
    generate_report(from_date, project.id2)

    # if from_date is the same, then report gets overwritten
    assert len(aws.dynamo['monthly_report']) == 3

    key2 = '%s-%s' % \
           (project.id2, datetime.combine(from_date, d_time.min).astimezone(pytz.utc).date())

    assert 'uid' in aws.dynamo['monthly_report'][2]
    assert aws.dynamo['monthly_report'][2]['uid']['S'] == key2
    assert 'expenses' in aws.dynamo['monthly_report'][2]
    assert 'income' in aws.dynamo['monthly_report'][2]
    assert 'total_income' in aws.dynamo['monthly_report'][2]
    assert 'total_expenses' in aws.dynamo['monthly_report'][2]
    assert 'revenue' in aws.dynamo['monthly_report'][2]

    assert len(aws.dynamo['monthly_report'][2]['expenses']['L']) == 1
    assert aws.dynamo['monthly_report'][2]['total_expenses']['S'] == '600.00'

    assert len(aws.dynamo['monthly_report'][2]['income']['L']) == 1
    assert aws.dynamo['monthly_report'][2]['total_income']['S'] == '4000.00'

    assert aws.dynamo['monthly_report'][2]['revenue']['S'] == '3400.00'

    assert 'balance' in aws.dynamo['monthly_report'][2]['income']['L'][0]['M']
    assert 'agreement' in aws.dynamo['monthly_report'][2]['income']['L'][0]['M']['balance']['M']


def test_generate_all_from_last_month(aws):
    from core.crons.monthly_report import generate_all_reports
    generate_all_reports()

    this_month_first = datetime.utcnow().date().replace(day=1)
    last_month_first = (this_month_first - timedelta(days=1)).replace(day=1)

    assert len(aws.dynamo['monthly_report']) == 6
    assert 'uid' in aws.dynamo['monthly_report'][3]
    assert 'uid' in aws.dynamo['monthly_report'][4]
    assert 'uid' in aws.dynamo['monthly_report'][5]

    key = '%s-%s' % \
          (project.id, datetime.combine(last_month_first, d_time.min).astimezone(pytz.utc).date())

    assert 'uid' in aws.dynamo['monthly_report'][4]
    assert aws.dynamo['monthly_report'][4]['uid']['S'] == key

    key2 = '%s-%s' % \
           (project.id2, datetime.combine(last_month_first, d_time.min).astimezone(pytz.utc).date())

    assert 'uid' in aws.dynamo['monthly_report'][5]
    assert aws.dynamo['monthly_report'][5]['uid']['S'] == key2


def test_api_get_project_report(client: FlaskClient, aws, admin_login: dict):
    this_month_first = datetime.utcnow().date().replace(day=1)
    future_month = (this_month_first + timedelta(days=31)).replace(day=1)
    last_month_first = (this_month_first - timedelta(days=1)).replace(day=1)
    prior_to_last_month_first = (last_month_first - timedelta(days=1)).replace(day=1)
    three_months_ago = (last_month_first - timedelta(days=1)).replace(day=1)

    resp = client.get(endpoint('/reports/%s-%s' % (project.id, prior_to_last_month_first)), headers=admin_login)
    assert resp.status_code == 404

    resp = client.get(endpoint('/reports/%s-%s' % (project.id, three_months_ago)), headers=admin_login)
    assert resp.status_code == 404

    resp = client.get(endpoint('/reports/%s-%s' % (project.id, last_month_first)), headers=admin_login)
    assert resp.status_code == 200

    resp = client.get(endpoint('/reports/%s-%s' % (project.id, this_month_first)), headers=admin_login)
    assert resp.status_code == 200

    resp = client.get(endpoint('/reports/%s-%s' % (project.id, future_month)), headers=admin_login)
    assert resp.status_code == 404


def test_user_email_sent():
    assert len(resources.mails) == 3, 'it should have sent every user with access an email for each report generated'

    assert len(resources.requests) == 3

def test_get_reports_by_projects(client: FlaskClient, admin_login):

    resp = client.get(endpoint('/reports?project_id=%s' % project.id), headers=admin_login)
    assert resp.status_code == 200

    assert 'items' in resp.json
    assert len(resp.json['items']) == 2
