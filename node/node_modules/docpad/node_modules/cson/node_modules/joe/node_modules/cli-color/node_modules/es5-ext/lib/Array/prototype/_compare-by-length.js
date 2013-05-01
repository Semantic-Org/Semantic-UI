// Used internally to sort array of lists by length

'use strict';

module.exports = function (a, b) {
	return (a.length >>> 0) - (b.length >>> 0);
};
