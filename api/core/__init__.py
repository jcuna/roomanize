import sys
from .router import Router
from .middleware import Middleware
from .middleware import error_handler
from pprint import pformat


def c_print(obj):
    print(pformat(obj), file=sys.stderr)


