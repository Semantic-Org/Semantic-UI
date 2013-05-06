var testCase = require('nodeunit').testCase;
var fs = require('fs');
var wrench = require('../lib/wrench');
var path = require('path');

function checkResultHidden(test, files) {
    var check = [
        '.hidden',
        '.hidden.txt',
        'bar.txt',
        'foo',
        path.join('.hidden', 'dolor.md'),
        path.join('foo', 'bar'),
        path.join('foo', 'dolor.md'),
        path.join('foo', 'lorem.txt'),
        path.join('foo', 'bar', 'ipsum.js')
    ];

    test.deepEqual(files, check);
}

function checkResultShown(test, files) {
    var check = [
        'bar.txt',
        'foo',
        path.join('foo', 'bar'),
        path.join('foo', 'dolor.md'),
        path.join('foo', 'lorem.txt'),
        path.join('foo', 'bar', 'ipsum.js')
    ];

    test.deepEqual(files, check);
}

function checkResultInflate(test, files) {
    var check = [
        '.hidden',
        'bar.txt',
        'test',
        path.join('.hidden', 'dolor.md')
    ];

    test.deepEqual(files, check);

    test.deepEqual(fs.lstatSync(path.join(__dirname, 'testdir/.hidden')).isSymbolicLink(), false);
    test.deepEqual(fs.lstatSync(path.join(__dirname, 'testdir/bar.txt')).isSymbolicLink(), false);
}

function checkResultDontInflate(test, files) {
    var check = [
        '.hidden',
        'bar.txt',
        'test',
        path.join('.hidden', 'dolor.md')
    ];

    test.deepEqual(files, check);

    test.deepEqual(fs.lstatSync(path.join(__dirname, 'testdir/.hidden')).isSymbolicLink(), true);
    test.deepEqual(fs.lstatSync(path.join(__dirname, 'testdir/bar.txt')).isSymbolicLink(), true);
}

function checkResultPreserveFiles(test, files) {
    checkResultHidden(test, files);
    var contents = fs.readFileSync(path.join(__dirname, path.join('testdir2', '.hidden.txt')), "utf8");
    test.deepEqual(contents, 'hidden file');
    contents = fs.readFileSync(path.join(__dirname, path.join('testdir2', 'bar.txt')), "utf8");
    test.deepEqual(contents, 'shown file');
}

function checkResultOverwriteFiles(test, files) {
    checkResultHidden(test, files);
    var contents = fs.readFileSync(path.join(__dirname, path.join('testdir2', '.hidden.txt')), "utf8");
    test.deepEqual(contents, 'just some text for .hidden.txt');
    contents = fs.readFileSync(path.join(__dirname, path.join('testdir2', 'bar.txt')), "utf8");
    test.deepEqual(contents, 'just some text for bar.txt');
}

