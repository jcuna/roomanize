from flask import request
from flask_restful import Resource
from dal.models import Project
from dal.shared import token_required, access_required, db


class Projects(Resource):

    @token_required
    def get(self):

        projects = Project.query.limit(10).all()
        active_project = [{'id': project.id, 'name': project.name} for project in projects if project.active] \
            if projects else []

        return {
            'projects': list(map(lambda r: {
                'id': r.id,
                'name': r.name,
                'contact': r.contact,
                'address': r.address,
            }, projects)),
            'selected': active_project.pop() if active_project else None
        }

    @token_required
    @access_required
    def post(self):

        data = request.get_json()

        if not data:
            return {'error': 'project object is required'}, 400

        if data['status']:
            db.session.query(Project).filter(Project.active is True).update({'active': False})
            print('hi')
            db.session.commit()

        project = Project(name=data['name'], active=data['status'], contact=data['phone'])

        if data['address']:
            project.address = data['address']

        db.session.add(project)
        db.session.commit()

        return dict(id=project.id)
