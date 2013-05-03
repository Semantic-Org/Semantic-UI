'use strict';

module.exports = function (t, a) {
	var mfn, m = t(function (conf) {
		conf.get = function () { return 'test'; };
		conf.memoized = function (x, y, z) { return conf.fn(z, y, x); };
		conf.clear = function () {};
		conf.clearAll  = function () {};
	});

	a(typeof m, 'function', "Returns");
	mfn = m(function (x, y, z) { return [x, y, z]; });
	a(typeof mfn, 'function', "Generates");
	a.deep(mfn(3, 7, 11),  [11, 7, 3], "Works");

	a(mfn.memoized, true, "Marked as memoized");
	a(m(mfn), mfn, "Do not memoize memoized");
};
