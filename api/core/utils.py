import logging
import os
from datetime import datetime, timedelta
from decimal import Decimal
from pathlib import Path
from time import time

import boto3
import pytz
from flask import Flask
import queue
from logging.handlers import QueueHandler, QueueListener, TimedRotatingFileHandler
from kanpai.validator import RequiredMixin

from config import configs
from dal.shared import ModelIter


def configure_loggers(app: Flask):
    if hasattr(configs, 'TESTING') and configs.TESTING:
        return
    elif len(app.logger.handlers) == 0 or isinstance(app.logger.handlers[0], logging.StreamHandler):
        level = logging.DEBUG if app.debug else logging.INFO

        boto3.set_stream_logger('', level + logging.DEBUG)

        app_logger = get_logger('app', True)

        # combine these loggers into app/root loggers
        for logger in [app.logger, logging.getLogger('gunicorn')]:
            logger.setLevel(level)
            logger.propagate = False
            logger.handlers = app_logger.handlers
        # log sqlalchemy queries to a file
        db_logging = logging.getLogger('sqlalchemy')
        db_logging.propagate = False
        db_logging.setLevel(logging.INFO)
        db_logging.handlers = get_logger('sql', True).handlers


def get_logger(name, non_blocking=False):
    """
    return a logger with default settings

    :return: Logger
    """
    logger = logging.getLogger(name)
    if len(logger.handlers) > 0 or hasattr(configs, 'TESTING'):
        return logger

    logger.propagate = False
    level = logging.DEBUG if configs.DEBUG else logging.INFO
    logger.setLevel(level)

    file_handler = create_file_log_handler(name)

    if non_blocking:
        log_queue = queue.Queue(-1)
        async_handler = QueueHandler(log_queue)
        # instantiate a listener
        listener = QueueListener(log_queue, file_handler)
        # attach custom handler to root logger
        logger.addHandler(async_handler)
        # start the listener
        listener.start()
    else:
        logger.addHandler(file_handler)

    return logger


class TimeLogger:

    def __init__(self, logger: logging.Logger):
        self.logger = logger

    def __enter__(self):
        self.start = time()

    def __exit__(self, *args):
        self.logger.info('Took: %s' % timedelta(seconds=(time() - self.start)))


def create_file_log_handler(name):
    handler = TimedRotatingFileHandler(log_path + name + '.log', when='midnight', backupCount=2)
    handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
    return handler


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

if not Path(log_path).is_dir():
    os.mkdir(log_path)


def dynamo_db_encode(input_data):
    if isinstance(input_data, ModelIter):
        return dynamo_db_encode(dict(input_data))
    elif isinstance(input_data, str):
        return {'S': input_data}
    elif isinstance(input, bool):
        return {'BOOL': str(input_data)}
    elif input_data is None:
        return {'NULL': True}
    elif isinstance(input_data, int) or isinstance(input_data, float):
        return {'S': str(input_data)}
    elif isinstance(input_data, Decimal):
        return {'S': '{0:.2f}'.format(input_data)}
    elif isinstance(input_data, dict):
        return {'M': {key: dynamo_db_encode(val) for key, val in input_data.items()}}
    elif isinstance(input_data, list):
        return {'L': list(map(lambda x: dynamo_db_encode(x), input_data))}


class Boolean(RequiredMixin):

    def __init__(self, error="Value must be a boolean."):
        self.processors = []
        self.processors.append({
            'action': self.__assert_bool,
            'attribs': {
                'error': error
            }
        })

    def __assert_bool(self, data, attribs):
        if data is None:
            return self.validation_success(data)

        if type(data) != bool:
            return self.validation_error(data, attribs['error'])

        return self.validation_success(data)
