'use strict';

var floorMonth = require('./floor-month');

module.exports = function () {
	floorMonth.call(this);
	this.setMonth(0);
	return this;
};
