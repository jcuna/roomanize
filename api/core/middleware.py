import sys

from flask import Flask


class Middleware:

    def __init__(self, app: Flask):
        self.app = app

    def __call__(self, environ, start_response) -> Flask:
        # print(environ, file=sys.stderr)
        return self.app(environ, start_response)
