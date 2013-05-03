'use strict';

var value = require('../../Object/valid-value');

module.exports = function () {
	var self = String(value(this)), l = self.length;
	return l ? self[l - 1] : null;
};
