'use strict';


var esprima = require('esprima');


var NIL  = require('../../common').NIL;
var Type = require('../../type');


function resolveJavascriptFunction(object /*, explicit*/) {
  /*jslint evil:true*/

  try {
    var source = '(' + object + ')',
        ast    = esprima.parse(source, { range: true }),
        params = [],
        body;

    if ('Program'             !== ast.type         ||
        1                     !== ast.body.length  ||
        'ExpressionStatement' !== ast.body[0].type ||
        'FunctionExpression'  !== ast.body[0].expression.type) {
      return NIL;
    }

    ast.body[0].expression.params.forEach(function (param) {
      params.push(param.name);
    });

    body = ast.body[0].expression.body.range;

    // Esprima's ranges include the first '{' and the last '}' characters on
    // function expressions. So cut them out.
    return new Function(params, source.slice(body[0]+1, body[1]-1));
  } catch (err) {
    return NIL;
  }
}


function representJavascriptFunction(object /*, style*/) {
  return object.toString();
}


module.exports = new Type('tag:yaml.org,2002:js/function', {
  loader: {
    kind: 'string',
    resolver: resolveJavascriptFunction
  },
  dumper: {
    kind: 'function',
    representer: representJavascriptFunction,
  }
});
