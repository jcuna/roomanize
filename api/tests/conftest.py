import pytest
from tests import tear_files, init

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
