/*
 * input-test.js: Tests for Loggly input requests
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
    testContext = {},
    config = helpers.loadConfig(),
    loggly = require('../lib/loggly').createClient(config),
    logglyJSON = require('../lib/loggly').createClient(config);

logglyJSON.config.json = true;

vows.describe('node-loggly/inputs').addBatch({
  "When using the node-loggly client": {
    "the getInputs() method": {
      topic: function () {
        loggly.getInputs(this.callback);
      },
      "should return a list of valid inputs": function (err, inputs) {
        assert.isNull(err);
        inputs.forEach(function (input) {
          helpers.assertInput(input);
        });
      }
    },
    "the getInput method": {
      "when called with a plaintext input": {
        topic: function () {
          loggly.getInput('test', this.callback);
        },
        "should return a valid input": function (err, input) {
          assert.isNull(err);
          helpers.assertInput(input);
        },
        "of the format 'text'": function (err, input) {
          assert.isNull(err);
          assert.equal(input.format, 'text');
        },
        "that matches the first input in the test configuration": function (err, input) {
          assert.equal(config.inputs.test.token,input.input_token);
          assert.equal(config.inputs.test.id,input.id);
          testContext.input = input;
        }
      },
      "when called with a json input": {
        topic: function () {
          logglyJSON.getInput('test_json', this.callback);
        },
        "should return a valid input": function (err, input) {
          assert.isNull(err);
          helpers.assertInput(input);
        },
        "of the format 'json'": function (err, input) {
          assert.isNull(err);
          assert.equal(input.format, 'json');
        },
        "that matches the second input in the test configuration": function (err, input) {
          assert.equal(config.inputs.test_json.token,input.input_token);
          assert.equal(config.inputs.test_json.id,input.id);
          testContext.inputJSON = input;
        }
      }
    }
  }
}).addBatch({
  "When using the node-loggly client": {
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
}).addBatch({
  "When using an instance of an input": {
    "the log() method of the 'text' instance": {
      "when passed a callback": {
        topic: function () {
          testContext.input.log('this is a test logging message from /test/input-test.js', this.callback);
        },
        "should log messages to loggly": function (err, result) {
          assert.isNull(err);
          assert.isObject(result);
          assert.equal(result.response, 'ok');
        }
      },
      "when not passed a callback": {
        topic: function () {
          var emitter = testContext.input.log('this is a test logging message from /test/input-test.js');
          emitter.on('log', this.callback.bind(null, null));
        },
        "should log messages to loggly": function (err, result) {
          assert.isNull(err);
          assert.isObject(result);
          assert.equal(result.response, 'ok');
        }
      }
    },
    "the log() method of the 'json' instance": {
      "when passed a callback": {
        topic: function () {
          testContext.inputJSON.log(
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
          var emitter = testContext.inputJSON.log({
              timestamp: new Date().getTime(),
              message: 'this is a test logging message from /test/input-test.js'
          });
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
}).export(module);