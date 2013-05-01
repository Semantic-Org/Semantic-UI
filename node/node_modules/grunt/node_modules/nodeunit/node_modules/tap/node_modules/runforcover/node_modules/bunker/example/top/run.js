var bunker = require('bunker');
var fs = require('fs');
var src = fs.readFileSync(__dirname + '/src.js', 'utf8');

var counts = {};

var b = bunker(src);
b.on('node', function (node) {
    if (!counts[node.id]) {
        counts[node.id] = { times : 0, node : node };
    }
    counts[node.id].times ++;
});

b.run({
    setInterval : setInterval,
    clearInterval : clearInterval,
    end : function () {
        Object.keys(counts)
            .sort(function (a, b) {
                return counts[b].times - counts[a].times
            })
            .forEach(function (key) {
                var count = counts[key];
                console.log(
                    count.times + ' : ' + count.node.source()
                );
            })
        ;
    }
});
