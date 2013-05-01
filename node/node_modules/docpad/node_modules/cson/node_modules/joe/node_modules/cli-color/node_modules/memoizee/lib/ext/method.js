// Memoized methods factory

'use strict';

var global   = require('es5-ext/lib/global')
  , extend   = require('es5-ext/lib/Object/extend')
  , isString = require('es5-ext/lib/String/is-string')

  , create = Object.create, defineProperty = Object.defineProperty;

require('../_base').ext.method = function (method, conf, options) {
	if (isString(options.method)) {
		method = { name: String(options.method),
			descriptor: { configurable: true, writable: true } };
	} else {
		method = options.method;
		method.name = String(method.name);
		method.descriptor = (method.descriptor == null) ?
				{ configurable: true, writable: true } : Object(method.descriptor);
	}
	options = create(options);
	options.method = undefined;

	(function (fn) {
		conf.memoized = function () {
			if (this && (this !== global)) {
				method.descriptor.value = conf.memoize(conf.fn.bind(this), options);
				defineProperty(this, method.name, method.descriptor);
				return method.descriptor.value.apply(this, arguments);
			}
			return fn.apply(this, arguments);
		};
		extend(conf.memoized, fn);
	}(conf.memoized));
};
