FROM nginx:1.28.0-alpine3.21-perl

COPY conf/nginx.conf /etc/nginx/nginx.conf.template
COPY certs /etc/nginx/certs

COPY script.sh /script.sh
RUN chmod +x /script.sh

ENTRYPOINT [ "/entrypoint.sh" ]
CMD [ "nginx", "-g", "daemon off;" ]