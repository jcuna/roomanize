import hashlib
import sys
import uuid
from datetime import datetime
from random import random

from .router import Router
from .middleware import Middleware
from pprint import pformat


def c_print(obj):
    print(pformat(obj), file=sys.stderr)


def random_token(more_entropy=random() * random()):
    s = str(datetime.utcnow().timestamp()) + str(uuid.uuid4().hex[:32] + str(more_entropy))
    return hashlib.sha256(s.encode('utf8')).hexdigest()
