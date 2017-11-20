FROM nginx

RUN apt-get update && \
    apt-get install curl gnupg && \
    curl -sL https://deb.nodesource.com/setup_9.x | bash - && \
    apt-get install -y nodejs

COPY . /usr/share/nginx/html

WORKDIR /usr/share/nginx/html