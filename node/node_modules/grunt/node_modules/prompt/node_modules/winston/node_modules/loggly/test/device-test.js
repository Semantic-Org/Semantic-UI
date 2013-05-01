/*
 * device-test.js: Tests for Loggly device requests
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENSE
 *
 */
 
var path = require('path'),
    vows = require('vows'),
    assert = require('assert'),
    helpers = require('./helpers');

var options = {},
    config = helpers.loadConfig(),
    loggly = require('../lib/loggly').createClient(config);

vows.describe('node-loggly/devices').addBatch({
  "When using the node-loggly client": {
    "the getDevices() method": {
      topic: function () {
        loggly.getDevices(this.callback);
      },
      "should return a list of valid devices": function (err, devices) {
        assert.isNull(err);
        devices.forEach(function (device) {
          helpers.assertDevice(device);
        });
      }
    },
    "the addDeviceToInput() method": {
      topic: function () {
        loggly.addDeviceToInput(config.inputs.test.id, '127.0.0.1', this.callback);
      },
      "should respond with 200 status code": function (err, res) {
        assert.isNull(err);
        assert.equal(res.statusCode, 200);
      }
    }
  }
}).export(module);