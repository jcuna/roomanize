from flask.testing import FlaskClient
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
    from dal.models import Balance, RentalAgreement, Tenant

    tenants = Tenant.query.all()
    assert len(tenants) == 1
    tenant = tenants.pop()
    assert hasattr(tenant, 'id')

    tenant_id = tenant.id

    agreement_resp = seed_new_agreement(client, admin_login['token']['value'], {'tenant_id': tenant_id})
    assert 'id' in agreement_resp.json
    assert agreement_resp.status_code == 200

    balances = Balance.query.all()
    assert len(balances) == 1, 'only one balance should exist'
    balance = balances.pop()
    assert isinstance(balance.agreement_id, int)
    assert balance.init_processed == False, 'first balance must not be init processed'
    assert isinstance(balance.agreement, RentalAgreement)


def test_new_balance(client, admin_login: dict):
    assert 'bro' in 'bron'
