/*
 * transport.js: Base Transport object for all Winston transports.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 *
 */

var events = require('events'),
    util = require('util'); 

//
// ### function Transport (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Tranport object responsible
// base functionality for all winston transports.
//
var Transport = exports.Transport = function (options) {
  events.EventEmitter.call(this);
  
  options               = options        || {};  
  this.level            = options.level  || 'info';
  this.silent           = options.silent || false;
  this.raw              = options.raw    || false;

  this.handleExceptions = options.handleExceptions || false;
};

//
// Inherit from `events.EventEmitter`.
//
util.inherits(Transport, events.EventEmitter);

//
// ### function logException (msg, meta, callback) 
// #### @msg {string} Message to log
// #### @meta {Object} **Optional** Additional metadata to attach
// #### @callback {function} Continuation to respond to when complete.
// Logs the specified `msg`, `meta` and responds to the callback once the log
// operation is complete to ensure that the event loop will not exit before
// all logging has completed.
//
Transport.prototype.logException = function (msg, meta, callback) {
  var self = this;
  
  function onLogged () {
    self.removeListener('error', onError);
    callback();
  }
  
  function onError () {
    self.removeListener('logged', onLogged);
    callback();
  }
  
  this.once('logged', onLogged);
  this.once('error', onError);  
  this.log('error', msg, meta, function () { });
};