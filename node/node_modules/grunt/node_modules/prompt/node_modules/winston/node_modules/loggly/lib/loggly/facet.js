/*
 * facet.js: Chainable search functions for Loggly facet searches.
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var util = require('util'),
    Search = require('./search').Search;

//
// function Facet (facet, query, client, callback) 
//   Chainable facet search object for Loggly API
//
var Facet = exports.Facet = function (facet, query, client, callback) {
  if (['date', 'ip', 'input'].indexOf(facet) === -1) {
    var error = new Error('Cannot search with unknown facet: ' + facet); 
    
    if (callback) {
      return callback(error);
    }
    else {
      throw error;
    }
  }
  
  //
  // Set the baseUrl to be facet/:facet?
  //
  this.baseUrl = ['facets', facet + '?'].join('/');
  
  //
  // Call the base constructor.
  //
  Search.call(this, query, client, callback);
};

//
// Inherit from `loggly.Search`.
//
util.inherits(Facet, Search);