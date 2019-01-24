import importlib
import sqlalchemy
from flask import Flask, url_for, render_template, redirect
from flask_restful import Api, request
from flask_restful.representations import json
from config.routes import register, no_permissions
import re
from dal import db
from dal.models import User, Role
from dal.shared import get_fillable

permissions = {}


class Router:

    version = 'v1.0'
    routes = {}

    def __init__(self, app: Flask):
        api = Api(app)

        for concat_data, concat_route in register().items():
            parts = re.split('\W+', concat_data)

            full_routes = []
            for route in re.split('\|', concat_route):
                full_routes.append('/' + self.version + route)

            pack_name = 'views.' + parts[0]
            pack = importlib.import_module(pack_name, parts[1])
            mod = getattr(pack, parts[1])
            api.add_resource(mod, *full_routes, endpoint=parts[2])
            if pack_name + '.' + parts[1] not in no_permissions:
                permissions.update({parts[2]: pack_name + '.' + parts[1]})

            with app.test_request_context():
                self.routes.update({parts[2]: url_for(parts[2])})

        @app.route('/routes')
        def routes():
            return render_template('routes.html', routes=self.routes)

        @app.route('/install', methods=['GET', 'POST'])
        def install():

            try:
                user_count = User.query.count()
                if user_count > 0:
                    return redirect('/')
            except sqlalchemy.exc.ProgrammingError:
                from migrate import generate
                generate()

            if request.method == 'POST':
                data = request.form
                if 'first_name' in data and data['first_name'] and 'last_name' in data and data['last_name']\
                        and 'email' in data and data['email'] and 'password' in data and data['password']:
                    user_data = get_fillable(User, **data)
                    user = User(**user_data)
                    user.hash_password()

                    admin_perms = {}

                    for endpoint, permission in permissions.items():
                        admin_perms.update({permission: ['read', 'write', 'delete']})

                    role = Role(name='Admin', permissions=json.dumps(admin_perms))
                    db.session.add(role)

                    user.roles.append(role)
                    db.session.add(user)

                    db.session.commit()

                    return redirect('/')

            return render_template('install.html')
