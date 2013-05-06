var net = require('net'),
    tls = require('tls');

var HybiParser = require('./hybi_parser'),
    API        = require('./api'),
    Event      = require('./api/event');

var Client = function(url, protocols, options) {
  this.url  = url;
  this._uri = require('url').parse(url);

  this.protocol = '';
  this.readyState = API.CONNECTING;
  this.bufferedAmount = 0;

  var secure     = (this._uri.protocol === 'wss:'),
      self       = this,
      onConnect  = function() { self._onConnect() },
      tlsOptions = {};

  if (options && options.verify === false) tlsOptions.rejectUnauthorized = false;

  var connection = secure
                 ? tls.connect(this._uri.port || 443, this._uri.hostname, tlsOptions, onConnect)
                 : net.createConnection(this._uri.port || 80, this._uri.hostname);

  this._parser = new HybiParser(this, {masking: true, protocols: protocols});
  this._stream = connection;

  this._stream.setTimeout(0);
  this._stream.setNoDelay(true);

  if (!secure) connection.addListener('connect', onConnect);

  connection.addListener('data', function(data) {
    self._onData(data);
  });
  ['close', 'end', 'error'].forEach(function(event) {
    connection.addListener(event, function() { self.close(1006, '', false) });
  });
};

Client.prototype._onConnect = function() {
  this._handshake = this._parser.createHandshake(this._uri, this._stream);
  this._message = [];
  try {
    this._stream.write(this._handshake.requestData(), 'binary');
  } catch (e) {}
};

Client.prototype._onData = function(data) {
  switch (this.readyState) {
    case API.CONNECTING:
      var bytes = this._handshake.parse(data);
      for (var i = 0, n = bytes.length; i < n; i++)
        this._message.push(bytes[i]);

      if (!this._handshake.isComplete()) return;

      if (this._handshake.isValid()) {
        this.protocol = this._handshake.protocol || '';
        this.readyState = API.OPEN;
        var event = new Event('open');
        event.initEvent('open', false, false);
        this.dispatchEvent(event);

        this._parser.parse(this._message);

      } else {
        this.readyState = API.CLOSED;
        var event = new Event('close', {code: 1006, reason: ''});
        event.initEvent('close', false, false);
        this.dispatchEvent(event);
      }
      break;

    case API.OPEN:
    case API.CLOSING:
      this._parser.parse(data);
  }
};

for (var key in API) Client.prototype[key] = API[key];

module.exports = Client;

