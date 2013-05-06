var API   = require('./websocket/api'),
    Event = require('./websocket/api/event');

var isSecureConnection = function(request) {
  if (request.headers['x-forwarded-proto']) {
    return request.headers['x-forwarded-proto'] === 'https';
  } else {
    return (request.connection && request.connection.authorized !== undefined) ||
           (request.socket && request.socket.secure);
  }
};

var EventSource = function(request, response, options) {
  options = options || {};

  this._request  = request;
  this._response = response;
  this._stream   = response.socket;
  this._ping     = options.ping  || this.DEFAULT_PING;
  this._retry    = options.retry || this.DEFAULT_RETRY;

  var scheme = isSecureConnection(request) ? 'https:' : 'http:';
  this.url = scheme + '//' + request.headers.host + request.url;

  this.lastEventId = request.headers['last-event-id'] || '';

  var self = this;
  this.readyState = API.CONNECTING;
  this._sendBuffer = [];
  process.nextTick(function() { self._open() });

  var handshake = 'HTTP/1.1 200 OK\r\n' +
                  'Content-Type: text/event-stream\r\n' +
                  'Cache-Control: no-cache, no-store\r\n' +
                  'Connection: close\r\n' +
                  '\r\n\r\n' +
                  'retry: ' + Math.floor(this._retry * 1000) + '\r\n\r\n';

  this.readyState = API.OPEN;

  if (this._ping)
    this._pingLoop = setInterval(function() { self.ping() }, this._ping * 1000);

  if (!this._stream || !this._stream.writable) return;

  this._stream.setTimeout(0);
  this._stream.setNoDelay(true);

  try { this._stream.write(handshake, 'utf8') } catch (e) {}

  ['close', 'end', 'error'].forEach(function(event) {
    self._stream.addListener(event, function() { self.close() });
  });
};

EventSource.isEventSource = function(request) {
  var accept = (request.headers.accept || '').split(/\s*,\s*/);
  return accept.indexOf('text/event-stream') >= 0;
};

var instance = {
  DEFAULT_PING:   10,
  DEFAULT_RETRY:  5,

  send: function(message, options) {
    if (this.readyState !== API.OPEN) return false;

    message = String(message).replace(/(\r\n|\r|\n)/g, '$1data: ');
    options = options || {};

    var frame = '';
    if (options.event) frame += 'event: ' + options.event + '\r\n';
    if (options.id)    frame += 'id: '    + options.id    + '\r\n';
    frame += 'data: ' + message + '\r\n\r\n';

    try {
      this._stream.write(frame, 'utf8');
      return true;
    } catch (e) {
      return false;
    }
  },

  ping: function() {
    try {
      this._stream.write(':\r\n\r\n', 'utf8');
      return true;
    } catch (e) {
      return false;
    }
  },

  close: function() {
    if (this.readyState === API.CLOSING || this.readyState === API.CLOSED)
      return;

    this.readyState = API.CLOSED;
    clearInterval(this._pingLoop);
    this._response.end();

    var event = new Event('close');
    event.initEvent('close', false, false);
    this.dispatchEvent(event);
  }
};

for (var key in API) EventSource.prototype[key] = API[key];
for (var key in instance) EventSource.prototype[key] = instance[key];
module.exports = EventSource;

