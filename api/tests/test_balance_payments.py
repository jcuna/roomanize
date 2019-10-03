from datetime import datetime, timedelta
import pytest
from dateutil.relativedelta import *
from _decimal import Decimal
from flask.testing import FlaskClient
from tests import front_end_date, endpoint
from tests.seeders import seed_tenant, seed_new_agreement, seed_project, seed_room


def test_seeding_data(client: FlaskClient, admin_login: dict):

    project_resp = seed_project(client, admin_login['token']['value'])
    assert 'id' in project_resp.json
    assert project_resp.status_code == 200

    room_resp = seed_room(client, admin_login['token']['value'], {'project_id': project_resp.json['id']})
    assert 'id' in room_resp.json
    assert room_resp.status_code == 200

    tenant_resp = seed_tenant(client, admin_login['token']['value'])
    assert 'id' in tenant_resp.json
    assert tenant_resp.status_code == 200


def test_agreement(client: FlaskClient, admin_login: dict):
    from dal.models import Balance, RentalAgreement, Tenant, db, TenantHistory, Payment
    from core.crons.balances import balances_cron

    tenants = Tenant.query.all()
    assert len(tenants) == 1
    tenant = tenants.pop()
    assert hasattr(tenant, 'id')

    tenant_id = tenant.id
    # create a new agreement with a balance due today
    agreement_resp = seed_new_agreement(client, admin_login['token']['value'], {'tenant_id': tenant_id})
    assert 'id' in agreement_resp.json
    assert agreement_resp.status_code == 200

    balances = Balance.query.all()
    assert len(balances) == 1, 'only one balance should exist, the one created on agreement creation'
    balance = balances.pop()
    assert isinstance(balance.agreement_id, int)
    assert balance.balance == Decimal(5900), 'balance should be the sum of deposits and agreement rate'
    assert balance.due_date.date() == datetime.utcnow().date()
    assert isinstance(balance.agreement, RentalAgreement)

    # run balance generator
    balances_cron()
    balances = Balance.query.all()
    assert len(balances) == 1, 'We created an agreement with today as due date so no new balances \
    should be created after balance cron runs'

    # remove all data related to this agreement to test other scenarios
    for b in balances: db.session.delete(b)
    db.session.commit()
    # should've cascaded through
    assert len(RentalAgreement.query.all()) == 0
    assert len(TenantHistory.query.all()) == 0
    assert len(Payment.query.all()) == 0
    assert len(Balance.query.all()) == 0


def test_new_balance(client: FlaskClient, admin_login: dict):
    from core.crons.balances import balances_cron
    from dal.models import Balance, Tenant, RentalAgreement

    tenants = Tenant.query.all()
    tenant_id = tenants.pop().id
    # create a new agreement with a balance due in the past so it generates a new balance
    start_date = datetime.utcnow() - timedelta(days=1)
    override = {'tenant_id': tenant_id, 'date': front_end_date(start_date)}
    seed_new_agreement(client, admin_login['token']['value'], override)

    # run balance generator
    balances_cron()

    balances = Balance.query.all()
    assert len(balances) == 2, 'our latest agreement has a balance due yesterday, \
    so we should have generated a new balance for the new period'

    last_balance = Balance.query.order_by(Balance.due_date.desc()).limit(1).first()
    assert last_balance.balance == Decimal(7400), 'new balance should be the sum of the previous balance \
    plus the agreements rate since no payment has been made'
    assert last_balance.due_date.date() == (start_date + timedelta(weeks=1)).date(), 'due date is a week \
    from yesterday (start_date) because we seeded agreement with weekly payment'

    balances_cron()

    assert Balance.query.count() == 2, 'We should still only have two balances since the newly created balance \
    is not ready to be processed'
    assert RentalAgreement.query.count() == 1, 'only one rental agreement thus far'


def test_tenant_balance_generation(client: FlaskClient, admin_login: dict):
    from dal.models import Tenant, RentalAgreement, Project, Balance
    from core.crons.balances import balances_cron

    override = {
        'email': 'tenant2@tenant.com',
        'first_name': 'Sample2',
        'last_name': 'Tenant2',
        'identification_number': '223-1234567-8',
        'phone': '5555555556'
    }
    # just positive testing for now. A scenario where a tenant with same id number, email or phone # should fail
    tenant_resp = seed_tenant(client, admin_login['token']['value'], override)
    assert 'id' in tenant_resp.json
    assert tenant_resp.status_code == 200
    assert Tenant.query.count() == 2

    tenant_id = tenant_resp.json['id']

    project_id = Project.query.first().id

    # seed another room
    room_resp = seed_room(client, admin_login['token']['value'], {'name': 'MA-1001', 'project_id': project_id})

    # create a new agreement with a balance due in the past so it generates a new balance
    start_date = datetime.utcnow() - timedelta(days=4)
    override = {
        'date': front_end_date(start_date),
        'deposit': '3000.00',
        'interval': '400',
        'rate': '3000.00',
        'room_id': room_resp.json['id'],
        'tenant_id': tenant_id
    }

    agreement = seed_new_agreement(client, admin_login['token']['value'], override)
    assert Balance.query.count() == 3, 'We should have thee balances, two from previous and one \
    from just inserted one'
    assert RentalAgreement.query.count() == 2, 'Should have two rental agreements now'

    balances_cron()

    new_balance = Balance.query.filter(Balance.agreement_id == agreement.json['id']).order_by(
        Balance.due_date.desc()
    ).limit(1).first()
    assert new_balance.balance == Decimal(9000), 'new balance should be the sum of the previous balance \
        plus the agreements rate since no payment has been made'
    assert new_balance.due_date.date() == (start_date + relativedelta(months=1)).date()

    assert Balance.query.count() == 4, 'Only 4 balances should exist right now'
    balances_cron()
    assert Balance.query.count() == 4, 'Only 4 balances should exist right now since no new agreements or \
    date has changed'


