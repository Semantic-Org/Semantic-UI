var charm = require('../')(process);

charm.write("Progress: 0 %");
var i = 0;

var increment = function () {
    charm.left(i.toString().length + 2);
    i = i + 1;
    charm.write(i + " %");
    if (i === 100) {
        charm.write("\nDone!\n");
        process.exit();
    }
};

var loop = setInterval(increment, 50);

charm.on('^C',process.exit);

