# IODiCUS Testing Monitor

This is a test harness that will perform end-to-end tests on the HTTP, WebSocket and AMQP interfaces of the Energy Portal (EP). The harness initiates a device update using the REST API (HTTP) and a mock Energy Balancing Engine (EBE). The device to be updated is owned by a mock Secure Server.

To install the test you must clone this module and its dependencies:

```
  git clone https://github.com/lukem512/iodicus-monitor.git
  cd ./iodicus-monitor
  npm install
```

To run the test you must start this module, specifying the hosts and socket ports of the [mock_ebe](https://github.com/lukem512/mock-ebe) and the [mock_secure_server](https://github.com/lukem512/mock-secure-server) instances. These must be running for the test to succeed.

```
  MOCK_EBE_HOST='http://localhost' MOCK_EBE_SOCKET_PORT=3001 MOCK_SECURE_SERVER_HOST='localhost' MOCK_SECURE_SERVER_SOCKET_PORT=3000 npm start
```

To specify the device to update, the following environment variables can be set. The default values are shown.

```
  DEVICE_PARAMETER_ID = 114
  TARGET_VALUE = 23
  GATEWAY_MAC_ID = 11223344556677
```
