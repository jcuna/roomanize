from base64 import b64encode

from flask.testing import FlaskClient

from tests import endpoint


def test_api_get_project_report(client: FlaskClient, admin_login: dict):
    from urllib.parse import quote
    data = {
        'html': b64encode(quote('<div></div>').encode()).decode(),
        'style': b64encode(quote('style></style>').encode()).decode(),
        'extra_css': b64encode(quote('http://file.com/extrashee.css').encode()).decode(),
        'uid': 'filename'
    }

    resp = client.post(endpoint('/to-pdf'), json=data, headers=admin_login)
    assert resp.status_code == 200
    assert resp.headers['Content-Disposition'] == "download;filename='filename.pdf'"
