'use strict';

if ((typeof process !== 'undefined') && process &&
		(typeof process.nextTick === 'function')) {

	// Node.js
	module.exports = process.nextTick;

} else if (typeof setImmediate === 'function') {

	// W3C Draft
	// https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
	module.exports = function (cb) { setImmediate(cb); };

} else {

	// Wide available standard
	module.exports = function (cb) { setTimeout(cb, 0); };
}
