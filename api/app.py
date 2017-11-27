from flask import Flask
import os
import core

app = Flask(__name__)

app.isDev = os.environ['APP_ENV'] == 'develop'

core.Router(app)

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=app.isDev
    )
