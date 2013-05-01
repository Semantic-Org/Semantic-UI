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
var Base = require('./base');

/**
 * Dir constructor.
 *
 * @param {String|null} name
 */
function Dir(name) {
  this.init(name);
};

/**
 * Dir extends from tmp.
 */
Dir.prototype.__proto__ = Base.prototype;

/**
 * Creates new file.
 *
 * @param {String} dirname
 */
Dir.prototype.create = function(dirname) {
  return fs.mkdirSync(path.normalize(dirname), 0777);
};

/**
 * Asynchronous dir.
 */
Dir.prototype.rmdir = function() {
  fs.rmdir.apply(fs, this.prepareArgs(arguments));
};

/**
 * Synchronous rmdir.
 */
Dir.prototype.rmdirSync = function() {
  return fs.rmdirSync.apply(fs, this.prepareArgs(arguments));
};

/**
 * Exporting the lib.
 */
module.exports = Dir;
