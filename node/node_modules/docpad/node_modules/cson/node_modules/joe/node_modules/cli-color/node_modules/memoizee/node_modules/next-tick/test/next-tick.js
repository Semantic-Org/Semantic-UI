'use strict';

module.exports = function (t, a, d) {
	var invoked;
	a(t(function () {
		a(arguments.length, 0, "Arguments");
		invoked = true;
	}), undefined, "Return");
	a(invoked, undefined, "Is not run immediately");
	setTimeout(function () {
		a(invoked, true, "Run in next tick");
		d();
	}, 0);
};
