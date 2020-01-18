import sqlalchemy
from flask_socketio import emit

from core import get_logger
from dal import db
from dal.models import Notification

def send_notification(user_id, subject, body):
    try:
        notification =  Notification(user_id=user_id, subject=subject, message=body)
        db.session.add(notification)
        db.session.commit()
        db.session.refresh(notification)
        emit(
            'USER_WS_NOTIFICATION',
            {'data': dict(notification)},
            namespace='/notifications/%s' %user_id,
            broadcast=True
        )
    except sqlalchemy.exc.SQLAlchemyError as e:
        logger = get_logger('app')
        logger.exception('Could not send notification')
        return False
    return True
