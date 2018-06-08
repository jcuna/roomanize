import logging
from flask import Flask


class Middleware:

    def __init__(self, app: Flask, debug: bool):
        self.app = app
        self.debug = debug

    def __call__(self, environ, start_response) -> Flask:
        if self.debug:
            logging.basicConfig()
            #logging.getLogger('sqlalchemy.engine').setLevel(logging.DEBUG)

        return self.app(environ, start_response)
