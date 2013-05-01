var charm = require('../')(process);

function exit () {
    charm.display('reset');
    process.exit();
}
charm.on('^C', exit);

var ix = 0;
var iv = setInterval(function () {
    charm.background(ix++).write(' ');
    if (ix === 256) {
        clearInterval(iv);
        charm.write('\n');
        exit();
    }
}, 10);
