from flask import Flask
from flask_socketio import SocketIO
from config import get_mail
from dal.shared import db
import core


def init_app() -> Flask:
    this_app = Flask(__name__)

    this_app.config.from_envvar('APP_SETTINGS_PATH')

    this_app.debug = this_app.config['APP_ENV'] == 'develop'
    this_app.env = this_app.config['APP_ENV']

    core.error_handler(this_app)

    core.Router(this_app)
    db.init_app(this_app)

    this_app.mail = get_mail(this_app)

    this_app.wsgi_app = core.Middleware(this_app.wsgi_app, this_app.debug)

    return this_app


if __name__ == '__main__':
    app = init_app()
    socketio = SocketIO(app)
    socketio.run(app, host='0.0.0.0', port=5000)
