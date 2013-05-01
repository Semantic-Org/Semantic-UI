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
    loggly = require('../lib/loggly').createClient(config);

vows.describe('node-loggly/search').addBatch({
  "When using the node-loggly client": {
    "the search() method": {
      "when searching without chaining": {
        topic: function () {
          loggly.search('logging message', this.callback);
        },
        "should return a set of valid search results": function (err, results) {
          helpers.assertSearch(err, results);
        }
      },
      "when searching with chaining": {
        topic: function () {
          loggly.search('logging message')
                .meta({ inputname: 'test' })
                .run(this.callback);
        },
        "should return a set of valid search results": function (err, results) {
          helpers.assertSearch(err, results);
        }
      }
    },
    "the facet() method": {
      "when searching by ip": {
        topic: function () {
          loggly.facet('ip', 'test', this.callback);
        },
        "should return a set of valid search results": function (err, results) {
          helpers.assertSearch(err, results);
        }
      },
      "when using chained searches": {
        topic: function () {
          loggly.facet('ip', 'test')
                .context({ from: 'NOW-1MONTH' })
                .run(this.callback);
        },
        "should return a set of valid search results": function (err, results) {
          helpers.assertSearch(err, results);
        }
      }
    },
    "the _checkRange() method": {
      "with invalid options set": {
        "should correct them": function () {
          var search = loggly.search('logging message')
            .context({ from: 'NOW', until: '1DAY' })
            ._checkRange();
                
          assert.equal(search._context.from, 'NOW-24HOURS');
          assert.equal(search._context.until, 'NOW');
        }
      },
      "with valid options set": {
        "should not modify them": function () {
          var search = loggly.search('logging message')
            .context({ from: 'NOW-2MONTHS', until: 'NOW' })
            ._checkRange();
                
          assert.equal(search._context.from, 'NOW-2MONTHS');
          assert.equal(search._context.until, 'NOW');
        }
      }
    }
  }
}).export(module);