from flask import Flask
from dal.shared import db
import os
import core


def init_app() -> Flask:
    this_app = Flask(__name__)

    this_app.config.from_envvar('APP_SETTINGS_PATH')
    this_app.debug = os.environ['APP_ENV'] == 'develop'

    core.Router(this_app)

    db.init_app(this_app)
    return this_app


if __name__ == '__main__':
    app = init_app()
    app.run(host='0.0.0.0', port=5000)
