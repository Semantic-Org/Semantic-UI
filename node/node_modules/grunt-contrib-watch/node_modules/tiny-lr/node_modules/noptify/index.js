
var fs     = require('fs');
var path   = require('path');
var nopt   = require('nopt');
var util   = require('./util');
var events = require('events');

var collectable = require('./actions/collectable');
var commandable = require('./actions/commandable');

module.exports = noptify;
noptify.Noptify = Noptify;

// noptify is a little wrapper around `nopt` module adding a more expressive,
// commander-like, API and few helpers.
//
// Examples
//
//     var program = noptify(process.argv, { program: 'name' })
//       .version('0.0.1')
//       .option('port', '-p', 'Port to listen on (default: 35729)', Number)
//       .option('pid', 'Path to the generated PID file', String)
//
//     var opts = program.parse();
//
// Returns an instance of `Noptify`
function noptify(args, options) {
  return new Noptify(args, options);
}

// Noptify provides the API to parse out option, shorthands and generate the
// proper generic help output.
//
// - args     - The Array of arguments to parse (default: `process.argv`);
// - options  - An hash of options with the following properties
//  - program - The program name to use in usage output
//
// Every noptify instance is created with two options, `-h, --help` and `-v,
// --version`.
function Noptify(args, options) {
  events.EventEmitter.call(this);
  options = this.options = options || {};
  this.args = args || process.argv;
  this._program = options.program || (path.basename(this.args[this.args[0] === 'node' ? 1 : 0]));

  this._shorthands = {};
  this._commands = {};
  this._routes = [];
  this._steps = [];
  this.nopt = {};

  this.option('help', '-h', 'Show help usage');
  this.option('version', '-v', 'Show package version');
}

util.inherits(Noptify, events.EventEmitter);

// Inherits from each actions' mixins
//
// XXX: consider making it optional? with a `.use()` method?
util.extend(Noptify.prototype, collectable);
util.extend(Noptify.prototype, commandable);


// Parse the provided options and shorthands, pass them through `nopt` and
// return the result.
//
// When `opts.help` is set, the help output is displayed and `help`
// event is emitted. The process exists with `0` status, the help output is
// automatically displayed and the `help` event is emitted.
//
// Examples
//
//    var program = noptify(['foo', '--help'])
//      .on('help', function() {
//        console.log('Examples');
//        console.log('');
//        console.log('  foo bar --baz > foo.txt');
//      });
//
//    var opts = program.parse();
//    // ... Help output ...
//    // ... Custom help output ...
//    // ... Exit ...
//
//
Noptify.prototype.parse = function parse(argv, position) {
  argv = argv || this.args;
  var options = this._options.reduce(function(opts, opt) {
    opts[opt.name] = opt.type;
    return opts;
  }, {});

  this._options.forEach(function(opt) {
    if(!opt.shorthand) return;
    this.shorthand(opt.shorthand, '--' + opt.name);
  }, this);

  var opts = nopt(options, this._shorthands, argv, position);
  if(opts.version) {
    console.log(this._version);
    process.exit(0);
  }

  var registered = this.registered(opts.argv.remain);
  if(opts.help) {
    if(registered && registered.help) {
      registered.help().emit('help');
    } else {
      this.help().emit('help');
    }

    process.exit(0);
  }

  this.nopt = opts;

  // check remaining args and registered command, for each match, remove the
  // argument from remaining args and trigger the handler, ideally the handler
  // can be another subprogram, for now simple functions

  if(this.routeCommand) process.nextTick(this.routeCommand.bind(this));
  if(this.stdin && this._readFromStdin) process.nextTick(this.stdin.bind(this));
  return opts;
};

// Define the program version.
Noptify.prototype.version = function version(ver) {
  this._version = ver;
  return this;
};

// Define the program property.
Noptify.prototype.program = function program(value) {
  this._program = value || '';
  return this;
};

// Define `name` option with optional shorthands, optional description and optional type.
Noptify.prototype.option = function option(name, shorthand, description, type) {
  this._options = this._options || [];
  if(!description) {
    description = shorthand;
    shorthand = '';
  }

  if(!type) {
    if(typeof description === 'function') {
      type = description;
      description = shorthand;
      shorthand = '';
    } else {
      type = String;
    }
  }

  shorthand = shorthand.replace(/^-*/, ''),

  this._options.push({
    name: name,
    shorthand: shorthand.replace(/^-*/, ''),
    description: description || (name + ': ' + type.name),
    usage: (shorthand ? '-' + shorthand + ', ': '' ) + '--' + name,
    type: type
  });

  return this;
};

// Stores the given `shorthands` Hash of options to be `parse()`-d by nopt
// later on.

Noptify.prototype.shorthand =
Noptify.prototype.shorthands = function shorthands(options, value) {
  if(typeof options === 'string' && value) {
    this._shorthands[options] = value;
    return this;
  }

  Object.keys(options).forEach(function(shorthand) {
    this._shorthands[shorthand] = options[shorthand];
  }, this);
  return this;
};

// Simply output to stdout the Usage and Help output.
Noptify.prototype.help = function help() {
  var buf = '';
  buf += '\n  Usage: ' + this._program + ' [options]';
  buf += '\n';
  buf += '\n  Options:\n';

  var maxln = Math.max.apply(Math, this._options.map(function(opts) {
    return opts.usage.length;
  }));

  var options = this._options.map(function(opts) {
    return '    ' + pad(opts.usage, maxln + 5) + '\t- ' + opts.description;
  });

  buf += options.join('\n');

  // part of help input ? --list-shorthands ?
  var shorthands = Object.keys(this._shorthands);
  if(shorthands.length) {
    buf += '\n\n  Shorthands:\n';
    maxln = Math.max.apply(Math, Object.keys(this._shorthands).map(function(key) {
      return key.length;
    }));
    buf += Object.keys(this._shorthands).map(function(shorthand) {
      return '    --' + pad(shorthand, maxln + 1) + '\t\t' + this._shorthands[shorthand];
    }, this).join('\n');
  }

  buf += '\n';

  console.log(buf);
  return this;
};

// Helpers

// command API

Noptify.prototype.run = function run(fn) {
  if(fn) {
    this._steps.push(fn);
    return this;
  }

  if(!this.nopt.argv) return this.parse();

  var steps = this._steps;
  var self = this;
  (function next(step) {
    if(!step) return;
    var async = /function\s*\(\w+/.test(step + '');
    if(!async) {
      step();
      return next(steps.shift());
    }

    step(function(err) {
      if(err) return self.emit('error', err);
      next(steps.shift());
    });
  })(steps.shift());
};

function pad(str, max) {
  var ln = max - str.length;
  return ln > 0 ? str + new Array(ln).join(' ') : str;
}
