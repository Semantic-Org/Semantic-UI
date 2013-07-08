var Promise = require('promise');
var fs = require('fs');
var path = require('path');
var normalize = path.normalize;


Promise.prototype.nodeify = function (cb) {
  if (typeof cb === 'function') {
    this.then(function (res) { process.nextTick(function () { cb(null, res); }); },
              function (err) { process.nextTick(function () { cb(err); }); });
    return undefined;
  } else {
    return this;
  }
}

var minifiers = {};

module.exports = Transformer;
function Transformer(obj) {
  this.name = obj.name;
  this.engines = obj.engines;
  this.isBinary = obj.isBinary || false;
  this.isMinifier = obj.isMinifier || false;
  this.outputFormat = obj.outputFormat;
  this._cache = {};
  if (typeof obj.async === 'function') {
    this._renderAsync = obj.async;
    this.sudoSync = obj.sudoSync || false;
  }
  if (typeof obj.sync === 'function') {
    this._renderSync = obj.sync;
    this.sync = true;
  } else {
    this.sync = obj.sudoSync || false;
  }

  if (this.isMinifier)
    minifiers[this.outputFormat] = this;
  else {
    var minifier = minifiers[this.outputFormat];
    if (minifier) {
      this.minify = function(str, options) {
        if (options && options.minify)
          return minifier.renderSync(str, typeof options.minify === 'object' && options.minify || {});
        return str;
      }
    }
  }
}

Transformer.prototype.cache = function (options, data) {
  if (options.cache && options.filename) {
    if (data) return this.cache[options.filename] = data;
    else return this.cache[options.filename];
  } else {
    return data;
  }
};
Transformer.prototype.loadModule = function () {
  if (this.engine) return this.engine;
  for (var i = 0; i < this.engines.length; i++) {
    try {
      var res = this.engines[i] === '.' ? null : (this.engine = require(this.engines[i]));
      this.engineName = this.engines[i];
      return res;
    } catch (ex) {
      if (this.engines.length === 1) {
        throw ex;
      }
    }
  }
  throw new Error('In order to apply the transform ' + this.name + ' you must install one of ' + this.engines.map(function (e) { return '"' + e + '"'; }).join());
};
Transformer.prototype.minify = function(str, options) {
  return str;
}
Transformer.prototype.renderSync = function (str, options) {
  options = options || {};
  options = clone(options);
  this.loadModule();
  if (this._renderSync) {
    return this.minify(this._renderSync((this.isBinary ? str : fixString(str)), options), options);
  } else if (this.sudoSync) {
    options.sudoSync = true;
    var res, err;
    this._renderAsync((this.isBinary ? str : fixString(str)), options, function (e, val) {
      if (e) err = e;
      else res = val;
    });
    if (err) throw err;
    else if (res != undefined) return this.minify(res, options);
    else if (typeof this.sudoSync === 'string') throw new Error(this.sudoSync.replace(/FILENAME/g, options.filename || ''));
    else throw new Error('There was a problem transforming ' + (options.filename || '') + ' syncronously using ' + this.name);
  } else {
    throw new Error(this.name + ' does not support transforming syncronously.');
  }
};
Transformer.prototype.render = function (str, options, cb) {
  options = options || {};
  var self = this;
  return new Promise(function (resolve, reject) {
    self.loadModule();
    if (self._renderAsync) {
      self._renderAsync((self.isBinary ? str : fixString(str)), clone(options), function (err, val) {
        if (err) reject(err);
        else resolve(self.minify(val, options));
      })
    } else {
      resolve(self.renderSync(str, options));
    }
  })
  .nodeify(cb);
};
Transformer.prototype.renderFile = function (path, options, cb) {
  options = options || {};
  var self = this;
  return new Promise(function (resolve, reject) {
    options.filename = (path = normalize(path));
    if (self._cache[path])
      resolve(null);
    else
      fs.readFile(path, function (err, data) {
        if (err) reject(err);
        else resolve(data);
      })
  })
  .then(function (str) {
    return self.render(str, options);
  })
  .nodeify(cb);
};
Transformer.prototype.renderFileSync = function (path, options) {
  options = options || {};
  options.filename = (path = normalize(path));
  return this.renderSync((this._cache[path] ? null : fs.readFileSync(path)), options);
};
function fixString(str) {
  if (str == null) return str;
  //convert buffer to string
  str = str.toString();
  // Strip UTF-8 BOM if it exists
  str = (0xFEFF == str.charCodeAt(0) 
    ? str.substring(1)
    : str);
  //remove `\r` added by windows
  return str.replace(/\r/g, '');
}

function clone(obj) {
  if (Array.isArray(obj)) {
    return obj.map(clone);
  } else if (obj && typeof obj === 'object') {
    var res = {};
    for (var key in obj) {
      res[key] = clone(obj[key]);
    }
    return res;
  } else {
    return obj;
  }
}
