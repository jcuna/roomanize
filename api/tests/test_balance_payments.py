from datetime import datetime, timedelta
from _decimal import Decimal
from flask.testing import FlaskClient
from tests import front_end_date
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
    override = {'tenant_id': tenant_id, 'date': front_end_date(datetime.utcnow() - timedelta(days=1))}
    seed_new_agreement(client, admin_login['token']['value'], override)

    # run balance generator
    balances_cron()

    balances = Balance.query.all()
    assert len(balances) == 2, 'our latest agreement has a balance due yesterday, \
    so we should have generated a new balance for the new period'

    last_balance = Balance.query.order_by(Balance.due_date.desc()).limit(1).first()
    assert last_balance.balance == Decimal(7400), 'new balance should be the sum of the previous balance \
    plus the agreements rate since no payment has been made'

    balances_cron()

    assert len(Balance.query.all()) == 2, 'We should still only have two balances since the newly created balance \
    is not ready to be processed'
    assert len(RentalAgreement.query.all()) == 1, 'only one rental agreement thus far'



def test_tenant_balance_in_future(client: FlaskClient, admin_login: dict):
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
    assert len(Tenant.query.all()) == 2

    tenant_id = tenant_resp.json['id']

    project_id = Project.query.first().id

    # seed another room
    room_resp = seed_room(client, admin_login['token']['value'], {'name': 'MA-1001', 'project_id': project_id})

    # create a new agreement with a balance due in the past so it generates a new balance
    override = {
        'date': front_end_date(datetime.utcnow() - timedelta(days=4)),
        'deposit': '3000.00',
        'interval': '400',
        'rate': '3000.00',
        'room_id': room_resp.json['id'],
        'tenant_id': tenant_id
    }

    agreement = seed_new_agreement(client, admin_login['token']['value'], override)
    assert len(Balance.query.all()) == 3, 'We should have thee balances, two from previous and one \
    from just inserted one'
    assert len(RentalAgreement.query.all()) == 2, 'Should have two rental agreements now'

    balances_cron()

    new_balance = Balance.query.filter(Balance.agreement_id == agreement.json['id']).order_by(
        Balance.due_date.desc()
    ).limit(1).first()
    assert new_balance.balance == Decimal(9000), 'new balance should be the sum of the previous balance \
        plus the agreements rate since no payment has been made'

    assert Balance.query.count() == 4, 'Only 4 balances should exist right now'
    balances_cron()
    assert Balance.query.count() == 4, 'Only 4 balances should exist right now since no new agreements or \
    date has changed'
