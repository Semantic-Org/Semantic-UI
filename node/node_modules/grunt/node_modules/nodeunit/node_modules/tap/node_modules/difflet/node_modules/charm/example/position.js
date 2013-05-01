var charm = require('charm')(process);

charm.on('^C', process.exit);

charm.position(function (x, y) {
    console.log('(%d, %d)', x, y);
});
