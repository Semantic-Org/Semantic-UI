'use strict';

// Nodejs lib.
var path = require('path');

var findup = require('../lib/findup-sync.js');

// Get a relative path.
var rel = function(abspath) {
  return typeof abspath === 'string' ? path.relative('.', abspath) : abspath;
};

exports['findup'] = {
  setUp: function(done) {
    this.cwd = process.cwd();
    done();
  },
  tearDown: function(done) {
    process.chdir(this.cwd);
    done();
  },
  'simple': function(test) {
    test.expect(8);
    var opts = {cwd: 'test/fixtures/a/b'};
    test.equal(rel(findup('foo.txt', opts)), path.normalize('test/fixtures/a/foo.txt'), 'should find files');
    test.equal(rel(findup('bar.txt', opts)), path.normalize('test/fixtures/a/b/bar.txt'), 'should find files');
    test.equal(rel(findup('a.txt', opts)), path.normalize('test/fixtures/a.txt'), 'should find files');
    test.equal(rel(findup('?.txt', opts)), path.normalize('test/fixtures/a.txt'), 'should support glob patterns');
    test.equal(rel(findup('*.txt', opts)), path.normalize('test/fixtures/a/b/bar.txt'), 'should find the first thing that matches the glob pattern');
    test.equal(rel(findup(['b*.txt', 'f*.txt'], opts)), path.normalize('test/fixtures/a/b/bar.txt'), 'should find the first thing that matches any of the glob patterns');
    test.equal(rel(findup(['f*.txt', 'b*.txt'], opts)), path.normalize('test/fixtures/a/b/bar.txt'), 'should find the first thing that matches any of the glob patterns');
    test.equal(findup('not-gonna-exist-i-hope.txt', opts), null, 'should returning null if no files found');
    test.done();
  },
  'cwd': function(test) {
    test.expect(8);
    process.chdir('test/fixtures/a/b');
    test.equal(rel(findup('foo.txt')), path.normalize('../foo.txt'), 'should find files');
    test.equal(rel(findup('bar.txt')), 'bar.txt', 'should find files');
    test.equal(rel(findup('a.txt')), path.normalize('../../a.txt'), 'should find files');
    test.equal(rel(findup('?.txt')), path.normalize('../../a.txt'), 'should support glob patterns');
    test.equal(rel(findup('*.txt')), 'bar.txt', 'should find the first thing that matches the glob pattern');
    test.equal(rel(findup(['b*.txt', 'f*.txt'])), 'bar.txt', 'should find the first thing that matches any of the glob patterns');
    test.equal(rel(findup(['f*.txt', 'b*.txt'])), 'bar.txt', 'should find the first thing that matches any of the glob patterns');
    test.equal(findup('not-gonna-exist-i-hope.txt'), null, 'should returning null if no files found');
    test.done();
  },
};
