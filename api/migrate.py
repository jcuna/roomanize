from app import db, init_app
from dal.models import collation

app = init_app()

with app.app_context():

    connection = db.engine.raw_connection()
    connection.cursor().execute("SET NAMES 'utf8mb4' COLLATE '" + collation + "'")

    db.create_all()
