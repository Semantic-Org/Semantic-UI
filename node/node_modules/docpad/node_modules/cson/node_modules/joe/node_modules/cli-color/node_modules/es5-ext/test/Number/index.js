'use strict';

var forEach   = require('../../lib/Object/for-each')
  , indexTest = require('tad/lib/utils/index-test')

  , path = require('path').resolve(__dirname, '../../lib/Number');

module.exports = function (t, a, d) {
	indexTest.readDir(path)(function (data) {
		var keys = Object.keys(t);
		forEach(data, function (path, name) {
			if (name === 'isNan') {
				name = 'isNaN';
			}
			if (keys.indexOf(name) !== -1) {
				a(t[name], require(path));
			} else {
				a.ok(false, name + " - is present ?");
			}
		});
	}).end(d);
};
