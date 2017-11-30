from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def get_fillable(model: db.Model, **kwargs):

    if not hasattr(model, 'fillable') and any(kwargs):
        raise Exception('Must declare a fillable on class ' + model.__name__)

    fillable = {}
    for attribute_name in model.fillable:
        if attribute_name in kwargs:
            fillable[attribute_name] = kwargs[attribute_name]

    return fillable
