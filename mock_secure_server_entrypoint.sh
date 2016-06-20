#!/bin/sh

# Start Mock Secure Server
cd node_modules/mock_secure_server
SOCKET_PORT=3000 LOG_PREFIX='[SS]' npm start
