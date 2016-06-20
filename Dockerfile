FROM node:6.2.1

# Create working directory
RUN mkdir -p /usr/src/monitor
WORKDIR /usr/src/monitor

# Copy application files
COPY . /usr/src/monitor

# Install dependencies from NPM/GitHub
RUN npm install

# Environment variables
# These can be overridden using the `-e` switch with `docker run`
ENV EP_API_HOST ''
ENV EP_API_PORT 8000
ENV EP_AUTHORIZATION_TOKEN ''

ENV EP_MESSAGING_HOST ''
ENV EP_MESSAGING_PORT 5672
ENV EP_MESSAGING_USER 'guest'
ENV EP_MESSAGING_PASS 'guest'
ENV EP_MESSAGING_EXCHANGE_NAME 'LES_EVENTS'

ENV MOCK_SECURE_SERVER_WS_PORT 5678
ENV MOCK_SECURE_SERVER_HTTP_PORT 8080

ENV MOCK_SECURE_SERVER_SOCKET_PORT 3000
ENV MOCK_EBE_SOCKET_PORT 3001

# Expose ports
EXPOSE $EP_MESSAGING_PORT
EXPOSE $EP_API_PORT

EXPOSE $MOCK_SECURE_SERVER_HTTP_PORT
EXPOSE $MOCK_SECURE_SERVER_WS_PORT

EXPOSE $MOCK_SECURE_SERVER_SOCKET_PORT
EXPOSE $MOCK_EBE_SOCKET_PORT

# Command to run application
COPY ./docker-entrypoint.sh /
COPY ./mock_secure_server_entrypoint.sh /
ENTRYPOINT [ "/monitor_entrypoint.sh" ]
