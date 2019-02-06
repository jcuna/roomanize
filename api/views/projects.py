import json
from datetime import datetime
from flask import request, session
from flask_restful import Resource
from dal.models import Project, TimeInterval, row2dict, User
from dal.shared import token_required, access_required, db


class Projects(Resource):

    @token_required
    def get(self):

        access = request.user.attributes.user_access if hasattr(request.user.attributes, 'user_access')\
            else None

        q = Project.query.filter_by(deleted=None)

        if access:
            access = json.loads(access)
            if 'projects' in access:
                pl = access['projects']
                if pl == '*':
                    q.limit(10)
                else:
                    q.filter(Project.id.in_(pl))

        return {
            'projects': list(map(lambda r: row2dict(r), q.all()))
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

        user = User.query.options().filter_by(email=session['user_email']).first()
        attr = {}
        if user.attributes.user_preferences:
            attr = json.loads(user.attributes.user_preferences)

        attr['default_project'] = project.id if data['active'] else None
        user.attributes.user_preferences = json.dumps(attr)
        db.session.commit()

        return dict(id=project.id)

    @token_required
    @access_required
    def put(self, project_id):
        data = request.get_json()

        updated_data = {}

        if 'active' in data:
            updated_data.update({'active': data['active']})

            user = User.query.options().filter_by(email=session['user_email']).first()

            attr = {}
            if user.attributes.user_preferences:
                attr = json.loads(user.attributes.user_preferences)

            if data['active']:
                db.session.query(Project).filter(Project.active.is_(True)).update({'active': False})

            attr['default_project'] = project_id if data['active'] else None
            user.attributes.user_preferences = json.dumps(attr)

        if 'name' in data:
            updated_data.update({'name': data['name']})
        if 'address' in data:
            updated_data.update({'address': data['address']})
        if 'contact' in data:
            updated_data.update({'contact': data['contact']})
        if 'deleted' in data:
            updated_data.update({'deleted': datetime.utcnow()})

        try:
            db.session.query(Project).filter_by(id=project_id).update(updated_data)
            db.session.commit()
        except any:
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
