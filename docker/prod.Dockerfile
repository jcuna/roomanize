FROM python:3.7.2
MAINTAINER Jon Garcia <jongarcia@sans.org>

RUN python3 -m pip install --upgrade pip

COPY ./api /usr/src/app
COPY ./docker/supervisord.conf /etc/supervisord.conf

RUN mkdir /usr/src/app/log

WORKDIR /usr/src/app

RUN pip install -r requirements.txt
