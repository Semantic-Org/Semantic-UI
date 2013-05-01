/*
 * logger.js: Core logger object used by winston.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 *
 */
 
var events = require('events'),
    util = require('util'),
    async = require('async'),
    config = require('./config'),
    common = require('./common'),
    exception = require('./exception');

//
// Time constants
//
var ticksPerMillisecond = 10000;

//
// ### function Logger (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Logger object responsible
// for persisting log messages and metadata to one or more transports.
//
var Logger = exports.Logger = function (options) {
  events.EventEmitter.call(this);
  options = options || {};
  
  var self = this,
      handleExceptions = false;
  
  //
  // Set Levels and default logging level
  //
  this.padLevels = options.padLevels || false;
  this.setLevels(options.levels);
  if (options.colors) {
    config.addColors(options.colors);
  }
  
  //
  // Hoist other options onto this instance.
  //
  this.level       = options.level || 'info';
  this.emitErrs    = options.emitErrs || false;
  this.stripColors = options.stripColors || false;
  this.exitOnError = typeof options.exitOnError !== 'undefined' 
    ? options.exitOnError 
    : true;
  
  //
  // Setup other intelligent default settings.
  //
  this.transports        = {};
  this.rewriters         = [];
  this.exceptionHandlers = {};
  this.profilers         = {};
  this._names            = [];
  this._hnames           = [];

  if (options.transports) {
    options.transports.forEach(function (transport) {
      self.add(transport, null, true);
      
      if (transport.handleExceptions) {
        handleExceptions = true;
      }
    });
  }
  
  if (options.rewriters) {
    options.rewriters.forEach(function(rewriter) {
      self.addRewriter(rewriter);
    });
  }
  
  if (options.exceptionHandlers) {
    handleExceptions = true;
    options.exceptionHandlers.forEach(function (handler) {
      self._hnames.push(handler.name);
      self.exceptionHandlers[handler.name] = handler;
    });
  }
  
  if (options.handleExceptions || handleExceptions) {
    this.handleExceptions();
  }
};

//
// Inherit from `events.EventEmitter`.
//
util.inherits(Logger, events.EventEmitter);

//
// ### function extend (target)
// #### @target {Object} Target to extend.
// Extends the target object with a 'log' method
// along with a method for each level in this instance.
//
Logger.prototype.extend = function (target) {
  var self = this;
  ['log', 'profile', 'startTimer'].concat(Object.keys(this.levels)).forEach(function (method) {
    target[method] = function () {
      return self[method].apply(self, arguments);
    };
  });
  
  return this;
};

