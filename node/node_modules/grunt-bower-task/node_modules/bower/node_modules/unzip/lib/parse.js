'use strict';

module.exports = Parse.create = Parse;

require("setimmediate");
var Transform = require('stream').Transform;
var inherits = require('util').inherits;
var zlib = require('zlib');
var binary = require('binary');
var PullStream = require('pullstream');
var MatchStream = require('match-stream');
var Entry = require('./entry');

if (!Transform) {
  Transform = require('readable-stream/transform');
}

inherits(Parse, Transform);

function Parse(opts) {
  var self = this;
  if (!(this instanceof Parse)) {
    return new Parse(opts);
  }

  Transform.call(this, { lowWaterMark: 0 });
  this._opts = opts || { verbose: false };
  this._hasEntryListener = false;

  this._pullStream = new PullStream();
  this._pullStream.on("error", function (e) {
    self.emit('error', e);
  });
  this._pullStream.once("end", function () {
    self._streamEnd = true;
  });
  this._pullStream.once("finish", function () {
    self._streamFinish = true;
  });

  this._readRecord();
}

Parse.prototype._readRecord = function () {
  var self = this;
  this._pullStream.pull(4, function (err, data) {
    if (err) {
      return self.emit('error', err);
    }

    if (data.length === 0) {
      return;
    }

    var signature = data.readUInt32LE(0);
    if (signature === 0x04034b50) {
      self._readFile();
    } else if (signature === 0x02014b50) {
      self._readCentralDirectoryFileHeader();
    } else if (signature === 0x06054b50) {
      self._readEndOfCentralDirectoryRecord();
    } else {
      err = new Error('invalid signature: 0x' + signature.toString(16));
      self.emit('error', err);
    }
  });
};

Parse.prototype._readFile = function () {
  var self = this;
  this._pullStream.pull(26, function (err, data) {
    if (err) {
      return self.emit('error', err);
    }

    var vars = binary.parse(data)
      .word16lu('versionsNeededToExtract')
      .word16lu('flags')
      .word16lu('compressionMethod')
      .word16lu('lastModifiedTime')
      .word16lu('lastModifiedDate')
      .word32lu('crc32')
      .word32lu('compressedSize')
      .word32lu('uncompressedSize')
      .word16lu('fileNameLength')
      .word16lu('extraFieldLength')
      .vars;

    return self._pullStream.pull(vars.fileNameLength, function (err, fileName) {
      if (err) {
        return self.emit('error', err);
      }
      fileName = fileName.toString('utf8');
      var entry = new Entry();
      entry.path = fileName;
      entry.props.path = fileName;
      entry.type = (vars.compressedSize === 0 && /[\/\\]$/.test(fileName)) ? 'Directory' : 'File';

      if (self._opts.verbose) {
        if (entry.type === 'Directory') {
          console.log('   creating:', fileName);
        } else if (entry.type === 'File') {
          if (vars.compressionMethod === 0) {
            console.log(' extracting:', fileName);
          } else {
            console.log('  inflating:', fileName);
          }
        }
      }

      var hasEntryListener = self._hasEntryListener;
      if (hasEntryListener) {
        self.emit('entry', entry);
      }

      self._pullStream.pull(vars.extraFieldLength, function (err, extraField) {
        if (err) {
          return self.emit('error', err);
        }
        if (vars.compressionMethod === 0) {
          self._pullStream.pull(vars.compressedSize, function (err, compressedData) {
            if (err) {
              return self.emit('error', err);
            }

            if (hasEntryListener) {
              entry.write(compressedData);
              entry.end();
            }

            return self._readRecord();
          });
        } else {
          var fileSizeKnown = !(vars.flags & 0x08);

          var inflater = zlib.createInflateRaw();
          inflater.on('error', function (err) {
            self.emit('error', err);
          });

          if (fileSizeKnown) {
            entry.size = vars.uncompressedSize;
            if (hasEntryListener) {
              entry.on('finish', self._readRecord.bind(self));
              self._pullStream.pipe(vars.compressedSize, inflater).pipe(entry);
            } else {
              self._pullStream.drain(vars.compressedSize, function (err) {
                if (err) {
                  return self.emit('error', err);
                }
                self._readRecord();
              });
            }
          } else {
            var descriptorSig = new Buffer(4);
            descriptorSig.writeUInt32LE(0x08074b50, 0);

            var matchStream = new MatchStream({ pattern: descriptorSig }, function (buf, matched, extra) {
              if (hasEntryListener) {
                if (!matched) {
                  return this.push(buf);
                }
                this.push(buf);
              }
              setImmediate(function() {
                self._pullStream.unpipe();
                self._pullStream.prepend(extra);
                self._processDataDescriptor(entry);
              });
              return this.push(null);
            });

            self._pullStream.pipe(matchStream);
            if (hasEntryListener) {
              matchStream.pipe(inflater).pipe(entry);
            }
          }
        }
      });
    });
  });
};

