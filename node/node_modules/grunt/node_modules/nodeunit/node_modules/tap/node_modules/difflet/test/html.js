var difflet = require('../');
var test = require('tap').test;
var ent = require('ent');

var tags = {
    inserted : 'g',
    updated : 'b',
    deleted : 'r',
};

test('html output', function (t) {
    t.plan(1);
    var diff = difflet({
        start : function (t, s) {
            s.write('<' + tags[t] + '>');
        },
        stop : function (t, s) {
            s.write('</' + tags[t] + '>');
        },
        write : function (buf, s) {
            s.write(ent.encode(buf));
        }
    });
    
    var stream = diff(
        { yy : 6, zz : 5, a : [1,2,3], fn : function qqq () {} },
        {
            a : [ 1, 2, 3, [4], "z", /beep/, new Buffer([0,1,2]) ],
            fn : function rrr () {},
            b : [5,6,7]
        }
    );
    
    var data = ''
    stream.on('data', function (buf) { data += buf });
    stream.on('end', function () {
        t.equal(data,
            '{&quot;a&quot;:[1,2,3,<g>[4]</g>,<g>&quot;z&quot;</g>,'
            + '<g>/beep/</g>,<g>&lt;Buffer 00 01 02&gt;</g>],'
            + '&quot;fn&quot;:<b>[Function: rrr]</b>,<g>'
            + '&quot;b&quot;:[5,6,7]</g>,<r>&quot;yy&quot;:6,'
            + '&quot;zz&quot;:5</r>}'
        );
        t.end();
    });
});

test('compare html output', function (t) {
    t.plan(1);
    
    var diff = difflet({
        start : function (t, s) {
            s.write('<' + tags[t] + '>');
        },
        stop : function (t, s) {
            s.write('</' + tags[t] + '>');
        },
        write : function (buf, s) {
            s.write(ent.encode(buf));
        }
    });
    
    var data = diff.compare(
        { yy : 6, zz : 5, a : [1,2,3], fn : function qqq () {} },
        {
            a : [ 1, 2, 3, [4], "z", /beep/, new Buffer([0,1,2]) ],
            fn : function rrr () {},
            b : [5,6,7]
        }
    );
    
    t.equal(data,
        '{&quot;a&quot;:[1,2,3,<g>[4]</g>,<g>&quot;z&quot;</g>,'
        + '<g>/beep/</g>,<g>&lt;Buffer 00 01 02&gt;</g>],'
        + '&quot;fn&quot;:<b>[Function: rrr]</b>,<g>'
        + '&quot;b&quot;:[5,6,7]</g>,<r>&quot;yy&quot;:6,'
        + '&quot;zz&quot;:5</r>}'
    );
    t.end();
});
