/*
  A console.log that won't leave you hanging when node exits
  90% of this file was ripped from node.js

  License: see: https://github.com/joyent/node/blob/master/lib/console.js
 */

 // console object
var formatRegExp = /%[sdj]/g;
function format(f) {
  var util = require('util');

  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(util.inspect(arguments[i]));
    }
    return objects.join(' ');
  }


  var i = 1;
  var args = arguments;
  var str = String(f).replace(formatRegExp, function(x) {
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });
  for (var len = args.length, x = args[i]; i < len; x = args[++i]) {
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + util.inspect(x);
    }
  }
  return str;
}

console.log = function() {
  var res = process.stdout.write(format.apply(this, arguments) + '\n');

  // this is the first time stdout got backed up
  if (!res && !process.stdout.pendingWrite) {
     process.stdout.pendingWrite = true;

     // magic sauce: keep node alive until stdout has flushed
     process.stdout.once('drain', function () {
       process.stdout.draining = false;
     });
  }
};
