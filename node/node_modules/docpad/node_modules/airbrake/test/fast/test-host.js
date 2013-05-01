var common = require('../common');
var airbrake = require(common.dir.root).createClient()
var assert = require('assert');
var sinon = require('sinon');
var os = require('os');
var xmlbuilder = require('xmlbuilder');

(function testDefaultHost() {
  assert.equal(airbrake.host, 'http://' + os.hostname());
})();

(function testPlainHost() {
  var err = new Error('oh no');
  var notice = xmlbuilder.create().begin('notice');

  airbrake.appendRequestXml(notice, err);
  var url = notice.children[0].children[0].children[0].value;
  assert.equal(url, airbrake.host);
})();

(function testPartialErrUrl() {
  var err = new Error('oh no');
  err.url = '/foo';
  var notice = xmlbuilder.create().begin('notice');

  airbrake.appendRequestXml(notice, err);
  var url = notice.children[0].children[0].children[0].value;
  assert.equal(url, airbrake.host + err.url);
})();

(function testAbsoluteErrUrl() {
  var err = new Error('oh no');
  err.url = 'http://example.org/bar';
  var notice = xmlbuilder.create().begin('notice');

  airbrake.appendRequestXml(notice, err);
  var url = notice.children[0].children[0].children[0].value;
  assert.equal(url, err.url);
})();
