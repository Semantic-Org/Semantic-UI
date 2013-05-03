'use strict';

var diff         = require('../Array/prototype/diff')
  , intersection = require('../Array/prototype/intersection')
  , value        = require('./valid-value')
  , isObject     = require('./is-object')

  , keys = Object.keys;

module.exports = function (obj, target) {
	var k1 = keys(Object(value(obj))), k2 = keys(Object(value(target)));
	return [diff.call(k1, k2), intersection.call(k1, k2).filter(function (key) {
		return (isObject(obj[key]) && isObject(target[key])) ?
				(obj[key].valueOf() !== target[key].valueOf()) :
				(obj[key] !== target[key]);
	}, obj), diff.call(k2, k1)];
};
