var burrito = require('../');
var test = require('tap').test;
var fs = require('fs');
var src = fs.readFileSync(__dirname + '/fail/src.js', 'utf8');

test('fail', function (t) {
    burrito(src, function (node) {});
    t.end();
});
