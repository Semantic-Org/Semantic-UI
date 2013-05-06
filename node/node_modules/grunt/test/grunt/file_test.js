'use strict';

var grunt = require('../../lib/grunt');

var fs = require('fs');
var path = require('path');

var Tempfile = require('temporary/lib/file');
var Tempdir = require('temporary/lib/dir');

var tmpdir = new Tempdir();
fs.symlinkSync(path.resolve('test/fixtures/octocat.png'), path.join(tmpdir.path, 'octocat.png'), 'file');
fs.symlinkSync(path.resolve('test/fixtures/expand'), path.join(tmpdir.path, 'expand'), 'dir');

exports['file.match'] = {
  'empty set': function(test) {
    test.expect(12);
    // Should return empty set if a required argument is missing or an empty set.
    test.deepEqual(grunt.file.match(null, null), [], 'should return empty set.');
    test.deepEqual(grunt.file.match({}, null, null), [], 'should return empty set.');
    test.deepEqual(grunt.file.match(null, 'foo.js'), [], 'should return empty set.');
    test.deepEqual(grunt.file.match('*.js', null), [], 'should return empty set.');
    test.deepEqual(grunt.file.match({}, null, 'foo.js'), [], 'should return empty set.');
    test.deepEqual(grunt.file.match({}, '*.js', null), [], 'should return empty set.');
    test.deepEqual(grunt.file.match({}, [], 'foo.js'), [], 'should return empty set.');
    test.deepEqual(grunt.file.match({}, '*.js', []), [], 'should return empty set.');
    test.deepEqual(grunt.file.match(null, ['foo.js']), [], 'should return empty set.');
    test.deepEqual(grunt.file.match(['*.js'], null), [], 'should return empty set.');
    test.deepEqual(grunt.file.match({}, null, ['foo.js']), [], 'should return empty set.');
    test.deepEqual(grunt.file.match({}, ['*.js'], null), [], 'should return empty set.');
    test.done();
  },
  'basic matching': function(test) {
    test.expect(6);
    test.deepEqual(grunt.file.match('*.js', 'foo.js'), ['foo.js'], 'should match correctly.');
    test.deepEqual(grunt.file.match('*.js', ['foo.js']), ['foo.js'], 'should match correctly.');
    test.deepEqual(grunt.file.match('*.js', ['foo.js', 'bar.css']), ['foo.js'], 'should match correctly.');
    test.deepEqual(grunt.file.match(['*.js', '*.css'], 'foo.js'), ['foo.js'], 'should match correctly.');
    test.deepEqual(grunt.file.match(['*.js', '*.css'], ['foo.js']), ['foo.js'], 'should match correctly.');
    test.deepEqual(grunt.file.match(['*.js', '*.css'], ['foo.js', 'bar.css']), ['foo.js', 'bar.css'], 'should match correctly.');
    test.done();
  },
  'no matches': function(test) {
    test.expect(2);
    test.deepEqual(grunt.file.match('*.js', 'foo.css'), [], 'should fail to match.');
    test.deepEqual(grunt.file.match('*.js', ['foo.css', 'bar.css']), [], 'should fail to match.');
    test.done();
  },
  'unique': function(test) {
    test.expect(2);
    test.deepEqual(grunt.file.match('*.js', ['foo.js', 'foo.js']), ['foo.js'], 'should return a uniqued set.');
    test.deepEqual(grunt.file.match(['*.js', '*.*'], ['foo.js', 'foo.js']), ['foo.js'], 'should return a uniqued set.');
    test.done();
  },
  'flatten': function(test) {
    test.expect(1);
    test.deepEqual(grunt.file.match([['*.js', '*.css'], ['*.*', '*.js']], ['foo.js', 'bar.css']), ['foo.js', 'bar.css'], 'should process nested pattern arrays correctly.');
    test.done();
  },
  'exclusion': function(test) {
    test.expect(5);
    test.deepEqual(grunt.file.match(['!*.js'], ['foo.js', 'bar.js']), [], 'solitary exclusion should match nothing');
    test.deepEqual(grunt.file.match(['*.js', '!*.js'], ['foo.js', 'bar.js']), [], 'exclusion should cancel match');
    test.deepEqual(grunt.file.match(['*.js', '!f*.js'], ['foo.js', 'bar.js', 'baz.js']), ['bar.js', 'baz.js'], 'partial exclusion should partially cancel match');
    test.deepEqual(grunt.file.match(['*.js', '!*.js', 'b*.js'], ['foo.js', 'bar.js', 'baz.js']), ['bar.js', 'baz.js'], 'inclusion / exclusion order matters');
    test.deepEqual(grunt.file.match(['*.js', '!f*.js', '*.js'], ['foo.js', 'bar.js', 'baz.js']), ['bar.js', 'baz.js', 'foo.js'], 'inclusion / exclusion order matters');
    test.done();
  },
  'options.matchBase': function(test) {
    test.expect(2);
    test.deepEqual(grunt.file.match({matchBase: true}, '*.js', ['foo.js', 'bar', 'baz/xyz.js']), ['foo.js', 'baz/xyz.js'], 'should matchBase (minimatch) when specified.');
    test.deepEqual(grunt.file.match('*.js', ['foo.js', 'bar', 'baz/xyz.js']), ['foo.js'], 'should not matchBase (minimatch) by default.');
    test.done();
  }
};

