/**
 * Temporary - The lord of tmp.
 * 
 * Author: Veselin Todorov <hi@vesln.com>
 * Licensed under the MIT License.
 */

var Tempdir = require('../lib/dir');
var dir = new Tempdir('foo') // name - optional

console.log(dir.path); // path.

/**
 * You can also use:
 * 
 * dir.rmdir
 * dir.rmdirSync
 */