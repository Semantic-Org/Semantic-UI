'use strict';

exports.__generic = function (t, a) {
	a(t.call(this, [{}, {}]), 0);
};

exports[''] = function (t, a) {
	a(t.call('abc', ''), 0, "Empty");
	a(t.call(['a', 2, 'c'], ['a', 2, 'c'], ['a', 2, 'c', 'c', 'd']), 3,
		"Whole same");
	a(t.call('abcd', 'abc', 'ab'), 2, "Same start");
	a(t.call('abcd', 'bc', 'cd'), 0, "Same part contained");
	a(t.call('abcd', 'xyz'), 0, "Not matched");
};
