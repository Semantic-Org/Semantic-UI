'use strict';

module.exports = function (t, a) {
	a.deep(t({ a: 'd', b: 'e', c: 'f' }).sort(), ['d', 'e', 'f']);
};
