var WebSocket = require('../lib/faye/websocket'),
    port      = process.argv[2] || 7000,
    secure    = process.argv[3] === 'ssl',
    scheme    = secure ? 'wss' : 'ws',
    ws        = new WebSocket.Client(scheme + '://localhost:' + port + '/');

console.log('Connecting to ' + ws.url);

ws.onopen = function(event) {
  console.log('open');
  ws.send('Hello, WebSocket!');
};

ws.onmessage = function(event) {
  console.log('message', event.data);
  // ws.close(1002, 'Going away');
};

ws.onclose = function(event) {
  console.log('close', event.code, event.reason);
};

