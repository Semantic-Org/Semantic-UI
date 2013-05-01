var path = require('path')
  , sys = require('sys');

require.paths.unshift(path.dirname(__dirname)+'/lib');

global.puts = sys.puts;
global.p = function() {sys.error(sys.inspect.apply(null, arguments))};;
global.assert = require('assert');