exports['file.isMatch'] = {
  'basic matching': function(test) {
    test.expect(6);
    test.ok(grunt.file.isMatch('*.js', 'foo.js'), 'should match correctly.');
    test.ok(grunt.file.isMatch('*.js', ['foo.js']), 'should match correctly.');
    test.ok(grunt.file.isMatch('*.js', ['foo.js', 'bar.css']), 'should match correctly.');
    test.ok(grunt.file.isMatch(['*.js', '*.css'], 'foo.js'), 'should match correctly.');
    test.ok(grunt.file.isMatch(['*.js', '*.css'], ['foo.js']), 'should match correctly.');
    test.ok(grunt.file.isMatch(['*.js', '*.css'], ['foo.js', 'bar.css']), 'should match correctly.');
    test.done();
  },
  'no matches': function(test) {
    test.expect(6);
    test.equal(grunt.file.isMatch('*.js', 'foo.css'), false, 'should fail to match.');
    test.equal(grunt.file.isMatch('*.js', ['foo.css', 'bar.css']), false, 'should fail to match.');
    test.equal(grunt.file.isMatch(null, 'foo.css'), false, 'should fail to match.');
    test.equal(grunt.file.isMatch('*.js', null), false, 'should fail to match.');
    test.equal(grunt.file.isMatch([], 'foo.css'), false, 'should fail to match.');
    test.equal(grunt.file.isMatch('*.js', []), false, 'should fail to match.');
    test.done();
  },
  'options.matchBase': function(test) {
    test.expect(2);
    test.ok(grunt.file.isMatch({matchBase: true}, '*.js', ['baz/xyz.js']), 'should matchBase (minimatch) when specified.');
    test.equal(grunt.file.isMatch('*.js', ['baz/xyz.js']), false, 'should not matchBase (minimatch) by default.');
    test.done();
  }
};

