
/**
 * Module dependencies.
 */

var express = require('./')
  , app = express()

module.exports = stringify;

function getSerialize (fn) {
var seen = [];
return function(key, value) {
  var ret = value;
  if (typeof value === 'object' && value) {
    if (seen.indexOf(value) !== -1)
      ret = '[Circular]';
    else
      seen.push(value);
  }
  if (fn) ret = fn(key, ret);
  return ret;
}
}

function stringify(obj, fn, spaces) {
return JSON.stringify(obj, getSerialize(fn), spaces);
}

stringify.getSerialize = getSerialize;


app.get('/', function(req, res){
  console.log(stringify(req));
  console.log(req.params);
});

app.listen(5555);
console.log('listening on 5555');
