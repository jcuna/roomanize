import sys
from flask import Flask, url_for, render_template
from flask_restful import Api
from config.routes import register
import re

permissions = {}


class Router:

    version = 'v1.0'
    routes = {}
    noPermissions = [
        'views.users.Session',
        'views.users.Users',
        'views.users.Permissions'
    ]

    def __init__(self, app: Flask):
        api = Api(app)

        for concat_data, route in register().items():
            parts = re.split('\W+', concat_data)

            pack_name = 'views.' + parts[0]
            pack = __import__(pack_name, fromlist=[parts[1]])
            mod = getattr(pack, parts[1])
            api.add_resource(mod, '/' + self.version + route, endpoint=parts[2])
            if pack_name + '.' + parts[1] not in self.noPermissions:
                permissions.update({parts[2]: pack_name + '.' + parts[1]})

            with app.test_request_context():
                self.routes.update({parts[2]: url_for(parts[2])})

        @app.route('/routes')
        def routes():
            return render_template('routes.html', routes=self.routes)

        @app.route('/install')
        def install():
            return render_template('routes.html', routes=self.routes)
