'use strict';

var i = require('../../../lib/Function/i')

  , map = Array.prototype.map;

module.exports = {
	__generic: function (t, a) {
		a.deep(t.call(this), map.call(this, i));
	},
	"": function (t, a) {
		var x = {}, y = [1, x, 'raz'], r;

		a.deep(r = t.call(y), y, "Matches content");
		a.not(r, y, "Not same object");
	}
};