module.exports = testCase({
    test_copyDirSyncRecursiveWithoutOptions: function(test) {
        var dir = path.join(__dirname, 'shown');
        var testdir = path.join(__dirname, 'testdir');

        wrench.copyDirSyncRecursive(dir, testdir);

        wrench.rmdirSyncRecursive(testdir);
        test.done();
    },
    test_copyDirSyncRecursiveHidden: function(test) {
        var dir = path.join(__dirname, 'shown');
        var testdir = path.join(__dirname, 'testdir');

        test.ok(fs.existsSync(dir), 'Folders should exist');

        wrench.mkdirSyncRecursive(testdir, 0777);
        wrench.copyDirSyncRecursive(dir, testdir, { excludeHiddenUnix: false });

        var files = wrench.readdirSyncRecursive(testdir);

        checkResultHidden(test, files);

        wrench.rmdirSyncRecursive(testdir);

        test.done();
    },
    test_copyDirSyncRecursiveShown: function(test) {
        var dir = path.join(__dirname, 'shown');
        var testdir = path.join(__dirname, 'testdir');

        test.ok(fs.existsSync(dir), 'Folders should exist');

        wrench.mkdirSyncRecursive(testdir, 0777);
        wrench.copyDirSyncRecursive(dir, testdir, { excludeHiddenUnix: true });

        var files = wrench.readdirSyncRecursive(testdir);

        checkResultShown(test, files);

        wrench.rmdirSyncRecursive(testdir);

        test.done();
    },
    test_copyDirSyncRecursiveInflate: function(test) {
        var dir = path.join(__dirname, 'withsymlinks');
        var testdir = path.join(__dirname, 'testdir');

        test.ok(fs.existsSync(dir), 'Folders should exist');

        wrench.mkdirSyncRecursive(testdir, 0777);
        wrench.copyDirSyncRecursive(dir, testdir, { excludeHiddenUnix: false, inflateSymlinks: true });

        var files = wrench.readdirSyncRecursive(testdir);

        checkResultInflate(test, files);

        wrench.rmdirSyncRecursive(testdir);

        test.done();
    },
    test_copyDirSyncRecursiveDontInflate: function(test) {
        var dir = path.join(__dirname, 'withsymlinks');
        var testdir = path.join(__dirname, 'testdir');

        test.ok(fs.existsSync(dir), 'Folders should exist');

        wrench.mkdirSyncRecursive(testdir, 0777);
        wrench.copyDirSyncRecursive(dir, testdir, { excludeHiddenUnix: false, inflateSymlinks: false });

        var files = wrench.readdirSyncRecursive(testdir);

        checkResultDontInflate(test, files);

        wrench.rmdirSyncRecursive(testdir);

        test.done();
    },
    test_copyDirSyncRecursivePreserveFiles: function(test) {
        var dir = path.join(__dirname, 'shown'),
            testdir1 = path.join(__dirname, 'testdir1'),
            testdir2 = path.join(__dirname, 'testdir2');

        test.ok(fs.existsSync(dir), 'Folders should exist');

        wrench.mkdirSyncRecursive(testdir1, 0777);
        wrench.copyDirSyncRecursive(dir, testdir1, { excludeHiddenUnix: false });
        wrench.copyDirSyncRecursive(dir, testdir2, { excludeHiddenUnix: false });

        fs.writeFileSync(path.join(testdir1, ".hidden.txt"), 'just some text for .hidden.txt');
        fs.writeFileSync(path.join(testdir1, "bar.txt"), 'just some text for bar.txt');

        wrench.copyDirSyncRecursive(testdir1, testdir2, { preserve: true, excludeHiddenUnix: false, preserveFiles: true });

        var files = wrench.readdirSyncRecursive(testdir2);

        checkResultPreserveFiles(test, files);

        wrench.rmdirSyncRecursive(testdir1);
        wrench.rmdirSyncRecursive(testdir2);

        test.done();
    },
    test_copyDirSyncRecursiveOverwriteFiles: function(test) {
        var dir = path.join(__dirname, 'shown'),
            testdir1 = path.join(__dirname, 'testdir1'),
            testdir2 = path.join(__dirname, 'testdir2');

        test.ok(fs.existsSync(dir), 'Folders should exist');

        wrench.mkdirSyncRecursive(testdir1, 0777);
        wrench.copyDirSyncRecursive(dir, testdir1, { excludeHiddenUnix: false });
        wrench.copyDirSyncRecursive(dir, testdir2, { excludeHiddenUnix: false });

        fs.writeFileSync(path.join(testdir1, ".hidden.txt"), 'just some text for .hidden.txt');
        fs.writeFileSync(path.join(testdir1, "bar.txt"), 'just some text for bar.txt');

        wrench.copyDirSyncRecursive(testdir1, testdir2, { preserve: true, excludeHiddenUnix: false, preserveFiles: false });

        var files = wrench.readdirSyncRecursive(testdir2);

        checkResultOverwriteFiles(test, files);

        wrench.rmdirSyncRecursive(testdir1);
        wrench.rmdirSyncRecursive(testdir2);

        test.done();
    }

});

// vim: et ts=4 sw=4
