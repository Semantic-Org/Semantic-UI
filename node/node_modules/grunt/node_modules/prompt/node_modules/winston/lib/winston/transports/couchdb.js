/*
 * Couchdb.js: Transport for logging to Couchdb
 *
 * (C) 2011 Max Ogden
 * MIT LICENSE
 *
 */

var events = require('events'),
    http = require('http'),
    util = require('util'),
    common = require('../common'),
    Transport = require('./transport').Transport; 

//
// ### function Couchdb (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Console transport object responsible
// for making arbitrary HTTP requests whenever log messages and metadata
// are received.
//
var Couchdb = exports.Couchdb = function (options) {
  Transport.call(this, options);

  this.name   = 'Couchdb'; 
  this.db     = options.db;
  this.user   = options.user;
  this.pass   = options.pass;
  this.host   = options.host   || 'localhost';
  this.port   = options.port   || 5984;

  if (options.auth) {
    //
    // TODO: add http basic auth options for outgoing HTTP requests
    //     
  }
  
  if (options.ssl) {
    //
    //  TODO: add ssl support for outgoing HTTP requests
    //
  }  
};

//
// Inherit from `winston.Transport`.
//
util.inherits(Couchdb, Transport);

//
// Expose the name of this Transport on the prototype
//
Couchdb.prototype.name = 'Couchdb';

//
// ### function log (level, msg, [meta], callback)
// #### @level {string} Level at which to log the message.
// #### @msg {string} Message to log
// #### @meta {Object} **Optional** Additional metadata to attach
// #### @callback {function} Continuation to respond to when complete.
// Core logging method exposed to Winston. Metadata is optional.
//
Couchdb.prototype.log = function (level, msg, meta, callback) {
  if (this.silent) {
    return callback(null, true);
  }
  
  var self = this,
      message = common.clone(meta || {}),
      options,
      req;
      
  message.level = level;
  message.message = msg;

  // Prepare options for outgoing HTTP request
  options = {
    host: this.host,
    port: this.port,
    path: "/" + this.db,
    method: "POST",
    headers: {"content-type": "application/json"}
  };
  
  if (options.user && options.pass) {
    options.headers["Authorization"] = "Basic " + new Buffer(options.user + ":" + options.pass).toString('base64');
  }
  
  // Perform HTTP logging request
  req = http.request(options, function (res) { 
    //
    // No callback on request, fire and forget about the response
    //
    self.emit('logged', res);
  }); 

  req.on('error', function (err) {
    //
    // Propagate the `error` back up to the `Logger` that this
    // instance belongs to.
    //
    self.emit('error', err);
  });
  
  //
  // Write logging event to the outgoing request body
  //
  req.write(JSON.stringify({ 
    method: 'log', 
    params: { 
      timestamp: new Date(), // RFC3339/ISO8601 format instead of common.timestamp()
      msg: msg, 
      level: level, 
      meta: meta 
    } 
  }));
  
  req.end();
  
  // Always return true, regardless of any errors
  callback(null, true);
};