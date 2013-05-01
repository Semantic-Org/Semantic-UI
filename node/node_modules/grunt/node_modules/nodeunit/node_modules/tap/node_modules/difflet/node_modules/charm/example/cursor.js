var charm = require('../')(process);

charm.position(5, 10);

charm.position(function (x, y) {
    console.dir([ x, y ]);
    
    charm.move(7,2);
    charm.push();
    process.stdout.write('lul');
    
    charm.left(3).up(1).foreground('magenta');
    process.stdout.write('v');
    charm.left(1).up(1).display('reset');
    process.stdout.write('|');
    
    charm.down(3);
    charm.pop().background('blue');
    process.stdout.write('popped\npow');
    charm.display('reset').erase('line');
    charm.destroy();
});
