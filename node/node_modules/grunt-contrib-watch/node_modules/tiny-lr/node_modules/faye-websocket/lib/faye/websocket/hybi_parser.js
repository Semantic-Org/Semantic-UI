var crypto    = require('crypto'),
    Handshake = require('./hybi_parser/handshake'),
    Reader    = require('./hybi_parser/stream_reader');

var HybiParser = function(webSocket, options) {
  this._reset();
  this._socket    = webSocket;
  this._reader    = new Reader();
  this._stage     = 0;
  this._masking   = options && options.masking;
  this._protocols = options && options.protocols;

  this._pingCallbacks = {};

  if (typeof this._protocols === 'string')
    this._protocols = this._protocols.split(/\s*,\s*/);
};

HybiParser.mask = function(payload, mask, offset) {
  if (mask.length === 0) return payload;
  offset = offset || 0;

  for (var i = 0, n = payload.length - offset; i < n; i++) {
    payload[offset + i] = payload[offset + i] ^ mask[i % 4];
  }
  return payload;
};

var instance = {
  BYTE:   255,
  FIN:    128,
  MASK:   128,
  RSV1:   64,
  RSV2:   32,
  RSV3:   16,
  OPCODE: 15,
  LENGTH: 127,

  OPCODES: {
    continuation: 0,
    text:         1,
    binary:       2,
    close:        8,
    ping:         9,
    pong:         10
  },

  ERRORS: {
    normal_closure:       1000,
    going_away:           1001,
    protocol_error:       1002,
    unacceptable:         1003,
    encoding_error:       1007,
    policy_violation:     1008,
    too_large:            1009,
    extension_error:      1010,
    unexpected_condition: 1011
  },

  FRAGMENTED_OPCODES: [0,1,2],
  OPENING_OPCODES:    [1,2],

  ERROR_CODES: [1000,1001,1002,1003,1007,1008,1009,1010,1011],

  UTF8_MATCH: /^([\x00-\x7F]|[\xC2-\xDF][\x80-\xBF]|\xE0[\xA0-\xBF][\x80-\xBF]|[\xE1-\xEC\xEE\xEF][\x80-\xBF]{2}|\xED[\x80-\x9F][\x80-\xBF]|\xF0[\x90-\xBF][\x80-\xBF]{2}|[\xF1-\xF3][\x80-\xBF]{3}|\xF4[\x80-\x8F][\x80-\xBF]{2})*$/,

  getVersion: function() {
    var version = this._socket.request.headers['sec-websocket-version'];
    return 'hybi-' + version;
  },

  handshakeResponse: function() {
    var secKey = this._socket.request.headers['sec-websocket-key'];
    if (!secKey) return null;

    var SHA1 = crypto.createHash('sha1');
    SHA1.update(secKey + Handshake.GUID);

    var accept    = SHA1.digest('base64'),
        protos    = this._socket.request.headers['sec-websocket-protocol'],
        supported = this._protocols,
        proto,

        headers = [
          'HTTP/1.1 101 Switching Protocols',
          'Upgrade: websocket',
          'Connection: Upgrade',
          'Sec-WebSocket-Accept: ' + accept
        ];

    if (protos !== undefined && supported !== undefined) {
      if (typeof protos === 'string') protos = protos.split(/\s*,\s*/);
      proto = protos.filter(function(p) { return supported.indexOf(p) >= 0 })[0];
      if (proto) {
        this.protocol = proto;
        headers.push('Sec-WebSocket-Protocol: ' + proto);
      }
    }

    return new Buffer(headers.concat('','').join('\r\n'), 'utf8');
  },

  isOpen: function() {
    return true;
  },

  createHandshake: function(uri) {
    return new Handshake(uri, this._protocols);
  },

  parse: function(data) {
    this._reader.put(data);
    var buffer = true;
    while (buffer) {
      switch (this._stage) {
        case 0:
          buffer = this._reader.read(1);
          if (buffer) this._parseOpcode(buffer[0]);
          break;

        case 1:
          buffer = this._reader.read(1);
          if (buffer) this._parseLength(buffer[0]);
          break;

        case 2:
          buffer = this._reader.read(this._lengthSize);
          if (buffer) this._parseExtendedLength(buffer);
          break;

        case 3:
          buffer = this._reader.read(4);
          if (buffer) {
            this._mask  = buffer;
            this._stage = 4;
          }
          break;

        case 4:
          buffer = this._reader.read(this._length);
          if (buffer) {
            this._payload = buffer;
            this._emitFrame();
            this._stage = 0;
          }
          break;
      }
    }
  },

  _parseOpcode: function(data) {
    var rsvs = [this.RSV1, this.RSV2, this.RSV3].filter(function(rsv) {
      return (data & rsv) === rsv;
    }, this);

    if (rsvs.length > 0) return this._socket.close(this.ERRORS.protocol_error, null, false);

    this._final   = (data & this.FIN) === this.FIN;
    this._opcode  = (data & this.OPCODE);
    this._mask    = [];
    this._payload = [];

    var valid = false;

    for (var key in this.OPCODES) {
      if (this.OPCODES[key] === this._opcode)
        valid = true;
    }
    if (!valid) return this._socket.close(this.ERRORS.protocol_error, null, false);

    if (this.FRAGMENTED_OPCODES.indexOf(this._opcode) < 0 && !this._final)
      return this._socket.close(this.ERRORS.protocol_error, null, false);

    if (this._mode && this.OPENING_OPCODES.indexOf(this._opcode) >= 0)
      return this._socket.close(this.ERRORS.protocol_error, null, false);

    this._stage = 1;
  },

  _parseLength: function(data) {
    this._masked = (data & this.MASK) === this.MASK;
    this._length = (data & this.LENGTH);

    if (this._length >= 0 && this._length <= 125) {
      this._stage = this._masked ? 3 : 4;
    } else {
      this._lengthBuffer = [];
      this._lengthSize   = (this._length === 126 ? 2 : 8);
      this._stage        = 2;
    }
  },

  _parseExtendedLength: function(buffer) {
    this._length = this._getInteger(buffer);
    this._stage  = this._masked ? 3 : 4;
  },

  frame: function(data, type, code) {
    if (this._closed) return null;

    var isText = (typeof data === 'string'),
        opcode = this.OPCODES[type || (isText ? 'text' : 'binary')],
        buffer = isText ? new Buffer(data, 'utf8') : data,
        insert = code ? 2 : 0,
        length = buffer.length + insert,
        header = (length <= 125) ? 2 : (length <= 65535 ? 4 : 10),
        offset = header + (this._masking ? 4 : 0),
        masked = this._masking ? this.MASK : 0,
        frame  = new Buffer(length + offset),
        BYTE   = this.BYTE,
        mask, i;

    frame[0] = this.FIN | opcode;

    if (length <= 125) {
      frame[1] = masked | length;
    } else if (length <= 65535) {
      frame[1] = masked | 126;
      frame[2] = Math.floor(length / 256);
      frame[3] = length & BYTE;
    } else {
      frame[1] = masked | 127;
      frame[2] = Math.floor(length / Math.pow(2,56)) & BYTE;
      frame[3] = Math.floor(length / Math.pow(2,48)) & BYTE;
      frame[4] = Math.floor(length / Math.pow(2,40)) & BYTE;
      frame[5] = Math.floor(length / Math.pow(2,32)) & BYTE;
      frame[6] = Math.floor(length / Math.pow(2,24)) & BYTE;
      frame[7] = Math.floor(length / Math.pow(2,16)) & BYTE;
      frame[8] = Math.floor(length / Math.pow(2,8))  & BYTE;
      frame[9] = length & BYTE;
    }

    if (code) {
      frame[offset]   = Math.floor(code / 256) & BYTE;
      frame[offset+1] = code & BYTE;
    }
    buffer.copy(frame, offset + insert);

    if (this._masking) {
      mask = [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256),
              Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)];
      new Buffer(mask).copy(frame, header);
      HybiParser.mask(frame, mask, offset);
    }

    return frame;
  },

  ping: function(message, callback, context) {
    message = message || '';
    if (callback) this._pingCallbacks[message] = [callback, context];
    return this._socket.send(message, 'ping');
  },

  close: function(code, reason, callback, context) {
    if (this._closed) return;
    if (callback) this._closingCallback = [callback, context];
    this._socket.send(reason || '', 'close', code || this.ERRORS.normal_closure);
    this._closed = true;
  },

  buffer: function(fragment) {
    for (var i = 0, n = fragment.length; i < n; i++)
      this._buffer.push(fragment[i]);
  },

  _emitFrame: function() {
    var payload = HybiParser.mask(this._payload, this._mask),
        opcode  = this._opcode;

    if (opcode === this.OPCODES.continuation) {
      if (!this._mode) return this._socket.close(this.ERRORS.protocol_error, null, false);
      this.buffer(payload);
      if (this._final) {
        var message = new Buffer(this._buffer);
        if (this._mode === 'text') message = this._encode(message);
        this._reset();
        if (message !== null) this._socket.receive(message);
        else this._socket.close(this.ERRORS.encoding_error, null, false);
      }
    }
    else if (opcode === this.OPCODES.text) {
      if (this._final) {
        var message = this._encode(payload);
        if (message !== null) this._socket.receive(message);
        else this._socket.close(this.ERRORS.encoding_error, null, false);
      } else {
        this._mode = 'text';
        this.buffer(payload);
      }
    }
    else if (opcode === this.OPCODES.binary) {
      if (this._final) {
        this._socket.receive(payload);
      } else {
        this._mode = 'binary';
        this.buffer(payload);
      }
    }
    else if (opcode === this.OPCODES.close) {
      var code   = (payload.length >= 2) ? 256 * payload[0] + payload[1] : null,
          reason = (payload.length > 2) ? this._encode(payload.slice(2)) : null;

      if (!(payload.length === 0) &&
          !(code !== null && code >= 3000 && code < 5000) &&
          this.ERROR_CODES.indexOf(code) < 0)
        code = this.ERRORS.protocol_error;

      if (payload.length > 125 || (payload.length > 2 && !reason))
        code = this.ERRORS.protocol_error;

      this._socket.close(code, (payload.length > 2) ? reason : null, false);
      if (this._closingCallback)
        this._closingCallback[0].call(this._closingCallback[1]);
    }
    else if (opcode === this.OPCODES.ping) {
      if (payload.length > 125) return this._socket.close(this.ERRORS.protocol_error, null, false);
      this._socket.send(payload, 'pong');
    }
    else if (opcode === this.OPCODES.pong) {
      var callbacks = this._pingCallbacks,
          message   = this._encode(payload),
          callback  = callbacks[message];

      delete callbacks[message];
      if (callback) callback[0].call(callback[1]);
    }
  },

  _reset: function() {
    this._mode   = null;
    this._buffer = [];
  },

  _encode: function(buffer) {
    try {
      var string = buffer.toString('binary', 0, buffer.length);
      if (!this.UTF8_MATCH.test(string)) return null;
    } catch (e) {}
    return buffer.toString('utf8', 0, buffer.length);
  },

  _getInteger: function(bytes) {
    var number = 0;
    for (var i = 0, n = bytes.length; i < n; i++)
      number += bytes[i] << (8 * (n - 1 - i));
    return number;
  }
};

for (var key in instance)
  HybiParser.prototype[key] = instance[key];

module.exports = HybiParser;

