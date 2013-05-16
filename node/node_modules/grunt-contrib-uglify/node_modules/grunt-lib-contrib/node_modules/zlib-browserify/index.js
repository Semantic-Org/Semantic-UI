const Zlib = module.exports = require('./zlib');

// the least I can do is make error messages for the rest of the node.js/zlib api.
// (thanks, dominictarr)
function error () {
  var m = [].slice.call(arguments).join(' ')
  throw new Error([
    m,
    'we accept pull requests',
    'http://github.com/brianloveswords/zlib-browserify'
    ].join('\n'))
}

;['createGzip'
, 'createGunzip'
, 'createDeflate'
, 'createDeflateRaw'
, 'createInflate'
, 'createInflateRaw'
, 'createUnzip'
, 'Gzip'
, 'Gunzip'
, 'Inflate'
, 'InflateRaw'
, 'Deflate'
, 'DeflateRaw'
, 'Unzip'
, 'inflateRaw'
, 'deflateRaw'].forEach(function (name) {
  Zlib[name] = function () {
    error('sorry,', name, 'is not implemented yet')
  }
});

const _deflate = Zlib.deflate;
const _gzip = Zlib.gzip;

Zlib.deflate = function deflate(stringOrBuffer, callback) {
  return _deflate(Buffer(stringOrBuffer), callback);
};
Zlib.gzip = function gzip(stringOrBuffer, callback) {
  return _gzip(Buffer(stringOrBuffer), callback);
};