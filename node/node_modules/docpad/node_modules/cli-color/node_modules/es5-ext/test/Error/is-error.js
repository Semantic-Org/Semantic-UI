'use strict';

module.exports = function (t, a) {
	a(t(), false, "Undefined");
	a(t(1), false, "Primitive");
	a(t({}), false, "Objectt");
	a(t({ toString: function () { return '[object Error]'; } }), false,
		"Fake error");
	a(t(new Error()), true, "Error");
};
