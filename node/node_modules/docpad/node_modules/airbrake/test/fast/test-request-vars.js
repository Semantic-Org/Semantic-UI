var common = require('../common');
var airbrake = require(common.dir.root).createClient()
var assert = require('assert');
var xmlbuilder = require('xmlbuilder');
var os = require('os');

(function testCgiDataFromProcessEnv() {
  var err = new Error();
  var cgiData = airbrake.cgiDataVars(err);

  assert.equal(cgiData['process.pid'], process.pid);
  assert.equal(cgiData['process.uid'], process.getuid());
  assert.equal(cgiData['process.gid'], process.getgid());
  assert.equal(cgiData['process.cwd'], process.cwd());
  assert.equal(cgiData['process.execPath'], process.execPath);
  assert.equal(cgiData['process.version'], process.version);
  assert.equal(cgiData['process.argv'], process.argv);
  assert.ok(cgiData['process.memoryUsage'].rss);
  assert.equal(cgiData['os.loadavg'].length, 3);
  assert.equal(typeof cgiData['os.uptime'], 'number');
  delete cgiData['process.pid'];
  delete cgiData['process.uid'];
  delete cgiData['process.gid'];
  delete cgiData['process.cwd'];
  delete cgiData['process.execPath'];
  delete cgiData['process.version'];
  delete cgiData['process.memoryUsage'];
  delete cgiData['process.argv'];
  delete cgiData['os.loadavg'];
  delete cgiData['os.uptime'];

  assert.deepEqual(cgiData, process.env);
  assert.notStrictEqual(cgiData, process.env);
})();

(function testCustomErrorProperties() {
  var err = new Error();
  err.myKey = 'some value';

  var cgiData = airbrake.cgiDataVars(err);
  assert.equal(cgiData['err.myKey'], err.myKey);
})();

(function testSessionVars() {
  var err = new Error();
  err.session = {foo: 'bar'};

  var session = airbrake.sessionVars(err);
  assert.deepEqual(session, err.session);
})();

(function testParamsVars() {
  var err = new Error();
  err.params = {foo: 'bar'};

  var params = airbrake.paramsVars(err);
  assert.deepEqual(params, err.params);
})();

(function testCircularVars() {
  var vars = {foo: 'bar', circular: {}};
  vars.circular.self = vars.circular;

  // test that no exception is thrown
  var request = xmlbuilder.create().begin('request');
  airbrake.addRequestVars(request, 'params', vars);
})();

(function testAppendErrorXmlWithBadStack() {
  var notice = xmlbuilder.create().begin('notice');
  var err = new Error('oh oh');

  err.stack += '\n    at Array.0 (native)';
  airbrake.appendErrorXml(notice, err);
})();

(function testEmptyErrorMessageDoesNotProduceInvalidXml() {
  // see: https://github.com/felixge/node-airbrake/issues/15
  var err = new Error();
  var xml = airbrake.notifyXml(err, true);

  assert.ok(!/<\/>/.test(xml));
})();
