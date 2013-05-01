var test = require('tap').test;
var bunker = require('../');

test('cover', function (t) {
    t.plan(1);
    
    var b = bunker('(' + function () {
        function foo () {}
        function bar () {}
        
        (function () {
            return foo();
        })();
    } + ')()');
    var counts = {};
    
    b.on('node', function (node) {
        counts[node.name] = (counts[node.name] || 0) + 1;
    });
    b.run();
    
    process.nextTick(function () {
        t.same(counts, {
            stat : 2,
            call : 2,
            return : 1,
        });
    });
});