exports['file.expand*'] = {
  setUp: function(done) {
    this.cwd = process.cwd();
    process.chdir('test/fixtures/expand');
    done();
  },
  tearDown: function(done) {
    process.chdir(this.cwd);
    done();
  },
  'basic matching': function(test) {
    test.expect(8);
    test.deepEqual(grunt.file.expand('**/*.js'), ['js/bar.js', 'js/foo.js'], 'should match.');
    test.deepEqual(grunt.file.expand('**/*.js', '**/*.css'), ['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css'], 'should match.');
    test.deepEqual(grunt.file.expand(['**/*.js', '**/*.css']), ['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css'], 'should match.');
    test.deepEqual(grunt.file.expand('**d*/**'), [
      'deep',
      'deep/deep.txt',
      'deep/deeper',
      'deep/deeper/deeper.txt',
      'deep/deeper/deepest',
      'deep/deeper/deepest/deepest.txt'], 'should match files and directories.');
    test.deepEqual(grunt.file.expand({mark: true}, '**d*/**'), [
      'deep/',
      'deep/deep.txt',
      'deep/deeper/',
      'deep/deeper/deeper.txt',
      'deep/deeper/deepest/',
      'deep/deeper/deepest/deepest.txt'], 'the minimatch "mark" option ensures directories end in /.');
    test.deepEqual(grunt.file.expand('**d*/**/'), [
      'deep/',
      'deep/deeper/',
      'deep/deeper/deepest/'], 'should match directories, arbitrary / at the end appears in matches.');
    test.deepEqual(grunt.file.expand({mark: true}, '**d*/**/'), [
      'deep/',
      'deep/deeper/',
      'deep/deeper/deepest/'], 'should match directories, arbitrary / at the end appears in matches.');
    test.deepEqual(grunt.file.expand('*.xyz'), [], 'should fail to match.');
    test.done();
  },
  'filter': function(test) {
    test.expect(5);
    test.deepEqual(grunt.file.expand({filter: 'isFile'}, '**d*/**'), [
      'deep/deep.txt',
      'deep/deeper/deeper.txt',
      'deep/deeper/deepest/deepest.txt'
    ], 'should match files only.');
    test.deepEqual(grunt.file.expand({filter: 'isDirectory'}, '**d*/**'), [
      'deep',
      'deep/deeper',
      'deep/deeper/deepest'
    ], 'should match directories only.');
    test.deepEqual(grunt.file.expand({filter: function(filepath) { return (/deepest/).test(filepath); }}, '**'), [
      'deep/deeper/deepest',
      'deep/deeper/deepest/deepest.txt',
    ], 'should filter arbitrarily.');
    test.deepEqual(grunt.file.expand({filter: 'isFile'}, 'js', 'css'), [], 'should fail to match.');
    test.deepEqual(grunt.file.expand({filter: 'isDirectory'}, '**/*.js'), [], 'should fail to match.');
    test.done();
  },
  'unique': function(test) {
    test.expect(4);
    test.deepEqual(grunt.file.expand('**/*.js', 'js/*.js'), ['js/bar.js', 'js/foo.js'], 'file list should be uniqed.');
    test.deepEqual(grunt.file.expand('**/*.js', '**/*.css', 'js/*.js'), ['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css'], 'file list should be uniqed.');
    test.deepEqual(grunt.file.expand('js', 'js/'), ['js', 'js/'], 'mixed non-ending-/ and ending-/ dirs will not be uniqed by default.');
    test.deepEqual(grunt.file.expand({mark: true}, 'js', 'js/'), ['js/'], 'mixed non-ending-/ and ending-/ dirs will be uniqed when "mark" is specified.');
    test.done();
  },
  'file order': function(test) {
    test.expect(4);
    var actual = grunt.file.expand('**/*.{js,css}');
    var expected = ['css/baz.css', 'css/qux.css', 'js/bar.js', 'js/foo.js'];
    test.deepEqual(actual, expected, 'should select 4 files in this order, by default.');

    actual = grunt.file.expand('js/foo.js', 'js/bar.js', '**/*.{js,css}');
    expected = ['js/foo.js', 'js/bar.js', 'css/baz.css', 'css/qux.css'];
    test.deepEqual(actual, expected, 'specifically-specified-up-front file order should be maintained.');

    actual = grunt.file.expand('js/bar.js', 'js/foo.js', '**/*.{js,css}');
    expected = ['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css'];
    test.deepEqual(actual, expected, 'specifically-specified-up-front file order should be maintained.');

    actual = grunt.file.expand('js/foo.js', '**/*.{js,css}', '!js/bar.js', 'js/bar.js');
    expected = ['js/foo.js', 'css/baz.css', 'css/qux.css', 'js/bar.js'];
    test.deepEqual(actual, expected, 'if a file is excluded and then re-added, it should be added at the end.');
    test.done();
  },
  'flatten': function(test) {
    test.expect(1);
    test.deepEqual(grunt.file.expand([['**/*.js'], ['**/*.css', 'js/*.js']]), ['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css'], 'should match.');
    test.done();
  },
  'exclusion': function(test) {
    test.expect(8);
    test.deepEqual(grunt.file.expand(['!js/*.js']), [], 'solitary exclusion should match nothing');
    test.deepEqual(grunt.file.expand(['js/bar.js','!js/bar.js']), [], 'exclusion should cancel match');
    test.deepEqual(grunt.file.expand(['**/*.js', '!js/foo.js']), ['js/bar.js'], 'should omit single file from matched set');
    test.deepEqual(grunt.file.expand(['!js/foo.js', '**/*.js']), ['js/bar.js', 'js/foo.js'], 'inclusion / exclusion order matters');
    test.deepEqual(grunt.file.expand(['**/*.js', '**/*.css', '!js/bar.js', '!css/baz.css']), ['js/foo.js','css/qux.css'], 'multiple exclusions should be removed from the set');
    test.deepEqual(grunt.file.expand(['**/*.js', '**/*.css', '!**/*.css']), ['js/bar.js', 'js/foo.js'], 'excluded wildcards should be removed from the matched set');
    test.deepEqual(grunt.file.expand(['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css', '!**/b*.*']), ['js/foo.js', 'css/qux.css'], 'different pattern for exclusion should still work');
    test.deepEqual(grunt.file.expand(['js/bar.js', '!**/b*.*', 'js/foo.js', 'css/baz.css', 'css/qux.css']), ['js/foo.js', 'css/baz.css', 'css/qux.css'], 'inclusion / exclusion order matters');
    test.done();
  },
  'options.matchBase': function(test) {
    test.expect(4);
    var opts = {matchBase: true};
    test.deepEqual(grunt.file.expand('*.js'), [], 'should not matchBase (minimatch) by default.');
    test.deepEqual(grunt.file.expand(opts, '*.js'), ['js/bar.js', 'js/foo.js'], 'options should be passed through to minimatch.');
    test.deepEqual(grunt.file.expand(opts, '*.js', '*.css'), ['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css'], 'should match.');
    test.deepEqual(grunt.file.expand(opts, ['*.js', '*.css']), ['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css'], 'should match.');
    test.done();
  },
  'options.cwd': function(test) {
    test.expect(4);
    var cwd = path.resolve(process.cwd(), '..');
    test.deepEqual(grunt.file.expand({cwd: cwd}, ['expand/js', 'expand/js/*']), ['expand/js', 'expand/js/bar.js', 'expand/js/foo.js'], 'should match.');
    test.deepEqual(grunt.file.expand({cwd: cwd, filter: 'isFile'}, ['expand/js', 'expand/js/*']), ['expand/js/bar.js', 'expand/js/foo.js'], 'should match.');
    test.deepEqual(grunt.file.expand({cwd: cwd, filter: 'isDirectory'}, ['expand/js', 'expand/js/*']), ['expand/js'], 'should match.');
    test.deepEqual(grunt.file.expand({cwd: cwd, filter: 'isFile'}, ['expand/js', 'expand/js/*', '!**/b*.js']), ['expand/js/foo.js'], 'should negate properly.');
    test.done();
  },
  'options.nonull': function(test) {
    test.expect(2);
    var opts = {nonull: true};
    test.deepEqual(grunt.file.expand(opts, ['js/a*', 'js/b*', 'js/c*']), ['js/a*', 'js/bar.js', 'js/c*'], 'non-matching patterns should be returned in result set.');
    test.deepEqual(grunt.file.expand(opts, ['js/foo.js', 'js/bar.js', 'js/baz.js']), ['js/foo.js', 'js/bar.js', 'js/baz.js'], 'non-matching filenames should be returned in result set.');
    test.done();
  },
};

