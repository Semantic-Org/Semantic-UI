/*
 * helpers.js: Test helpers for node-loggly
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var fs = require('fs'),
    util = require('util'),
    path = require('path'),
    vows = require('vows'),
    assert = require('assert'),
    loggly = require('../lib/loggly');

var helpers = exports;

helpers.validConfig = function (config) {
  return config
      && config.subdomain !== 'test-subdomain'
      && config.auth
      && config.auth.username !== 'test-username'
      && config.auth.password !== 'test-password'
      && config.inputs
      && config.inputs.test
      && config.inputs.test_json;
};

helpers.loadConfig = function () {
  try {
    var configFile = path.join(__dirname, 'data', 'test-config.json'),
        stats = fs.statSync(configFile)
        config = JSON.parse(fs.readFileSync(configFile).toString());
    
    if (!helpers.validConfig(config)) {
      util.puts('Config file test-config.json must be updated with valid data before running tests');
      process.exit(0);
    }

    helpers.config = config || {}
    return config || {};
  }
  catch (ex) {
    util.puts('Error parsing test-config.json');
    ex.stack.split('\n').forEach(function (line) {
      console.log(line);
    });
    
    process.exit(0);
  }
};

helpers.assertInput = function (input) {
  assert.instanceOf(input, loggly.Input);
  assert.isNotNull(input.id);
  assert.isNotNull(input.name);
  assert.isNotNull(input.service);
  assert.isNotNull(input.create);
  assert.isNotNull(input.discover);
  assert.isNotNull(input.discoverTime);
  assert.isNotNull(input.description);
};

helpers.assertDevice = function (device) {
  assert.instanceOf(device, loggly.Device);
  assert.isNotNull(device.id);
  assert.isNotNull(device.input);
  assert.isNotNull(device.ipAddress);
  assert.isNotNull(device.launched);
  assert.isNotNull(device.resourceUri);
};

helpers.assertSearch = function (err, results) {
  assert.isNull(err);
  assert.isObject(results);
  assert.isTrue(typeof results.data !== 'undefined');
  assert.isTrue(typeof results.numFound !== 'undefined');
  assert.isTrue(typeof results.context !== 'undefined');
};
