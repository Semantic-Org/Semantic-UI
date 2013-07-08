var Hash = require('hashish');
var optimist = require('../index');
var assert = require('assert');

exports.usageFail = function () {
    var r = checkUsage(function () {
        return optimist('-x 10 -z 20'.split(' '))
            .usage('Usage: $0 -x NUM -y NUM')
            .demand(['x','y'])
            .argv;
    });
    assert.deepEqual(
        r.result,
        { x : 10, z : 20, _ : [], $0 : './usage' }
    );
    
    assert.deepEqual(
        r.errors.join('\n').split(/\n+/),
        [
            'Usage: ./usage -x NUM -y NUM',
            'Options:',
            '  -x  [required]',
            '  -y  [required]',
            'Missing required arguments: y',
        ]
    );
    assert.deepEqual(r.logs, []);
    assert.ok(r.exit);
};

exports.usagePass = function () {
    var r = checkUsage(function () {
        return optimist('-x 10 -y 20'.split(' '))
            .usage('Usage: $0 -x NUM -y NUM')
            .demand(['x','y'])
            .argv;
    });
    assert.deepEqual(r, {
        result : { x : 10, y : 20, _ : [], $0 : './usage' },
        errors : [],
        logs : [],
        exit : false,
    });
};

exports.checkPass = function () {
    var r = checkUsage(function () {
        return optimist('-x 10 -y 20'.split(' '))
            .usage('Usage: $0 -x NUM -y NUM')
            .check(function (argv) {
                if (!('x' in argv)) throw 'You forgot about -x';
                if (!('y' in argv)) throw 'You forgot about -y';
            })
            .argv;
    });
    assert.deepEqual(r, {
        result : { x : 10, y : 20, _ : [], $0 : './usage' },
        errors : [],
        logs : [],
        exit : false,
    });
};

exports.checkFail = function () {
    var r = checkUsage(function () {
        return optimist('-x 10 -z 20'.split(' '))
            .usage('Usage: $0 -x NUM -y NUM')
            .check(function (argv) {
                if (!('x' in argv)) throw 'You forgot about -x';
                if (!('y' in argv)) throw 'You forgot about -y';
            })
            .argv;
    });
    
    assert.deepEqual(
        r.result,
        { x : 10, z : 20, _ : [], $0 : './usage' }
    );
    
    assert.deepEqual(
        r.errors.join('\n').split(/\n+/),
        [
            'Usage: ./usage -x NUM -y NUM',
            'You forgot about -y'
        ]
    );
    
    assert.deepEqual(r.logs, []);
    assert.ok(r.exit);
};

exports.checkCondPass = function () {
    function checker (argv) {
        return 'x' in argv && 'y' in argv;
    }
    
    var r = checkUsage(function () {
        return optimist('-x 10 -y 20'.split(' '))
            .usage('Usage: $0 -x NUM -y NUM')
            .check(checker)
            .argv;
    });
    assert.deepEqual(r, {
        result : { x : 10, y : 20, _ : [], $0 : './usage' },
        errors : [],
        logs : [],
        exit : false,
    });
};

exports.checkCondFail = function () {
    function checker (argv) {
        return 'x' in argv && 'y' in argv;
    }
    
    var r = checkUsage(function () {
        return optimist('-x 10 -z 20'.split(' '))
            .usage('Usage: $0 -x NUM -y NUM')
            .check(checker)
            .argv;
    });
    
    assert.deepEqual(
        r.result,
        { x : 10, z : 20, _ : [], $0 : './usage' }
    );
    
    assert.deepEqual(
        r.errors.join('\n').split(/\n+/).join('\n'),
        'Usage: ./usage -x NUM -y NUM\n'
        + 'Argument check failed: ' + checker.toString()
    );
    
    assert.deepEqual(r.logs, []);
    assert.ok(r.exit);
};

exports.countPass = function () {
    var r = checkUsage(function () {
        return optimist('1 2 3 --moo'.split(' '))
            .usage('Usage: $0 [x] [y] [z] {OPTIONS}')
            .demand(3)
            .argv;
    });
    assert.deepEqual(r, {
        result : { _ : [ '1', '2', '3' ], moo : true, $0 : './usage' },
        errors : [],
        logs : [],
        exit : false,
    });
};

exports.countFail = function () {
    var r = checkUsage(function () {
        return optimist('1 2 --moo'.split(' '))
            .usage('Usage: $0 [x] [y] [z] {OPTIONS}')
            .demand(3)
            .argv;
    });
    assert.deepEqual(
        r.result,
        { _ : [ '1', '2' ], moo : true, $0 : './usage' }
    );
    
    assert.deepEqual(
        r.errors.join('\n').split(/\n+/),
        [
            'Usage: ./usage [x] [y] [z] {OPTIONS}',
            'Not enough non-option arguments: got 2, need at least 3',
        ]
    );
    
    assert.deepEqual(r.logs, []);
    assert.ok(r.exit);
};

exports.defaultSingles = function () {
    var r = checkUsage(function () {
        return optimist('--foo 50 --baz 70 --powsy'.split(' '))
            .default('foo', 5)
            .default('bar', 6)
            .default('baz', 7)
            .argv
        ;
    });
    assert.eql(r.result, {
        foo : '50',
        bar : 6,
        baz : '70',
        powsy : true,
        _ : [],
        $0 : './usage',
    });
};

exports.defaultHash = function () {
    var r = checkUsage(function () {
        return optimist('--foo 50 --baz 70'.split(' '))
            .default({ foo : 10, bar : 20, quux : 30 })
            .argv
        ;
    });
    assert.eql(r.result, {
        foo : '50',
        bar : 20,
        baz : 70,
        quux : 30,
        _ : [],
        $0 : './usage',
    });
};

exports.rebase = function () {
    assert.equal(
        optimist.rebase('/home/substack', '/home/substack/foo/bar/baz'),
        './foo/bar/baz'
    );
    assert.equal(
        optimist.rebase('/home/substack/foo/bar/baz', '/home/substack'),
        '../../..'
    );
    assert.equal(
        optimist.rebase('/home/substack/foo', '/home/substack/pow/zoom.txt'),
        '../pow/zoom.txt'
    );
};

function checkUsage (f) {
    var _process = process;
    process = Hash.copy(process);
    var exit = false;
    process.exit = function () { exit = true };
    process.env = Hash.merge(process.env, { _ : 'node' });
    process.argv = [ './usage' ];
    
    var errors = [];
    var logs = [];
    
    console._error = console.error;
    console.error = function (msg) { errors.push(msg) };
    console._log = console.log;
    console.log = function (msg) { logs.push(msg) };
    
    var result = f();
    
    process = _process;
    console.error = console._error;
    console.log = console._log;
    
    return {
        errors : errors,
        logs : logs,
        exit : exit,
        result : result,
    };
};
