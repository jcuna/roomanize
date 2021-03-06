from flask.testing import FlaskClient
from tests import endpoint, front_end_date

admin_sample = {
    'first_name': 'Test',
    'last_name': 'User',
    'email': 'testuser@testing.org',
    'password': 'secured',
    'company_name': 'Green CRN',
    'address': '1500 Sample St. Sunnyside CA 98996',
    'contact': '5555555555',
}

project_sample = {
    'active': True,
    'address': '1500 Sample St. Sunnyside CA 98996',
    'name': 'Sample',
    'phone': '1234567890',
}

tenant_sample = {
    'email': 'tenant@tenant.com',
    'first_name': 'Sample',
    'last_name': 'Tenant',
    'identification_number': '123-1234567-8',
    'phone': '5555555555'
}

room_sample = {
    'description': 'room number MA-1000',
    'name': 'MA-1000',
    'picture': '',
    'project_id': 1,
}

registration_sample = {
    'date': front_end_date(), # defaults to today
    'deposit': '4400.00',
    'interval': '100',  # weekly, 200 every two weeks and 400 monthly
    'rate': '1500.00',
    'reference1': '5555555555',
    'reference2': '',
    'reference3': '',
    'room_id': 1,
    'tenant_id': 1
}


def seed_admin(client: FlaskClient):
    return client.post('/install', data=admin_sample)


def seed_project(client: FlaskClient, auth, override=None):
    data = {}
    data.update(project_sample)
    if override:
        data.update(override)

    return client.post(endpoint('/projects'), json=data, headers=auth)


def seed_room(client: FlaskClient, auth, override=None):

    data = {}
    data.update(room_sample)
    if override:
        data.update(override)
        data.update({'description': 'Room number ' + data.get('name')})

    return client.post(endpoint('/rooms'), json=data, headers=auth)


def seed_tenant(client: FlaskClient, auth, override=None):
    data = {}
    data.update(tenant_sample)
    if override:
        data.update(override)

    return client.post(endpoint('/tenants'), json=data, headers=auth)


def seed_new_agreement(client: FlaskClient, auth, override=None):

    if override is None:
        override = dict()
    data = {}
    data.update(registration_sample)
    if override:
        data.update(override)

    return client.post(endpoint('/agreements'), json=data, headers=auth)
