var common = require('../common');

require('long-stack-traces');
var assert = common.assert;
var stackTrace = require(common.dir.lib + '/stack-trace');

function badFn() {
  var err = new Error('oh no');
  var trace = stackTrace.parse(err);

  assert.ok(trace[2].getFileName().match(/-----/));
};

setTimeout(badFn, 10);
