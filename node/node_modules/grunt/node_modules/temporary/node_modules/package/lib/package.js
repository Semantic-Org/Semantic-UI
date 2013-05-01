/**
 * package - Easy package.json exports.
 * 
 * Author: Veselin Todorov <hi@vesln.com>
 * Licensed under the MIT License.
 */

/**
 * Dependencies.
 */
var fs = require('fs');
var path = require('path');
var exists = fs.existsSync || path.existsSync;

/**
 * Package.
 * 
 * @param {String|null} location
 * @returns {Object} package.json data
 */
var package = function(location) {
  if (location === Object(location)) {
    location = package.discover(location);
  }
  return package.read(path.normalize(location + '/package.json'));
};

/**
 * Reads and parses a package.json file.
 * 
 * @param {String} file
 * @returns {Object} package.json data
 */
package.read = function(file) {
  var data = fs.readFileSync(file, 'utf8');
  return JSON.parse(data);
};

/**
 * Makes an atempt to find package.json file.
 * 
 * @returns {Object} package.json data
 */
package.discover = function(module) {
  var location = path.dirname(module.filename);
  var found = null;
  
  while (!found) {
    if (exists(location + '/package.json')) {
      found = location;
    } else if (location !== '/') {
      location = path.dirname(location);
    } else {
      throw new Error('package.json can not be located');
    }
  }
  
  return found;
};

/**
 * Exporting the lib.
 */
module.exports = package;
