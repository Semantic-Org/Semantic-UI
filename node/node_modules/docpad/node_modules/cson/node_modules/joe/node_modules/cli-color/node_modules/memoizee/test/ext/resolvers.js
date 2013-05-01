'use strict';

var toArray = require('es5-ext/lib/Array/from')
  , memoize = require('../../lib');

module.exports = function (a) {
	return {
		"Original arguments": function (a) {
			var fn, mfn, x = {};
			fn = function (x, y) { x = y; return toArray(mfn.args); };
			mfn = memoize(fn, { resolvers: [] });

			a.deep(mfn(23, 'raz', x), [23, 'raz', x]);
		},
		"Resolvers": function () {
			var i = 0, fn, r;
			fn = memoize(function () { ++i; return arguments; },
				 { length: 3, resolvers: [Boolean, String] });
			return {
				"No args": function () {
					i = 0;
					a.deep(toArray(r = fn()), [false, 'undefined'], "First");
					a(fn(), r, "Second");
					a(fn(), r, "Third");
					a(i, 1, "Called once");
				},
				"Some Args": function () {
					var x = {};
					i = 0;
					a.deep(toArray(r = fn(0, 34, x, 45)), [false, '34', x, 45],
						"First");
					a(fn(0, 34, x, 22), r, "Second");
					a(fn(0, 34, x, false), r, "Third");
					a(i, 1, "Called once");
					return {
						"Other": function () {
							a.deep(toArray(r = fn(1, 34, x, 34)),
								[true, '34', x, 34], "Second");
							a(fn(1, 34, x, 89), r, "Third");
							a(i, 2, "Called once");
						}
					};
				}
			};
		}
	};
};
