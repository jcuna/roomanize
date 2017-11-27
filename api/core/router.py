from flask_restful import Api
from flask import Flask
from config.routes import register
import re


class Router:

    version = 'v1.0'

    def __init__(self, app: Flask):
        api = Api(app)

        for concat_data, route in register().items():
            parts = re.split('\W+', concat_data)

            pack = __import__('views.' + parts[0], fromlist=[parts[1]])
            mod = getattr(pack, parts[1])
            api.add_resource(mod, '/' + self.version + '/' + route, endpoint=parts[2])
