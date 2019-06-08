#!/bin/sh

cd $APP_PATH

npm install

if [ "$APP_ENV" = "develop" ]; then
    npm run start:dev
else
    #rm -rf css && rm -rf js && rm -rf node_modules &&
    npm run build && cp -r . /static_files && printf "success...\n"
fi
