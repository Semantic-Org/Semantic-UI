'use strict';

var util     =  require('util')
  , through  =  require('through')
  , toString =  Object.prototype.toString
  , slice    =  Array.prototype.slice;

function blowup () {
  throw new Error('Argument to streamTap needs to be either Number for depth or a log Function');
}

function defaultLog (depth) {
  function log (data) {
    console.log(util.inspect(data, false, depth, true));
  }

  return function (data) {
    if (arguments.length === 1) {
      log(data);
    } else {
      slice.call(arguments).forEach(log);
    }
  };
}

// invoke three ways:
//  tap ()
//  tap (depth)
//  tap (log)
function tap (arg0) {
  var log;

  if (!arguments.length) {
    log = defaultLog(1);
  } else {

    if (toString.call(arg0) === '[object Number]' ) {
      log = defaultLog(arg0);
    } else if (toString.call(arg0) === '[object Function]' ) {
      log = arg0;
    } else {
      blowup();
    }

  }

  return through(
    function write (data) {
      log(data);
      this.emit('data', data);
    }
  );

}

module.exports = tap;
