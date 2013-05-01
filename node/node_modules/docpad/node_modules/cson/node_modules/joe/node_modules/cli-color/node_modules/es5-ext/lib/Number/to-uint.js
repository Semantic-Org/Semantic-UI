'use strict';

var toInt = require('./to-int')

  , max = Math.max;

module.exports = function (value) { return max(0, toInt(value)); };
