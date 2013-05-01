/**
 * Temporary - The lord of tmp.
 * 
 * Author: Veselin Todorov <hi@vesln.com>
 * Licensed under the MIT License.
 */

/**
 * Dependencies.
 */
var package = require('package')(module);

/**
 * Version.
 */
module.exports.version = package.version;

/**
 * Exporting the temp file
 */
module.exports.File = require('./file');

/**
 * Exporting the temp directory.
 */
module.exports.Dir = require('./dir');