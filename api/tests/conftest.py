from base64 import b64encode
import pytest
from tests import tear_files, init, endpoint
from tests.seeders import seed_admin


@pytest.fixture(scope='module')
def client():
    """
    Creates a new database for the unit test to use
    """
    init()

    from app import db, init_app
    from helpers import run_migration

    app = init_app()
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            db.session.commit()
            run_migration()
        yield client
    tear_files()


@pytest.fixture
def no_db_client():
    """
    Returns client with no db
    """
    init()

    from app import init_app

    app = init_app()
    with app.test_client() as client:
        yield client
    tear_files()


@pytest.fixture(scope='module')
def admin_login(client):

    admin_resp = seed_admin(client)
    assert b'Redirecting...' in admin_resp.data, 'Must redirect upon valid admin creation'
    assert admin_resp.status_code == 302

    auth = {
        'Authorization': 'Basic ' + b64encode(b'testuser@testing.org:' + b'secured').decode()
    }
    # create a session
    login_resp = client.post(endpoint('/login'), headers=auth)
    assert 'token' in login_resp.json, 'token expected'
    assert login_resp.status_code == 200
    return login_resp.json
