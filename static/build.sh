#!/bin/sh

cd $APP_PATH

npm install

if [ "$APP_ENV" = "develop" ]; then
    npm run watch
else
    npm run build
fi