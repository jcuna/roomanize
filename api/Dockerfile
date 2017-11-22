FROM python:3.6.3
MAINTAINER Jon Cuna <jcuna@joncuna.com>

COPY . /usr/src/app
WORKDIR /usr/src/app

RUN pip install -r requirements.txt
RUN chmod +x run.sh