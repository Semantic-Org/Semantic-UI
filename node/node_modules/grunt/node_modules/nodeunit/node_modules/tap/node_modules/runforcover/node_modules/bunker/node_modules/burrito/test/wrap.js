var test = require('tap').test;
var burrito = require('../');
var vm = require('vm');

test('preserve ternary parentheses', function (t) {
    var originalSource = '"anything" + (x ? y : z) + "anything"';
    var burritoSource = burrito(originalSource, function (node) {
        // do nothing. we just want to check that ternary parens are persisted
    });
    
    var ctxt = {
        x : false,
        y : 'y_'+~~(Math.random()*10),
        z : 'z_'+~~(Math.random()*10)
    };
    
    var expectedOutput = vm.runInNewContext(originalSource, ctxt);
    var burritoOutput = vm.runInNewContext(burritoSource, ctxt);
    
    t.equal(burritoOutput, expectedOutput);
    
    ctxt.x = true;
    
    expectedOutput = vm.runInNewContext(originalSource, ctxt);
    burritoOutput = vm.runInNewContext(burritoSource, ctxt);
    
    t.equal(burritoOutput, expectedOutput);
    t.end();
});

test('wrap calls', function (t) {
    t.plan(20);
    var src = burrito('f() && g(h())\nfoo()', function (node) {
        if (node.name === 'call') node.wrap('qqq(%s)');
        if (node.name === 'binary') node.wrap('bbb(%s)');
        t.ok(node.state);
        t.equal(this, node.state);
    });
    
    var times = { bbb : 0, qqq : 0 };
    
    var res = [];
    vm.runInNewContext(src, {
        bbb : function (x) {
            times.bbb ++;
            res.push(x);
            return x;
        },
        qqq : function (x) {
            times.qqq ++;
            res.push(x);
            return x;
        },
        f : function () { return true },
        g : function (h) {
            t.equal(h, 7);
            return h !== 7
        },
        h : function () { return 7 },
        foo : function () { return 'foo!' },
    });
    
    t.same(res, [
        true, // f()
        7, // h()
        false, // g(h())
        false, // f() && g(h())
        'foo!', // foo()
    ]);
    t.equal(times.bbb, 1);
    t.equal(times.qqq, 4);
    t.end();
});

test('wrap fn', function (t) {
    var src = burrito('f(g(h(5)))', function (node) {
        if (node.name === 'call') {
            node.wrap(function (s) {
                return 'z(' + s + ')';
            });
        }
    });
    
    var times = 0;
    t.equal(
        vm.runInNewContext(src, {
            f : function (x) { return x + 1 },
            g : function (x) { return x + 2 },
            h : function (x) { return x + 3 },
            z : function (x) {
                times ++;
                return x * 10;
            },
        }),
        (((((5 + 3) * 10) + 2) * 10) + 1) * 10
    );
    t.equal(times, 3);
    t.end();
});

test('binary string', function (t) {
    var src = 'z(x + y)';
    var context = {
        x : 3,
        y : 4,
        z : function (n) { return n * 10 },
    };
    
    var res = burrito.microwave(src, context, function (node) {
        if (node.name === 'binary') {
            node.wrap('%a*2 - %b*2');
        }
    });
    
    t.equal(res, 10 * (3*2 - 4*2));
    t.end();
});

test('binary fn', function (t) {
    var src = 'z(x + y)';
    var context = {
        x : 3,
        y : 4,
        z : function (n) { return n * 10 },
    };
    
    var res = burrito.microwave(src, context, function (node) {
        if (node.name === 'binary') {
            node.wrap(function (expr, a, b) {
                return '(' + a + ')*2 - ' + '(' + b + ')*2';
            });
        }
    });
    
    t.equal(res, 10 * (3*2 - 4*2));
    t.end();
});

test('intersperse', function (t) {
    var src = '(' + (function () {
        f();
        g();
    }).toString() + ')()';
    
    var times = { f : 0, g : 0, zzz : 0 };
    
    var context = {
        f : function () { times.f ++ },
        g : function () { times.g ++ },
        zzz : function () { times.zzz ++ },
    };
    
    burrito.microwave(src, context, function (node) {
        if (node.name === 'stat') node.wrap('{ zzz(); %s }');
    });
    
    t.same(times, { f : 1, g : 1, zzz : 3 });
    t.end();
});
