'use strict';

module.exports = function (t, a) {
	var called = false, original, x = {}, y = {}, z = {}, w = {}, wrap;

	original = function (s, t) {
		a(this, x, "Context");
		a.deep([s, t], [y, z], "Arguments");
		called = true;
		return w;
	};

	wrap = t.call(original, function (fn, s, t) {
		var r;
		a(this, x, "Wrap: Context");
		a.deep([s, t], [y, z], "Wrap: Arguments");
		a(called, false, "Before");
		r = fn();
		a(called, true, "After");
		return r;
	});

	a(wrap.call(x, y, z), w, "Pass Return");

	a(t.call(function () {
		return z;
	}, function () {
		return x;
	})(), x, "Override return");
};