exports['file.expandMapping'] = {
  setUp: function(done) {
    this.cwd = process.cwd();
    process.chdir('test/fixtures');
    done();
  },
  tearDown: function(done) {
    process.chdir(this.cwd);
    done();
  },
  'basic matching': function(test) {
    test.expect(2);

    var actual = grunt.file.expandMapping(['expand/**/*.txt'], 'dest');
    var expected = [
      {dest: 'dest/expand/deep/deep.txt', src: ['expand/deep/deep.txt']},
      {dest: 'dest/expand/deep/deeper/deeper.txt', src: ['expand/deep/deeper/deeper.txt']},
      {dest: 'dest/expand/deep/deeper/deepest/deepest.txt', src: ['expand/deep/deeper/deepest/deepest.txt']},
    ];
    test.deepEqual(actual, expected, 'basic src-dest options');

    actual = grunt.file.expandMapping(['expand/**/*.txt'], 'dest/');
    test.deepEqual(actual, expected, 'destBase should behave the same both with or without trailing slash');

    test.done();
  },
  'flatten': function(test) {
    test.expect(1);
    var actual = grunt.file.expandMapping(['expand/**/*.txt'], 'dest', {flatten: true});
    var expected = [
      {dest: 'dest/deep.txt', src: ['expand/deep/deep.txt']},
      {dest: 'dest/deeper.txt', src: ['expand/deep/deeper/deeper.txt']},
      {dest: 'dest/deepest.txt', src: ['expand/deep/deeper/deepest/deepest.txt']},
    ];
    test.deepEqual(actual, expected, 'dest paths should be flattened pre-destBase+destPath join');
    test.done();
  },
  'ext': function(test) {
    test.expect(2);
    var actual, expected;
    actual = grunt.file.expandMapping(['expand/**/*.txt'], 'dest', {ext: '.foo'});
    expected = [
      {dest: 'dest/expand/deep/deep.foo', src: ['expand/deep/deep.txt']},
      {dest: 'dest/expand/deep/deeper/deeper.foo', src: ['expand/deep/deeper/deeper.txt']},
      {dest: 'dest/expand/deep/deeper/deepest/deepest.foo', src: ['expand/deep/deeper/deepest/deepest.txt']},
    ];
    test.deepEqual(actual, expected, 'specified extension should be added');
    actual = grunt.file.expandMapping(['expand-mapping-ext/**/file*'], 'dest', {ext: '.foo'});
    expected = [
      {dest: 'dest/expand-mapping-ext/dir.ectory/file-no-extension.foo', src: ['expand-mapping-ext/dir.ectory/file-no-extension']},
      {dest: 'dest/expand-mapping-ext/dir.ectory/sub.dir.ectory/file.foo', src: ['expand-mapping-ext/dir.ectory/sub.dir.ectory/file.ext.ension']},
      {dest: 'dest/expand-mapping-ext/file.foo', src: ['expand-mapping-ext/file.ext.ension']},
    ];
    test.deepEqual(actual, expected, 'specified extension should be added');
    test.done();
  },
  'cwd': function(test) {
    test.expect(1);
    var actual = grunt.file.expandMapping(['**/*.txt'], 'dest', {cwd: 'expand'});
    var expected = [
      {dest: 'dest/deep/deep.txt', src: ['expand/deep/deep.txt']},
      {dest: 'dest/deep/deeper/deeper.txt', src: ['expand/deep/deeper/deeper.txt']},
      {dest: 'dest/deep/deeper/deepest/deepest.txt', src: ['expand/deep/deeper/deepest/deepest.txt']},
    ];
    test.deepEqual(actual, expected, 'cwd should be stripped from front of destPath, pre-destBase+destPath join');
    test.done();
  },
  'rename': function(test) {
    test.expect(1);
    var actual = grunt.file.expandMapping(['**/*.txt'], 'dest', {
      cwd: 'expand',
      flatten: true,
      rename: function(destBase, destPath, options) {
        return path.join(destBase, options.cwd, 'o-m-g', destPath);
      }
    });
    var expected = [
      {dest: 'dest/expand/o-m-g/deep.txt', src: ['expand/deep/deep.txt']},
      {dest: 'dest/expand/o-m-g/deeper.txt', src: ['expand/deep/deeper/deeper.txt']},
      {dest: 'dest/expand/o-m-g/deepest.txt', src: ['expand/deep/deeper/deepest/deepest.txt']},
    ];
    test.deepEqual(actual, expected, 'custom rename function should be used to build dest, post-flatten');
    test.done();
  },
  'rename to same dest': function(test) {
    test.expect(1);
    var actual = grunt.file.expandMapping(['**/*'], 'dest', {
      filter: 'isFile',
      cwd: 'expand',
      flatten: true,
      rename: function(destBase, destPath) {
        return path.join(destBase, 'all' + path.extname(destPath));
      }
    });
    var expected = [
      {dest: 'dest/all.md', src: ['expand/README.md']},
      {dest: 'dest/all.css', src: ['expand/css/baz.css', 'expand/css/qux.css']},
      {dest: 'dest/all.txt', src: ['expand/deep/deep.txt', 'expand/deep/deeper/deeper.txt', 'expand/deep/deeper/deepest/deepest.txt']},
      {dest: 'dest/all.js', src: ['expand/js/bar.js', 'expand/js/foo.js']},
    ];
    test.deepEqual(actual, expected, 'if dest is same for multiple src, create an array of src');
    test.done();
  },
};


// Compare two buffers. Returns true if they are equivalent.
var compareBuffers = function(buf1, buf2) {
  if (!Buffer.isBuffer(buf1) || !Buffer.isBuffer(buf2)) { return false; }
  if (buf1.length !== buf2.length) { return false; }
  for (var i = 0; i < buf2.length; i++) {
    if (buf1[i] !== buf2[i]) { return false; }
  }
  return true;
};

// Compare two files. Returns true if they are equivalent.
var compareFiles = function(filepath1, filepath2) {
  return compareBuffers(fs.readFileSync(filepath1), fs.readFileSync(filepath2));
};

