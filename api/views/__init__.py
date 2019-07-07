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

    @staticmethod
    def paginate(result, page, total_pages):
        return {'list': result, 'page': page, 'total_pages': total_pages}
