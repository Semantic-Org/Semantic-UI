'use strict';

module.exports = function (t, a) {
	var e = new Error('Error'), x = {}, f1 = function (y) { return y; }
	  , f2 = function () { throw e; };

	a(t.call(f1)(x), x);
	a(t.call(f2)(), e, "Thrown");
};
