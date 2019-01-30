#!/bin/sh

cd $APP_PATH

if [ "$APP_ENV" = "develop" ]; then
    while true
    do
        python3 app.py
        sleep 2
    done
else
    gunicorn --worker-class eventlet -w 1 --bind :5000 wsgi:app --log-level=debug --log-file=-
fi
