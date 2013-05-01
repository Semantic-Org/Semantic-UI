/*
 * couchdb-test.js: Tests for instances of the Couchdb transport
 *
 * (C) 2011 Max Ogden
 * MIT LICENSE
 *
 */

var path = require('path'),
    vows = require('vows'),
    fs = require('fs'),
    http = require('http'),
    assert = require('assert'),
    winston = require('../../lib/winston'),
    helpers = require('../helpers');

var couchdbTransport = new (winston.transports.Couchdb)({ 
  "host": "localhost",
  "port": 4567,
  "db": "logs"
});

var server = http.createServer(function (req, res) {
  res.end();
});

server.listen(4567);

vows.describe('winston/transports/couchdb').addBatch({
  "An instance of the Couchdb Transport": {
    "when passed valid options": {
      "should have the proper methods defined": function () {
        helpers.assertCouchdb(couchdbTransport);
      },
      "the log() method": helpers.testNpmLevels(couchdbTransport, "should respond with true", function (ign, err, logged) {
        assert.isNull(err);
        assert.isTrue(logged);
      })
    }
  }
}).addBatch({
  "When the tests are over": {
    "the server should cleanup": function () {
      server.close();
    }
  }
}).export(module);