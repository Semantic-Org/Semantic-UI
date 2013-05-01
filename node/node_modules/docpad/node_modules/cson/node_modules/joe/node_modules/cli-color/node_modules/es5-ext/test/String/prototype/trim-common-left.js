'use strict';

module.exports = function (t, a) {
	a(t.call('abc', ''), 'abc', "Empty");
	a(t.call('a2c', 'a2c', 'a2ccd'), '', "Whole same");
	a(t.call('abcd', 'abc', 'ab'), 'cd', "Same start");
	a(t.call('abcd', 'bc', 'cd'), 'abcd', "Same part contained");
	a(t.call('abcd', 'xyz'), 'abcd', "Not matched");
};
