FROM alpine:3.22

# Install MariaDB and required tools
RUN apk add --no-cache mariadb mariadb-client bash

# Create necessary directories for MariaDB
RUN mkdir -p /run/mysqld && chown -R mysql:mysql /run/mysqld /var/lib/mysql

# Copy the initialization script and SQL file to the container
COPY ./tools/script.sh /docker-entrypoint-initdb.d/script.sh
COPY ./tools/init.sql /docker-entrypoint-initdb.d/init.sql

# Ensure the script has execution permissions
RUN chmod +x /docker-entrypoint-initdb.d/script.sh

# Set environment variables for MariaDB
ENV MYSQL_ROOT_PASSWORD=test
ENV MYSQL_DATABASE=ft_transcendance
ENV MYSQL_USER=root
ENV MYSQL_PASSWORD=123456789

# Expose the default MariaDB port
EXPOSE 3306

# Set the default command to start MariaDB
CMD ["sh", "-c", "mysqld --init-file=/docker-entrypoint-initdb.d/init.sql"]