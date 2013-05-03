'use strict';

module.exports = {
	__generic: function (t, a) {
		a(t.call(this).length, 3);
	},
	"": function (t, a) {
		var o, x, y, z;
		o = {};
		x = [0, 1, "", null, NaN, o, false, true];
		y = x.slice(0);

		a.not(z = t.call(x), x, "Returns different object");
		if (isNaN(x[4]) && isNaN(y[4])) {
			y[4] = x[4] = 'NaN won\'t equal NaN';
		}
		a.deep(x, y, "Origin not changed");
		a.deep(z, [1, o, true], "Result");
	}
};
