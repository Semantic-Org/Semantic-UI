'use strict';

var value    = require('../../Object/valid-value')
  , contains = require('./contains')
  , byLength = require('./_compare-by-length')

  , filter = Array.prototype.filter, push = Array.prototype.push
  , slice = Array.prototype.slice;

module.exports = function (/*…list*/) {
	var lists;
	if (arguments.length) {
		push.apply(lists = [this], arguments);
		lists.forEach(value);
		lists.sort(byLength);
		return lists.reduce(function (a, b) {
			return filter.call(a, function (x) {
				return contains.call(b, x);
			});
		});
	} else {
		return slice.call(this);
	}
};
