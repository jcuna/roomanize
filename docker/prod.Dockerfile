FROM python:3.7.4-alpine
MAINTAINER Jon Cuna <jcuna@joncuna.com>

COPY ./api /usr/src/app
COPY ./docker/supervisord.conf /etc/supervisord.conf
WORKDIR /usr/src/app

RUN mkdir /usr/src/app/log

RUN apk add --no-cache bash ssmtp jpeg-dev zlib-dev

RUN apk add --no-cache postgresql-libs \
    && apk add --no-cache --virtual .build-deps gcc musl-dev postgresql-dev \
    && pip install pydevd-pycharm~=191.7479.19 \
    && pip install -r /build/requirements.txt --no-cache-dir \
    && apk --purge del .build-deps


