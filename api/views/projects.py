from flask import request
from flask_restful import Resource

from dal.models import Project, TimeInterval, row2dict
from dal.shared import token_required, access_required, db


class Projects(Resource):

    @token_required
    def get(self):

        projects = Project.query.filter_by(deleted=None).limit(10).all()
        active_project = [{'id': project.id, 'name': project.name} for project in projects if project.active] \
            if projects else []

        return {
            'projects': list(map(lambda r: row2dict(r), projects)),
            'selected': active_project.pop() if active_project else None
        }

    @token_required
    @access_required
    def post(self):

        data = request.get_json()

        if not data:
            return {'error': 'project object is required'}, 400

        if data['active']:
            db.session.query(Project).filter(Project.active.is_(True)).update({'active': False})

        project = Project(name=data['name'], active=data['active'], contact=data['phone'])

        if data['address']:
            project.address = data['address']

        db.session.add(project)
        db.session.commit()

        return dict(id=project.id)

    @token_required
    @access_required
    def put(self, project_id):

        data = request.get_json()

        updated_data = {}

        if 'active' in data:
            updated_data.update({'active': data['active']})
            if data['active']:
                db.session.query(Project).filter(Project.active.is_(True)).update({'active': False})

        if 'name' in data:
            updated_data.update({'name': data['name']})
        if 'address' in data:
            updated_data.update({'address': data['address']})
        if 'contact' in data:
            updated_data.update({'contact': data['contact']})
        if 'deleted' in data:
            updated_data.update({'active': data['deleted']})

        try:
            db.session.query(Project).filter_by(id=project_id).update(updated_data)
            db.session.commit()
        except:
            return {'error': 'Unexpected Error'}, 404

        return {'message': 'success'}


class Rooms(Resource):

    @token_required
    @access_required
    def get(self):
        pass

    @token_required
    @access_required
    def post(self):
        pass

    @token_required
    @access_required
    def put(self):
        pass


class TimeIntervals(Resource):

    @token_required
    def get(self):

        result = []
        for interval in TimeInterval.query.all():
            result.append(row2dict(interval))

        return result
