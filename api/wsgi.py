from app import init_app
from flask_socketio import SocketIO

app = init_app()

if __name__ == '__main__':
    socketio = SocketIO(app)
    socketio.run(app)
