'use strict';

// overloadDefs
// self, overloadDefs
var overload = module.exports = function () {
  var self, selfSet = false, overloadDefs;
  if (arguments.length === 1) {
    overloadDefs = arguments[0];
  } else {
    selfSet = true;
    self = arguments[0];
    overloadDefs = arguments[1];
  }
  return function () {
    if (!selfSet) {
      self = this;
    }
    var args = Array.prototype.slice.call(arguments);
    var overloadMatchData = findOverload(overloadDefs, args);
    if (!overloadMatchData) {
      throw new Error(createErrorMessage('No match found.', overloadDefs));
    }
    var overloadFn = overloadMatchData.def[overloadMatchData.def.length - 1];
    return overloadFn.apply(self, overloadMatchData.args);
  };
};

var findOverload = overload.findOverload = function (overloadDefs, args) {
  for (var i = 0; i < overloadDefs.length; i++) {
    if (i === overloadDefs.length - 1 && typeof(overloadDefs[i]) === 'function') {
      return { args: args, def: [overloadDefs[i]] };
    }
    var newArgs;
    if (newArgs = isMatch(overloadDefs[i], args)) {
      return { args: newArgs, def: overloadDefs[i] };
    }
  }
  return null;
};

function isMatch(overloadDef, args) {
  var overloadDefIdx;
  var argIdx;
  var newArgs = [];
  for (overloadDefIdx = 0, argIdx = 0; overloadDefIdx < overloadDef.length - 1; overloadDefIdx++) {
    if (typeof(overloadDef[overloadDefIdx]) !== 'function') {
      throw new Error("Invalid overload definition. Array should only contain functions.");
    }
    //console.log('overloadDef/arg:', overloadDef[overloadDefIdx], args[argIdx]);
    var result = overloadDef[overloadDefIdx](args[argIdx]);
    //console.log('result:', result);
    if (result) {
      if (result.hasOwnProperty('defaultValue')) {
        newArgs.push(result.defaultValue);
      } else {
        if (overloadDef[overloadDefIdx].optional && args[argIdx] === null) {
          argIdx++;
          newArgs.push(overloadDef[overloadDefIdx].defaultValue);
          continue;
        }
        newArgs.push(args[argIdx]);
        argIdx++;
      }
    } else {
      if (overloadDef[overloadDefIdx].optional) {
        newArgs.push(overloadDef[overloadDefIdx].defaultValue);
        continue;
      }
      return false;
    }
  }
  //console.log('compares', overloadDefIdx, overloadDef.length - 1, argIdx, args.length, newArgs.length);
  if (overloadDefIdx === overloadDef.length - 1 && argIdx >= args.length) {
    return newArgs;
  }
  return false;
}

function createErrorMessage(message, overloadDefs) {
  message += '\n';
  message += '  Possible matches:\n';
  for (var i = 0; i < overloadDefs.length; i++) {
    var overloadDef = overloadDefs[i];
    if (typeof(overloadDef) === 'function') {
      message += '   [default]\n';
    } else {
      var matchers = overloadDef.slice(0, overloadDef.length - 1);
      matchers = matchers.map(function (m) {
        if (!m) {
          return '[invalid argument definition]';
        }
        return m.name || m;
      });
      if (matchers.length === 0) {
        message += '   ()\n';
      } else {
        message += '   (' + matchers.join(', ') + ')\n';
      }
    }
  }
  return message;
}

// --- func
overload.func = function func(arg) {
  return typeof(arg) === 'function';
};

overload.funcOptional = function funcOptional(arg) {
  if (!arg) {
    return true;
  }
  return overload.func(arg);
};
overload.funcOptional.optional = true;

overload.funcOptionalWithDefault = function (def) {
  var fn = function funcOptionalWithDefault(arg) {
    if (arg === undefined) {
      return false;
    }
    return overload.func(arg);
  };
  fn.optional = true;
  fn.defaultValue = def;
  return fn;
};

// --- callback
overload.callbackOptional = function callbackOptional(arg) {
  if (!arg) {
    return { defaultValue: function defaultCallback() {} };
  }
  return overload.func(arg);
};
overload.callbackOptional.optional = true;

// --- string
overload.string = function string(arg) {
  return typeof(arg) === 'string';
};

overload.stringOptional = function stringOptional(arg) {
  if (!arg) {
    return true;
  }
  return overload.string(arg);
};
overload.stringOptional.optional = true;

overload.stringOptionalWithDefault = function (def) {
  var fn = function stringOptionalWithDefault(arg) {
    if (arg === undefined) {
      return false;
    }
    return overload.string(arg);
  };
  fn.optional = true;
  fn.defaultValue = def;
  return fn;
};

// --- number
overload.number = function number(arg) {
  return typeof(arg) === 'number';
};

overload.numberOptional = function numberOptional(arg) {
  if (!arg) {
    return true;
  }
  return overload.number(arg);
};
overload.numberOptional.optional = true;

overload.numberOptionalWithDefault = function (def) {
  var fn = function numberOptionalWithDefault(arg) {
    if (arg === undefined) {
      return false;
    }
    return overload.number(arg);
  };
  fn.optional = true;
  fn.defaultValue = def;
  return fn;
};

// --- array
overload.array = function array(arg) {
  return arg instanceof Array;
};

overload.arrayOptional = function arrayOptional(arg) {
  if (!arg) {
    return true;
  }
  return overload.array(arg);
};
overload.arrayOptional.optional = true;

overload.arrayOptionalWithDefault = function (def) {
  var fn = function arrayOptionalWithDefault(arg) {
    if (arg === undefined) {
      return false;
    }
    return overload.array(arg);
  };
  fn.optional = true;
  fn.defaultValue = def;
  return fn;
};

// --- object
overload.object = function object(arg) {
  return typeof(arg) === 'object';
};

overload.objectOptional = function objectOptional(arg) {
  if (!arg) {
    return true;
  }
  return overload.object(arg);
};
overload.objectOptional.optional = true;

overload.objectOptionalWithDefault = function (def) {
  var fn = function objectOptionalWithDefault(arg) {
    if (arg === undefined) {
      return false;
    }
    return overload.object(arg);
  };
  fn.optional = true;
  fn.defaultValue = def;
  return fn;
};
