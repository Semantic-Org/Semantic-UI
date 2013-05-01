var common = require('../common');
if (!common.deployKey) {
  console.error('Skipping: Needs deployKey from test/config.js.');
  return;
}

var Airbrake = require(common.dir.root);
var airbrake = Airbrake.createClient(common.deployKey);
var sinon = require('sinon');
var assert = require('assert');

var spy = sinon.spy();
airbrake.trackDeployment({
  repo: Airbrake.PACKAGE.repository.url,
  rev: '98103a8fa850d5eaf3666e419d8a0a93e535b1b2',
}, spy);

process.on('exit', function() {
  assert.strictEqual(spy.args[0][0], null);
  assert.deepEqual(Object.keys(spy.args[0][1]), [
    'key',
    'env',
    'user',
    'rev',
    'repo',
  ]);
});
