/*
 * logger-test.js: Tests for instances of the winston Logger
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

vows.describe('winton/logger').addBatch({
  "An instance of winston.Logger": {
    topic: new (winston.Logger)({ transports: [new (winston.transports.Console)({ level: 'info' })] }), 
    "should have the correct methods / properties defined": function (logger) {
      helpers.assertLogger(logger);
    },
    "the add() with an unsupported transport": {
      "should throw an error": function () {
        assert.throws(function () { logger.add('unsupported') }, Error);
      }
    }
  }
}).addBatch({
  "An instance of winston.Logger with no transports": {
    topic: new (winston.Logger)({ emitErrs: true }),
    "the log() method should throw an error": function (logger) {
      assert.throws(function () { logger.log('anything') }, Error);
    },
    "the extend() method called on an empty object": {
      topic: function (logger) {
        var empty = {};
        logger.extend(empty);
        return empty;
      },
      "should define the appropriate methods": function (extended) {
        ['log', 'profile', 'startTimer'].concat(Object.keys(winston.config.npm.levels)).forEach(function (method) {
          assert.isFunction(extended[method]);
        });
      }
    },
    "the add() method with a supported transport": {
      topic: function (logger) {       
        return logger.add(winston.transports.Console);  
      },
      "should add the console Transport onto transports": function (logger) {
        assert.equal(helpers.size(logger.transports), 1);
        helpers.assertConsole(logger.transports.console);
      },
      "should throw an error when the same Transport is added": function (logger) {
        assert.throws(function () { logger.add(winston.transports.Console) }, Error);
      },
      "the log() method": {
        topic: function (logger) {
          logger.once('logging', this.callback);
          logger.log('info', 'test message');
        },
        "should emit the 'log' event with the appropriate transport": function (transport, ign) {
          helpers.assertConsole(transport);
        }
      },
      "the profile() method": {
        "when passed a callback": {
          topic: function (logger) {
            var that = this;
            logger.profile('test1');
            setTimeout(function () {
              logger.profile('test1', function (err, level, msg, meta) {
                that.callback(err, level, msg, meta, logger);
              });
            }, 1000);
          },
          "should respond with the appropriate profile message": function (err, level, msg, meta, logger) {
            assert.isNull(err);
            assert.equal(level, 'info');
            assert.match(meta.duration, /(\d+)ms/);
            assert.isTrue(typeof logger.profilers['test'] === 'undefined');
          }
        },
        "when not passed a callback": {
          topic: function (logger) {
            var that = this;
            logger.profile('test2');
            logger.once('logging', that.callback.bind(null, null));
            setTimeout(function () {
              logger.profile('test2');
            }, 1000);
          },
          "should respond with the appropriate profile message": function (err, transport, level, msg, meta) {
            assert.isNull(err);
            assert.equal(level, 'info');
            assert.match(meta.duration, /(\d+)ms/);
          }
        }
      },
      "the startTimer() method": {
        "when passed a callback": {
          topic: function (logger) {
            var that = this;
            var timer = logger.startTimer()
            setTimeout(function () {
              timer.done('test', function (err, level, msg, meta) {
                that.callback(err, level, msg, meta, logger);
              });
            }, 1000);
          },
          "should respond with the appropriate message": function (err, level, msg, meta, logger) {
            assert.isNull(err);
            assert.equal(level, 'info');
            assert.match(meta.duration, /(\d+)ms/);
          }
        },
        "when not passed a callback": {
          topic: function (logger) {
            var that = this;
            var timer = logger.startTimer()
            logger.once('logging', that.callback.bind(null, null));
            setTimeout(function () {
              timer.done();
            }, 1000);
          },
          "should respond with the appropriate message": function (err, transport, level, msg, meta) {
            assert.isNull(err);
            assert.equal(level, 'info');
            assert.match(meta.duration, /(\d+)ms/);
            
            var duration = parseInt(meta.duration);
            assert.isNumber(duration);
            assert.isTrue(duration > 900 && duration < 1100);
          }
        }
      },
      "and adding an additional transport": {
        topic: function (logger) {       
          return logger.add(winston.transports.File, { 
            filename: path.join(__dirname, 'fixtures', 'logs', 'testfile2.log') 
          }); 
        },
        "should be able to add multiple transports": function (logger) {
          assert.equal(helpers.size(logger.transports), 2);
          helpers.assertConsole(logger.transports.console);
          helpers.assertFile(logger.transports.file);
        }
      }
    }
  }
}).addBatch({
  "The winston logger": {
    topic: new (winston.Logger)({ 
      transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: path.join(__dirname, 'fixtures', 'logs', 'filelog.log' )})
      ] 
    }),
    "should return have two transports": function (logger) {
      assert.equal(helpers.size(logger.transports), 2);
    },
    "the remove() with an unadded transport": {
      "should throw an Error": function (logger) {
        assert.throws(function () { logger.remove(winston.transports.Loggly) }, Error);
      }
    },
    "the remove() method with an added transport": {
      topic: function (logger) {
         return logger.remove(winston.transports.Console);  
      },
      "should remove the Console transport from transports": function (logger) {
        assert.equal(helpers.size(logger.transports), 1);
        helpers.assertFile(logger.transports.file);
      },
      "and removing an additional transport": {
        topic: function (logger) {
           return logger.remove(winston.transports.File);  
        },
        "should remove File transport from transports": function (logger) {
          assert.equal(helpers.size(logger.transports), 0);
        }
      }
    }
  }
}).addBatch({
  "The winston logger": {
    topic: new (winston.Logger)({
      transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: path.join(__dirname, 'fixtures', 'logs', 'filelog.log' )})
      ]
    }),
    "the clear() method": {
      "should remove all transports": function (logger) {
        logger.clear();
        assert.equal(helpers.size(logger.transports), 0);
      }
    }
  }
}).export(module);
