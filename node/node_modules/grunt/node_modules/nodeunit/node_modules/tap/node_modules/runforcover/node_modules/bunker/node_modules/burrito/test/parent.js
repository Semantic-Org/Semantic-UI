var test = require('tap').test;
var burrito = require('../');

test('check parent', function (t) {
    t.plan(5);
    var src = 'Math.tan(0) + Math.sin(0)';
    
    var res = burrito.microwave(src, function (node) {
        if (node.name === 'binary') {
            node.wrap('%a - %b');
        }
        else if (node.name === 'num') {
            t.equal(node.parent().value[0][0], 'dot');
            
            var fn = node.parent().value[0][2];
            if (fn === 'sin') {
                node.wrap('Math.PI / 2');
            }
            else if (fn === 'tan') {
                node.wrap('Math.PI / 4');
            }
            else t.fail('Unknown fn');
        }
    });
    
    t.equal(res, Math.tan(Math.PI / 4) - Math.sin(Math.PI / 2)); // ~ 0
});
