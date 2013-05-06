var StreamReader = function() {
  this._queue  = [];
  this._cursor = 0;
};

StreamReader.prototype.read = function(bytes) {
  return this._readBuffer(bytes);
};

StreamReader.prototype.put = function(buffer) {
  if (!buffer || buffer.length === 0) return;
  if (!buffer.copy) buffer = new Buffer(buffer);
  this._queue.push(buffer);
};

StreamReader.prototype._readBuffer = function(length) {
  var buffer = new Buffer(length),
      queue  = this._queue,
      remain = length,
      n      = queue.length,
      i      = 0,
      chunk, offset, size;

  if (remain === 0) return buffer;

  while (remain > 0 && i < n) {
    chunk = queue[i];
    offset = (i === 0) ? this._cursor : 0;
    size = Math.min(remain, chunk.length - offset);
    chunk.copy(buffer, length - remain, offset, offset + size);
    remain -= size;
    i += 1;
  }

  if (remain > 0) return null;

  queue.splice(0, i-1);
  this._cursor = (i === 1 ? this._cursor : 0) + size;

  return buffer;
};

module.exports = StreamReader;
