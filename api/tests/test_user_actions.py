from base64 import b64encode

from flask.testing import FlaskClient

from tests import endpoint
from tests.conftest import MockMail
from tests.seeders import seed_project

class LocalUser(object):
    id = None
    token = None
    pass


user = LocalUser()

def test_admin_create_user(client: FlaskClient, admin_login: dict):
    project_resp = seed_project(client, admin_login)


    resp = client.post(
        endpoint('/users'),
        json={
            'first_name': 'John',
            'last_name': 'Smith',
            'email': 'jondmith@school.edu',
            'roles': [1], #admin
            'attributes': {'access': {'projects': [project_resp.json['id']]}}
        },
        headers=admin_login
    )

    assert 'id' in resp.json
    assert resp.status_code == 200
    assert len(MockMail.mails) == 1

    user.id = resp.json['id']


def test_user_verifies_account(client: FlaskClient):
    from dal.models import UserToken

    verification_token = UserToken.query.first()
    assert verification_token is not None

    verification = client.get(endpoint('/user-tokens/badtoken'))
    assert verification.status_code == 400
    assert 'isValid' in verification.json
    assert verification.json['isValid'] == False

    verification = client.get(endpoint('/user-tokens/%s' % verification_token.token))
    assert verification.status_code == 200
    assert 'isValid' in verification.json
    assert verification.json['isValid'] == True

    user.token = verification_token.token


def test_user_activates_account(client: FlaskClient):

    resp = client.post(
        endpoint('/account/activate-pass'),
        json={
            'token': 'bad-token',
            'pw': 'badpassword',
            'pw2': 'badpassword',
        }
    )

    assert resp.status_code == 400
    assert 'Invalid token' in resp.json['error']

    resp = client.post(
        endpoint('/account/activate-pass'),
        json={
            'token': user.token,
            'pw': 'badpassword',
            'pw2': 'badpassword',
        }
    )

    assert resp.status_code == 400
    assert 'Invalid password' in resp.json['error']

    resp = client.post(
        endpoint('/account/activate-pass'),
        json={
            'token': user.token,
            'pw': 'mY$P@ssw0rd',
            'pw2': 'mY$P@ssw0rd',
        }
    )

    assert resp.status_code == 200


def test_token_cannot_be_reused(client: FlaskClient):
    verification = client.get(endpoint('/user-tokens/%s' % user.token))
    assert verification.status_code == 400
    assert 'isValid' in verification.json
    assert verification.json['isValid'] == False


def test_new_user_can_login(client: FlaskClient):
    auth = {
        'Authorization': 'Basic ' + b64encode(b'jondmith@school.edu:mY$P@ssw0rd').decode()
    }
    login_resp = client.post(endpoint('/login'), headers=auth)
    assert 'token' in login_resp.json, 'token expected'
    assert login_resp.status_code == 200


def test_user_changes_password(client: FlaskClient):
    from dal.models import UserToken

    resp = client.put(endpoint('/users/reset-password'))
    assert resp.status_code == 400
    assert 'error' in resp.json
    assert 'Missing email' in resp.json['error']


    resp = client.put(endpoint('/users/reset-password'), json={'email': 'jondmith2@school.edu'})
    assert resp.status_code == 200

    assert len(MockMail.mails) == 1, 'no email has been sent because user does not exist'


    resp = client.put(endpoint('/users/reset-password'), json={'email': 'jondmith@school.edu'})
    assert resp.status_code == 200

    assert UserToken.query.count() == 2
    assert len(MockMail.mails) == 2, 'an email should haveve been sent'

    token = UserToken.query.offset(1).first()

    assert token is not None

    resp = client.post(
        endpoint('/account/activate-pass'),
        json={
            'token': token.token,
            'pw': '@noth3rp@22w04d',
            'pw2': '@noth3rp@22w04d',
        }
    )

    assert resp.status_code == 200

    auth = {
        'Authorization': 'Basic ' + b64encode(b'jondmith@school.edu:@noth3rp@22w04d').decode()
    }
    login_resp = client.post(endpoint('/login'), headers=auth)
    assert 'token' in login_resp.json, 'token expected'
    assert login_resp.status_code == 200
