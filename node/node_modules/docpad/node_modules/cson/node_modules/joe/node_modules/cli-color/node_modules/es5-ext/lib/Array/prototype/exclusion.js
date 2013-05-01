'use strict';

var value    = require('../../Object/valid-value')
  , toArray  = require('../from')
  , contains = require('./contains')
  , copy     = require('./copy')
  , byLength = require('./_compare-by-length')

, filter = Array.prototype.filter, push = Array.prototype.push;

module.exports = function (/*…lists*/) {
	var lists, seen, result;
	if (arguments.length) {
		push.apply(lists = [this], arguments);
		lists.forEach(value);
		seen = [];
		result = [];
		lists.sort(byLength).forEach(function (list) {
			result = result.filter(function (item) {
				return !contains.call(list, item);
			}).concat(filter.call(list, function (x) {
				return !contains.call(seen, x);
			}));
			push.apply(seen, toArray(list));
		});
		return result;
	} else {
		return copy.call(this);
	}
};
