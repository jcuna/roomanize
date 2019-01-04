from flask import Flask
from dal.shared import db
import core
import sys


def init_app() -> Flask:
    this_app = Flask(__name__)

    this_app.config.from_envvar('APP_SETTINGS_PATH')

    this_app.debug = this_app.config['APP_ENV'] == 'develop'
    this_app.env = this_app.config['APP_ENV']

    # if this_app.debug:
    #     sys.path.append("pycharm-debug-py3k.egg")
    #     import pydevd
    #     pydevd.settrace('host.docker.internal', port=9001, stdoutToServer=True, stderrToServer=True)

    core.Router(this_app)
    db.init_app(this_app)

    this_app.wsgi_app = core.Middleware(this_app.wsgi_app, this_app.debug)

    return this_app


if __name__ == '__main__':
    app = init_app()
    app.run(host='0.0.0.0', port=5000)
