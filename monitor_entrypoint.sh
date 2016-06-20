#!/bin/sh

# Start Mock EBE
cd node_modules/mock_ebe
SOCKET_PORT=3001 LOG_PREFIX='[EBE]' npm start &

# Start Monitor
cd ../..
npm start