Parse.prototype._processDataDescriptor = function (entry) {
  var self = this;
  this._pullStream.pull(16, function (err, data) {
    if (err) {
      return self.emit('error', err);
    }

    var vars = binary.parse(data)
      .word32lu('dataDescriptorSignature')
      .word32lu('crc32')
      .word32lu('compressedSize')
      .word32lu('uncompressedSize')
      .vars;

    entry.size = vars.uncompressedSize;
    self._readRecord();
  });
};

Parse.prototype._readCentralDirectoryFileHeader = function () {
  var self = this;
  this._pullStream.pull(42, function (err, data) {
    if (err) {
      return self.emit('error', err);
    }

    var vars = binary.parse(data)
      .word16lu('versionMadeBy')
      .word16lu('versionsNeededToExtract')
      .word16lu('flags')
      .word16lu('compressionMethod')
      .word16lu('lastModifiedTime')
      .word16lu('lastModifiedDate')
      .word32lu('crc32')
      .word32lu('compressedSize')
      .word32lu('uncompressedSize')
      .word16lu('fileNameLength')
      .word16lu('extraFieldLength')
      .word16lu('fileCommentLength')
      .word16lu('diskNumber')
      .word16lu('internalFileAttributes')
      .word32lu('externalFileAttributes')
      .word32lu('offsetToLocalFileHeader')
      .vars;

    return self._pullStream.pull(vars.fileNameLength, function (err, fileName) {
      if (err) {
        return self.emit('error', err);
      }
      fileName = fileName.toString('utf8');

      self._pullStream.pull(vars.extraFieldLength, function (err, extraField) {
        if (err) {
          return self.emit('error', err);
        }
        self._pullStream.pull(vars.fileCommentLength, function (err, fileComment) {
          if (err) {
            return self.emit('error', err);
          }
          return self._readRecord();
        });
      });
    });
  });
};

Parse.prototype._readEndOfCentralDirectoryRecord = function () {
  var self = this;
  this._pullStream.pull(18, function (err, data) {
    if (err) {
      return self.emit('error', err);
    }

    var vars = binary.parse(data)
      .word16lu('diskNumber')
      .word16lu('diskStart')
      .word16lu('numberOfRecordsOnDisk')
      .word16lu('numberOfRecords')
      .word32lu('sizeOfCentralDirectory')
      .word32lu('offsetToStartOfCentralDirectory')
      .word16lu('commentLength')
      .vars;

    if (vars.commentLength) {
      process.nextTick(function() {
        self._pullStream.pull(vars.commentLength, function (err, comment) {
          if (err) {
            return self.emit('error', err);
          }
          comment = comment.toString('utf8');
          return self._pullStream.end();
        });
      });

    } else {
      self._pullStream.end();
    }
  });
};

Parse.prototype._transform = function (chunk, encoding, callback) {
  if (this._pullStream.write(chunk)) {
    return callback();
  }

  this._pullStream.once('drain', callback);
};

Parse.prototype.pipe = function (dest, opts) {
  var self = this;
  if (typeof dest.add === "function") {
    self.on("entry", function (entry) {
      dest.add(entry);
    })
  }
  return Transform.prototype.pipe.apply(this, arguments);
};

Parse.prototype._flush = function (callback) {
  if (!this._streamEnd || !this._streamFinish) {
    return setImmediate(this._flush.bind(this, callback));
  }

  this.emit('close');
  return callback();
};

Parse.prototype.addListener = function(type, listener) {
  if ('entry' === type) {
    this._hasEntryListener = true;
  }
  return Transform.prototype.addListener.call(this, type, listener);
};

Parse.prototype.on = Parse.prototype.addListener;
