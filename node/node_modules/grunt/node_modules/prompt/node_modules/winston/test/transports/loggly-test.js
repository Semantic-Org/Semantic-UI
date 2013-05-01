/*
 * loggly-test.js: Tests for instances of the Loggly transport
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENSE
 *
 */

var path = require('path'),
    vows = require('vows'),
    assert = require('assert'),
    winston = require('../../lib/winston'),
    helpers = require('../helpers');

var config = helpers.loadConfig();

if (!config) {
  return;
}

var tokenTransport = new (winston.transports.Loggly)({
      subdomain: config.transports.loggly.subdomain,
      inputToken: config.transports.loggly.inputToken
    }),
    nameTransport = new (winston.transports.Loggly)({ 
      subdomain: config.transports.loggly.subdomain,
      inputName: config.transports.loggly.inputName,
      auth: config.transports.loggly.auth
    });

vows.describe('winston/transports/loggly').addBatch({
  "An instance of the Loggly Transport": {
    "when passed an input token": {
      "should have the proper methods defined": function () {
        helpers.assertLoggly(tokenTransport);
      },
      "the log() method": helpers.testNpmLevels(tokenTransport, "should log messages to loggly", function (ign, err, logged) {
        assert.isNull(err);
        assert.isTrue(logged);
      }),
      "the log() method with no metadata": {
        topic: function () {
        tokenTransport.log('info', 'test-message', null, this.callback.bind(null, null));
        },
        "should respond immediately": function () {
          assert.isTrue(true);
        }
      }
    },
    "when passed an input name": {
      "should have the proper methods defined": function () {
        helpers.assertLoggly(nameTransport);
      },
      "the log() method": helpers.testNpmLevels(nameTransport, "should log messages to loggly", function (ign, err, result) {
        assert.isNull(err);
        assert.isTrue(result === true || result.response === 'ok');
      })
    }
  }
}).export(module);

