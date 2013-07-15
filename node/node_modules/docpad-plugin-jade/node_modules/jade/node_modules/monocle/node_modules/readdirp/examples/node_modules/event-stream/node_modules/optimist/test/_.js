var spawn = require('child_process').spawn;
var assert = require('assert');

exports.dotSlashEmpty = function () {
    testCmd('./bin.js', []);
};

exports.dotSlashArgs = function () {
    testCmd('./bin.js', [ 'a', 'b', 'c' ]);
};

exports.nodeEmpty = function () {
    testCmd('node bin.js', []);
};

exports.nodeArgs = function () {
    testCmd('node bin.js', [ 'x', 'y', 'z' ]);
};

exports.whichNodeEmpty = function () {
    var which = spawn('which', ['node']);
    
    which.stdout.on('data', function (buf) {
        testCmd(buf.toString().trim() + ' bin.js', []);
    });
    
    which.stderr.on('data', function (err) {
        assert.fail(err.toString());
    });
};

exports.whichNodeArgs = function () {
    var which = spawn('which', ['node']);
    
    which.stdout.on('data', function (buf) {
        testCmd(buf.toString().trim() + ' bin.js', [ 'q', 'r' ]);
    });
    
    which.stderr.on('data', function (err) {
        assert.fail(err.toString());
    });
};

function testCmd (cmd, args) {
    var to = setTimeout(function () {
        assert.fail('Never got stdout data.')
    }, 5000);
    
    var oldDir = process.cwd();
    process.chdir(__dirname + '/_');
    
    var cmds = cmd.split(' ');
    
    var bin = spawn(cmds[0], cmds.slice(1).concat(args.map(String)));
    process.chdir(oldDir);
    
    bin.stderr.on('data', function (err) {
        assert.fail(err.toString());
    });
    
    bin.stdout.on('data', function (buf) {
        clearTimeout(to);
        var _ = JSON.parse(buf.toString());
        assert.eql(_.map(String), args.map(String));
    });
}
