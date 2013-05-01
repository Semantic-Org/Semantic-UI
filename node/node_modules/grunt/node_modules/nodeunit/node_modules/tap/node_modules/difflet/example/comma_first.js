var diff = require('../')({
    indent : 2,
    comma : 'first',
});

var prev = { yy : 6, zz : 5, a : [1,2,3] };
var next = {
    a : [ 1, 2, 3, [4], "z", /beep/, new Buffer(3) ],
    fn : 8,
    b : [5,6,7]
};
diff(prev, next).pipe(process.stdout);
