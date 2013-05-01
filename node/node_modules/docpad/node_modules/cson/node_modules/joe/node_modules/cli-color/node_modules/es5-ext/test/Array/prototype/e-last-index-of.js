'use strict';

module.exports = function (t, a) {
	var x = {};
	a(t.call([3, 'raz', {}, x, {}, x], x), 5, "Regular");
	a(t.call([3, 'raz', NaN, {}, x], NaN), 2, "NaN");
	a(t.call([3, 'raz', 0, {}, -0], -0), 4, "-0");
	a(t.call([3, 'raz', -0, {}, 0], +0), 4, "+0");
	a(t.call([3, 'raz', NaN, {}, NaN], NaN, 3), 2, "fromIndex");
};
