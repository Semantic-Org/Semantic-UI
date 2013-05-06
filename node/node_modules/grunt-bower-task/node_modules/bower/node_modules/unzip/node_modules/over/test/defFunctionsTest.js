'use strict';

var overload = require('../');

module.exports = {
  'required, good': function (test) {
    var items = [
      { fn: overload.func, param: function () {} },
      { fn: overload.funcOptional, param: function () {} },
      { fn: overload.funcOptionalWithDefault(function () {}), param: function () {} },
      { fn: overload.callbackOptional, param: function () {} },
      { fn: overload.string, param: 'test' },
      { fn: overload.stringOptional, param: 'test' },
      { fn: overload.stringOptionalWithDefault('test'), param: 'test' },
      { fn: overload.number, param: 5 },
      { fn: overload.numberOptional, param: 5 },
      { fn: overload.numberOptionalWithDefault(5), param: 5 },
      { fn: overload.array, param: [1] },
      { fn: overload.arrayOptional, param: [1] },
      { fn: overload.arrayOptionalWithDefault([1]), param: [1] },
      { fn: overload.object, param: {} },
      { fn: overload.objectOptional, param: {} },
      { fn: overload.objectOptionalWithDefault({}), param: {} }
    ];
    items.forEach(function (item) {
      test.equals(item.fn(item.param), true);
    });
    test.done();
  },

  'required, bad': function (test) {
    var items = [
      { fn: overload.func, param: 5 },
      { fn: overload.funcOptional, param: 5 },
      { fn: overload.funcOptionalWithDefault(function () {}), param: 5 },
      { fn: overload.callbackOptional, param: 5 },
      { fn: overload.string, param: 5 },
      { fn: overload.stringOptional, param: 5 },
      { fn: overload.stringOptionalWithDefault('test'), param: 5 },
      { fn: overload.number, param: 'test' },
      { fn: overload.numberOptional, param: 'test' },
      { fn: overload.numberOptionalWithDefault(5), param: 'test' },
      { fn: overload.array, param: 5 },
      { fn: overload.arrayOptional, param: 5 },
      { fn: overload.arrayOptionalWithDefault([]), param: 5 },
      { fn: overload.object, param: 5 },
      { fn: overload.objectOptional, param: 5 },
      { fn: overload.objectOptionalWithDefault({}), param: 5 }
    ];
    items.forEach(function (item) {
      test.equals(item.fn(item.param), false);
    });
    test.done();
  },

  'optional, null': function (test) {
    var items = [
      { fn: overload.funcOptional },
      { fn: overload.stringOptional },
      { fn: overload.numberOptional },
      { fn: overload.arrayOptional },
      { fn: overload.objectOptional }
    ];
    items.forEach(function (item) {
      test.equals(item.fn(null), true, 'invalid results for function: ' + item.fn.name);
    });
    test.done();
  },

  'optional, callback': function (test) {
    test.equals(typeof(overload.callbackOptional(null).defaultValue), 'function');
    test.done();
  },

  'with defaults': function (test) {
    var fn = function () {};
    var items = [
      { fn: overload.funcOptionalWithDefault(fn), expected: fn },
      { fn: overload.stringOptionalWithDefault('test'), expected: 'test' },
      { fn: overload.numberOptionalWithDefault(5), expected: 5 },
      { fn: overload.arrayOptionalWithDefault([]), expected: [] },
      { fn: overload.objectOptionalWithDefault({}), expected: {} }
    ];
    items.forEach(function (item) {
      test.deepEqual(item.fn.defaultValue, item.expected);
    });
    test.done();
  }
};
