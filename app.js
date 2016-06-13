"use strict"

var mock_secure_server = require('mock_secure_server');
var mock_ebe = require('mock_ebe');

let DEVICE_PARAMETER_ID = process.env.DEVICE_PARAMETER_ID || 114;
let TARGET_VALUE = process.env.TARGET_VALUE || 123;

let RECEIVE_UPDATE_REQUEST_TIMEOUT = process.env.RECEIVE_UPDATE_REQUEST_TIMEOUT || 10000;
let RECEIVE_PUSH_NOTIFICATION_TIMEOUT = process.env.RECEIVE_PUSH_NOTIFICATION_TIMEOUT || 10000;

// Run the test
let test = function() {
  console.log('[MONITOR] Running end-to-end device update test');

  // Flags for Testing
  let amqp_push_notification_received = false;
  let http_rest_api_online = false;

  // Watch for update messages
  mock_ebe.registerReceivePushNotification(DEVICE_PARAMETER_ID, TARGET_VALUE, function(msg){
    console.log('[MONITOR] The AMQP messaging interface is online!');
    amqp_push_notification_received = true;
  });

  // TODO: watch for receive events on mock_secure_server

  // TODO: watch for send events on mock_secure_server

  // Fire the request
  mock_ebe.requestUpdateDeviceData(DEVICE_PARAMETER_ID, TARGET_VALUE, (err, success) => {
    if (err || !success) { return console.error('Unable to send device update'); }

    console.log('[MONITOR] The REST API is online!');
    http_rest_api_online = true;
  });

  setTimeout(function() {
    if (!amqp_push_notification_received) {
      console.warn('[MONITOR] Timeout reached for update request - the service may be offline');
    }
  }, RECEIVE_UPDATE_REQUEST_TIMEOUT);
};

// Wait for the mock secure server to receive an importer connection
// and wait for the mock EBE to connect to the messaging server
function waitForConnections() {
  if (mock_secure_server.connections() > 0) {
    if (mock_ebe.connected()) {
      return test();
    }
  }

  // Retry in 3s
  setTimeout(waitForConnections, 3000);
};

console.log('[MONITOR] Starting components...');
waitForConnections();
