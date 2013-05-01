/*
 * prompt.js: Simple prompt for prompting information from the command line
 *
 * (C) 2010, Nodejitsu Inc.
 *
 */

var events = require('events'),
    async = require('async'),
    colors = require('colors'),
    winston = require('winston'),
    tty = require('tty');

//
// ### @private function capitalize (str)
// #### str {string} String to capitalize
// Capitalizes the string supplied.
//
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

//
// Expose version using `pkginfo`
//
require('pkginfo')(module, 'version');

var stdin, stdout, history = [];
var prompt = module.exports = Object.create(events.EventEmitter.prototype);
var logger = prompt.logger = new winston.Logger({
  transports: [new (winston.transports.Console)()]
});

prompt.started    = false;
prompt.paused     = false;
prompt.allowEmpty = false;
prompt.message    = 'prompt';
prompt.delimiter  = ': ';

//
// Create an empty object for the properties
// known to `prompt`
//
prompt.properties = {};

//
// Setup the default winston logger to use
// the `cli` levels and colors.
//
logger.cli();

//
// ### function start (options)
// #### @options {Object} **Optional** Options to consume by prompt
// Starts the prompt by listening to the appropriate events on `options.stdin`
// and `options.stdout`. If no streams are supplied, then `process.stdin`
// and `process.stdout` are used, respectively.
//
prompt.start = function (options) {
  if (prompt.started) {
    return;
  }

  options = options        || {};
  stdin   = options.stdin  || process.openStdin();
  stdout  = options.stdout || process.stdout;

  //
  // By default: Remeber the last `10` prompt property /
  // answer pairs and don't allow empty responses globally.
  //
  prompt.memory     = options.memory     || 10;
  prompt.allowEmpty = options.allowEmpty || false;
  prompt.message    = options.message    || prompt.message;
  prompt.delimiter  = options.delimiter  || prompt.delimiter;

  if (process.platform !== 'win32') {
    // windows falls apart trying to deal with SIGINT
    process.on('SIGINT', function () {
      stdout.write('\n');
      process.exit(1);
    });   
  }

  prompt.emit('start');
  prompt.started = true;
  return prompt;
};

//
// ### function pause ()
// Pauses input coming in from stdin
//
prompt.pause = function () {
  if (!prompt.started || prompt.paused) {
    return;
  }

  stdin.pause();
  prompt.emit('pause');
  prompt.paused = true;
  return prompt;
};

//
// ### function resume ()
// Resumes input coming in from stdin
//
prompt.resume = function () {
  if (!prompt.started || !prompt.paused) {
    return;
  }

  stdin.resume();
  prompt.emit('resume');
  prompt.paused = false;
  return prompt;
};

//
// ### function history (search)
// #### @search {Number|string} Index or property name to find.
// Returns the `property:value` pair from within the prompts
// `history` array.
//
prompt.history = function (search) {
  if (typeof search === 'number') {
    return history[search] || {};
  }

  var names = history.map(function (pair) {
    return typeof pair.property === 'string'
      ? pair.property
      : pair.property.name;
  });

  if (~names.indexOf(search)) {
    return null;
  }

  return history.filter(function (name) {
    return typeof pair.property === 'string'
      ? pair.property === name
      : pair.property.name === name;
  })[0];
};

//
// ### function get (msg, [validator,] callback)
// #### @msg {Array|Object|string} Set of variables to get input for.
// #### @callback {function} Continuation to pass control to when complete.
// Gets input from the user via stdin for the specified message(s) `msg`.
//
prompt.get = function (msg, callback) {
  var vars = !Array.isArray(msg) ? [msg] : msg,
      result = {};

  vars = vars.map(function (v) {
    if (typeof v === 'string') {
      v = v.toLowerCase();
    }

    return prompt.properties[v] || v;
  });

  function get(target, next) {
    prompt.getInput(target, function (err, line) {
      if (err) {
        return next(err);
      }

      var name = target.name || target;
      result[name] = line;
      next();
    });
  }

  async.forEachSeries(vars, get, function (err) {
    return err ? callback(err) : callback(null, result);
  });

  return prompt;
};

