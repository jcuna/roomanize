import pytest
import os


config = """
TESTING = True
SQLALCHEMY_DATABASE_URI = 'sqlite:///%s'
SQLALCHEMY_TRACK_MODIFICATIONS = False
SQLALCHEMY_ENGINE_OPTIONS = {
    'pool_recycle': True
}
DB_COLLATION = 'BINARY'
APP_ENV = 'testing'
SECRET_KEY = 'testing'
CACHE_CONFIG = {
    'CACHE_TYPE': 'simple',
    'CACHE_KEY_PREFIX': 'local_dev'
}
""" % (os.path.dirname(os.environ['APP_SETTINGS_PATH']) + '/testdb')


settings_fd = open(os.environ['APP_SETTINGS_PATH'], 'w+')
settings_fd.write(config)
settings_fd.close()


@pytest.fixture
def client():
    """
    Creates a new database for the unit test to use
    """
    from app import db, init_app
    from helpers import run_migration

    app = init_app()
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            db.session.commit()
            run_migration()
        yield client

        os.unlink(os.path.dirname(os.environ['APP_SETTINGS_PATH']) + '/testdb')
        os.unlink(os.environ['APP_SETTINGS_PATH'])
