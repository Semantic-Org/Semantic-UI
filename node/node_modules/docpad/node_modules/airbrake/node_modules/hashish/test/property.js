var Hash = require('hashish');
var assert = require('assert');
var vm = require('vm');
var fs = require('fs');

var src = fs.readFileSync(__dirname + '/../index.js', 'utf8');

exports.defineGetter = function () {
    var context = {
        module : { exports : {} },
        Object : {
            keys : Object.keys,
            defineProperty : undefined,
        },
        require : require,
    };
    context.exports = context.module.exports;
    
    vm.runInNewContext('(function () {' + src + '})()', context);
    var Hash_ = context.module.exports;
    
    var times = 0;
    Hash_.__proto__.__proto__.__defineGetter__ = function () {
        times ++;
        return Object.__defineGetter__.apply(this, arguments);
    };
    
    assert.equal(vm.runInNewContext('Object.defineProperty', context), null);
    
    assert.deepEqual(
        Hash_({ a : 1, b : 2, c : 3 }).values,
        [ 1, 2, 3 ]
    );
    
    assert.ok(times > 5);
};

exports.defineProperty = function () {
    var times = 0;
    var context = {
        module : { exports : {} },
        Object : {
            keys : Object.keys,
            defineProperty : function (prop) {
                times ++;
                if (prop.get) throw new TypeError('engine does not support')
                assert.fail('should have asserted by now');
            },
        },
        require : require
    };
    context.exports = context.module.exports;
    
    vm.runInNewContext('(function () {' + src + '})()', context);
    var Hash_ = context.module.exports;
    
    Hash_.__proto__.__proto__.__defineGetter__ = function () {
        assert.fail('getter called when a perfectly good'
            + ' defineProperty was available'
        );
    };
    
    assert.deepEqual(
        Hash_({ a : 1, b : 2, c : 3 }).values,
        [ 1, 2, 3 ]
    );
    
    assert.equal(times, 1);
};
