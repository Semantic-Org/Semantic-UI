var test = require('tap').test;
var burrito = require('../');

test('wrap error', function (t) {
    t.plan(6);
    
    try {
        var src = burrito('f() && g()', function (node) {
            if (node.name === 'binary') node.wrap('h(%a, %b')
        });
        t.fail('should have blown up');
    }
    catch (err) {
        t.ok(err.message.match(/unexpected/i));
        t.ok(err instanceof SyntaxError);
        t.ok(!err.stack.match(/uglify-js/));
        t.equal(err.line, 0);
        t.equal(err.col, 10);
        t.equal(err.pos, 10);
    }
});

test('non string', function (t) {
    t.plan(3);
    
    t.throws(function () {
        burrito.parse(new Buffer('[]'));
    });
    
    t.throws(function () {
        burrito.parse(new String('[]'));
    });
    
    t.throws(function () {
        burrito.parse();
    });
});

test('syntax error', function (t) {
    t.plan(3);
    try {
        var src = burrito('f() && g())', function (node) {
            if (node.name === 'binary') node.wrap('h(%a, %b)')
        });
        assert.fail('should have blown up');
    }
    catch (err) {
        t.ok(err.message.match(/unexpected/i));
        t.ok(err instanceof SyntaxError);
        t.ok(!err.stack.match(/uglify-js/));
    }
});
