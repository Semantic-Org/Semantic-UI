/*
 * log-test.js: Tests for vanilla logging with no authentication.
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var path = require('path'),
    vows = require('vows'),
    assert = require('assert'),
    helpers = require('./helpers');

var config = helpers.loadConfig(),
    loggly = require('../lib/loggly').createClient({ subdomain: config.subdomain }),
    logglyJSON = require('../lib/loggly').createClient({ subdomain: config.subdomain, json: true });

vows.describe('node-loggly/inputs (no auth)').addBatch({
  "When using the node-loggly client without authentication": {
    "the log() method": {
      "to a 'text' input": {
        "when passed a callback": {
          topic: function () {
            loggly.log(
              config.inputs.test.token,
              'this is a test logging message from /test/input-test.js',
              this.callback);
          },
          "should log messages to loggly": function (err, result) {
            assert.isNull(err);
            assert.isObject(result);
            assert.equal(result.response, 'ok');
          }
        },
        "when not passed a callback": {
          topic: function () {
            var emitter = loggly.log(config.inputs.test.token, 'this is a test logging message from /test/input-test.js');
            emitter.on('log', this.callback.bind(null, null));
          },
          "should log messages to loggly": function (err, result) {
            assert.isNull(err);
            assert.isObject(result);
            assert.equal(result.response, 'ok');
          }
        }
      },
      "to a 'json' input": {
        "when passed a callback": {
          topic: function () {
            logglyJSON.log(
              config.inputs.test_json.token,
              {
                timestamp: new Date().getTime(),
                message: 'this is a test logging message from /test/input-test.js'
              },
              this.callback);
          },
          "should log messages to loggly": function (err, result) {
            assert.isNull(err);
            assert.isObject(result);
            assert.equal(result.response, 'ok');
          }
        },
        "when not passed a callback": {
          topic: function () {
            var emitter = logglyJSON.log(
              config.inputs.test_json.token,
              {
                timestamp: new Date().getTime(),
                message: 'this is a test logging message from /test/input-test.js'
              }
            );
            emitter.on('log', this.callback.bind(null, null));
          },
          "should log messages to loggly": function (err, result) {
            assert.isNull(err);
            assert.isObject(result);
            assert.equal(result.response, 'ok');
          }
        }
      }
    }
  }
}).export(module);