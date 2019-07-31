import logging
import os
from datetime import datetime
from pathlib import Path
import pytz
from flask import current_app
import queue
from logging.handlers import QueueHandler, QueueListener, RotatingFileHandler


def queue_logger():

    que = queue.Queue(-1)  # no limit on size
    queue_handler = QueueHandler(que)
    non_block_listener = LogListener(que)
    root = logging.getLogger()
    root.addHandler(queue_handler)
    non_block_listener.start()
    return non_block_listener


class LogListener(QueueListener):
    """
    dynamically add new handlers to the queue listener
    """
    def add_handler(self, handler):
        # tuples are immutable
        self.handlers = self.handlers + (handler,)
        self.stop()
        self.start()


def get_logger(name='app'):
    """
    return a logger with default settings

    :return: Logger
    """
    logger = logging.getLogger(name)
    if len(logger.handlers) > 0:
        return logger

    handler = RotatingFileHandler(log_path + name + '.log', maxBytes=100000, backupCount=1)
    handler.setFormatter(log_formatter)

    logger.setLevel(logging.DEBUG)
    logger.addHandler(handler)

    listener.add_handler(handler)

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
listener = queue_logger()

if not Path(log_path).is_dir():
    os.mkdir(log_path)
