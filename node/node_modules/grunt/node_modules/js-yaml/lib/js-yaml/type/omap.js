'use strict';


var NIL  = require('../common').NIL;
var Type = require('../type');


var _hasOwnProperty = Object.prototype.hasOwnProperty;
var _toString       = Object.prototype.toString;


function resolveYamlOmap(object /*, explicit*/) {
  var objectKeys = [], index, length, pair, pairKey, pairHasKey;

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;

    if ('[object Object]' !== _toString.call(pair)) {
      return NIL;
    }

    for (pairKey in pair) {
      if (_hasOwnProperty.call(pair, pairKey)) {
        if (!pairHasKey) {
          pairHasKey = true;
        } else {
          return NIL;
        }
      }
    }

    if (!pairHasKey) {
      return NIL;
    }

    if (-1 === objectKeys.indexOf(pairKey)) {
      objectKeys.push(pairKey);
    } else {
      return NIL;
    }
  }

  return object;
}


module.exports = new Type('tag:yaml.org,2002:omap', {
  loader: {
    kind: 'array',
    resolver: resolveYamlOmap
  }
});
