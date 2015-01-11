/* global jasmine */

'use strict';

(function(jasmine, beforeEach) {

  var sinon = (typeof require === 'function' && typeof module === 'object') ? require('sinon') : window.sinon,
    spyMatchers = 'called calledOnce calledTwice calledThrice calledBefore calledAfter calledOn alwaysCalledOn calledWith alwaysCalledWith calledWithExactly alwaysCalledWithExactly calledWithMatch alwaysCalledWithMatch'.split(' '),
    i = spyMatchers.length,
    spyMatcherHash = {},
    unusualMatchers = {
      "returned": "toHaveReturned",
      "alwaysReturned": "toHaveAlwaysReturned",
      "threw": "toHaveThrown",
      "alwaysThrew": "toHaveAlwaysThrown"
    },

    createCustomMatcher = function(arg) {
      return sinon.match(function (val) {
        return jasmine.getEnv().equals_(val, arg);
      });
    },

    getMatcherFunction = function(sinonName, matcherName) {
      var original = jasmine.Matchers.prototype[matcherName];
      return function () {
        if (jasmine.isSpy(this.actual) && original) {
          return original.apply(this, arguments);
        }
        var sinonProperty = this.actual[sinonName];
        var args = Array.prototype.slice.call(arguments);

        for (var i = 0; i < args.length; i++) {
          if (args[i] && (typeof args[i].jasmineMatches === 'function' || args[i] instanceof jasmine.Matchers.ObjectContaining)) {
            args[i] = createCustomMatcher(args[i]);
          }
        }

        return (typeof sinonProperty === 'function') ? sinonProperty.apply(this.actual, args) : sinonProperty;
      };
    };

  while(i--) {
    var sinonName = spyMatchers[i],
      matcherName = "toHaveBeen" + sinonName.charAt(0).toUpperCase() + sinonName.slice(1);

    spyMatcherHash[matcherName] = getMatcherFunction(sinonName, matcherName);
  }

  for (var j in unusualMatchers) {
    spyMatcherHash[unusualMatchers[j]] = getMatcherFunction(j, unusualMatchers[j]);
  }

  beforeEach(function() {
    this.addMatchers(spyMatcherHash);
  });

})(jasmine, beforeEach);