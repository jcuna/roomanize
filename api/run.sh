#!/bin/sh

cd $APP_PATH

if [ "$APP_ENV" = "develop" ]; then
    python3 app.py
else
    gunicorn -w 1 --bind :5000 wsgi:app --log-level=debug --log-file=-
fi