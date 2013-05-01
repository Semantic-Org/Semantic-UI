'use strict';

module.exports = function (t, a) {
	a(typeof t.statistics, 'object', "Access to statistics");
	a(typeof t.log, 'function', "Access to log function");
	a(typeof t.log(), 'string', "Log outputs string");
};
