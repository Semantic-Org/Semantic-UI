'use strict';

module.exports = function (t, a) {
	var x = {}, y = {}, r;

	r = t({ foo: 'bar', x: x, raz: 'dwa', y: y  },
		{ foo: 'bar', x: y, raz: 'trzy', z: x });
	a.deep(r[0], ['y'], "Only in scope");
	a.deep(r[1], ['x', 'raz'], "Changed");
	a.deep(r[2], ['z'], "Only in other");

	r = t({ foo: 'bar', x: x, raz: 'dwa' }, {});
	a.deep(r[0], ['foo', 'x', 'raz'], "Other empty: Only in scope");
	a.deep(r[1], [], "Other empty: Changed");
	a.deep(r[2], [], "Other empty: Only in other");

	r = t({}, { foo: 'bar', x: x, raz: 'dwa' });
	a.deep(r[0], [], "Other empty: Only in scope");
	a.deep(r[1], [], "Other empty: Changed");
	a.deep(r[2], ['foo', 'x', 'raz'], "Other empty: Only in other");
};
