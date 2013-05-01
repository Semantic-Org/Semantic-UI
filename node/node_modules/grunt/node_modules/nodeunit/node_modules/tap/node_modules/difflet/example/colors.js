var diff = require('../')({ indent : 2 });

var prev = {
    yy : 6,
    zz : 5,
    a : [1,2,3],
    fn : 'beep',
    c : { x : 7, z : 3 }
};

var next = {
    a : [ 1, 2, "z", /beep/, new Buffer(3) ],
    fn : function qqq () {},
    b : [5,6,7],
    c : { x : 8, y : 5 }
};

diff(prev, next).pipe(process.stdout);
