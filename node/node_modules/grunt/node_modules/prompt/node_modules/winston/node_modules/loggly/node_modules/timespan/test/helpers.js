/*
 * helpers.js: Tests helpers for the TimeSpan module.
 *
 * (C) Charlie Robbins
 * MIT LICENSE
 *
 */

var assert = require('assert'),
    timeSpan = require('../lib/time-span')
 
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

var helpers = exports,
    components = ['milliseconds', 'seconds', 'minutes', 'hours', 'days'];

//
// Tests all of the factory methods for the `TimeSpan` object:
// `fromMilliseconds`, `fromSeconds`, etc.
//
exports.testFactories = function (num) {
  var context = {};
  
  components.forEach(function (component) {
    var method = 'from' + capitalize(component);
    
    context['the ' + method + '() method'] = function () {
      var value = timeSpan[method](num);
      assert.equal(value[component], num);
    }
  });
  
  return context;
};