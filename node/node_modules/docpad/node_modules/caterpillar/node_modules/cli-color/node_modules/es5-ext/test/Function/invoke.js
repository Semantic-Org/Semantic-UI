'use strict';

var k  = require('../../lib/Function/k')

  , o = { b: k('c') };

module.exports = function (t, a) {
	a(t('b')(o), 'c');
};
