import sys
import traceback
from flask import Flask, jsonify
from core.utils import app_logger


class Middleware:

    def __init__(self, app: Flask, debug: bool):
        self.app = app
        self.debug = debug

    def __call__(self, environ, start_response) -> Flask:
        # do any middleware stuff here!
        return self.app(environ, start_response)


def error_handler(app: Flask):
    status_code = 500

    def handle_error_response(error: Exception):
        _, _, tb = sys.exc_info()
        json_output = {
            'error': str(error),
            'traceback': traceback.format_list(traceback.extract_tb(tb))
        }

        response = jsonify(json_output)

        if hasattr(error, 'status_code'):
            response.status_code = error.status_code
        else:
            response.status_code = status_code

        return response

    def handle_error_response_prod(error: Exception):
        app_logger.exception(error)
        json_output = {
            'error': 'An unexpected error occurred',
        }

        response = jsonify(json_output)

        if hasattr(error, 'status_code'):
            response.status_code = error.status_code
        else:
            response.status_code = status_code

        return response

    if app.debug:
        app.register_error_handler(Exception, handle_error_response)
    else:
        app.register_error_handler(Exception, handle_error_response_prod)


class HttpException(Exception):
    def __init__(self, message, status_code=400):
        super(Exception, self).__init__(message)

        self.status_code = status_code
