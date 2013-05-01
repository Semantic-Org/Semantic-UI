var common = require('../common');
var assert = require('assert');


(function testAddingKeyToDevelopmentEnvironments() {
  var airbrake = require(common.dir.root).createClient(common.key, 'dev');
  airbrake.developmentEnvironments.push('dev');
  airbrake.notify(new Error('this should not be posted to airbrake'), function(err, url) {
    assert.equal(err, undefined);
    assert.equal(url, undefined);
  });
})();

(function testDevelopmentEnviroment() {
  var airbrake = require(common.dir.root).createClient(common.key, 'development');
  // this should be posted to airbrake simply because we didn't add 'development' to
  // airbrake.developmentEnvironments. The decision to default to an empty array here
  // was to ensure that the previous expected behavior would continue (in the odd chance
  // someone was expecting airbrake notifications in development).
  airbrake.notify(new Error('this should be posted to airbrake'), function(err, url) {
    assert.equal(err, undefined);
    assert.ok(/^http:\/\//.test(url));
  });
})();


(function testProductionEnviroment() {
  var airbrake = require(common.dir.root).createClient(common.key, 'production');
  airbrake.notify(new Error('this should be posted to airbrake'), function(err, url) {
    assert.equal(err, undefined);
    assert.ok(/^http:\/\//.test(url));
  });
})();