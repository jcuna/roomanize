from flask import Flask
from core.utils import configure_loggers
from config import get_mail
from dal.shared import db
import core


def init_app(mode='web') -> Flask:
    this_app = Flask(__name__)

    #this_app.patched = patched
    this_app.config.from_envvar('APP_SETTINGS_PATH')
    this_app.env = this_app.config['APP_ENV']
    # configure the app to log to a file.
    configure_loggers(this_app)
    core.Encryptor.password = this_app.config['SECRET_KEY']

    if mode == 'web':
        core.error_handler(this_app)
        core.cache.init_app(this_app, config=this_app.config['CACHE_CONFIG'])
        this_app.wsgi_app = core.Middleware(this_app.wsgi_app, this_app.debug)
        core.Router(this_app)

    db.init_app(this_app)
    this_app.mail = get_mail(this_app)

    return this_app


if __name__ == '__main__':
    from flask_socketio import SocketIO
    app = init_app()
    socketio = SocketIO(app, logger=app.logger, engineio_logger=False)
    socketio.run(app, host='0.0.0.0', port=5000, debug=app.debug)
