'use strict';

var memoize  = require('../../lib');

module.exports = function () {
	return {
		"No descriptor": function (a) {
			var mfn, x = {}, i = 0, fn = function () {
				++i;
				return this;
			};

			mfn = memoize(fn, { method: 'foo' });
			a(mfn.call(x), x, "Context");
			a(x.foo(), x, "Method");
			a(i, 1, "Cached");
		},
		"Descriptor": function (a) {
			var mfn, x = {}, i = 0, fn = function () {
				++i;
				return this;
			};

			mfn = memoize(fn,
				{ method: { name: 'foo', descriptor: { configurable: true } } });
			a(mfn.call(x), x, "Context");
			a.deep(Object.getOwnPropertyDescriptor(x, 'foo'),
				{ enumerable: false, configurable: true, writable: false,
					value: x.foo });
			a(x.foo(), x, "Method");
			a(i, 1, "Cached");
		}
	};
};
