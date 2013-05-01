var burrito = require('burrito');
var json = require('jsonify');

var src = [
    'function f () { g() }',
    'function g () { h() }',
    'function h () { throw "moo" + Array(x).join("!") }',
    'var x = 4',
    'f()'
].join('\r\n');

window.onload = function () {
    burrito(src, function (node) {
        document.body.innerHTML += node.name + '<br>\n';
    });
};
if (document.readyState === 'complete') window.onload();
