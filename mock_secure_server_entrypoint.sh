#!/bin/sh

# Start Mock Secure Server
cd /mock_secure_server/node_modules/mock_secure_server
SOCKET_PORT=3000 LOG_PREFIX='[SS]' npm start