exports['file'] = {
  setUp: function(done) {
    this.defaultEncoding = grunt.file.defaultEncoding;
    grunt.file.defaultEncoding = 'utf8';
    this.string = 'Ação é isso aí\n';
    this.object = {foo: 'Ação é isso aí', bar: ['ømg', 'pønies']};
    this.writeOption = grunt.option('write');
    done();
  },
  tearDown: function(done) {
    grunt.file.defaultEncoding = this.defaultEncoding;
    grunt.option('write', this.writeOption);
    done();
  },
  'read': function(test) {
    test.expect(5);
    test.strictEqual(grunt.file.read('test/fixtures/utf8.txt'), this.string, 'file should be read as utf8 by default.');
    test.strictEqual(grunt.file.read('test/fixtures/iso-8859-1.txt', {encoding: 'iso-8859-1'}), this.string, 'file should be read using the specified encoding.');
    test.ok(compareBuffers(grunt.file.read('test/fixtures/octocat.png', {encoding: null}), fs.readFileSync('test/fixtures/octocat.png')), 'file should be read as a buffer if encoding is specified as null.');
    test.strictEqual(grunt.file.read('test/fixtures/BOM.txt'), 'foo', 'file should have BOM stripped.');

    grunt.file.defaultEncoding = 'iso-8859-1';
    test.strictEqual(grunt.file.read('test/fixtures/iso-8859-1.txt'), this.string, 'changing the default encoding should work.');
    test.done();
  },
  'readJSON': function(test) {
    test.expect(3);
    var obj;
    obj = grunt.file.readJSON('test/fixtures/utf8.json');
    test.deepEqual(obj, this.object, 'file should be read as utf8 by default and parsed correctly.');

    obj = grunt.file.readJSON('test/fixtures/iso-8859-1.json', {encoding: 'iso-8859-1'});
    test.deepEqual(obj, this.object, 'file should be read using the specified encoding.');

    grunt.file.defaultEncoding = 'iso-8859-1';
    obj = grunt.file.readJSON('test/fixtures/iso-8859-1.json');
    test.deepEqual(obj, this.object, 'changing the default encoding should work.');
    test.done();
  },
  'readYAML': function(test) {
    test.expect(3);
    var obj;
    obj = grunt.file.readYAML('test/fixtures/utf8.yaml');
    test.deepEqual(obj, this.object, 'file should be read as utf8 by default and parsed correctly.');

    obj = grunt.file.readYAML('test/fixtures/iso-8859-1.yaml', {encoding: 'iso-8859-1'});
    test.deepEqual(obj, this.object, 'file should be read using the specified encoding.');

    grunt.file.defaultEncoding = 'iso-8859-1';
    obj = grunt.file.readYAML('test/fixtures/iso-8859-1.yaml');
    test.deepEqual(obj, this.object, 'changing the default encoding should work.');
    test.done();
  },
  'write': function(test) {
    test.expect(5);
    var tmpfile;
    tmpfile = new Tempfile();
    grunt.file.write(tmpfile.path, this.string);
    test.strictEqual(fs.readFileSync(tmpfile.path, 'utf8'), this.string, 'file should be written as utf8 by default.');
    tmpfile.unlinkSync();

    tmpfile = new Tempfile();
    grunt.file.write(tmpfile.path, this.string, {encoding: 'iso-8859-1'});
    test.strictEqual(grunt.file.read(tmpfile.path, {encoding: 'iso-8859-1'}), this.string, 'file should be written using the specified encoding.');
    tmpfile.unlinkSync();

    grunt.file.defaultEncoding = 'iso-8859-1';
    tmpfile = new Tempfile();
    grunt.file.write(tmpfile.path, this.string);
    grunt.file.defaultEncoding = 'utf8';
    test.strictEqual(grunt.file.read(tmpfile.path, {encoding: 'iso-8859-1'}), this.string, 'changing the default encoding should work.');
    tmpfile.unlinkSync();

    tmpfile = new Tempfile();
    var octocat = fs.readFileSync('test/fixtures/octocat.png');
    grunt.file.write(tmpfile.path, octocat);
    test.ok(compareBuffers(fs.readFileSync(tmpfile.path), octocat), 'buffers should always be written as-specified, with no attempt at re-encoding.');
    tmpfile.unlinkSync();

    grunt.option('write', false);
    var filepath = path.join(tmpdir.path, 'should-not-exist.txt');
    grunt.file.write(filepath, 'test');
    test.equal(grunt.file.exists(filepath), false, 'file should NOT be created if --no-write was specified.');
    test.done();
  },
  'copy': function(test) {
    test.expect(4);
    var tmpfile;
    tmpfile = new Tempfile();
    grunt.file.copy('test/fixtures/utf8.txt', tmpfile.path);
    test.ok(compareFiles(tmpfile.path, 'test/fixtures/utf8.txt'), 'files should just be copied as encoding-agnostic by default.');
    tmpfile.unlinkSync();

    tmpfile = new Tempfile();
    grunt.file.copy('test/fixtures/iso-8859-1.txt', tmpfile.path);
    test.ok(compareFiles(tmpfile.path, 'test/fixtures/iso-8859-1.txt'), 'files should just be copied as encoding-agnostic by default.');
    tmpfile.unlinkSync();

    tmpfile = new Tempfile();
    grunt.file.copy('test/fixtures/octocat.png', tmpfile.path);
    test.ok(compareFiles(tmpfile.path, 'test/fixtures/octocat.png'), 'files should just be copied as encoding-agnostic by default.');
    tmpfile.unlinkSync();

    grunt.option('write', false);
    var filepath = path.join(tmpdir.path, 'should-not-exist.txt');
    grunt.file.copy('test/fixtures/utf8.txt', filepath);
    test.equal(grunt.file.exists(filepath), false, 'file should NOT be created if --no-write was specified.');
    test.done();
  },
  'copy and process': function(test) {
    test.expect(13);
    var tmpfile;
    tmpfile = new Tempfile();
    grunt.file.copy('test/fixtures/utf8.txt', tmpfile.path, {
      process: function(src, filepath) {
        test.equal(filepath, 'test/fixtures/utf8.txt', 'filepath should be passed in, as-specified.');
        test.equal(Buffer.isBuffer(src), false, 'when no encoding is specified, use default encoding and process src as a string');
        test.equal(typeof src, 'string', 'when no encoding is specified, use default encoding and process src as a string');
        return 'føø' + src + 'bår';
      }
    });
    test.equal(grunt.file.read(tmpfile.path), 'føø' + this.string + 'bår', 'file should be saved as properly encoded processed string.');
    tmpfile.unlinkSync();

    tmpfile = new Tempfile();
    grunt.file.copy('test/fixtures/iso-8859-1.txt', tmpfile.path, {
      encoding: 'iso-8859-1',
      process: function(src) {
        test.equal(Buffer.isBuffer(src), false, 'use specified encoding and process src as a string');
        test.equal(typeof src, 'string', 'use specified encoding and process src as a string');
        return 'føø' + src + 'bår';
      }
    });
    test.equal(grunt.file.read(tmpfile.path, {encoding: 'iso-8859-1'}), 'føø' + this.string + 'bår', 'file should be saved as properly encoded processed string.');
    tmpfile.unlinkSync();

    tmpfile = new Tempfile();
    grunt.file.copy('test/fixtures/utf8.txt', tmpfile.path, {
      encoding: null,
      process: function(src) {
        test.ok(Buffer.isBuffer(src), 'when encoding is specified as null, process src as a buffer');
        return new Buffer('føø' + src.toString() + 'bår');
      }
    });
    test.equal(grunt.file.read(tmpfile.path), 'føø' + this.string + 'bår', 'file should be saved as the buffer returned by process.');
    tmpfile.unlinkSync();

    grunt.file.defaultEncoding = 'iso-8859-1';
    tmpfile = new Tempfile();
    grunt.file.copy('test/fixtures/iso-8859-1.txt', tmpfile.path, {
      process: function(src) {
        test.equal(Buffer.isBuffer(src), false, 'use non-utf8 default encoding and process src as a string');
        test.equal(typeof src, 'string', 'use non-utf8 default encoding and process src as a string');
        return 'føø' + src + 'bår';
      }
    });
    test.equal(grunt.file.read(tmpfile.path), 'føø' + this.string + 'bår', 'file should be saved as properly encoded processed string.');
    tmpfile.unlinkSync();

    var filepath = path.join(tmpdir.path, 'should-not-exist.txt');
    grunt.file.copy('test/fixtures/iso-8859-1.txt', filepath, {
      process: function() {
        return false;
      }
    });
    test.equal(grunt.file.exists(filepath), false, 'file should NOT be created if process returns false.');
    test.done();
  },
  'copy and process, noprocess': function(test) {
    test.expect(4);
    var tmpfile;
    tmpfile = new Tempfile();
    grunt.file.copy('test/fixtures/utf8.txt', tmpfile.path, {
      noProcess: true,
      process: function(src) {
        return 'føø' + src + 'bår';
      }
    });
    test.equal(grunt.file.read(tmpfile.path), this.string, 'file should not have been processed.');
    tmpfile.unlinkSync();

    ['process', 'noprocess', 'othernoprocess'].forEach(function(filename) {
      var filepath = path.join(tmpdir.path, filename);
      grunt.file.copy('test/fixtures/utf8.txt', filepath);
      var tmpfile = new Tempfile();
      grunt.file.copy(filepath, tmpfile.path, {
        noProcess: ['**/*no*'],
        process: function(src) {
          return 'føø' + src + 'bår';
        }
      });
      if (filename === 'process') {
        test.equal(grunt.file.read(tmpfile.path), 'føø' + this.string + 'bår', 'file should have been processed.');
      } else {
        test.equal(grunt.file.read(tmpfile.path), this.string, 'file should not have been processed.');
      }
      tmpfile.unlinkSync();
    }, this);

    test.done();
  },
  'delete': function(test) {
    test.expect(2);
    var oldBase = process.cwd();
    var cwd = path.resolve(tmpdir.path, 'delete', 'folder');
    grunt.file.mkdir(cwd);
    grunt.file.setBase(tmpdir.path);

    grunt.file.write(path.join(cwd, 'test.js'), 'var test;');
    test.ok(grunt.file.delete(cwd), 'should return true after deleting file.');
    test.equal(grunt.file.exists(cwd), false, 'file should have been deleted.');
    grunt.file.setBase(oldBase);
    test.done();
  },
  'delete nonexistent file': function(test) {
    test.expect(1);
    test.ok(!grunt.file.delete('nonexistent'), 'should return false if file does not exist.');
    test.done();
  },
  'delete outside working directory': function(test) {
    test.expect(3);
    var oldBase = process.cwd();
    var oldWarn = grunt.fail.warn;
    grunt.fail.warn = function() {};

    var cwd = path.resolve(tmpdir.path, 'delete', 'folder');
    var outsidecwd = path.resolve(tmpdir.path, 'delete', 'outsidecwd');
    grunt.file.mkdir(cwd);
    grunt.file.mkdir(outsidecwd);
    grunt.file.setBase(cwd);

    grunt.file.write(path.join(outsidecwd, 'test.js'), 'var test;');
    test.equal(grunt.file.delete(path.join(outsidecwd, 'test.js')), false, 'should not delete anything outside the cwd.');

    test.ok(grunt.file.delete(path.join(outsidecwd), {force:true}), 'should delete outside cwd when using the --force.');
    test.equal(grunt.file.exists(outsidecwd), false, 'file outside cwd should have been deleted when using the --force.');

    grunt.file.setBase(oldBase);
    grunt.fail.warn = oldWarn;
    test.done();
  },
  'dont delete current working directory': function(test) {
    test.expect(2);
    var oldBase = process.cwd();
    var oldWarn = grunt.fail.warn;
    grunt.fail.warn = function() {};

    var cwd = path.resolve(tmpdir.path, 'dontdelete', 'folder');
    grunt.file.mkdir(cwd);
    grunt.file.setBase(cwd);

    test.equal(grunt.file.delete(cwd), false, 'should not delete the cwd.');
    test.ok(grunt.file.exists(cwd), 'the cwd should exist.');

    grunt.file.setBase(oldBase);
    grunt.fail.warn = oldWarn;
    test.done();
  },
  'dont actually delete with no-write option on': function(test) {
    test.expect(2);
    grunt.option('write', false);

    var oldBase = process.cwd();
    var cwd = path.resolve(tmpdir.path, 'dontdelete', 'folder');
    grunt.file.mkdir(cwd);
    grunt.file.setBase(tmpdir.path);

    grunt.file.write(path.join(cwd, 'test.js'), 'var test;');
    test.ok(grunt.file.delete(cwd), 'should return true after not actually deleting file.');
    test.equal(grunt.file.exists(cwd), true, 'file should NOT be deleted if --no-write was specified.');
    grunt.file.setBase(oldBase);

    test.done();
  },
  'mkdir': function(test) {
    test.expect(5);
    test.doesNotThrow(function() {
      grunt.file.mkdir(tmpdir.path);
    }, 'Should not explode if the directory already exists.');
    test.ok(fs.existsSync(tmpdir.path), 'path should still exist.');

    test.doesNotThrow(function() {
      grunt.file.mkdir(path.join(tmpdir.path, 'aa/bb/cc'));
    }, 'Should also not explode, otherwise.');
    test.ok(path.join(tmpdir.path, 'aa/bb/cc'), 'path should have been created.');

    fs.writeFileSync(path.join(tmpdir.path, 'aa/bb/xx'), 'test');
    test.throws(function() {
      grunt.file.mkdir(path.join(tmpdir.path, 'aa/bb/xx/yy'));
    }, 'Should throw if a path cannot be created (ENOTDIR).');

    test.done();
  },
  'recurse': function(test) {
    test.expect(1);
    var rootdir = 'test/fixtures/expand';
    var expected = {};
    expected[rootdir + '/css/baz.css'] = [rootdir, 'css', 'baz.css'];
    expected[rootdir + '/css/qux.css'] = [rootdir, 'css', 'qux.css'];
    expected[rootdir + '/deep/deep.txt'] = [rootdir, 'deep', 'deep.txt'];
    expected[rootdir + '/deep/deeper/deeper.txt'] = [rootdir, 'deep/deeper', 'deeper.txt'];
    expected[rootdir + '/deep/deeper/deepest/deepest.txt'] = [rootdir, 'deep/deeper/deepest', 'deepest.txt'];
    expected[rootdir + '/js/bar.js'] = [rootdir, 'js', 'bar.js'];
    expected[rootdir + '/js/foo.js'] = [rootdir, 'js', 'foo.js'];
    expected[rootdir + '/README.md'] = [rootdir, undefined, 'README.md'];

    var actual = {};
    grunt.file.recurse(rootdir, function(abspath, rootdir, subdir, filename) {
      actual[abspath] = [rootdir, subdir, filename];
    });

    test.deepEqual(actual, expected, 'paths and arguments should match.');
    test.done();
  },
  'exists': function(test) {
    test.expect(6);
    test.ok(grunt.file.exists('test/fixtures/octocat.png'), 'files exist.');
    test.ok(grunt.file.exists('test', 'fixtures', 'octocat.png'), 'should work for paths in parts.');
    test.ok(grunt.file.exists('test/fixtures'), 'directories exist.');
    test.ok(grunt.file.exists(path.join(tmpdir.path, 'octocat.png')), 'file links exist.');
    test.ok(grunt.file.exists(path.join(tmpdir.path, 'expand')), 'directory links exist.');
    test.equal(grunt.file.exists('test/fixtures/does/not/exist'), false, 'nonexistent files do not exist.');
    test.done();
  },
  'isLink': function(test) {
    test.expect(6);
    test.equals(grunt.file.isLink('test/fixtures/octocat.png'), false, 'files are not links.');
    test.equals(grunt.file.isLink('test/fixtures'), false, 'directories are not links.');
    test.ok(grunt.file.isLink(path.join(tmpdir.path, 'octocat.png')), 'file links are links.');
    test.ok(grunt.file.isLink(path.join(tmpdir.path, 'expand')), 'directory links are links.');
    test.ok(grunt.file.isLink(tmpdir.path, 'octocat.png'), 'should work for paths in parts.');
    test.equals(grunt.file.isLink('test/fixtures/does/not/exist'), false, 'nonexistent files are not links.');
    test.done();
  },
  'isDir': function(test) {
    test.expect(6);
    test.equals(grunt.file.isDir('test/fixtures/octocat.png'), false, 'files are not directories.');
    test.ok(grunt.file.isDir('test/fixtures'), 'directories are directories.');
    test.ok(grunt.file.isDir('test', 'fixtures'), 'should work for paths in parts.');
    test.equals(grunt.file.isDir(path.join(tmpdir.path, 'octocat.png')), false, 'file links are not directories.');
    test.ok(grunt.file.isDir(path.join(tmpdir.path, 'expand')), 'directory links are directories.');
    test.equals(grunt.file.isDir('test/fixtures/does/not/exist'), false, 'nonexistent files are not directories.');
    test.done();
  },
  'isFile': function(test) {
    test.expect(6);
    test.ok(grunt.file.isFile('test/fixtures/octocat.png'), 'files are files.');
    test.ok(grunt.file.isFile('test', 'fixtures', 'octocat.png'), 'should work for paths in parts.');
    test.equals(grunt.file.isFile('test/fixtures'), false, 'directories are not files.');
    test.ok(grunt.file.isFile(path.join(tmpdir.path, 'octocat.png')), 'file links are files.');
    test.equals(grunt.file.isFile(path.join(tmpdir.path, 'expand')), false, 'directory links are not files.');
    test.equals(grunt.file.isFile('test/fixtures/does/not/exist'), false, 'nonexistent files are not files.');
    test.done();
  },
  'isPathAbsolute': function(test) {
    test.expect(5);
    test.ok(grunt.file.isPathAbsolute(path.resolve('/foo')), 'should return true');
    test.ok(grunt.file.isPathAbsolute(path.resolve('/foo') + path.sep), 'should return true');
    test.equal(grunt.file.isPathAbsolute('foo'), false, 'should return false');
    test.ok(grunt.file.isPathAbsolute(path.resolve('test/fixtures/a.js')), 'should return true');
    test.equal(grunt.file.isPathAbsolute('test/fixtures/a.js'), false, 'should return false');
    test.done();
  },
  'arePathsEquivalent': function(test) {
    test.expect(5);
    test.ok(grunt.file.arePathsEquivalent('/foo'), 'should return true');
    test.ok(grunt.file.arePathsEquivalent('/foo', '/foo/', '/foo/../foo/'), 'should return true');
    test.ok(grunt.file.arePathsEquivalent(process.cwd(), '.', './', 'test/..'), 'should return true');
    test.equal(grunt.file.arePathsEquivalent(process.cwd(), '..'), false, 'should return false');
    test.equal(grunt.file.arePathsEquivalent('.', '..'), false, 'should return false');
    test.done();
  },
  'doesPathContain': function(test) {
    test.expect(6);
    test.ok(grunt.file.doesPathContain('/foo', '/foo/bar'), 'should return true');
    test.ok(grunt.file.doesPathContain('/foo/', '/foo/bar/baz', '/foo/bar', '/foo/whatever'), 'should return true');
    test.equal(grunt.file.doesPathContain('/foo', '/foo'), false, 'should return false');
    test.equal(grunt.file.doesPathContain('/foo/xyz', '/foo/xyz/123', '/foo/bar/baz'), false, 'should return false');
    test.equal(grunt.file.doesPathContain('/foo/xyz', '/foo'), false, 'should return false');
    test.ok(grunt.file.doesPathContain(process.cwd(), 'test', 'test/fixtures', 'lib'), 'should return true');
    test.done();
  },
  'isPathCwd': function(test) {
    test.expect(8);
    test.ok(grunt.file.isPathCwd(process.cwd()), 'cwd is cwd');
    test.ok(grunt.file.isPathCwd('.'), 'cwd is cwd');
    test.equal(grunt.file.isPathCwd('test'), false, 'subdirectory is not cwd');
    test.equal(grunt.file.isPathCwd(path.resolve('test')), false, 'subdirectory is not cwd');
    test.equal(grunt.file.isPathCwd('..'), false, 'parent is not cwd');
    test.equal(grunt.file.isPathCwd(path.resolve('..')), false, 'parent is not cwd');
    test.equal(grunt.file.isPathCwd('/'), false, 'root is not cwd (I hope)');
    test.equal(grunt.file.isPathCwd('nonexistent'), false, 'nonexistent path is not cwd');
    test.done();
  },
  'isPathInCwd': function(test) {
    test.expect(8);
    test.equal(grunt.file.isPathInCwd(process.cwd()), false, 'cwd is not IN cwd');
    test.equal(grunt.file.isPathInCwd('.'), false, 'cwd is not IN cwd');
    test.ok(grunt.file.isPathInCwd('test'), 'subdirectory is in cwd');
    test.ok(grunt.file.isPathInCwd(path.resolve('test')), 'subdirectory is in cwd');
    test.equal(grunt.file.isPathInCwd('..'), false, 'parent is not in cwd');
    test.equal(grunt.file.isPathInCwd(path.resolve('..')), false, 'parent is not in cwd');
    test.equal(grunt.file.isPathInCwd('/'), false, 'root is not in cwd (I hope)');
    test.equal(grunt.file.isPathInCwd('nonexistent'), false, 'nonexistent path is not in cwd');
    test.done();
  },
};
