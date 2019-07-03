FROM php:7.2-fpm-alpine3.7
MAINTAINER Jon Garcia  version: 1

# persistent packages
RUN apk add --no-cache bash wget openssl ssmtp sed libxml2-dev git openssh zip libzip libpng libbz2 icu-libs
# needed for memcached
RUN apk add --no-cache --update libmemcached-libs zlib
# libraries only needed for package compilation
RUN apk add --no-cache --update --virtual buildDeps g++ make icu-dev openssl-dev \
    curl-dev autoconf zlib-dev libmemcached-dev cyrus-sasl-dev libpng-dev \
    libzip-dev bzip2-dev

# base php packages
RUN docker-php-ext-configure zip --with-libzip \
    && docker-php-ext-install mysqli pdo_mysql zip bz2 \
    gd intl pcntl opcache bcmath soap

# php pecl libraries
RUN pecl install xdebug \
    && pecl install apcu \
    && yes no | pecl install memcached \
    && yes no | pecl install igbinary \
    && pecl install redis \
    && docker-php-ext-enable apcu igbinary xdebug redis memcached \
    # remove os packages no longer necesary
    && apk del buildDeps

# get composer
RUN wget https://raw.githubusercontent.com/composer/getcomposer.org/fe44bd5b10b89fbe7e7fc70e99e5d1a344a683dd/web/installer \
    -O - -q | php -- --quiet && mv composer.phar /usr/local/bin/composer

# fpm logs
RUN mkdir -p -m 1777 /var/log/fpm
RUN sed -i 's@error_log = /proc/self/fd/2@error_log = /var/log/fpm/fpm-error.log@' /usr/local/etc/php-fpm.d/docker.conf
RUN sed -i 's@access.log = /proc/self/fd/2@access.log = /var/log/fpm/fpm-access.log@' /usr/local/etc/php-fpm.d/docker.conf

WORKDIR /var/www/phpMyAdmin

RUN PMA_VERSION="4.9.0.1" \
    && CHECKSUM="6494e2172354a6621d0accf3445dcc3db3d17c4274fb5a94c9159590f6978bad  phpMyAdmin-$PMA_VERSION-english.tar.gz" \
    && wget https://files.phpmyadmin.net/phpMyAdmin/${PMA_VERSION}/phpMyAdmin-${PMA_VERSION}-english.tar.gz \
    && sha256sum phpMyAdmin-${PMA_VERSION}-english.tar.gz | grep "$CHECKSUM" > /dev/null \
    && tar xzpf phpMyAdmin-${PMA_VERSION}-english.tar.gz \
    && mv ./phpMyAdmin-${PMA_VERSION}-english/* . \
    && rm -R phpMyAdmin-${PMA_VERSION}-english* \
    && mkdir tmp && chown www-data:www-data tmp \
    && cp config.sample.inc.php config.inc.php \
    && sed -i "s@\$cfg\['blowfish_secret'\] \= ''@\$cfg\['blowfish_secret'\] \= '"$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)"'@" config.inc.php \
    && sed -i "s/localhost/mysql/" config.inc.php \
    && echo "\$GLOBALS['cfg']['ShowPhpInfo'] = true;" >> config.inc.php || echo "bad checksum" > index.html \
    && echo 'upload_max_filesize=500M' >> /usr/local/etc/php/conf.d/docker-php-ext-maxsize.ini \
    && echo 'post_max_size=500M' >> /usr/local/etc/php/conf.d/docker-php-ext-maxsize.ini
