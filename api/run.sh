#!/bin/sh

cd $APP_PATH

if [ "$APP_ENV" = "develop" ]; then
    while true
    do
        python3 app.py
        sleep 5
    done
else
    gunicorn -w 1 --bind :5000 wsgi:app --log-level=debug --log-file=-
fi