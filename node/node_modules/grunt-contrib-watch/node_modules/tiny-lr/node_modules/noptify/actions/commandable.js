var nopt = require('nopt');

// Commandable Mixin
//
// Provides API to route arbitrary routes or register command / sub commands /
// sub programs.
var commandable = module.exports;

// XXX: tomdocify, generate in readme

commandable.cmd =
commandable.command = function command(name, fn) {
  this._commands[name] = fn;
  var commandable = fn && fn.command && fn.route && fn.parse;
  this.on(name, commandable ? function(args, opts, position) {
    fn.parse(args, position);
  } : fn);
  return this;
};

commandable.route = function route(pattern, fn) {
  pattern = pattern instanceof RegExp ? pattern : new RegExp('^' + pattern + '$');
  this._routes.push({
    pattern: pattern,
    fn: fn
  });
  return this;
};

commandable.routeCommand = function routeCommand(opts) {
  opts = opts || this.nopt;
  var args = opts.argv.remain;
  var commands = Object.keys(this._commands);

  // firt try to find a route, then fallback to command
  var route = this._routes.filter(function(route) {
    return route.pattern.test(args.join(' '));
  });

  if(route.length) return route[0].fn();

  var first = 0
  var registered = args.filter(function(arg, i) {
    var match = ~commands.indexOf(arg);
    if(match) first = first || i;
    return match;
  });

  if(!registered[0]) return this.run();

  opts.argv.remain = args.slice(0, first);
  registered.forEach(function(command) {
    var position = opts.argv.original.indexOf(command) + 1;
    var options = nopt({}, {}, opts.argv.original, position);
    this.emit(command, options.argv.original, options, position);
  }, this);
};


commandable.registered = function(args) {
  var commands = Object.keys(this._commands);
  var registered = args.filter(function(arg, i) {
    return ~commands.indexOf(arg);
  });

  return registered.length ? this._commands[registered] : false;
};

