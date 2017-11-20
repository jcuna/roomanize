
from flask import Flask
from flask_restful import Resource, Api

app = Flask(__name__)
api = Api(app)


class Test(Resource):
    def get(self):
        return {
            'test': [
                'hello',
                'hello1',
                'hello2',
            ]
        }


api.add_resource(Test, "/")

if (__name__ == '__main__'):
    app.run(host='0.0.0.0', port=80, debug=True)
