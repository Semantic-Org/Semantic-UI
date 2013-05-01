var traverse = require('../');
var assert = require('assert');

exports.subexpr = function () {
    var obj = [ 'a', 4, 'b', 5, 'c', 6 ];
    var r = traverse(obj).map(function (x) {
        if (typeof x === 'number') {
            this.update([ x - 0.1, x, x + 0.1 ], true);
        }
    });
    
    assert.deepEqual(obj, [ 'a', 4, 'b', 5, 'c', 6 ]);
    assert.deepEqual(r, [
        'a', [ 3.9, 4, 4.1 ],
        'b', [ 4.9, 5, 5.1 ],
        'c', [ 5.9, 6, 6.1 ],
    ]);
};

exports.block = function () {
    var obj = [ [ 1 ], [ 2 ], [ 3 ] ];
    var r = traverse(obj).map(function (x) {
        if (Array.isArray(x) && !this.isRoot) {
            if (x[0] === 5) this.block()
            else this.update([ [ x[0] + 1 ] ])
        }
    });
    
    assert.deepEqual(r, [
        [ [ [ [ [ 5 ] ] ] ] ],
        [ [ [ [ 5 ] ] ] ],
        [ [ [ 5 ] ] ],
    ]);
};
