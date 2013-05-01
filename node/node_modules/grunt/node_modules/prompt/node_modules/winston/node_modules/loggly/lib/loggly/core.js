/*
 * core.js: Core functions for accessing Loggly
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var events = require('events'),
    qs = require('querystring'),
    config = require('./config'),
    common = require('./common'),
    Search = require('./search').Search,
    Facet = require('./facet').Facet,
    loggly = require('../loggly');

//
// function createClient (options)
//   Creates a new instance of a Loggly client.
//
exports.createClient = function (options) {
  return new Loggly(config.createConfig(options));
};

//
// Loggly (config)
//   Constructor for the Loggly object
//
var Loggly = exports.Loggly = function (config) {
  this.config = config;
};

//
// function log (callback) 
//   logs args to input device
//
Loggly.prototype.log = function (inputId, msg, callback) {
  var emitter = new (events.EventEmitter)(),
      message;
      
  if (msg instanceof Object) {
    message = this.config.json ? JSON.stringify(msg) : common.serialize(msg);
  } 
  else {
    message = this.config.json ? JSON.stringify({ message : msg }) : msg;
  }

  var logOptions = {
    uri: this.config.inputUrl + inputId,
    method: 'POST', 
    body: message,
    headers: {
      'Content-Type': this.config.json ? 'application/json' : 'text/plain'
    }
  };

  common.loggly(logOptions, callback, function (res, body) {
    try {
      var result = JSON.parse(body);
      if (callback) {
        callback(null, result);
      }
      
      emitter.emit('log', result);
    }
    catch (ex) {
      if (callback) {
        callback(new Error('Unspecified error from Loggly: ' + ex));
      }
    }
  }); 
  
  return emitter; 
};

//
// function search (query, callback)
//   Returns a new search object which can be chained
//   with options or called directly if @callback is passed
//   initially.
//
// Sample Usage:
//
//   client.search('404')
//         .meta({ ip: '127.0.0.1' })
//         .context({ rows: 100 })
//         .run(function () { /* ... */ });
//
Loggly.prototype.search = function (query, callback) {
  return new Search(query, this, callback);
};

//
// function facet (facet, query, [options], callback) 
//   Performs a facet search against loggly with the 
//   specified facet, query and options.
//
Loggly.prototype.facet = function (facet, query, callback) {
  return new Facet(facet, query, this, callback);
};


//
// function getInputs ([raw], callback) 
//   Returns a list of all inputs for the authenicated account
//
Loggly.prototype.getInputs = function () {
  var self = this,
      args = Array.prototype.slice.call(arguments),
      callback = args.pop(),
      raw = args.length > 0 ? args[0] : false;
  
  common.loggly(this.logglyUrl('inputs'), this.config.auth, callback, function (res, body) {
    var inputs = [], 
        results = JSON.parse(body);
        
    if (!raw) {
      results.forEach(function (result) {
        inputs.push(new (loggly.Input)(self, result));
      });
      
      return callback(null, inputs);
    }
    
    callback(null, results);
  });
};

//
// function getInput (name, callback)
//   Returns the input with the specified name 
//
Loggly.prototype.getInput = function (name, callback) {
  var self = this;
  this.getInputs(true, function (err, results) {
    if (err) {
      return callback(err);
    }
    
    var matches = results.filter(function (r) { return r.name === name }),
        input = null;
        
    if (matches.length > 0) {
      input = new (loggly.Input)(self, matches[0]);
    }
    
    callback(null, input);
  });
};

//
// function addDevice (inputId, address, callback) 
//   Adds the device at address to the input specified by inputId
//
Loggly.prototype.addDeviceToInput = function (inputId, address, callback) {
  var addOptions = {
    uri: this.logglyUrl('devices'),
    auth: this.config.auth,
    method: 'POST', 
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: qs.stringify({ 'input_id': inputId, 'ip': address }).replace('"', '')
  };

  common.loggly(addOptions, callback, function (res, body) {
    callback(null, res);
  });
};

//
// function addDevice (inputId, callback) 
//   Adds the calling device to the input
//
Loggly.prototype.addDevice = function (inputId, callback) {
  //
  // Remark: This is not fully implemented yet
  //
  callback(new Error('Not Implemented Yet...'));
  
  //common.loggly(this.logglyUrl('inputs', inputId, 'adddevice'), this.config.auth, callback, function (res, body) {
  //});
};

//
// function getDevices (callback) 
//   Returns a list of all devices for the authenicated account
//
Loggly.prototype.getDevices = function (callback) {
  var self = this;
  common.loggly(this.logglyUrl('devices'), this.config.auth, callback, function (res, body) {
    var results = JSON.parse(body),
        devices = [];
        
    results.forEach(function (result) {
      devices.push(new (loggly.Device)(self, result));
    });
    
    callback(null, devices);
  });
};

//
// function logglyUrl ([path, to, resource])
//   Helper method that concats the string params into a url
//   to request against a loggly serverUrl. 
//
Loggly.prototype.logglyUrl = function (/* path, to, resource */) {
  var args = Array.prototype.slice.call(arguments);
  return [this.config.logglyUrl].concat(args).join('/');
};