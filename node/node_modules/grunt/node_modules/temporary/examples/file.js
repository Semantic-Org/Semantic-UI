/**
 * Temporary - The lord of tmp.
 * 
 * Author: Veselin Todorov <hi@vesln.com>
 * Licensed under the MIT License.
 */

var Tempfile = require('../lib/file');
var file = new Tempfile('foo') // name - optional

console.log(file.path); // file path.

/**
 * You can also use:
 * 
 * file.readFile
 * file.readFileSync
 * file.writeFile
 * file.writeFileSync
 * file.open
 * file.openSync
 * file.close
 * file.closeSync
 * file.unlink
 * file.unlinkSync
 */