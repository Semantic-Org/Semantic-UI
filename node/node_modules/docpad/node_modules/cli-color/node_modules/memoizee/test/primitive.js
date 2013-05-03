'use strict';

module.exports = function (t) {
	return {
		"No args": function (a) {
			var i = 0, fn = function () { ++i; return arguments[0]; }, mfn;
			mfn = t(fn, { primitive: true });
			a(mfn('ble'), 'ble', "#1");
			a(mfn({}), 'ble', "#2");
			a(i, 1, "Called once");
		},
		"One arg": function (a) {
			var i = 0, fn = function (x) { ++i; return x; }, mfn
			  , y = { toString: function () { return 'foo'; } };
			mfn = t(fn, { primitive: true });
			a(mfn(y), y, "#1");
			a(mfn('foo'), y, "#2");
			a(i, 1, "Called once");
		},
		"Many args": function (a) {
			var i = 0, fn = function (x, y, z) { ++i; return x + y + z; }, mfn
			  , y = { toString: function () { return 'foo'; } };
			mfn = t(fn, { primitive: true });
			a(mfn(y, 'bar', 'zeta'), 'foobarzeta', "#1");
			a(mfn('foo', 'bar', 'zeta'), 'foobarzeta', "#2");
			a(i, 1, "Called once");
		},
		"Clear cache": function (a) {
			var i = 0, fn = function (x, y, z) { ++i; return x + y + z; }, mfn
			  , y = { toString: function () { return 'foo'; } };
			mfn = t(fn, { primitive: true });
			a(mfn(y, 'bar', 'zeta'), 'foobarzeta', "#1");
			a(mfn('foo', 'bar', 'zeta'), 'foobarzeta', "#2");
			a(i, 1, "Called once");
			mfn.clear('foo', { toString: function () { return 'bar'; } },
				'zeta');
			a(mfn(y, 'bar', 'zeta'), 'foobarzeta', "#3");
			a(i, 2, "Called twice");
		},
		"Circular": function (a) {
			var i = 0, fn;
			fn = t(function (x) {
				if (++i < 2) fn(x);
			});
			a.throws(function () {
				fn('foo');
			}, 'CIRCULAR_INVOCATION');

			i = 0;
			fn = t(function (x, y) {
				if (++i < 2) fn(x, y);
			});
			a.throws(function () {
				fn('foo', 'bar');
			}, 'CIRCULAR_INVOCATION');
		}
	};
};
