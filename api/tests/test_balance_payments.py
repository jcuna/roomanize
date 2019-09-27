from base64 import b64encode
from flask.testing import FlaskClient
from tests import endpoint
from tests.seeders import seed_admin, seed_tenant, seed_new_agreement, seed_project, seed_room


def test_seeding_data(client: FlaskClient):

    admin_resp = seed_admin(client)
    assert b'Redirecting...' in admin_resp.data
    assert admin_resp.status_code == 302

    # we need a cookie
    auth = {
        'Authorization': 'Basic ' + b64encode(b'testuser@testing.org:' + b'secured').decode()
    }
    # create a session
    login_resp = client.post(endpoint('/login'), headers=auth)
    assert 'token' in login_resp.json
    assert login_resp.status_code == 200

    token = login_resp.json['token']['value']

    project_resp = seed_project(client, token)
    assert 'id' in project_resp.json
    assert project_resp.status_code == 200

    room_resp = seed_room(client, token, {'project_id': project_resp.json['id']})
    assert 'id' in room_resp.json
    assert room_resp.status_code == 200

    tenant_resp = seed_tenant(client, token)
    assert 'id' in tenant_resp.json
    assert tenant_resp.status_code == 200

    user_id = tenant_resp.json['id']

    agreement_resp = seed_new_agreement(client, token, {'tenant_id': user_id})
    assert 'id' in agreement_resp.json
    assert agreement_resp.status_code == 200


def test_init_balance_created(client: FlaskClient):
    from dal.models import Balance
    from dal.models import RentalAgreement

    balances = Balance.query.all()
    assert len(balances) == 1
    balance = Balance.query.first()
    assert isinstance(balance.agreement_id, int)
    assert balance.init_processed == False
    assert isinstance(balance.agreement, RentalAgreement)
