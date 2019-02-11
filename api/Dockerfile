FROM python:3.7.2
MAINTAINER Jon Cuna <jcuna@joncuna.com>

COPY . /usr/src/app
WORKDIR /usr/src/app

RUN python3 -m pip install --upgrade pip
RUN apt-get update && apt-get install -y ssmtp \
    && sed -i 's/^\(mailhub=\).*$/\1mailhog:1025/' /etc/ssmtp/ssmtp.conf \
    && echo "FromLineOverride=YES" >> /etc/ssmtp/ssmtp.conf

RUN pip install -r requirements.txt
RUN chmod +x run.sh
