#!/bin/sh

cd ${APP_PATH}

if [ ! -d "$APP_PATH/log" ]; then
    mkdir "$APP_PATH/log"
fi

if [ "$APP_ENV" = "develop" ]; then
    while true
    do
        python3 app.py >> "$APP_PATH/log/app.log" 2>&1
        sleep 2
    done
else
    gunicorn --worker-class eventlet --bind :5000 wsgi:app --log-level=debug --log-file=- >> "$APP_PATH/log/app.log" 2>&1
fi
