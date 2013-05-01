/*
 * time-span-test.js: Tests for the TimeSpan module.
 *
 * (C) Charlie Robbins
 * MIT LICENSE
 *
 */

var vows = require('vows'),
    assert = require('assert'),
    timeSpan = require('../lib/time-span');
    
vows.describe('time-span/date-time').addBatch({
  "When using the TimeSpan module": {
    "the parseDate() method": {
      "when passed a TimeSpan string using ISO8601 with explicit time modifiers": {
        "which do not carry over": {
          "should return the correct value": function () {
            var target = new Date(Date.parse('2010-04-03T10:04:15Z')),
                parsed = timeSpan.parseDate('2010-04-03T12:34:15Z-2HOURS30MINUTES');

            assert.equal(target.toString(), parsed.toString());
          }
        },
        "which carry under": {
          "should return the correct value": function () {
            var target = new Date(Date.parse('2010-03-29T12:34:15Z')),
                parsed = timeSpan.parseDate('2010-04-01T12:34:15Z-72HOURS');

            assert.equal(target.toString(), parsed.toString());
          }
        },
        "which carry under a leap year": {
          "should return the correct value": function () {
            var target = new Date(Date.parse('2007-03-31T12:00:00Z')),
                parsed = timeSpan.parseDate('2010-03-31T12:00:00Z-1096DAYS');

            assert.equal(target.toString(), parsed.toString());
          }
        },
        "which carry over": {
          "should return the correct value": function () {
            var target = new Date(Date.parse('2013-04-03T12:34:15Z')),
                parsed = timeSpan.parseDate('2010-04-03T12:34:15Z+2YEARS365DAYS');

            assert.equal(target.toString(), parsed.toString());
          }
        }
      },
      "when passed a TimeSpan string using NOW with explicit time modifiers": {
        "which do not carry over": {
          "should return the correct value": function () {
            var now = new Date(Date.now()),
                parsed = timeSpan.parseDate('NOW-2HOURS');
            
            now.setHours(now.getHours() - 2 - (now.getTimezoneOffset() / 60));
            assert.equal(now.getHours(), parsed.getHours());
          }
        },
        "which carry under": {
          "should return the correct value": function () {
            var now = new Date(Date.now()),
                parsed = timeSpan.parseDate('NOW-72HOURS');

            now.setHours(now.getHours() - 72 - (now.getTimezoneOffset() / 60));
            assert.equal(now.getHours(), parsed.getHours());
          }
        }
      }
    }
  }
}).export(module);