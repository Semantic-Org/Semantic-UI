/**
 * Temporary - The lord of tmp.
 *
 * Author: Veselin Todorov <hi@vesln.com>
 * Licensed under the MIT License.
 */

/**
 * Dependencies.
 */
var fs = require('fs');
var path = require('path');
var generator = require('./generator');
var detector = require('./detector');

/**
 * Base constructor.
 *
 * @param {String|null} name
 */
function Base(name) {
  this.init(name);
};

/**
 * Initializes the class.
 *
 * @param {String|null} name
 */
Base.prototype.init = function(name) {
  var filename = generator.build(name);
  this.create(filename);
  this.path = filename;
};

/**
 * Converts the arguments object to array and
 * append `this.path` as first element.
 *
 * @returns {Array}
 */
Base.prototype.prepareArgs = function(args) {
  args = Array.prototype.slice.call(args);
  args.unshift(this.path);
  return args;
};

/**
 * Renames the dir/file.
 *
 * @param {String} name
 * @param {Function} cb Callback.
 */
Base.prototype.rename = function(name, cb) {
  var self = this;
  var args = arguments;
  var tmp = path.normalize(path.dirname(self.path) + '/' + name);

  fs.rename(this.path, tmp, function(err) {
    self.path = tmp;
    if (args.length === 2) cb(err);
  });
};

/**
 * Renames the dir/file sync.
 *
 * @param {String} name
 */
Base.prototype.renameSync = function(name) {
  var tmp = path.normalize(path.dirname(this.path) + '/' + name);
  var result = fs.renameSync(this.path, tmp);
  this.path = tmp;
  return result;
};

/**
 * Exporting the lib.
 */
module.exports = Base;
