var http = require('http');
var charmer = require('../');

http.createServer(function (req, res) {
    res.setHeader('content-type', 'text/ansi');
    
    var charm = charmer(res);
    charm.reset();
    
    var radius = 10;
    var theta = 0;
    var points = [];

    var iv = setInterval(function () {
        var x = 2 + (radius + Math.cos(theta) * radius) * 2;
        var y = 2 + radius + Math.sin(theta) * radius;
        
        points.unshift([ x, y ]);
        var colors = [ 'red', 'yellow', 'green', 'cyan', 'blue', 'magenta' ];
        
        points.forEach(function (p, i) {
            charm.position(p[0], p[1]);
            var c = colors[Math.floor(i / 12)];
            charm.background(c).write(' ')
        });
        points = points.slice(0, 12 * colors.length - 1);
        
        theta += Math.PI / 40;
    }, 50);
    
    req.connection.on('end', function () {
        clearInterval(iv);
        charm.destroy();
    });
}).listen(8081);
