var basicEvents = require('nodeunit').testCase;
var lib = '../../lib/eventemitter2';

var EventEmitter2;

if(typeof require !== 'undefined') {
  EventEmitter2 = require(lib).EventEmitter2;
}
else {
  EventEmitter2 = window.EventEmitter2;
}

function setHelper (emitter, test, testName){
  var eventNames = [
    testName, 
    testName + '.*', 
    testName + '.ns1', 
    testName + '.ns1.ns2', 
    testName + '.ns2.*',
    testName + '.**',
    testName = '.ns2.**'
  ];

  for (var i = 0; i < eventNames.length; i++) {
    emitter.on(eventNames[i], function () { 
        test.ok(true, eventNames[i] + 'has fired');
    });
  }

  return eventNames;
}

module.exports = basicEvents({

  'intialize 1. Configuration Flags Test.': function (test) {

    var emitter = new EventEmitter2({ 
      wildcard: true,
      verbose: true
    });

    var emitterDefault = new EventEmitter2({
    });

    test.ok(!emitterDefault.wildcard, 'default .wildcard should be false');
    test.ok(emitter.wildcard, '.wildcard should be true when set');
    
    test.expect(2);
    test.done();

  },
  'initialize 2. creating a wildcard EE should have listenerTree.': function (test) {

    var emitter = new EventEmitter2({ 
      wildcard: true,
      verbose: true
    });

    var emitterDefault = new EventEmitter2({
    });

    test.ok(emitter.listenerTree, 'listenerTree should exist');
    test.equal(typeof emitter.listenerTree, 'object', 'listenerTree should be an Object');

    test.ok(!emitterDefault.listenerTree, 'listenerTree should not exist');
    // check the tree to be empty?
    
    test.expect(3);
    test.done();

  },
});
