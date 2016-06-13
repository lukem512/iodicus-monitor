# IODiCUS Testing Monitor

This is a test harness that will perform end-to-end tests on the HTTP, WebSocket and AMQP interfaces of the Energy Portal (EP). The harness initiates a device update using the REST API (HTTP) and a mock Energy Balancing Engine (EBE). The device to be updated is owned by a mock Secure Server.

To install the test you must clone this module and it's dependencies:

```
    git clone https://github.com/lukem512/iodicus-monitor.git
    cd monitor
    npm install
```

To run the test you must start this module and, once it has initialised, start the secure importer:

```
    npm start
    cd ~/YOUR_IODICUS_PROJECT/ep_site/python manage.py import_secure_autobahn -s test-server -r
```
