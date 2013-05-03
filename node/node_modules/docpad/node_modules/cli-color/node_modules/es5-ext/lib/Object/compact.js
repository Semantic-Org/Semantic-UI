'use strict';

var filter = require('./filter');

module.exports = function (obj) { return filter(obj, Boolean); };
