import logging
import os
from datetime import datetime
from pathlib import Path
import pytz
from flask import Flask
import queue
from logging.handlers import QueueHandler, QueueListener, RotatingFileHandler
from config import configs


def configure_loggers(app: Flask):
    if hasattr(configs, 'TESTING') and configs.TESTING:
        return
    elif len(app.logger.handlers) == 0 or isinstance(app.logger.handlers[0], logging.StreamHandler):
        level = logging.DEBUG if app.debug else logging.INFO
        app.logger.setLevel(level)
        app.logger.handlers = app_logger.handlers
        gunicorn_logger = logging.getLogger('gunicorn.error')
        gunicorn_logger.setLevel(level)
        gunicorn_logger.handlers = app_logger.handlers
        db_logging = logging.getLogger('sqlalchemy')
        db_logging.setLevel(logging.INFO)
        db_logging.handlers = get_logger('sql', level).handlers


def get_logger(name: str = 'app', level: int = logging.INFO) -> logging.Logger:
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

    handler = RotatingFileHandler(log_path + name + '.log', maxBytes=50000, backupCount=2)
    handler.setFormatter(log_formatter)

    # instantiate listener
    listener = QueueListener(log_queue, handler)

    # attach custom handler to root logger
    logger.addHandler(queue_handler)

    # start the listener
    listener.start()

    return logger



def local_to_utc(date: str) -> datetime:
    """
    Converts a date string to a utc aware datetime object
    Use this before storing any manually set date
    :param date: str
    :return: datetime
    """
    date = datetime.strptime(date, '%Y-%m-%d %H:%M:%S')
    localized = pytz.timezone(configs.TIME_ZONE).localize(date)
    return localized.astimezone(pytz.utc)


def utc_to_local(date: datetime) -> datetime:
    """
    Converts UTC date to local datetime object
    Use it before returning date to the client or convert it on client side (recommended).
    :param date: datetime
    :return: datetime
    """
    return date.astimezone(pytz.timezone(configs.TIME_ZONE))


app_path = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
log_path = app_path + '/log/'
log_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
app_logger = get_logger('app')

if not Path(log_path).is_dir():
    os.mkdir(log_path)
