var bunker = require('bunker');
var b = bunker('var x = 0; for (var i = 0; i < 30; i++) { x++ }');

var counts = {};

b.on('node', function (node) {
    if (!counts[node.id]) {
        counts[node.id] = { times : 0, node : node };
    }
    counts[node.id].times ++;
});

b.run();

Object.keys(counts).forEach(function (key) {
    var count = counts[key];
    console.log(count.times + ' : ' + count.node.source());
});
