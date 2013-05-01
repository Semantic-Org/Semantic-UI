var difflet = require('../');
var ent = require('ent');

var tags = {
    inserted : '<span class="g">',
    updated : '<span class="b">',
    deleted : '<span class="r">',
};
var diff = difflet({
    start : function (t, s) {
        s.write(tags[t]);
    },
    stop : function (t, s) {
        s.write('</span>');
    },
    write : function (buf) {
        stream.write(ent.encode(buf))
    },
});

var prev = {
    yy : 6,
    zz : 5,
    a : [1,2,3],
    fn : function qq () {}
};
var next = {
    a : [ 1, 2, 3, [4], "z", /beep/, new Buffer([0,1,2]) ],
    fn : 'I <3 robots',
    b : [5,6,7]
};

var stream = diff(prev, next);
stream.pipe(process.stdout, { end : false });
