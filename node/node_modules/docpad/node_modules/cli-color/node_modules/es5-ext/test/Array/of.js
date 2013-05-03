'use strict';

module.exports = function (t, a) {
	var x = {};

	a.deep(t(), [], "No arguments");
	a.deep(t(3), [3], "One numeric argument");
	a.deep(t(3, 'raz', null, x, undefined), [3, 'raz', null, x, undefined],
		"Many arguments");
};
