FROM python:3.6.3
MAINTAINER Jon Cuna <jcuna@joncuna.com>

COPY . /usr/src/app
WORKDIR /usr/src/app

RUN pip install -r requirements.txt

CMD ["python3", "app.py"]