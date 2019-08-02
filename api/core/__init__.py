import json
import atexit
import socket
import struct
import threading
from time import sleep
from flask import request
from dal.models import Audit
from flask_restful import Resource
from .router import Router
from .utils import get_logger, app_path, app_logger
from .middleware import Middleware, error_handler
from flask_caching import Cache as CacheService
from simplecrypt import encrypt, decrypt
from base64 import b64encode, b64decode


class Cache:

    @staticmethod
    def set(key, value, timeout=3600):
        return cache.add(timeout=timeout, key=key, value=value)

    @staticmethod
    def get(key):
        value = cache.get(key=key)
        if not value:
            cache.delete(key=key)
        return value

    @staticmethod
    def remember(key, func, timeout=3600):
        value = Cache.get(key)
        if not value:
            value = func()
            Cache.set(key, value, timeout)
        return value

    @staticmethod
    def delete(key):
        return cache.delete(key=key)


class API(Resource):

    audit_tasks = []

    def dispatch_request(self, *args, **kwargs):
        output = super(Resource, self).dispatch_request(*args, **kwargs)

        user_id = None
        if hasattr(request, 'user'):
            user_id = request.user.id

        audit = Audit(
            user_id=user_id,
            ip=request.remote_addr,
            endpoint=request.path,
            headers=json.dumps([{key: request.environ[key]} for key in request.environ if 'HTTP_' in key]),
            method=request.method,
            response=json.dumps(output),
            payload=json.dumps({
                'json': request.get_json(silent=True),
                'query': request.args.to_dict(),
                'form': request.form.to_dict(),
                'all': request.get_data(as_text=True)
            })
        )
        self.audit_tasks.append(audit)

        return output


class AsyncAuditor(threading.Thread):

    def __init__(self, tasks: list, stop: threading.Event):
        super().__init__()
        self.tasks = tasks
        self.stop_event = stop

    def run(self):
        from app import init_app
        from dal import db

        app = init_app(mode='sys')
        app.logger.info('starting async audit thread')

        with app.app_context():
            try:
                while not self.stop_event.is_set():
                    if len(self.tasks) > 0:
                        task: dict
                        for task in self.tasks:
                            app.logger.info(str(threading.current_thread()) + ' new audit record')
                            task.payload = encryptor.encrypt(task.payload)
                            task.ip = struct.unpack("!I", socket.inet_aton(task.ip))[0]
                            db.session.add(task)
                        self.tasks.clear()
                        db.session.commit()
                    sleep(2)
                app.logger.info('exiting async audit thread')
            except BaseException as e:
                app.logger.exception('Exception')


def runner():
    # this is our cron job runner
    from config.crons import cron_jobs
    from apscheduler.schedulers.background import BackgroundScheduler

    scheduler = BackgroundScheduler(timezone='utc')
    scheduler.start()
    for job in cron_jobs:
        scheduler.add_job(**job)

    # this long running is used to perform after request auditing
    stop_event = threading.Event()
    async_task = AsyncAuditor(API.audit_tasks, stop_event)
    async_task.start()

    def exit_async_thread():
        stop_event.set()
        async_task.join()

    atexit.register(exit_async_thread)


class Encryptor:

    password = 'password'
    """ Make sure to change this in your app setup Encryptor.password = @configPW """

    def encrypt(self, string: str) -> str:
        return b64encode(encrypt(self.password, string))

    def decrypt(self, string: str) -> str:
        return b64decode(decrypt(self.password, string))


# auto exec
cache = CacheService()
encryptor = Encryptor()
