/*
 * container.js: Inversion of control container for winston logger instances
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 *
 */

var common = require('./common'),
    winston = require('../winston');

//
// ### function Container (options)
// #### @options {Object} Default pass-thru options for Loggers
// Constructor function for the Container object responsible for managing
// a set of `winston.Logger` instances based on string ids.
//
var Container = exports.Container = function (options) {
  this.loggers = {};
  this.options = options || {};
  this.default = {
    transports: [
      new winston.transports.Console({
        level: 'silly',
        colorize: false
      })
    ]
  }
};

//
// ### function get / add (id, options)
// #### @id {string} Id of the Logger to get
// #### @options {Object} **Optional** Options for the Logger instance
// Retreives a `winston.Logger` instance for the specified `id`. If
// an instance does not exist, one is created. 
//
Container.prototype.get = Container.prototype.add = function (id, options) {
  if (!this.loggers[id]) {
    options = common.clone(options || this.options || this.default);
    options.transports = options.transports || [];

    if (options.transports.length === 0 && (!options || !options['console'])) {
      options.transports.push(this.default.transports[0]);
    }

    Object.keys(options).forEach(function (key) {
      if (key === 'transports') {
        return;
      }
      
      var name = common.capitalize(key);

      if (!winston.transports[name]) {
        throw new Error('Cannot add unknown transport: ' + name);
      }
      
      var namedOptions = options[key];
      namedOptions.id = id;
      options.transports.push(new (winston.transports[name])(namedOptions));
    });

    this.loggers[id] = new winston.Logger(options);
  }

  return this.loggers[id];
};

//
// ### function close (id)
// #### @id {string} **Optional** Id of the Logger instance to find
// Returns a boolean value indicating if this instance
// has a logger with the specified `id`.
//
Container.prototype.has = function (id) {
  return !!this.loggers[id];
};

//
// ### function close (id)
// #### @id {string} **Optional** Id of the Logger instance to close
// Closes a `Logger` instance with the specified `id` if it exists. 
// If no `id` is supplied then all Loggers are closed.
//
Container.prototype.close = function (id) {
  var self = this;
  
  function _close (id) {
    if (!self.loggers[id]) {
      return;
    }

    self.loggers[id].close();
    delete self.loggers[id];
  }
  
  return id ? _close(id) : Object.keys(this.loggers).forEach(function (id) {
    _close(id);
  });
};

