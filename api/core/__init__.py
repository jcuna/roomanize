import json
import atexit
import os
import socket
import struct
import threading
from datetime import timedelta
from time import sleep, time
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
        super(AsyncAuditor, self).__init__(name='async-auditor')
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
                        start = time()
                        task: dict
                        for task in self.tasks:
                            app.logger.debug(threading.current_thread().name + ' new audit record')
                            if is_prod:
                                task.payload = encryptor.encrypt(task.payload)
                            task.ip = struct.unpack('!I', socket.inet_aton(task.ip))[0]
                            db.session.add(task)
                        self.tasks.clear()
                        db.session.commit()
                        app.logger.debug('Took: ' + str(timedelta(seconds=(time() - start))))
                    sleep(2)
                app.logger.info('exiting async audit thread')
            except BaseException as e:
                app.logger.exception('Exception')


#  TODO: manage with supervisord
def runner():
    # if this is not a second spawn for auto reload worker
    if is_prod or os.environ.get('WERKZEUG_RUN_MAIN') == 'true':

        # TODO: switch to use an independent async queue with socket communication
        # TODO CONT: queue can be managed with supervisord and have send message and receive message endpoints
        # TODO CONT: https://stackoverflow.com/questions/39598038/implementing-a-single-thread-server-daemon-python
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
is_prod = os.environ.get('APP_ENV') == 'production'
cache = CacheService()
encryptor = Encryptor()
