'use strict';

var i    = require('../../../lib/Function/i')
  , noop = require('../../../lib/Function/noop');

module.exports = function (t, a) {
	a(t.call(i)(''), true, "Falsy");
	a(t.call(noop)(), true, "Undefined");
	a(t.call(i)({}), false, "Any object");
	a(t.call(i)(true), false, "True");
};
