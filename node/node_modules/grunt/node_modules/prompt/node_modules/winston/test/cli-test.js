/*
 * cli-test.js: Tests for the cli levels available in winston.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENSE
 *
 */

var path = require('path'),
    vows = require('vows'),
    assert = require('assert'),
    winston = require('../lib/winston'),
    helpers = require('./helpers');

vows.describe('winston/logger/cli').addBatch({
  "When an instance of winston.Logger": {
    topic: function () {
      return new winston.Logger({
        transports: [
          new winston.transports.Console()
        ]
      })
    },
    "the cli() method": {
      "should set the appropriate values on the logger": function (logger) {
        logger.cli();
        assert.isTrue(logger.padLevels);
        assert.isTrue(logger.transports.console.colorize);
        assert.isFalse(logger.transports.console.timestamp);
        Object.keys(winston.config.cli.levels).forEach(function (level) {
          assert.isNumber(logger.levels[level]);
        });
        
        Object.keys(winston.config.cli.colors).forEach(function (color) {
          assert.isString(winston.config.allColors[color]);
        });
      }
    }
  }
}).export(module);