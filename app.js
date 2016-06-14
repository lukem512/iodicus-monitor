"use strict"
let io = require('socket.io-client');

let DEVICE_PARAMETER_ID = process.env.DEVICE_PARAMETER_ID || 114;
let TARGET_VALUE = process.env.TARGET_VALUE || 123;
let GATEWAY_MAC_ID = process.env.GATEWAY_MAC_ID || 11223344556677;

let SOCKET_WAIT_TIME = process.env.SOCKET_WAIT_TIME || 3000;

// Default socket factory
function connect_to_socket(name, host, port) {
  let socket_uri = host + ':' + port;

  console.log('[SOCKET] Connecting to ' + name + ' at \'' + socket_uri + '\'');
  return io.connect(socket_uri, { reconnect: true });
};

// Method to check for socket connections
var ebe_socket_connected, secure_server_socket_connected = false;

function wait_for_sockets() {
  if (ebe_socket_connected && secure_server_socket_connected) {
    console.log('[SOCKET] Calling requestUpdateDeviceData');

    // Call the mock_ebe to make a device update
    ebe_socket.emit('call', {
      routineName: 'requestUpdateDeviceData',
      args: {
        device_parameter_id: DEVICE_PARAMETER_ID,
        target_value: TARGET_VALUE
      }
    }, function(err, success) {
      if (err) return console.error('[SOCKET] Error:', err);
      console.log('[SOCKET] Resulting value was ' + success);

      if (success) {
        console.log('[MONITOR] REST API is online!');
      }
    });
  } else {
    setTimeout(wait_for_sockets, SOCKET_WAIT_TIME);
  }
}

//
// Mock Energy Balancing Engine
//
var MOCK_EBE_HOST = process.env.MOCK_EBE_HOST || 'http://localhost';
var MOCK_EBE_SOCKET_PORT = process.env.MOCK_EBE_SOCKET_PORT || 3001;
const MOCK_EBE_SOCKET_NAME = 'mock_ebe';

var ebe_socket = connect_to_socket(MOCK_EBE_SOCKET_NAME, MOCK_EBE_HOST, MOCK_EBE_SOCKET_PORT);

// Wait for connection
ebe_socket.on('connect', data => {
  ebe_socket_connected = true;
});

// Subscribe to the receive event
ebe_socket.on('receive', data => {
  console.log('[SOCKET] Received \'receive\' event from ' + MOCK_EBE_SOCKET_NAME);
  let obj = JSON.parse(data);

  /* { current: 105,
  type: '112',
  device_parameter: 114,
  intent: 123,
  trigger: 'AP',
  time: '2016-06-14T09:22:32.083947+00:00',
  site: 'secure_testsite',
  action: 'change_request' } */

  if (obj.action == 'change_request') {
    if (obj.device_parameter.toString() == DEVICE_PARAMETER_ID.toString()) {
      if (obj.intent.toString() == TARGET_VALUE.toString()) {
        console.log('[MONITOR] Change request acknowledged by Message Queue')
      }
    }
  }

  /* { previous: 105,
  current: 123,
  type: '112',
  action: 'change_record',
  site: 'secure_testsite',
  device_parameter: 114,
  trigger: 'OD',
  time: '2016-06-13T10:34:23.850940+00:00' } */

  if (obj.action == 'change_record') {
    if (obj.device_parameter.toString() == DEVICE_PARAMETER_ID.toString()) {
      if (obj.current.toString() == TARGET_VALUE.toString()) {
        console.log('[MONITOR] Message Queue is online!')
      }
    }
  }
});
ebe_socket.emit('subscribe', { eventName: 'receive' });

// Subscribe to the send event
ebe_socket.on('send', data => {
  console.log('[SOCKET] Received \'send\' event from ' + MOCK_EBE_SOCKET_NAME);
  let obj = JSON.parse(data);

  console.log(obj)
});
ebe_socket.emit('subscribe', { eventName: 'send' });

//
// Mock Secure Server
//
var MOCK_SECURE_SERVER_HOST = process.env.MOCK_SECURE_SERVER_HOST || 'http://localhost';
var MOCK_SECURE_SERVER_SOCKET_PORT = process.env.MOCK_SECURE_SERVER_SOCKET_PORT || 3000;
const MOCK_SECURE_SERVER_SOCKET_NAME = 'mock_secure_server';

var secure_server_socket = connect_to_socket(MOCK_SECURE_SERVER_SOCKET_NAME, MOCK_SECURE_SERVER_HOST, MOCK_SECURE_SERVER_SOCKET_PORT);

// Wait for connection
ebe_socket.on('connect', data => {
  secure_server_socket_connected = true;
});

// Subscribe to the receive event
secure_server_socket.on('receive', data => {
  console.log('[SOCKET] Received \'receive\' event from ' + MOCK_SECURE_SERVER_SOCKET_NAME);
  let obj = JSON.parse(data);

  /* {
      DeviceData: {
        DPDO: [{
          DPRefID: "112",
          LTU: 20160614T091021052Z,
          CV: 123
        }],
        DPID: 64,
        DRefID: "1"
      },
    GatewayMacId: "11223344556677"
  } */

  // For now, just check that the target value matches
  if (obj.GatewayMacId == GATEWAY_MAC_ID) {
    obj.DeviceData.DPDO.some(dpdo => {
      if (dpdo.CV == TARGET_VALUE) {
        console.log('[MONITOR] Secure Server HTTP interface is online!');
        return true;
      }
      return false;
    });
  }
});
secure_server_socket.emit('subscribe', { eventName: 'receive' });

// Subscribe to the send event
secure_server_socket.on('send', data => {
  console.log('[SOCKET] Received \'send\' event from ' + MOCK_SECURE_SERVER_SOCKET_NAME);
  let obj = JSON.parse(data);

  /*
    {
      "DataType":0,
      "Data":{
        "GDDO":{
          "GMACID":11223344556677,
          "GCS":"1",
          "GN":"TestGateway",
          "LUT":"2016-06-14T09:14:47.008Z",
          "ZNDS":[{
            "ZID":1,
            "DDDO":[{
              "DRefID":1,
              "DPID":1,
              "DPDO":[{
                "DPRefID":112,
                "CV":123,
                "LUT":"2016-06-14T09:14:47.008Z"
              }]
            }]
          }]
        },
        "ALMS":[]
      }
    }
  */

  // For now, just check that the target value matches
  if (obj.DataType == 0) {
    let gddo = obj.Data.GDDO;
    if (gddo.GMACID == GATEWAY_MAC_ID) {
      gddo.ZNDS.some(znds => {
        let found = false;
        znds.DDDO.some(dddo => {
          dddo.DPDO.some(dpdo => {
            if (dpdo.CV == TARGET_VALUE) {
              found = true;
              console.log('[MONITOR] Secure Server WebSocket interface is online!');
            }
            return found;
          });
          return found;
        });
        return found;
      });
    }
  }
});
secure_server_socket.emit('subscribe', { eventName: 'send' });

//
// Main test methods
//

// Spin until the sockets have connected
setTimeout(wait_for_sockets, SOCKET_WAIT_TIME);
