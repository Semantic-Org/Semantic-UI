'use strict';

module.exports = function (t, a) {
	var x, y;

	a(t(null, null), true, "null vs null");
	a(t({}, null), false, "Object vs null");
	a(t(undefined, null), false, "Undefined vs null");

	a(t({ 1: 1, 2: 2, 3: 3 }, { 1: 1, 2: 2, 3: 3 }), true, "Same");
	a(t({ 1: 1, 2: 2, 3: 3 }, { 1: 1, 2: 2, 3: 4 }), false,
		"Different property value");
	a(t({ 1: 1, 2: 2, 3: 3 }, { 1: 1, 2: 2 }), false,
		"Property only in source");
	a(t({ 1: 1, 2: 2 }, { 1: 1, 2: 2, 3: 4 }), false,
		"Property only in target");

	a(t("raz", "dwa"), false, "String: diff");
	a(t("raz", "raz"), true, "String: same");
	a(t("32", 32), false, "String & Number");
	a(t("raz", new String("raz")), false, "String & String object");

	a(t([1, 'raz', true], [1, 'raz', true]), true, "Array: same");
	a(t([1, 'raz', undefined], [1, 'raz']), false, "Array: diff");

	x = { foo: { bar: { mar: {} } } };
	y = { foo: { bar: { mar: {} } } };
	a(t(x, y, Infinity), true, "Object: deep");
	a(t(x, y, 3), true, "Object: deep limited");
	a(t(x, y, 2), false, "Object: deep shallow");

	a(t({ foo: { bar: { mar: 'foo' } } }, { foo: { bar: { mar: {} } } },
		Infinity), false, "Object: deep");

	x = { foo: { bar: { mar: {} } } };
	x.rec = { foo: x };

	y = { foo: { bar: { mar: {} } } };
	y.rec = { foo: x };

	a(t(x, y, Infinity), true,
		"Object: Infinite Recursion: Same #1");

	x.rec.foo = y;
	a(t(x, y, Infinity), true,
		"Object: Infinite Recursion: Same #2");

	x.rec.foo = x;
	y.rec.foo = y;
	a(t(x, y, Infinity), true,
		"Object: Infinite Recursion: Same #3");

	y.foo.bar.mar = 'raz';
	a(t(x, y, Infinity), false,
		"Object: Infinite Recursion: Diff");

	a(t(function () { return 'raz'; }, function () { return 'raz'; }), true,
		"Function: same");
	a(t(function () { return 'raz'; }, function () { return 'dwa'; }), false,
		"Function: diff");

	a(t(/raz/, /raz/), true, "Regexp: same");
	a(t(/raz/, /dwa/), false, "Regexp: diff");
};
