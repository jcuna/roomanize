FROM nginx

RUN apt-get update && \
    apt-get install -y curl gnupg && \
    curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
    apt-get install -y nodejs

COPY . /usr/share/nginx/html
WORKDIR /usr/share/nginx/html

RUN chmod +x build.sh