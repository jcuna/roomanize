import logging
import os
from datetime import datetime
from pathlib import Path
import pytz
from flask import current_app, Flask
import queue
from logging.handlers import QueueHandler, QueueListener, RotatingFileHandler


def configure_loggers(app: Flask):
    if len(app.logger.handlers) == 0 or isinstance(app.logger.handlers[0], logging.StreamHandler):
        level = logging.DEBUG if app.debug else logging.INFO
        app.logger.setLevel(level)
        app.logger.handlers = app_logger.handlers
        gunicorn_logger = logging.getLogger('gunicorn.error')
        gunicorn_logger.setLevel(level)
        gunicorn_logger.handlers = app_logger.handlers
        db_logging = logging.getLogger('sqlalchemy.engine')
        db_logging.setLevel(level)
        db_logging.handlers = get_logger('sql', level).handlers


def get_logger(name: str = 'app', level: int = logging.INFO):
    """
    return a logger with default settings

    :return: Logger
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)
    if len(logger.handlers) > 0:
        return logger

    log_queue = queue.Queue(-1)
    queue_handler = QueueHandler(log_queue)

    handler = RotatingFileHandler(log_path + name + '.log', maxBytes=100000, backupCount=1)
    handler.setFormatter(log_formatter)

    # instantiate listener
    listener = QueueListener(log_queue, handler)

    # attach custom handler to root logger
    logger.addHandler(queue_handler)

    # start the listener
    listener.start()

    return logger


class Lock:
    """
    handy class to create a lock file
    use it like lock = Lock('file')
    with lock:
        # run things
    """

    def __init__(self, lock_file):
        self.lock_file = lock_file
        # raise exception if pid file exists and log it. remove if it's stale

    def __enter__(self):
        # write pid file
        pass

    def __exit__(self, type, value, traceback):
        # remove pid file
        pass


def local_to_utc(date: str) -> datetime:
    """
    Converts a date string to a utc aware datetime object
    Use this before storing any manually set date
    :param date: str
    :return: datetime
    """
    date = datetime.strptime(date, '%Y-%m-%d %H:%M:%S')
    localized = pytz.timezone(current_app.config['TIME_ZONE']).localize(date)
    return localized.astimezone(pytz.utc)


def utc_to_local(date: datetime) -> datetime:
    """
    Converts UTC date to local datetime object
    Use it before returning date to the client or convert it on client side (recommended).
    :param date: datetime
    :return: datetime
    """
    return date.astimezone(pytz.timezone(current_app.config['TIME_ZONE']))


app_path = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
log_path = app_path + '/log/'
log_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
app_logger = get_logger('app')

if not Path(log_path).is_dir():
    os.mkdir(log_path)
