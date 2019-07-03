class Result:

    @staticmethod
    def success(message='Success', code=200):
        return {'message': message}, code

    @staticmethod
    def error(message='Unexpected Error', code=400):
        return {'error': message}, code

    @staticmethod
    def id(_id):
        return {'id': _id}
