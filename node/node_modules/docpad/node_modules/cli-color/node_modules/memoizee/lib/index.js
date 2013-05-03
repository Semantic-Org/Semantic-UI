// Provides memoize with all options

'use strict';

var regular   = require('./regular')
  , primitive = require('./primitive')

  , call = Function.prototype.call;

// Order is significant!
require('./ext/dispose');
require('./ext/resolvers');
require('./ext/async');
require('./ext/ref-counter');
require('./ext/method');
require('./ext/max-age');
require('./ext/max');

module.exports = function (fn/* options */) {
	var options = Object(arguments[1]);
	return call.call(options.primitive ? primitive : regular, this, fn, options);
};
