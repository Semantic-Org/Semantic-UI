/*
 * common.js: Common utility functions for requesting against Loggly APIs
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var util = require('util'),
    request = require('request'),
    loggly = require('../loggly');

var common = exports;

//
// Failure HTTP Response codes based
// off Loggly specification.
//
var failCodes = common.failCodes = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict / Duplicate",
  410: "Gone",
  500: "Internal Server Error",
  501: "Not Implemented",
  503: "Throttled"
};

//
// Success HTTP Response codes based
// off Loggly specification.
//
var successCodes = common.successCodes = {
  200: "OK",
  201: "Created", 
  202: "Accepted",
  203: "Non-authoritative information",
  204: "Deleted",
};

//
// Core method that actually sends requests to Loggly.
// This method is designed to be flexible w.r.t. arguments 
// and continuation passing given the wide range of different
// requests required to fully implement the Loggly API.
// 
// Continuations: 
//   1. 'callback': The callback passed into every node-loggly method
//   2. 'success':  A callback that will only be called on successful requests.
//                  This is used throughout node-loggly to conditionally
//                  do post-request processing such as JSON parsing.
//
// Possible Arguments (1 & 2 are equivalent):
//   1. common.loggly('some-fully-qualified-url', auth, callback, success)
//   2. common.loggly('GET', 'some-fully-qualified-url', auth, callback, success)
//   3. common.loggly('DELETE', 'some-fully-qualified-url', auth, callback, success)
//   4. common.loggly({ method: 'POST', uri: 'some-url', body: { some: 'body'} }, callback, success)
//
common.loggly = function () {
  var args = Array.prototype.slice.call(arguments),
      success = args.pop(),
      callback = args.pop(),
      requestBody, 
      headers,
      method, 
      auth, 
      uri;
  
  //
  // Now that we've popped off the two callbacks
  // We can make decisions about other arguments
  //
  if (args.length == 1) {
    if (typeof args[0] === 'string') {
      //
      // If we got a string assume that it's the URI 
      //
      method = 'GET';
      uri    = args[0];
    }
    else {
      method      = args[0]['method'] || 'GET',
      uri         = args[0]['uri'];
      requestBody = args[0]['body'];
      auth        = args[0]['auth'];
      headers     = args[0]['headers'];
    }
  }
  else if (args.length == 2) {
    method = 'GET';
    uri    = args[0];
    auth   = args[1];
  }
  else {
    method = args[0];
    uri    = args[1];
    auth   = args[2];
  }
  
  function onError (err) {
    if (callback) {
      callback(err);
    }
  }
  
  var requestOptions = {
    uri: uri,
    method: method,
    headers: headers || {}
  };
  
  if (auth) {
    requestOptions.headers['authorization'] = 'Basic ' + new Buffer(auth.username + ':' + auth.password).toString('base64');
  }
  
  if (requestBody) {
    requestOptions.body = requestBody;
  }
  
  try {
    request(requestOptions, function (err, res, body) {
      if (err) {
        return onError(err);
      }

      var statusCode = res.statusCode.toString();
      if (Object.keys(failCodes).indexOf(statusCode) !== -1) {
        return onError((new Error('Loggly Error (' + statusCode + '): ' + failCodes[statusCode])));
      }

      success(res, body);
    });
  }
  catch (ex) {
    onError(ex);
  }
};

//
// ### function serialize (obj, key)
// #### @obj {Object|literal} Object to serialize
// #### @key {string} **Optional** Optional key represented by obj in a larger object
// Performs simple comma-separated, `key=value` serialization for Loggly when 
// logging to non-JSON inputs.
//
common.serialize = function (obj, key) {
  if (obj === null) {
    obj = 'null';
  }
  else if (obj === undefined) {
    obj = 'undefined';
  }
  else if (obj === false) {
    obj = 'false';
  }
  
  if (typeof obj !== 'object') {
    return key ? key + '=' + obj : obj;
  }
  
  var msg = '',
      keys = Object.keys(obj),
      length = keys.length;
  
  for (var i = 0; i < length; i++) {
    if (Array.isArray(obj[keys[i]])) {
      msg += keys[i] + '=['
      
      for (var j = 0, l = obj[keys[i]].length; j < l; j++) {
        msg += common.serialize(obj[keys[i]][j]);
        if (j < l - 1) {
          msg += ', ';
        }
      }
      
      msg += ']';
    }
    else {
      msg += common.serialize(obj[keys[i]], keys[i]);
    }    
    
    if (i < length - 1) {
      msg += ', ';
    }
  }
  
  return msg;
};

//
// function clone (obj)
//   Helper method for deep cloning pure JSON objects
//   i.e. JSON objects that are either literals or objects (no Arrays, etc)
//
common.clone = function (obj) {
  var clone = {};
  for (var i in obj) {
    clone[i] = obj[i] instanceof Object ? common.clone(obj[i]) : obj[i];
  }

  return clone;
};