//
// ### function getInput (msg, validator, callback)
// #### @msg {Object|string} Variable to get input for.
// #### @callback {function} Continuation to pass control to when complete.
// Gets input from the user via stdin for the specified message `msg`.
//
prompt.getInput = function (prop, callback) {
  var name   = prop.message || prop.name || prop,
      propName = prop.name || prop,
      delim  = prompt.delimiter,
      raw    = [prompt.message, delim + name.grey, delim.grey],
      read   = prop.hidden ? prompt.readLineHidden : prompt.readLine,
      length, msg;

  if (prompt.override && prompt.override[propName]) {
    return callback (null, prompt.override[propName])
  }

  if (prop.default) {
    raw.splice(2, -1, ' (' + prop.default + ')');
  }

  // Calculate the raw length and colorize the prompt
  length = raw.join('').length;
  raw[0] = raw[0];
  msg = raw.join('');

  if (prop.help) {
    prop.help.forEach(function (line) {
      logger.help(line);
    });
  }

  stdout.write(msg);
  prompt.emit('prompt', prop);

  read.call(null, function (err, line) {
    if (err) {
      return callback(err);
    }

    if (!line || line === '') {
      line = prop.default || line;
    }

    if (!prop.validator && prop.empty !== false) {
      logger.input(line.yellow);
      return callback(null, line);
    }

    var valid = true,
        validator = prop.validator;

    function next(valid) {
      if (arguments.length < 1) {
        valid = true;
      }

      if (prop.empty === false && valid) {
        valid = line.length > 0;
        if (!valid) {
          prop.warning = prop.warning || 'You must supply a value.';
        }
      }

      if (!valid) {
        logger.error('Invalid input for ' + name.grey);
        if (prop.warning) {
          logger.error(prop.warning);
        }

        prompt.emit('invalid', prop, line);
        return prompt.getInput(prop, callback);
      }

      //
      // Log the resulting line, append this `property:value`
      // pair to the history for `prompt` and respond to
      // the callback.
      //
      logger.input(line.yellow);
      prompt._remember(prop, line);
      callback(null, line);
    }

    if (validator) {
      if (validator.test) {
        valid = validator.test(line)
      }
      else if (typeof validator === 'function') {
        return validator.length < 2
          ? next(validator(line))
          : validator(line, next);
      }
      else {
        return callback(new Error('Invalid valiator: ' + typeof validator));
      }
    }

    next(valid);
  });

  return prompt;
};

//
// ### function addProperties (obj, properties, callback)
// #### @obj {Object} Object to add properties to
// #### @properties {Array} List of properties to get values for
// #### @callback {function} Continuation to pass control to when complete.
// Prompts the user for values each of the `properties` if `obj` does not already
// have a value for the property. Responds with the modified object.
//
prompt.addProperties = function (obj, properties, callback) {
  properties = properties.filter(function (prop) {
    return typeof obj[prop] === 'undefined';
  });

  if (properties.length === 0) {
    return callback(obj);
  }

  prompt.get(properties, function (err, results) {
    if (err) {
      return callback(err);
    }
    else if (!results) {
      return callback(null, obj);
    }

    function putNested (obj, path, value) {
      var last = obj, key;

      while (path.length > 1) {
        key = path.shift();
        if (!last[key]) {
          last[key] = {};
        }

        last = last[key];
      }

      last[path.shift()] = value;
    }

    Object.keys(results).forEach(function (key) {
      putNested(obj, key.split('.'), results[key]);
    });

    callback(null, obj);
  });

  return prompt;
};

//
// ### function readLine (callback)
// #### @callback {function} Continuation to respond to when complete
// Gets a single line of input from the user.
//
prompt.readLine = function (callback) {
  var value = '', buffer = '';
  prompt.resume();
  stdin.setEncoding('utf8');
  stdin.on('error', callback);
  stdin.on('data', function data (chunk) {
    value += buffer + chunk;
    buffer = '';
    value = value.replace(/\r/g, '');
    if (value.indexOf('\n') !== -1) {
      if (value !== '\n') {
        value = value.replace(/^\n+/, '');
      }

      buffer = value.substr(value.indexOf('\n'));
      value = value.substr(0, value.indexOf('\n'));
      prompt.pause();
      stdin.removeListener('data', data);
      stdin.removeListener('error', callback);
      value = value.trim();
      callback(null, value);
    }
  });

  return prompt;
};

//
// ### function readLineHidden (callback)
// #### @callback {function} Continuation to respond to when complete
// Gets a single line of hidden input (i.e. `rawMode = true`) from the user.
//
prompt.readLineHidden = function (callback) {
  var value = '';
  
  //
  // Ignore errors from `.setRawMode()` so that `prompt` can
  // be scripted in child processes.
  //
  try { tty.setRawMode(true) }
  catch (ex) { }
  
  prompt.resume();
  stdin.on('error', callback);
  stdin.on('data', function data (line) {
    line = line + '';
    for(var i = 0; i < line.length; i++) {
      c = line[i];
      switch (c) {
        case '\n': case '\r': case '\r\n': case '\u0004':
          try { tty.setRawMode(false) }
          catch (ex) { }
          stdin.removeListener('data', data);
          stdin.removeListener('error', callback);
          value = value.trim();
          stdout.write('\n');
          stdout.flush && stdout.flush();
          prompt.pause();
          return callback(null, value);
        case '\x7f': case'\x08':
          value = value.slice(0,-1);
          break;
        case '\u0003': case '\0':
          stdout.write('\n');
          process.exit(1);
          break;
        default:
          value = value + c;
          break;
      }
    }
  });

  return prompt;
};

//
// ### @private function _remember (property, value)
// #### @property {Object|string} Property that the value is in response to.
// #### @value {string} User input captured by `prompt`.
// Prepends the `property:value` pair into the private `history` Array
// for `prompt` so that it can be accessed later.
//
prompt._remember = function (property, value) {
  history.unshift({
    property: property,
    value: value
  });

  //
  // If the length of the `history` Array
  // has exceeded the specified length to remember,
  // `prompt.memory`, truncate it.
  //
  if (history.length > prompt.memory) {
    history.splice(prompt.memory, history.length - prompt.memory);
  }
};
