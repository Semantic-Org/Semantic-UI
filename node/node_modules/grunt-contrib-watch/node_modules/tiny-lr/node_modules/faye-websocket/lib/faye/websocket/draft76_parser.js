var crypto        = require('crypto'),
    Draft75Parser = require('./draft75_parser'),
    Draft76Parser = function() { Draft75Parser.apply(this, arguments) };

var bridge = function() {};
bridge.prototype = Draft75Parser.prototype;
Draft76Parser.prototype = new bridge();

var numberFromKey = function(key) {
  return parseInt(key.match(/[0-9]/g).join(''), 10);
};

var spacesInKey = function(key) {
  return key.match(/ /g).length;
};

var bigEndian = function(number) {
  var string = '';
  [24,16,8,0].forEach(function(offset) {
    string += String.fromCharCode(number >> offset & 0xFF);
  });
  return string;
};

Draft76Parser.prototype.getVersion = function() {
  return 'hixie-76';
};

Draft76Parser.prototype.handshakeResponse = function(head) {
  var request = this._socket.request, tmp;

  var response = new Buffer('HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
                            'Upgrade: WebSocket\r\n' +
                            'Connection: Upgrade\r\n' +
                            'Sec-WebSocket-Origin: ' + request.headers.origin + '\r\n' +
                            'Sec-WebSocket-Location: ' + this._socket.url + '\r\n\r\n',
                            'binary');

  var signature = this.handshakeSignature(head);
  if (signature) {
    tmp = new Buffer(response.length + signature.length);
    response.copy(tmp, 0);
    signature.copy(tmp, response.length);
    response = tmp;
  }

  return response;
};

Draft76Parser.prototype.isOpen = function() {
  return !!this._handshakeComplete;
};

Draft76Parser.prototype.handshakeSignature = function(head) {
  if (head.length === 0) return null;

  var request = this._socket.request,

      key1    = request.headers['sec-websocket-key1'],
      value1  = numberFromKey(key1) / spacesInKey(key1),

      key2    = request.headers['sec-websocket-key2'],
      value2  = numberFromKey(key2) / spacesInKey(key2),

      MD5     = crypto.createHash('md5');

  MD5.update(bigEndian(value1));
  MD5.update(bigEndian(value2));
  MD5.update(head.toString('binary'));

  this._handshakeComplete = true;
  return new Buffer(MD5.digest('binary'), 'binary');
};

Draft76Parser.prototype.parse = function(data) {
  if (this._handshakeComplete)
    return Draft75Parser.prototype.parse.call(this, data);

  return this.handshakeSignature(data);
};

Draft76Parser.prototype._parseLeadingByte = function(data) {
  if (data !== 0xFF)
    return Draft75Parser.prototype._parseLeadingByte.call(this, data);

  this._closing = true;
  this._length = 0;
  this._stage = 1;
};

Draft76Parser.prototype.close = function(code, reason, callback, context) {
  if (this._closed) return;
  if (this._closing) this._socket.send(new Buffer([0xFF, 0x00]));
  this._closed = true;
  if (callback) callback.call(context);
};

module.exports = Draft76Parser;

