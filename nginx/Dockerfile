FROM nginx:1.28.0-alpine3.21-perl

COPY default.conf /etc/nginx/default.conf.template
COPY certificates /etc/nginx/certs

COPY script.sh /script.sh
RUN chmod +x /script.sh

ENTRYPOINT [ "/script.sh" ]
CMD [ "nginx", "-g", "daemon off;" ]