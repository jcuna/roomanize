from flask.testing import FlaskClient

from tests import endpoint


def test_widgets_return_models(client: FlaskClient, admin_login: dict):

    resp = client.get(endpoint('/widgets'))

    assert resp.status_code == 401
    assert resp.json['error'] == 'Token is missing!'
    resp = client.get(endpoint('/widgets'), headers=admin_login)

    assert resp.status_code == 200
    assert isinstance(resp.json, list)
    assert len(resp.json) == 9
    assert resp.json[0]['class'] == 'dal.models.Project'
    assert len(resp.json[0]['fields']) == 5
    assert len(resp.json[0]['relationships']) == 1
    assert resp.json[0]['relationships'][0]['class'] == 'dal.models.Room'
    assert resp.json[0]['relationships'][0]['name'] == 'rooms'


def test_widget_create_widget(client: FlaskClient, admin_login: dict):
    from dal.models import CompanyProfile
    from dal.models import User

    resp = client.post(endpoint('/widgets'), json={}, headers=admin_login)

    assert resp.status_code == 400
    assert 'description' in resp.json['error']
    assert 'name' in resp.json['error']
    assert 'schema' in resp.json['error']

    schema = {
        'name': 'Something else',
        'description': 'A description to show',
        'schema': []
    }

    resp = client.post(endpoint('/widgets'), json=schema, headers=admin_login)
    assert resp.status_code == 400
    assert resp.json['error']['name'] == 'Name may consists of letters, dashes and underscores'

    schema = {
        'name': 'schema_name',
        'description': 'A description to show',
        'schema': {
            'model': 'dal.models.Balance',
            'conditions': [{'AND': [{'column': 'dal.models.Balance.due_date', 'value': 'today', 'comparator': 'lt'}]}],
            'limit': 1,
            'order_dir': 'desc',
            'order_by': 'dal.models.Balance.due_date',
            'fields': [
                'dal.models.Balance.balance',
                'dal.models.Balance.due_date',
                'dal.models.Tenant.last_name',
                'dal.models.RentalAgreement.id',
                'dal.models.Room.name'
            ],
            'relationships': [
                'dal.models.RentalAgreement', 'dal.models.TenantHistory', 'dal.models.Tenant',
                'dal.models.Room'
            ]
        }
    }

    resp = client.post(endpoint('/widgets'), json=schema, headers=admin_login)
    assert resp.status_code == 200
    c = CompanyProfile.query.first()
    assert 'widgets' in c.settings
    assert 'schema_name' in c.settings['widgets']
    assert c.settings['widgets']['schema_name']['name'] == 'schema_name'
    assert c.settings['widgets']['schema_name']['description'] == 'A description to show'
    assert c.settings['widgets']['schema_name']['schema']['model'] == 'dal.models.Balance'

    schema2 = {
        'name': 'new_users',
        'private': True,
        'description': 'A 2ns description',
        'schema': {
            'model': 'dal.models.User',
            'conditions': [{'AND': [{'column': 'dal.models.User.created_at', 'value': 'today', 'comparator': 'le'}]}],
            'fields': ['dal.models.User.id', 'dal.models.User.first_name', 'dal.models.User.last_name']
        }
    }

    resp = client.post(endpoint('/widgets'), json=schema2, headers=admin_login)
    assert resp.status_code == 200
    admin = User.query.filter_by(email='testuser@testing.org').first()
    assert 'widgets' in admin.attributes.preferences
    assert 'new_users' in admin.attributes.preferences['widgets']
    assert admin.attributes.preferences['widgets']['new_users']['name'] == 'new_users'
    assert admin.attributes.preferences['widgets']['new_users']['description'] == 'A 2ns description'
    assert admin.attributes.preferences['widgets']['new_users']['schema']['model'] == 'dal.models.User'


def test_run_widget(client: FlaskClient, admin_login: dict):
    resp = client.get(endpoint('/widgets/dont-exist'), headers=admin_login)
    assert resp.status_code == 404

    resp = client.get(endpoint('/widgets/schema_name'), headers=admin_login)
    assert resp.status_code == 200
    assert type(resp.json) == list

    resp = client.get(endpoint('/widgets/new_users?type=private'), headers=admin_login)
    assert resp.status_code == 200
    assert type(resp.json) == list
    assert len(resp.json) == 1