//
// ### function log (level, msg, [meta], callback)
// #### @level {string} Level at which to log the message.
// #### @msg {string} Message to log
// #### @meta {Object} **Optional** Additional metadata to attach
// #### @callback {function} Continuation to respond to when complete.
// Core logging method exposed to Winston. Metadata is optional.
//
Logger.prototype.log = function (level, msg) {
  var self = this, 
      callback,
      meta;
  
  if (arguments.length === 3) {
    if (typeof arguments[2] === 'function') {
      meta = {};
      callback = arguments[2];
    }
    else if (typeof arguments[2] === 'object') {
      meta = arguments[2];
    }
  }
  else if (arguments.length === 4) {
    meta = arguments[2];
    callback = arguments[3];
  }

  // If we should pad for levels, do so
  if (this.padLevels) {
    msg = new Array(this.levelLength - level.length).join(' ') + msg;
  }

  function onError (err) {
    if (callback) {
      callback(err);
    }
    else if (self.emitErrs) {
      self.emit('error', err);
    };
  }
  
  if (this.transports.length === 0) {
    return onError(new Error('Cannot log with no transports.'));
  }
  else if (typeof self.levels[level] === 'undefined') {
    return onError(new Error('Unknown log level: ' + level));
  }
  
  this.rewriters.forEach(function(rewriter) {
    meta = rewriter(level, msg, meta);
  });
  
  //
  // For consideration of terminal 'color" programs like colors.js,
  // which can add ANSI escape color codes to strings, we destyle the 
  // ANSI color escape codes when `this.stripColors` is set.
  //
  // see: http://en.wikipedia.org/wiki/ANSI_escape_code
  //
  if (this.stripColors) {
    var code = /\u001b\[\d+m/g;
    msg = ('' + msg).replace(code, '');
  }
  
  for (var i = 0, l = this._names.length; i < l; i++) {
    var transport = this.transports[this._names[i]];
    if ((transport.level && self.levels[transport.level] <= self.levels[level])
      || (!transport.level && self.levels[self.level] <= self.levels[level])) {
      transport.log(level, msg, meta, function (err) {
        self.emit('logging', transport, level, msg, meta);
      });
    }
  }
  
  //
  // Immediately respond to the callback
  //
  if (callback) {
    callback(null, level, msg, meta);    
  }
  
  return this;
};

//
// ### function close ()
// Cleans up resources (streams, event listeners) for all
// transports associated with this instance (if necessary).
//
Logger.prototype.close = function () {
  var self = this;
  
  this._names.forEach(function (name) {
    var transport = self.transports[name];
    if (transport && transport.close) {
      transport.close();
    }
  });
};

//
// ### function handleExceptions () 
// Handles `uncaughtException` events for the current process
//
Logger.prototype.handleExceptions = function () {
  var args = Array.prototype.slice.call(arguments),
      handlers = [],
      self = this;
      
  args.forEach(function (a) {
    if (Array.isArray(a)) {
      handlers = handlers.concat(a);
    }
    else {
      handlers.push(a);
    }
  });
  
  handlers.forEach(function (handler) {
    self.exceptionHandlers[handler.name] = handler;
  });
  
  this._hnames = Object.keys(self.exceptionHandlers);
    
  if (!this.catchExceptions) {
    this.catchExceptions = this._uncaughtException.bind(this);
    process.on('uncaughtException', this.catchExceptions);
  }
};

//
// ### function unhandleExceptions () 
// Removes any handlers to `uncaughtException` events
// for the current process
//
Logger.prototype.unhandleExceptions = function () {
  var self = this;
  
  if (this.catchExceptions) {
    Object.keys(this.exceptionHandlers).forEach(function (name) {
      if (handler.close) {
        handler.close();
      }
    });
    
    this.exceptionHandlers = {};
    Object.keys(this.transports).forEach(function (name) {
      var transport = self.transports[name];
      if (transport.handleExceptions) {
        transport.handleExceptions = false;
      }
    })
    
    process.removeListener('uncaughtException', this.catchExceptions);
    this.catchExceptions = false;    
  }
};

//
// ### function add (transport, [options])
// #### @transport {Transport} Prototype of the Transport object to add.
// #### @options {Object} **Optional** Options for the Transport to add.
// #### @instance {Boolean} **Optional** Value indicating if `transport` is already instantiated.
// Adds a transport of the specified type to this instance.
//
Logger.prototype.add = function (transport, options, created) {
  var instance = created ? transport : (new (transport)(options));
  
  if (!instance.name && !instance.log) {
    throw new Error('Unknown transport with no log() method');
  }
  else if (this.transports[instance.name]) {
    throw new Error('Transport already attached: ' + instance.name);
  }
  
  this.transports[instance.name] = instance;
  this._names = Object.keys(this.transports);
  
  //
  // Listen for the `error` event on the new Transport
  //
  instance._onError = this._onError.bind(this, instance)
  instance.on('error', instance._onError);
  
  //
  // If this transport has `handleExceptions` set to `true`
  // and we are not already handling exceptions, do so.
  //
  if (transport.handleExceptions && !this.catchExceptions) {
    this.handleExceptions();
  }

  return this;
};

//
// ### function addRewriter (transport, [options])
// #### @transport {Transport} Prototype of the Transport object to add.
// #### @options {Object} **Optional** Options for the Transport to add.
// #### @instance {Boolean} **Optional** Value indicating if `transport` is already instantiated.
// Adds a transport of the specified type to this instance.
//
Logger.prototype.addRewriter = function(rewriter) {
  this.rewriters.push(rewriter);
}

//
// ### function clear ()
// Remove all transports from this instance
//
Logger.prototype.clear = function () {
  for (var name in this.transports) {
    this.remove({ name: name });
  }
};

//
// ### function remove (transport) 
// #### @transport {Transport} Transport to remove.
// Removes a transport of the specified type from this instance.
//
Logger.prototype.remove = function (transport) {
  var name = transport.name || transport.prototype.name;
    
  if (!this.transports[name]) {
    throw new Error('Transport ' + name + ' not attached to this instance');
  }
  
  var instance = this.transports[name];
  delete this.transports[name];
  this._names = Object.keys(this.transports);
  
  if (instance.close) {
    instance.close();
  }
  
  instance.removeListener('error', instance._onError);
  return this;
};

var ProfileHandler = function (logger) {
  this.logger = logger;

  this.start = Date.now();

  this.done = function (msg) {
    var args, callback, meta;
    args     = Array.prototype.slice.call(arguments);
    callback = typeof args[args.length - 1] === 'function' ? args.pop() : null;
    meta     = typeof args[args.length - 1] === 'object' ? args.pop() : {};
   
    meta.duration = (Date.now()) - this.start + 'ms';

    return this.logger.info(msg, meta, callback);
  }
}

Logger.prototype.startTimer = function () {
  return new ProfileHandler(this);
}

//
// ### function profile (id, [msg, meta, callback])
// #### @id {string} Unique id of the profiler 
// #### @msg {string} **Optional** Message to log
// #### @meta {Object} **Optional** Additional metadata to attach
// #### @callback {function} **Optional** Continuation to respond to when complete.
// Tracks the time inbetween subsequent calls to this method
// with the same `id` parameter. The second call to this method
// will log the difference in milliseconds along with the message.
//
Logger.prototype.profile = function (id) {
  var now = Date.now(), then, args,
      msg, meta, callback;
  
  if (this.profilers[id]) {
    then = this.profilers[id];
    delete this.profilers[id];
    
    // Support variable arguments: msg, meta, callback
    args     = Array.prototype.slice.call(arguments);
    callback = typeof args[args.length - 1] === 'function' ? args.pop() : null;
    meta     = typeof args[args.length - 1] === 'object' ? args.pop() : {};
    msg      = args.length === 2 ? args[1] : id; 
    
    // Set the duration property of the metadata
    meta.duration = now - then + 'ms'; 
    return this.info(msg, meta, callback);
  }
  else {
    this.profilers[id] = now;
  }
  
  return this;
};

//
// ### function setLevels (target)
// #### @target {Object} Target levels to use on this instance
// Sets the `target` levels specified on this instance.
//
Logger.prototype.setLevels = function (target) {
  return common.setLevels(this, this.levels, target);
};

//
// ### function cli ()
// Configures this instance to have the default
// settings for command-line interfaces: no timestamp,
// colors enabled, padded output, and additional levels.
//
Logger.prototype.cli = function () {
  this.padLevels = true;
  this.setLevels(config.cli.levels);
  config.addColors(config.cli.colors);
  
  if (this.transports.console) {
    this.transports.console.colorize = true;
    this.transports.console.timestamp = false;
  }
  
  return this;
};

//
// ### @private function _uncaughtException (err) 
// #### @err {Error} Error to handle
// Logs all relevant information around the `err` and
// exits the current process.
//
Logger.prototype._uncaughtException = function (err) {
  var self = this,
      responded = false,
      info = exception.getAllInfo(err),
      handlers = this._getExceptionHandlers(),
      timeout,
      doExit;
  
  //
  // Calculate if we should exit on this error
  //
  doExit = typeof this.exitOnError === 'function'
    ? this.exitOnError(err)
    : this.exitOnError;
  
  function logAndWait(transport, next) {
    transport.logException('uncaughtException', info, next, err);
  }
  
  function gracefulExit() {
    if (doExit && !responded) {
      //
      // Remark: Currently ignoring any exceptions from transports
      //         when catching uncaught exceptions.
      //
      clearTimeout(timeout);
      responded = true;
      process.exit(1);
    }
  }
  
  if (!handlers || handlers.length === 0) {
    return gracefulExit();
  }
  
  //
  // Log to all transports and allow the operation to take
  // only up to `3000ms`.
  //
  async.forEach(handlers, logAndWait, gracefulExit);
  if (doExit) {
    timeout = setTimeout(gracefulExit, 3000);
  }
};

//
// ### @private function _getExceptionHandlers ()
// Returns the list of transports and exceptionHandlers
// for this instance.
//
Logger.prototype._getExceptionHandlers = function () {
  var self = this;

  return this._hnames.map(function (name) {
    return self.exceptionHandlers[name];
  }).concat(this._names.map(function (name) {
    return self.transports[name].handleExceptions && self.transports[name];
  })).filter(Boolean);
};

//
// ### @private function _onError (transport, err)
// #### @transport {Object} Transport on which the error occured
// #### @err {Error} Error that occurred on the transport
// Bubbles the error, `err`, that occured on the specified `transport`
// up from this instance if `emitErrs` has been set.
//
Logger.prototype._onError = function (transport, err) {
  if (this.emitErrs) {
    this.emit('error', err, transport);
  }
};
