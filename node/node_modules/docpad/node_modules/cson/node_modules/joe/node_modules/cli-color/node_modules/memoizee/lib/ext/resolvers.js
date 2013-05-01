// Normalize arguments before passing them to underlying function

'use strict';

var toArray    = require('es5-ext/lib/Array/from')
  , forEach    = require('es5-ext/lib/Object/for-each')
  , callable   = require('es5-ext/lib/Object/valid-callable')

  , slice = Array.prototype.slice

  , resolve;

resolve = function (args) {
	return this.map(function (r, i) {
		return r ? r(args[i]) : args[i];
	}).concat(slice.call(args, this.length));
};

require('../_base').ext.resolvers = function (resolvers, conf) {
	var resolver;

	resolver = toArray(resolvers);
	resolver.forEach(function (r) { (r == null) || callable(r); });
	resolver = resolve.bind(resolver);

	(function (fn) {
		conf.memoized = function () {
			var value;
			conf.memoized.args = arguments;
			value = fn.apply(this, resolver(arguments));
			delete conf.memoized.args;
			return value;
		};
		forEach(fn, function (value, name) {
			conf.memoized[name] = function () {
				return fn[name].apply(this, resolver(arguments));
			};
		});
	}(conf.memoized));
};
