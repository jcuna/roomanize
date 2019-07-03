import json
import os
import socket
import struct
import sys
import threading
from flask import request
from dal.models import Audit
from flask_restful import Resource
from .router import Router
from .utils import get_logger, app_path
from .middleware import Middleware, error_handler
from pprint import pformat
from flask_caching import Cache as CacheService
from simplecrypt import encrypt, decrypt
from base64 import b64encode, b64decode


def c_print(obj):
    print(pformat(obj), file=sys.stderr)


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

        async_task = AsyncAuditor(audit=audit)
        async_task.start()

        return output


class AsyncAuditor(threading.Thread):

    def __init__(self, audit: tuple):
        super().__init__()
        self.audit = audit

    def run(self):
        from app import init_app
        from dal import db

        app = init_app(mode='sys')

        with app.app_context():
            try:
                self.audit.payload = encryptor.encrypt(self.audit.payload)
                self.audit.ip = struct.unpack("!I", socket.inet_aton(self.audit.ip))[0]
                db.session.add(self.audit)
                db.session.commit()
            except Exception as e:
                app.logger.exception(self.audit)


def runner(app):

    # if this is not a second spawn for auto reload worker
    if not app.debug or os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
        from config.crons import cron_jobs
        from apscheduler.schedulers.background import BackgroundScheduler

        scheduler = BackgroundScheduler(timezone='utc')
        scheduler.start()
        for job in cron_jobs:
            scheduler.add_job(**job)


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
