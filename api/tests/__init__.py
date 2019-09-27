import os

config = """
TESTING = True
DEBUG = False
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
TIME_ZONE = 'America/New_York'
""" % (os.path.dirname(os.environ['APP_SETTINGS_PATH']) + '/testdb')

def init():
    settings_fd = open(os.environ['APP_SETTINGS_PATH'], 'w+')
    settings_fd.write(config)
    settings_fd.close()


def tear_files():
    os.unlink(os.path.dirname(os.environ['APP_SETTINGS_PATH']) + '/testdb')
    os.unlink(os.environ['APP_SETTINGS_PATH'])


def endpoint(uri):
    return '/v1.0' + uri
