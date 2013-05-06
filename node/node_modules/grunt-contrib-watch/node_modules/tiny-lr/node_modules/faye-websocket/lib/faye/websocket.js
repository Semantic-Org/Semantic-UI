// API and protocol references:
// 
// * http://dev.w3.org/html5/websockets/
// * http://dvcs.w3.org/hg/domcore/raw-file/tip/Overview.html#interface-eventtarget
// * http://dvcs.w3.org/hg/domcore/raw-file/tip/Overview.html#interface-event
// * http://tools.ietf.org/html/draft-hixie-thewebsocketprotocol-75
// * http://tools.ietf.org/html/draft-hixie-thewebsocketprotocol-76
// * http://tools.ietf.org/html/draft-ietf-hybi-thewebsocketprotocol-17

var Draft75Parser = require('./websocket/draft75_parser'),
    Draft76Parser = require('./websocket/draft76_parser'),
    HybiParser    = require('./websocket/hybi_parser'),
    API           = require('./websocket/api'),
    Event         = require('./websocket/api/event');

var getParser = function(request) {
  var headers = request.headers;
  return headers['sec-websocket-version']
       ? HybiParser
       : (headers['sec-websocket-key1'] && headers['sec-websocket-key2'])
       ? Draft76Parser
       : Draft75Parser;
};

var isSecureConnection = function(request) {
  if (request.headers['x-forwarded-proto']) {
    return request.headers['x-forwarded-proto'] === 'https';
  } else {
    return (request.connection && request.connection.authorized !== undefined) ||
           (request.socket && request.socket.secure);
  }
};

var WebSocket = function(request, socket, head, supportedProtos, options) {
  this.request = request;
  this._stream = request.socket;
  this._ping   = options && options.ping;
  this._pingId = 0;

  var scheme = isSecureConnection(request) ? 'wss:' : 'ws:';
  this.url = scheme + '//' + request.headers.host + request.url;
  this.readyState = API.CONNECTING;
  this.bufferedAmount = 0;

  var Parser = getParser(request);
  this._parser = new Parser(this, {protocols: supportedProtos});

  var self = this;
  this._sendBuffer = [];
  process.nextTick(function() { self._open() });

  var handshake = this._parser.handshakeResponse(head);
  if (this._parser.isOpen()) this.readyState = API.OPEN;

  if (this._ping)
    this._pingLoop = setInterval(function() {
      self._pingId += 1;
      self.ping(self._pingId.toString());
    }, this._ping * 1000);

  this.protocol = this._parser.protocol || '';
  this.version = this._parser.getVersion();

  if (!this._stream || !this._stream.writable) return;

  this._stream.setTimeout(0);
  this._stream.setNoDelay(true);

  try { this._stream.write(handshake, 'binary') } catch (e) {}

  this._stream.addListener('data', function(data) {
    var response = self._parser.parse(data);
    if (!response) return;
    try { self._stream.write(response, 'binary') } catch (e) {}
    self._open();
  });
  ['close', 'end', 'error'].forEach(function(event) {
    self._stream.addListener(event, function() { self.close(1006, '', false) });
  });
};

WebSocket.prototype.ping = function(message, callback, context) {
  if (!this._parser.ping) return false;
  return this._parser.ping(message, callback, context);
};

for (var key in API) WebSocket.prototype[key] = API[key];

WebSocket.WebSocket   = WebSocket;
WebSocket.Client      = require('./websocket/client');
WebSocket.EventSource = require('./eventsource');
module.exports        = WebSocket;

