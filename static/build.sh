#!/bin/sh

cd $APP_PATH

npm install

if [ "$APP_ENV" = "develop" ]; then
    npm run start:dev
else
    npm run build
    rm -rf css
    rm -rf js
    rm -rf node_modules
fi
