/*
 * helpers.js: Test helpers for the prompt tests.
 *
 * (C) 2010, Nodejitsu Inc.
 *
 */

var events = require('events'),
    stream = require('stream'),
    util = require('util'),
    prompt = require('../lib/prompt');

var helpers = exports;

var MockReadWriteStream = helpers.MockReadWriteStream = function () {
  //
  // No need to do anything here, it's just a mock.
  //
};

util.inherits(MockReadWriteStream, events.EventEmitter);

['resume', 'pause', 'setEncoding', 'flush'].forEach(function (method) {
  MockReadWriteStream.prototype[method] = function () { /* Mock */ };
});

MockReadWriteStream.prototype.write = function (msg) {
  this.emit('data', msg);
};

//
// Create some mock streams for asserting against
// in our prompt tests.
//
helpers.stdin = new MockReadWriteStream();
helpers.stdout = new MockReadWriteStream();
helpers.stderr = new MockReadWriteStream();

//
// Monkey punch `util.error` to silence console output
// and redirect to helpers.stderr for testing.
//
util.error = function () {
  helpers.stderr.write.apply(helpers.stderr, arguments);
}

helpers.properties = {
  riffwabbles: {
    name: 'riffwabbles',
    validator: /^[\w|\-]+$/,
    warning: 'riffwabbles can only be letters, numbers, and dashes',
    default: 'foobizzles'
  },
  username: {
    name: 'username',
    validator: /^[\w|\-]+$/,
    warning: 'Username can only be letters, numbers, and dashes'
  },
  notblank: {
    name: 'notblank',
    empty: false
  },
  password: {
    name: 'password',
    hidden: true,
    empty: false
  },
  badValidator: {
    name: 'bad-validator',
    validator: ['cant', 'use', 'array']
  },
  animal: {
    name: 'animal', 
    description: 'Enter an animal',
    default: 'dog',
    validator: /dog|cat/
  },
  sound: {
    name: 'sound', 
    description: 'What sound does this animal make?',
    validator: function (value) {
      var animal = prompt.history(0).value;
      
      return animal === 'dog' && value === 'woof'
        || animal === 'cat' && value === 'meow';
    }
  },
  fnvalidator: {
    name: 'fnvalidator',
    validator: function (line) {
      return line.slice(0,2) == 'fn';
    },
    warning: 'fnvalidator must start with "fn"'
  },
  cbvalidator: {
    name: 'cbvalidator',
    validator: function (line, next) {
      next(line.slice(0,2) == 'cb');
    },
    warning: 'cbvalidator must start with "cb"'
  }
};
