#!/bin/sh

envsubst '${MAIN_HOST} ${MAIN_PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
exec "$@"