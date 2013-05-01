var test = require('tap').test;
var burrito = require('../');

test('microwave', function (t) {
    t.plan(4);
    
    var context = {
        f : function (x) { return x + 1 },
        g : function (x) { return x + 2 },
        h : function (x) { return x + 3 },
        z : function (x) {
            t.ok(true); // 3 times
            return x * 10;
        },
    };
    
    var res = burrito.microwave('f(g(h(5)))', context, function (node) {
        if (node.name === 'call') {
            node.wrap(function (s) {
                return 'z(' + s + ')';
            });
        }
    });
    
    t.equal(res, (((((5 + 3) * 10) + 2) * 10) + 1) * 10);
});

test('empty context', function (t) {
    var res = burrito.microwave('Math.sin(2)', function (node) {
        if (node.name === 'num') node.wrap('Math.PI / %s');
    });
    t.equal(res, 1);
    t.end();
});
