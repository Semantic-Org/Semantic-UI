var common = require('../common');
var airbrake = require(common.dir.root).createClient(common.key);
var assert = require('assert');
var sinon = require('sinon');

var err = new Error('test-notify');
airbrake.handleExceptions();

sinon.spy(airbrake, 'notify');

process.on('exit', function() {
  var exitCode = (airbrake.notify.called)
    ? 0
    : 1;

  process.reallyExit(exitCode);
});

throw err;

