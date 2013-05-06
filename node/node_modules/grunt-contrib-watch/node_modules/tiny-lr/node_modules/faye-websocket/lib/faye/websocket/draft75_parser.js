var Draft75Parser = function(webSocket) {
  this._socket = webSocket;
  this._stage  = 0;
};

var instance = {
  getVersion: function() {
    return 'hixie-75';
  },

  handshakeResponse: function() {
    return new Buffer('HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
                      'Upgrade: WebSocket\r\n' +
                      'Connection: Upgrade\r\n' +
                      'WebSocket-Origin: ' + this._socket.request.headers.origin + '\r\n' +
                      'WebSocket-Location: ' + this._socket.url + '\r\n\r\n',
                      'utf8');
  },

  isOpen: function() {
    return true;
  },

  parse: function(buffer) {
    var data, message, value;
    for (var i = 0, n = buffer.length; i < n; i++) {
      data = buffer[i];

      switch (this._stage) {
        case 0:
          this._parseLeadingByte(data);
          break;

        case 1:
          value = (data & 0x7F);
          this._length = value + 128 * this._length;

          if (this._closing && this._length === 0) {
            this._socket.close(null, null, false);
          }
          else if ((0x80 & data) !== 0x80) {
            if (this._length === 0) {
              this._socket.receive('');
              this._stage = 0;
            }
            else {
              this._buffer = [];
              this._stage = 2;
            }
          }
          break;

        case 2:
          if (data === 0xFF) {
            message = new Buffer(this._buffer);
            this._socket.receive(message.toString('utf8', 0, this._buffer.length));
            this._stage = 0;
          }
          else {
            this._buffer.push(data);
            if (this._length && this._buffer.length === this._length)
              this._stage = 0;
          }
          break;
      }
    }
  },

  _parseLeadingByte: function(data) {
    if ((0x80 & data) === 0x80) {
      this._length = 0;
      this._stage = 1;
    } else {
      delete this._length;
      this._buffer = [];
      this._stage = 2;
    }
  },

  frame: function(data) {
    if (Buffer.isBuffer(data)) return data;

    var buffer = new Buffer(data, 'utf8'),
        frame  = new Buffer(buffer.length + 2);

    frame[0] = 0x00;
    frame[buffer.length + 1] = 0xFF;
    buffer.copy(frame, 1);

    return frame;
  }
};

for (var key in instance)
  Draft75Parser.prototype[key] = instance[key];

module.exports = Draft75Parser;

