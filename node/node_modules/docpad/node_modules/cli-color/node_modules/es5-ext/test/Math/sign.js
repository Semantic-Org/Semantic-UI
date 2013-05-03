'use strict';

var is = require('../../lib/Object/is');

module.exports = function (t, a) {
	a(is(t(0), +0), true, "+0");
	a(is(t(-0), -0), true, "-0");
	a(is(t({}), NaN), true, "NaN");
	a(t(-234234234), -1, "Negative");
	a(t(234234234), 1, "Positive");
};
