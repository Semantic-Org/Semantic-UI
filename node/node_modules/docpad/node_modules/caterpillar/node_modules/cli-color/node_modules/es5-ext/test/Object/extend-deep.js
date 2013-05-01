'use strict';

module.exports = function (t, a) {
	var o1, o2;
	o1 = { a: 1, b: 2, c: { d: { e: 42, f: 30 }, g: 40 }, h: { i: 30, j: 40 },
		 k: { m: 30 } };
	o2 = { b: 3, c: { d: { g: 30, e: 15 } }, h: {}, k: null };

	a.deep(t({}, o1, o2), { a: 1, b: 3, c: { d: { g: 30, e: 15, f: 30 }, g: 40 },
		h: { i: 30, j: 40 }, k: null  }, "Multi argument");

	t(o1, o2);
	a.deep(o1, { a: 1, b: 3, c: { d: { g: 30, e: 15, f: 30 }, g: 40 },
		h: { i: 30, j: 40 }, k: null  }, "Single argument");
};
