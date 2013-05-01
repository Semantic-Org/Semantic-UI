var bunker = require('bunker');
var b = bunker('(' + function () {
    function beep () {
        var x = 0;
        for (var i = 0; i < 1000; i++) {
            for (var j = 0; j < 100; j++) {
                x += j;
            }
        }
        return x;
    }
    
    beep();
    
} + ')()');

var counts = {};

b.on('node', function (node) {
    if (!counts[node.id]) {
        counts[node.id] = { times : 0, node : node, elapsed : 0 };
    }
    counts[node.id].times ++;
    
    var now = Date.now();
    
    if (last.id !== undefined) {
        counts[last.id].elapsed += last.
    }
    
    if (node.name === 'call') {
        var start = now;
        
        last.id = node.id;
        counts[node.id].elapsed += Date.now() - start;
    }
    else {
        counts[node.id].elapsed += now - last;
        last = now;
    }
});

b.run();

Object.keys(counts).forEach(function (key) {
    var count = counts[key];
    console.log(
        [ count.times, count.node.source(), count.elapsed ]
            .join(' : ')
    );
});
