ARG NGINX_VERSION=1.27.3

FROM nginx:$NGINX_VERSION-alpine  AS contacts_nginx
COPY docker/nginx/conf.d /etc/nginx/conf.d
WORKDIR /website

COPY  /website/ /website/
