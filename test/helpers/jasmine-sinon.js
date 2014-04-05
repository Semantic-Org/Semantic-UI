var createCustomMatcher, createMatcher, jasmineMessageGenerator, jasmineName, sinonMatchers, sinonName, sinonToJasmineMap, spies,
  __slice = [].slice;

sinonMatchers = {};

sinonToJasmineMap = {
  'called': 'toHaveBeenCalled',
  'calledOnce': 'toHaveBeenCalledOnce',
  'calledTwice': 'toHaveBeenCalledTwice',
  'calledThrice': 'toHaveBeenCalledThrice',
  'calledBefore': 'toHaveBeenCalledBefore',
  'calledAfter': 'toHaveBeenCalledAfter',
  'calledOn': 'toHaveBeenCalledOn',
  'alwaysCalledOn': 'toHaveBeenAlwaysCalledOn',
  'calledWith': 'toHaveBeenCalledWith',
  'alwaysCalledWith': 'toHaveBeenAlwaysCalledWith',
  'calledWithExactly': 'toHaveBeenCalledWithExactly',
  'alwaysCalledWithExactly': 'toHaveBeenAlwaysCalledWithExactly',
  'calledWithMatch': 'toHaveBeenCalledWithMatch',
  'alwaysCalledWithMatch': 'toHaveBeenAlwaysCalledWithMatch',
  'returned': 'toHaveReturned',
  'alwaysReturned': 'toHaveAlwaysReturned',
  'threw': 'toHaveThrown',
  'alwaysThrew': 'toHaveAlwaysThrown'
};

jasmineMessageGenerator = {
  'toHaveBeenCalled': function(passed, spy, other_args) {
    var message;
    message = "Expected spy '" + spy + "' ";
    if (passed) {
      message += "not ";
    }
    message += "toHaveBeenCalled";
    return message.trim();
  },
  'toHaveBeenCalledOnce': function(passed, spy, other_args) {
    var message;
    message = "Expected spy '" + spy + "' ";
    if (passed) {
      message += "not ";
    }
    message += "toHaveBeenCalledOnce";
    return message.trim();
  },
  'toHaveBeenCalledTwice': function(passed, spy, other_args) {
    var message;
    message = "Expected spy '" + spy + "' ";
    if (passed) {
      message += "not ";
    }
    message += "toHaveBeenCalledTwice";
    return message.trim();
  },
  'toHaveBeenCalledThrice': function(passed, spy, other_args) {
    var message;
    message = "Expected spy '" + spy + "' ";
    if (passed) {
      message += "not ";
    }
    message += "toHaveBeenCalledThrice";
    return message.trim();
  },
  'toHaveBeenCalledBefore': function(passed, spy, other_args) {
    var message;
    message = "Expected spy '" + spy + "' ";
    if (passed) {
      message += "not ";
    }
    message += "toHaveBeenCalledBefore ";
    if ((other_args != null ? other_args.length : void 0) > 0) {
      message += jasmine.pp(other_args) + (" but was CalledBefore " + (jasmine.pp(spy.lastCall.args)));
    }
    return message.trim();
  },
  'toHaveBeenCalledAfter': function(passed, spy, other_args) {
    var message;
    message = "Expected spy '" + spy + "' ";
    if (passed) {
      message += "not ";
    }
    message += "toHaveBeenCalledAfter ";
    if ((other_args != null ? other_args.length : void 0) > 0) {
      message += jasmine.pp(other_args) + (" but was CalledAfter " + (jasmine.pp(spy.lastCall.args)));
    }
    return message.trim();
  },
  'toHaveBeenCalledOn': function(passed, spy, other_args) {
    var message;
    message = "Expected spy '" + spy + "' ";
    if (passed) {
      message += "not ";
    }
    message += "toHaveBeenCalledOn ";
    if ((other_args != null ? other_args.length : void 0) > 0) {
      message += jasmine.pp(other_args) + (" but was CalledOn " + (jasmine.pp(spy.lastCall.args)));
    }
    return message.trim();
  },
  'toHaveBeenAlwaysCalledOn': function(passed, spy, other_args) {
    var message;
    message = "Expected spy '" + spy + "' ";
    if (passed) {
      message += "not ";
    }
    message += "toHaveBeenAlwaysCalledOn ";
    if ((other_args != null ? other_args.length : void 0) > 0) {
      message += jasmine.pp(other_args) + (" but was AlwaysCalledOn " + (jasmine.pp(spy.lastCall.args)));
    }
    return message.trim();
  },
  'toHaveBeenCalledWith': function(passed, spy, other_args) {
    var message;
    message = "Expected spy '" + spy + "' ";
    if (passed) {
      message += "not ";
    }
    message += "toHaveBeenCalledWith ";
    if ((other_args != null ? other_args.length : void 0) > 0) {
      message += jasmine.pp(other_args) + (" but was CalledWith " + (jasmine.pp(spy.lastCall.args)));
    }
    return message.trim();
  },
  'toHaveBeenAlwaysCalledWith': function(passed, spy, other_args) {
    var message;
    message = "Expected spy '" + spy + "' ";
    if (passed) {
      message += "not ";
    }
    message += "toHaveBeenAlwaysCalledWith ";
    if ((other_args != null ? other_args.length : void 0) > 0) {
      message += jasmine.pp(other_args) + (" but was AlwaysCalledWith " + (jasmine.pp(spy.lastCall.args)));
    }
    return message.trim();
  },
  'toHaveBeenCalledWithExactly': function(passed, spy, other_args) {
    var message;
    message = "Expected spy '" + spy + "' ";
    if (passed) {
      message += "not ";
    }
    message += "toHaveBeenCalledWithExactly ";
    if ((other_args != null ? other_args.length : void 0) > 0) {
      message += jasmine.pp(other_args) + (" but was CalledWithExactly " + (jasmine.pp(spy.lastCall.args)));
    }
    return message.trim();
  },
  'toHaveBeenAlwaysCalledWithExactly': function(passed, spy, other_args) {
    var message;
    message = "Expected spy '" + spy + "' ";
    if (passed) {
      message += "not ";
    }
    message += "toHaveBeenAlwaysCalledWithExactly ";
    if ((other_args != null ? other_args.length : void 0) > 0) {
      message += jasmine.pp(other_args) + (" but was AlwaysCalledWithExactly " + (jasmine.pp(spy.lastCall.args)));
    }
    return message.trim();
  },
  'toHaveBeenCalledWithMatch': function(passed, spy, other_args) {
    var message;
    message = "Expected spy '" + spy + "' ";
    if (passed) {
      message += "not ";
    }
    message += "toHaveBeenCalledWithMatch ";
    if ((other_args != null ? other_args.length : void 0) > 0) {
      message += jasmine.pp(other_args) + (" but was CalledWithMatch " + (jasmine.pp(spy.lastCall.args)));
    }
    return message.trim();
  },
  'toHaveBeenAlwaysCalledWithMatch': function(passed, spy, other_args) {
    var message;
    message = "Expected spy '" + spy + "' ";
    if (passed) {
      message += "not ";
    }
    message += "toHaveBeenAlwaysCalledWithMatch ";
    if ((other_args != null ? other_args.length : void 0) > 0) {
      message += jasmine.pp(other_args) + (" but was AlwaysCalledWithMatch " + (jasmine.pp(spy.lastCall.args)));
    }
    return message.trim();
  },
  'toHaveReturned': function(passed, spy, other_args) {
    var message;
    message = "Expected spy '" + spy + "' ";
    if (passed) {
      message += "not ";
    }
    message += "toHaveReturned ";
    if ((other_args != null ? other_args.length : void 0) > 0) {
      message += jasmine.pp(other_args) + (" but returned " + (jasmine.pp(spy.lastCall.args)));
    }
    return message.trim();
  },
  'toHaveAlwaysReturned': function(passed, spy, other_args) {
    var message;
    message = "Expected spy '" + spy + "' ";
    if (passed) {
      message += "not ";
    }
    message += "toHaveAlwaysReturned ";
    if ((other_args != null ? other_args.length : void 0) > 0) {
      message += jasmine.pp(other_args) + (" but returned " + (jasmine.pp(spy.lastCall.args)));
    }
    return message.trim();
  },
  'toHaveThrown': function(passed, spy, other_args) {
    var message;
    message = "Expected spy '" + spy + "' ";
    if (passed) {
      message += "not ";
    }
    message += "toHaveThrown ";
    if ((other_args != null ? other_args.length : void 0) > 0) {
      message += jasmine.pp(other_args) + (" but threw " + (jasmine.pp(spy.lastCall.args)));
    }
    return message.trim();
  },
  'toHaveAlwaysThrown': function(passed, spy, other_args) {
    var message;
    message = "Expected spy '" + spy + "' ";
    if (passed) {
      message += "not ";
    }
    message += "toHaveAlwaysThrown ";
    if ((other_args != null ? other_args.length : void 0) > 0) {
      message += jasmine.pp(other_args) + (" but threw " + (jasmine.pp(spy.lastCall.args)));
    }
    return message.trim();
  }
};

