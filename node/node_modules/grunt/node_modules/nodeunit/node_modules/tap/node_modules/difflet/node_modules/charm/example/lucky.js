var charm = require('../')(process);
charm.reset();

var colors = [ 'red', 'cyan', 'yellow', 'green', 'blue' ];
var text = 'Always after me lucky charms.';

var offset = 0;
var iv = setInterval(function () {
    var y = 0, dy = 1;
    for (var i = 0; i < 40; i++) {
        var color = colors[(i + offset) % colors.length];
        var c = text[(i + offset) % text.length];
        charm
            .move(1, dy)
            .foreground(color)
            .write(c)
        ;
        y += dy;
        if (y <= 0 || y >= 5) dy *= -1;
    }
    charm.position(0, 1);
    offset ++;
}, 150);
 
charm.on('data', function (buf) {
    if (buf[0] === 3) {
        clearInterval(iv);
        charm.destroy();
    }
});
