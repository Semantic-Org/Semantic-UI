'use strict';

module.exports = function (t, a) {
	var o1 = { a: 1, b: 2 }
	  , o2 = { b: 3, c: 4 };

	a.deep(t({}, o1, o2), { a: 1, b: 3, c: 4 }, "Multi argument");

	t(o1, o2);
	a.deep(o1, { a: 1, b: 3, c: 4 }, "Single: content");
};
