var testCase = require('nodeunit').testCase;
var fs = require('fs');
var wrench = require('../lib/wrench');
var path = require('path');


function checkResult(test, files) {
    var check = [
            'bar.txt',
            'foo',
            path.join('foo', 'bar'),
            path.join('foo', 'dolor.md'),
            path.join('foo', 'lorem.txt'),
            path.join('foo', 'bar', 'ipsum.js')
        ];

    test.deepEqual(files, check);

    test.done();
}

module.exports = testCase({
    test_readdirSyncRecursive: function(test) {
        var dir = path.join(__dirname, 'readdir');

        test.ok(fs.existsSync(dir), 'Folders should exist');

        var files = wrench.readdirSyncRecursive(dir);

        checkResult(test, files);
    },

    test_readdirRecursive: function(test) {
        var dir = path.join(__dirname, 'readdir');

        test.ok(fs.existsSync(dir), 'Folders should exist');

        var allFiles = [];

        wrench.readdirRecursive(dir, function(e, files) {
            if (e) throw e;

            if (files) {
                allFiles = allFiles.concat(files);
            } else {
                checkResult(test, allFiles);
            }
        });
    }
});

// vim: et ts=4 sw=4
