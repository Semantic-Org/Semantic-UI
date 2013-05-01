/*
 * grunt
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
 */

/*global QUnit:true, alert:true*/

// Don't re-order tests.
QUnit.config.reorder = false;
// Run tests serially, not in parallel.
QUnit.config.autorun = false;

// Send messages to the parent zombie.js process via alert! Good times!!
function sendMessage() {
  var args = [].slice.call(arguments);
  alert(JSON.stringify(args));
}

QUnit.log(function(obj) {
  // What is this I don’t even
  if (obj.message === '[object Object], undefined:undefined') { return; }
  // Parse some stuff before sending it.
  var actual = QUnit.jsDump.parse(obj.actual);
  var expected = QUnit.jsDump.parse(obj.expected);
  // Send it.
  sendMessage('log', obj.result, actual, expected, obj.message, obj.source);
});

QUnit.testStart(function(obj) {
  sendMessage('testStart', obj.name);
});

QUnit.testDone(function(obj) {
  sendMessage('testDone', obj.name, obj.failed, obj.passed, obj.total);
});

QUnit.moduleStart(function(obj) {
  sendMessage('moduleStart', obj.name);
});

QUnit.moduleDone(function(obj) {
  sendMessage('moduleDone', obj.name, obj.failed, obj.passed, obj.total);
});

QUnit.begin(function() {
  sendMessage('begin');
});

QUnit.done(function(obj) {
  sendMessage('done', obj.failed, obj.passed, obj.total, obj.runtime);
});
