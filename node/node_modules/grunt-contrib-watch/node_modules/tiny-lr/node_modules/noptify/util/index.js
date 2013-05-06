
// Common interface to utility methods, exposing the standard `util` core module
var util = module.exports = require('util');

// and augmenting it
util.extend = require('./extend');
