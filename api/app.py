from flask import Flask
from flask_socketio import SocketIO
from config import get_mail
from dal.shared import db
from core import error_handler, cache, Router, Middleware


def init_app(mode='web') -> Flask:
    this_app = Flask(__name__)

    this_app.config.from_envvar('APP_SETTINGS_PATH')
    this_app.debug = this_app.config['APP_ENV'] == 'develop'
    this_app.env = this_app.config['APP_ENV']

    if mode == 'web':
        error_handler(this_app)
        cache.init_app(this_app, config=this_app.config['CACHE_CONFIG'])
        Router(this_app)

    db.init_app(this_app)

    this_app.mail = get_mail(this_app)

    if mode == 'web':
        this_app.wsgi_app = Middleware(this_app.wsgi_app, this_app.debug)

    return this_app


if __name__ == '__main__':
    app = init_app()
    socketio = SocketIO(app)
    socketio.run(app, host='0.0.0.0', port=5000, debug=app.debug)
