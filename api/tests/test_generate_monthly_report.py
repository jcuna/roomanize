from datetime import datetime, time as d_time

import pytz
from flask.testing import FlaskClient

from tests import front_end_date, endpoint, Mock
from tests.seeders import seed_project, seed_room, seed_tenant, seed_new_agreement


project = Mock()
project.id = None

def test_report_format(client: FlaskClient, aws, admin_login):
    from core.crons.monthly_report import generate_report

    from_date = datetime.utcnow().astimezone(pytz.timezone('America/New_York')).date().replace(day=1)

    resp = seed_project(client, admin_login, {'name': 'ProjectName', 'address': '123 Micksburg St'})
    assert resp.status_code == 200
    project_id = resp.json['id']

    generate_report(from_date, project_id)

    assert 'monthly_report' in aws.dynamo
    assert len(aws.dynamo['monthly_report']) == 1

    from_date_adjusted = str(
        datetime.combine(from_date, d_time.min).astimezone(pytz.timezone('America/New_York')).date()
    )

    assert from_date_adjusted in aws.dynamo['monthly_report']
    assert 'project' in aws.dynamo['monthly_report'][from_date_adjusted]
    assert 'address' in aws.dynamo['monthly_report'][from_date_adjusted]

    assert aws.dynamo['monthly_report'][from_date_adjusted]['project'] == 'ProjectName'
    assert aws.dynamo['monthly_report'][from_date_adjusted]['address'] == '123 Micksburg St'

    assert 'report_day' in aws.dynamo['monthly_report'][from_date_adjusted]
    assert 'expenses' in aws.dynamo['monthly_report'][from_date_adjusted]
    assert 'income' in aws.dynamo['monthly_report'][from_date_adjusted]
    assert 'from_date' in aws.dynamo['monthly_report'][from_date_adjusted]
    assert 'to_date' in aws.dynamo['monthly_report'][from_date_adjusted]
    assert 'total_income' in aws.dynamo['monthly_report'][from_date_adjusted]
    assert 'total_expenses' in aws.dynamo['monthly_report'][from_date_adjusted]


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
        'date': front_end_date(), # defaults to today
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
        'date': front_end_date(), # defaults to today
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

    payment_a1_2 = client.post(
        endpoint('/pay-balance'),
        json={'balance_id': balance1, 'payment_type_id': 1, 'amount': 2500},
        headers=admin_login
    )

    payment_a2_1 = client.post(
        endpoint('/pay-balance'),
        json={'balance_id': balance2, 'payment_type_id': 1, 'amount': 800},
        headers=admin_login
    )

    payment_a2_2 = client.post(
        endpoint('/pay-balance'),
        json={'balance_id': balance2, 'payment_type_id': 1, 'amount': 5000},
        headers=admin_login
    )

    payment_a2_3 = client.post(
        endpoint('/pay-balance'),
        json={'balance_id': balance2, 'payment_type_id': 1, 'amount': -1000},
        headers=admin_login
    )

    expense1 = client.post(endpoint('/expenses'), json={
        'nonce': "randome1234",
        'amount': "600.00",
        'description': "Something",
        'date': front_end_date(),
    })

    expense2 = client.post(endpoint('/expenses'), json={
        'nonce': "random54321",
        'amount': "1500.00",
        'description': "Another expense",
        'date': front_end_date(),
    })

    expense3 = client.post(endpoint('/expenses'), json={
        'nonce': "random94932",
        'amount': "620.00",
        'description': "A thrid expense",
        'date': front_end_date(),
    })


def test_report_generated(client: FlaskClient, admin_login: dict, aws):
    from core.crons.monthly_report import generate_report

    from_date = datetime.utcnow().astimezone(pytz.timezone('America/New_York')).date().replace(day=1)

    generate_report(from_date, project.id)

    # if from_date is the same, then report gets overwritten
    assert len(aws.dynamo['monthly_report']) == 1

    from_date_adjusted = str(
        datetime.combine(from_date, d_time.min).astimezone(pytz.timezone('America/New_York')).date()
    )
