var common = exports;

var path = require('path');
var root = path.dirname(__dirname);

common.dir = {
  lib: root + '/lib',
};

common.assert = require('assert');
