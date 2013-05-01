'use strict';

var ois      = require('../../Object/is')
  , value    = require('../../Object/valid-value')
  , toArray  = require('../from')
  , byLength = require('./_compare-by-length')

  , every = Array.prototype.every;

module.exports = function (/*…lists*/) {
	var lists, r, l;

	lists = [this].concat(toArray(arguments));
	lists.forEach(value);
	lists.sort(byLength);
	l = r = (lists[0].length >>> 0);

	every.call(lists.slice(1), function (list) {
		var i;
		for (i = 0; i < l; ++i) {
			if (i > r) {
				break;
			} else if (!ois(this[i], list[i])) {
				r = i;
				break;
			}
		}
		return r;
	}, lists[0]);

	return r;
};