createCustomMatcher = function(arg, util, customEqualityTesters) {
  return sinon.match(function(val) {
    return util.equals(val, arg, customEqualityTesters);
  });
};

createMatcher = function(sinonName, jasmineName) {
  var original;
  original = jasmineRequire[jasmineName];
  return function(util, customEqualityTesters) {
    return {
      compare: function() {
        var arg, args, compare, i, message, pass, sinonProperty, spy, _i, _len;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        spy = args[0];
        if (original && jasmine.isSpy(spy)) {
          compare = original(jasmine)(util, customEqualityTesters).compare;
          return compare.apply(null, args);
        }
        sinonProperty = spy[sinonName];
        for (i = _i = 0, _len = args.length; _i < _len; i = ++_i) {
          arg = args[i];
          if (arg != null) {
            if ((typeof arg.jasmineMatches === 'function') || (arg instanceof jasmine.ObjectContaining)) {
              args[i] = createCustomMatcher(arg, util, customEqualityTesters);
            }
          }
        }
        if (typeof sinonProperty === 'function') {
          pass = sinonProperty.apply(spy, args.slice(1));
        } else {
          pass = sinonProperty;
        }
        message = jasmineMessageGenerator[jasmineName](pass, spy, args.slice(1));
        return {
          pass: pass,
          message: message
        };
      }
    };
  };
};

for (sinonName in sinonToJasmineMap) {
  jasmineName = sinonToJasmineMap[sinonName];
  sinonMatchers[jasmineName] = createMatcher(sinonName, jasmineName);
}

jasmine.Expectation.addCoreMatchers(sinonMatchers);

spies = [];

this.sinonSpyOn = function(obj, method) {
  return spies.push(sinon.spy(obj, method));
};

afterEach(function() {
  var spy, _i, _len;
  for (_i = 0, _len = spies.length; _i < _len; _i++) {
    spy = spies[_i];
    spy.restore();
  }
  return spies = [];
});