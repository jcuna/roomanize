import logging
import os
from datetime import datetime
from pathlib import Path
import pytz
from flask import current_app

app_path = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
log_path = app_path + '/log/'
default_log = 'app'


def basic_logging(handler, env):
    level = logging.DEBUG if env == 'develop' else logging.WARN
    logging.basicConfig(handlers=handler, level=level)


def get_logger(name=default_log):
    """
    return a logger with default settings

    :return: Logger
    """
    if not Path(log_path).is_dir():
        os.mkdir(log_path)

    formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')

    handler = logging.FileHandler(log_path + name + '.log')

    handler.setFormatter(formatter)

    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)
    logger.addHandler(handler)

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
