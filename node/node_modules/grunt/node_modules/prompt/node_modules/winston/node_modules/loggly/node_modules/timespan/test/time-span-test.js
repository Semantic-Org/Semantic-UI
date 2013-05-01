/*
 * time-span-test.js: Tests for the TimeSpan module.
 *
 * (C) Charlie Robbins
 * MIT LICENSE
 *
 */

var vows = require('vows'),
    assert = require('assert'),
    timeSpan = require('../lib/time-span'),
    helpers = require('./helpers');
    
vows.describe('time-span').addBatch({
  "When using the TimeSpan module": {
    "the parse() method": {
      "when passed a TimeSpan string with no days": {
        "should return a valid TimeSpan object": function () {
          var ts = timeSpan.parse("04:03:02.10");
          assert.equal(ts.hours, 4);
          assert.equal(ts.minutes, 3);
          assert.equal(ts.seconds, 2);
          assert.equal(ts.milliseconds, 100);
        }
      },
      "when passed a TimeSpan string with days": {
        "should return a valid TimeSpan object": function () {
          var ts = timeSpan.parse("01:04:03:02.10");
          assert.equal(ts.days, 1);
          assert.equal(ts.hours, 4);
          assert.equal(ts.minutes, 3);
          assert.equal(ts.seconds, 2);
          assert.equal(ts.milliseconds, 100);
        }
      }
    },
    "the test() method": {
      "when passed a TimeSpan string with no days": {
        "should return true": function () {
          assert.isTrue(timeSpan.test("04:03:02.10"));
        }
      },
      "when passed a TimeSpan string with days": {
        "should return true": function () {
          assert.isTrue(timeSpan.test("01:04:03:02.10"));
        }
      },
      "when passed an invalid TimeSpan string": {
        "should return false": function () {
          assert.isFalse(timeSpan.test('xx:00:invalid'));
        }
      }
    },
    "the fromDates() method": {
      "with two Date values": function () {
        var diff = 1000 * 60 * 60 * 12,
            end = new Date(),
            start = new Date(end.getTime() - diff);
            
        assert.equal(12, timeSpan.fromDates(start, end).hours);
      },
      "with two string values": function () {
        assert.equal(2, timeSpan.fromDates('NOW-4DAYS', 'NOW-2DAYS').days);
      }
    },
    "the factory methods": helpers.testFactories(10)
  }
}).export(module);