//'use strict';

module.exports = Parse.create = Parse;

require("setimmediate");
var Transform = require('stream').Transform;
var inherits = require('util').inherits;
var zlib = require('zlib');
var binary = require('binary');
var Buffers = require('buffers');
var UntilStream = require('./untilstream');
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

  this._untilStream = new UntilStream();
  this._untilStream.on("error", function (e) {
    self.emit('error', e);
  });
  this._untilStream.once("end", function () {
    self._streamEnd = true;
  });
  this._untilStream.once("finish", function () {
    self._streamFinish = true;
  });

  this._readRecord();
}

Parse.prototype._readRecord = function () {
  var self = this;
  this._untilStream.pull(4, function (err, data) {
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
  this._untilStream.pull(26, function (err, data) {
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

    return self._untilStream.pull(vars.fileNameLength, function (err, fileName) {
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

      self.emit('entry', entry);

      self._untilStream.pull(vars.extraFieldLength, function (err, extraField) {
        if (err) {
          return self.emit('error', err);
        }
        if (vars.compressionMethod === 0) {
          self._untilStream.pull(vars.compressedSize, function (err, compressedData) {
            if (err) {
              return self.emit('error', err);
            }

            entry.write(compressedData);
            entry.end();

            return self._readRecord();
          });
        } else {
          var fileSizeKnown = !(vars.flags & 0x08);

          var inflater = zlib.createInflateRaw();
          inflater.on('error', function (err) {
            self.emit('error', err);
          });

          entry.on('finish', self._readRecord.bind(self));

          if (fileSizeKnown) {
            entry.size = vars.uncompressedSize;
            self._untilStream.pipe(vars.compressedSize, inflater).pipe(entry);
          } else {
            var descriptorSig = new Buffer(4);
            descriptorSig.writeUInt32LE(0x08074b50, 0);
            inflater.pipe(entry);

            var prevData = new Buffer(0);
            inflateServiceRequest();

            function inflateServiceRequest() {
              var data = self._untilStream.pullUpTo(1024);
              var bufs = Buffers();
              bufs.push(prevData);
              if (data) {
                bufs.push(data);
              }

              var sigIndex = bufs.indexOf(descriptorSig);
              if (prevData.length && sigIndex <= 0) {
                if (inflater.write(prevData)) {
                  prevData = data;
                  inflateServiceRequest();
                } else {
                  prevData = data;
                  inflater.once('drain', inflateServiceRequest.bind(self));
                }
              } else if (!prevData.length) {
                prevData = data;
                inflateServiceRequest();
              }
              else {
                processDescriptor(bufs, sigIndex);
              }
            }

            function processDescriptor(bufs, sigIndex) {
              if (bufs.length < sigIndex + 16) {
                process.nextTick(function() {
                  self._untilStream.pull(sigIndex + 16 - bufs.length, function(err, data) {
                    if (err) {
                      return self.emit('error', err);
                    }

                    bufs.push(data)
                    processDescriptor(bufs, sigIndex);
                  })
                })
              } else {
                var dataDescriptor = binary.parse(bufs.slice(sigIndex + 4, sigIndex + 16))
                  .word32lu('crc32')
                  .word32lu('compressedSize')
                  .word32lu('uncompressedSize')
                  .vars;

                entry.size = dataDescriptor.uncompressedSize;
                self._untilStream.prepend(bufs.slice(sigIndex + 16, bufs.length));
                inflater.write(bufs.slice(0, sigIndex));
                inflater.end();
              }
            }
          }
        }
      });
    });
  });
};

Parse.prototype._readCentralDirectoryFileHeader = function () {
  var self = this;
  this._untilStream.pull(42, function (err, data) {
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

    return self._untilStream.pull(vars.fileNameLength, function (err, fileName) {
      if (err) {
        return self.emit('error', err);
      }
      fileName = fileName.toString('utf8');

      self._untilStream.pull(vars.extraFieldLength, function (err, extraField) {
        if (err) {
          return self.emit('error', err);
        }
        self._untilStream.pull(vars.fileCommentLength, function (err, fileComment) {
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
  this._untilStream.pull(18, function (err, data) {
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
        self._untilStream.pull(vars.commentLength, function (err, comment) {
          if (err) {
            return self.emit('error', err);
          }
          comment = comment.toString('utf8');
          return self._untilStream.end();
        });
      });

    } else {
      self._untilStream.end();
    }
  });
};

Parse.prototype._transform = function (chunk, outputFn, callback) {
  if (this._untilStream.write(chunk)) {
    return callback();
  }

  this._untilStream.once('drain', callback);
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

Parse.prototype._flush = function (outputFn, callback) {
  if (!this._streamEnd || !this._streamFinish) {
    return setImmediate(this._flush.bind(this, outputFn, callback));
  }

  this.emit('close');
  return callback();
};
