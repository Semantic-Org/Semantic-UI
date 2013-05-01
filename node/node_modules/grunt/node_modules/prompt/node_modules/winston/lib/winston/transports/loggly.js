/*
 * loggly.js: Transport for logginh to remote Loggly API
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 *
 */

var events = require('events'),
    loggly = require('loggly'),
    util = require('util'),
    async = require('async'),
    common = require('../common'),
    Transport = require('./transport').Transport; 

//
// ### function Loggly (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Loggly transport object responsible
// for persisting log messages and metadata to Loggly; 'LaaS'.
//
var Loggly = exports.Loggly = function (options) {
  Transport.call(this, options);

  function valid() {
    return options.inputToken
      || options.inputName && options.auth
      || options.inputName && options.inputs && options.inputs[options.inputName]
      || options.id && options.inputs && options.inputs[options.id];
  }

  if (!options.subdomain) {
    throw new Error('Loggly Subdomain is required');
  }
  
  if (!valid()) {
    throw new Error('Target input token or name is required.');
  }  
  
  this.name = 'loggly'; 
  this.logBuffer = [];
  
  this.client = loggly.createClient({
    subdomain: options.subdomain,
    auth: options.auth || null,
    json: options.json || false
  });
  
  if (options.inputToken) {
    this.inputToken = options.inputToken;
    this.ready = true;
  }
  else if (options.inputs && (options.inputs[options.inputName] 
    || options.inputs[options.id])) {
    this.inputToken = options.inputs[options.inputName] || options.inputs[options.id];
    this.ready = true;
  }
  else if (options.inputName) {
    this.ready = false;
    this.inputName = options.inputName;
    
    var self = this;
    this.client.getInput(this.inputName, function (err, input) {
      if (err) {
        throw err;
      }
      
      self.inputToken = input.input_token;
      self.ready = true;
    });
  }
};

//
// Inherit from `winston.Transport`.
//
util.inherits(Loggly, Transport);

//
// Expose the name of this Transport on the prototype
//
Loggly.prototype.name = 'loggly';

//
// ### function log (level, msg, [meta], callback)
// #### @level {string} Level at which to log the message.
// #### @msg {string} Message to log
// #### @meta {Object} **Optional** Additional metadata to attach
// #### @callback {function} Continuation to respond to when complete.
// Core logging method exposed to Winston. Metadata is optional.
//
Loggly.prototype.log = function (level, msg, meta, callback) {
  if (this.silent) {
    return callback(null, true);
  }

  var self = this,
      message = common.clone(meta || {});
      
  message.level = level;
  message.message = msg;
  
  if (!this.ready) {
    //
    // If we haven't gotten the input token yet
    // add this message to the log buffer.
    //
    this.logBuffer.push(message);
  }
  else if (this.ready && this.logBuffer.length > 0) {
    //
    // Otherwise if we have buffered messages
    // add this message to the buffer and flush them.
    //
    this.logBuffer.push(message);
    this.flush();
  }
  else {
    //
    // Otherwise just log the message as normal
    //
    this.client.log(this.inputToken, message, function () {
      self.emit('logged');
    });
  }
  
  callback(null, true);
};

//
// ### function flush ()
// Flushes any buffered messages to the current `stream`
// used by this instance.
//
Loggly.prototype.flush = function () {
  var self = this;
  
  function logMsg (msg, next) {
    self.client.log(self.inputToken, msg, function (err) {
      if (err) {
        self.emit('error', err);
      }
      
      next();
    });
  }
  
  //
  // Initiate calls to loggly for each message in the buffer
  //
  async.forEach(this.logBuffer, logMsg, function () {
    self.emit('logged');
  });
  
  process.nextTick(function () {
    //
    // Then quickly truncate the list
    //
    self.logBuffer.length = 0;
  });
};