@pytest.mark.parametrize('_in, out, c', [(4500.00, 2000.00, 3), (3500.00, 3000.00, 4), (1250.99, 5249.01, 5)])
def test_tenant_balance_generation_with_payments(client: FlaskClient, admin_login: dict, _in, out, c):
    from dal.models import Tenant, RentalAgreement, Project, Balance
    from core.crons.balances import balances_cron

    override = {
        'email': 'tenant' + str(int(_in)) + '@tenant.com',
        'first_name': 'Sample' + str(int(_in)) + '',
        'last_name': 'Tenant' + str(int(_in)) + '',
        'identification_number': '223-1' + str(int(_in)) + '67-8',
        'phone': '555555' + str(int(_in))
    }

    tenant = seed_tenant(client, admin_login['token']['value'], override)

    assert 'id' in tenant.json
    assert tenant.status_code == 200
    assert Tenant.query.count() == c

    # seed another room
    room_resp = seed_room(
        client,
        admin_login['token']['value'],
        {'name': 'MA-' + str(int(_in)), 'project_id': Project.query.first().id}
    )
    # create a new agreement with a balance due in the past so it generates a new balance
    start_date = datetime.utcnow() - timedelta(days=2)
    override = {
        'date': front_end_date(start_date),
        'deposit': '2500.00',
        'interval': '200',  # biweekly
        'rate': '2000.00',
        'room_id': room_resp.json['id'],
        'tenant_id': tenant.json['id']
    }
    agreement_resp = seed_new_agreement(client, admin_login['token']['value'], override)
    agreement = RentalAgreement.query.filter(RentalAgreement.id == agreement_resp.json['id']).first()
    assert len(agreement.balances) == 1
    assert RentalAgreement.query.count() == c

    payment = client.post(
        endpoint('/pay-balance'),
        json={'balance_id': agreement.balances[0].id, 'payment_type_id': 1, 'amount': _in},
        headers={'X-Access-Token': admin_login['token']['value']}
    )
    assert 'id' in payment.json
    assert payment.status_code == 200
    balances_cron()
    balance = Balance.query.filter(Balance.agreement_id == agreement_resp.json['id'])\
        .order_by(Balance.due_date.desc()).limit(1).first()

    assert float(balance.balance) == out
    assert balance.due_date.date() == (start_date + timedelta(days=14)).date()

    balances_cron()

    agreement = RentalAgreement.query.filter(RentalAgreement.id == agreement_resp.json['id']).first()
    assert len(agreement.balances) == 2, 'No new balance should`ve been created for this agreement'


def test_tenant_balance_not_created(client: FlaskClient, admin_login: dict):
    from dal.models import Tenant, RentalAgreement, Project, Balance
    from core.crons.balances import balances_cron

    override = {
        'email': 'tenant4@tenant.com',
        'first_name': 'Sample4',
        'last_name': 'Tenant4',
        'identification_number': '423-1234567-8',
        'phone': '5555555558'
    }

    tenant_resp = seed_tenant(client, admin_login['token']['value'], override)
    assert 'id' in tenant_resp.json
    assert tenant_resp.status_code == 200
    assert Tenant.query.count() == 6

    # seed another room
    room_resp = seed_room(
        client,
        admin_login['token']['value'],
        {'name': 'MA-1004', 'project_id': Project.query.first().id}
    )
    # create a new agreement with a balance due in the past so it generates a new balance
    start_date = datetime.utcnow() + timedelta(days=4)
    override = {
        'date': front_end_date(start_date),
        'deposit': '3000.00',
        'interval': '200',  # biweekly
        'rate': '2000.00',
        'room_id': room_resp.json['id'],
        'tenant_id': tenant_resp.json['id']
    }

    agreement_resp = seed_new_agreement(client, admin_login['token']['value'], override)
    assert Balance.query.count() == 11
    agreement = RentalAgreement.query.filter(RentalAgreement.id == agreement_resp.json['id']).first()
    assert len(agreement.balances) == 1
    assert agreement.balances[0].balance == Decimal(5000)
    assert agreement.balances[0].due_date.date() == start_date.date()

    balances_cron()

    assert Balance.query.count() == 11, 'no new balances should`ve been created because agreement starts in the future'
    agreement2 = RentalAgreement.query.filter(RentalAgreement.id == agreement_resp.json['id']).first()
    assert len(agreement2.balances) == 1
    assert agreement2.balances[0].balance == Decimal(5000)
    assert agreement2.balances[0].due_date.date() == start_date.date()
