def test_no_session(client):
    """Start with a blank database."""
    rv = client.get('/v1.0/user')
    assert b'no session' in rv.data
