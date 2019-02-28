import sys
from .router import Router
from .middleware import Middleware
from .middleware import error_handler
from pprint import pformat
from flask_caching import Cache

def c_print(obj):
    print(pformat(obj), file=sys.stderr)


cache = Cache()


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
