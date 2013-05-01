/*
 * search.js: chainable search functions for Loggly
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var qs = require('querystring'),
    timespan = require('timespan'),
    common = require('./common');

//
// function Search (query, client, callback) 
//   Chainable search object for Loggly API
//
var Search = exports.Search = function (query, client, callback) {
  this.query = query;
  this.client = client;
  
  if (!this.baseUrl) {
    this.baseUrl = 'search?';
  }
  
  //
  // If we're passed a callback, run immediately.
  //
  if (callback) {
    this.callback = callback;
    this.run();
  }
};

//
// function meta (meta)
//   Sets the appropriate metadata for this search query:
//   e.g. ip, inputname
//
Search.prototype.meta = function (meta) {
  this._meta = meta;
  return this;
};

//
// function context (context)
//   Sets the appropriate context for this search query:
//   e.g. rows, start, from, until, order, format, fields
//
Search.prototype.context = function (context) {
  this._context = context;
  return this;
};

//
// ### function run (callback) 
// #### @callback {function} Continuation to respond to when complete
// Runs the search query for for this instance with the query, metadata,
// context, and other parameters that have been configured on it.
//
Search.prototype.run = function (callback) {
  var rangeError;
  
  //
  // Trim the search query 
  //
  this.query.trim();
  
  //
  // Update the callback for this instance if it's passed
  //
  this.callback = callback || this.callback;
  if (!this.callback) {
    throw new Error('Cannot run search without a callback function.');
  }
  
  // If meta was passed, update the search query appropriately
  if (this._meta) {
    this.query += ' ' + qs.unescape(qs.stringify(this._meta, ' ', ':'));
  }

  // Set the context for the query string
  this._context = this._context || {};
  this._context.q = this.query;
  this._checkRange();

  var self = this, searchOptions = {
    uri: this.client.logglyUrl(this.baseUrl + qs.stringify(this._context)),
    auth: this.client.config.auth
  };
  
  common.loggly(searchOptions, this.callback, function (res, body) {
    self.callback(null, JSON.parse(body));
  });
  
  return this;
};

//
// ### function _checkRange ()
// Checks if the range that has been configured for this 
// instance is valid and updates if it is not.
//
Search.prototype._checkRange = function () {
  if (!this._context || (!this._context.until && !this._context.from)) {
    return;
  }
  
  this._context.until = this._context.until || 'NOW';
  this._context.from  = this._context.from  || 'NOW-24HOURS';
  
  if (!timespan.parseDate(this._context.until)) {
    this._context.until = 'NOW';
  }
  
  if (!timespan.parseDate(this._context.from)) {
    this._context.from = 'NOW-24HOURS';
  }
  
  if (timespan.fromDates(this._context.from, this._context.until) < 0
    || this._context.until === this._context.from) {
    //
    // If the length of the timespan for this Search instance is
    // negative then set it to default values
    //
    this._context.until = 'NOW';
    this._context.from = 'NOW-24HOURS';
  }
  
  return this;
};