from datetime import datetime, timedelta

import boto3

from config import configs


class Base(object):
    clients = {}
    """Clients dictionary"""

    session = {}
    """Session dictionary"""

    resources = {}
    """resources dictionary"""

    def __init__(self):

        if 'session' not in self.session or self.session['expire'] < datetime.utcnow():
            self.session.update({'session':
                boto3.Session(
                    aws_access_key_id=configs.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=configs.AWS_SECRET_ACCESS_KEY,
                    region_name=configs.AWS_REGION
                ), 'expire': datetime.utcnow() + timedelta(hours=1)})

    def get_resource(self, rsrc):
        if rsrc not in self.resources:
            self.resources[rsrc] = self.session['session'].resource(rsrc)

        return self.resources[rsrc]

    def get_client(self, rsrc='s3'):
        if rsrc not in self.clients:
            self.clients[rsrc] = self.session['session'].client(rsrc)

        return self.clients[rsrc]
