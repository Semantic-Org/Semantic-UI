var grunt = require('../../lib/grunt');

var fs = require('fs');
var path = require('path');

// test helper
//
// compare - to effectively compare Buffers, we would need something like
// bnoordhuis/buffertools, but I'd rather not add a new dependency for the sake
// of testing.
//
// So we're relying on comparisons between the `hex` of buffers to do that,
// seems to be reliant enough to cover our test needs with file copy.
function compare(actual, expected, encoding) {
  encoding = encoding || 'hex';
  return fs.readFileSync(actual, encoding) === fs.readFileSync(expected, encoding);
}

exports['file'] = {
  'isPathAbsolute': function(test) {
    test.expect(2);
    test.ok(grunt.file.isPathAbsolute(path.resolve('test/fixtures/a.js')), 'should return true');
    test.equal(grunt.file.isPathAbsolute('test/fixtures/a.js'), false, 'should return false');
    test.done();
  },
  'read': function(test) {
    test.expect(2);
    test.strictEqual(grunt.file.read('test/fixtures/a.js'), fs.readFileSync('test/fixtures/a.js', 'utf8'));
    test.strictEqual(grunt.file.read('test/fixtures/octocat.png'), fs.readFileSync('test/fixtures/octocat.png', 'utf8'));
    test.done();
  },
  'write': function(test) {
    test.expect(4);
    var content = 'var a = "foobar";';
    grunt.file.write('test/fixtures/test_write.js', content);
    test.strictEqual(fs.readFileSync('test/fixtures/test_write.js', 'utf8'), content);
    test.strictEqual(grunt.file.read('test/fixtures/test_write.js'), content);

    var octocat = fs.readFileSync('test/fixtures/octocat.png');
    grunt.file.write('test/fixtures/test_write.png', octocat);
    test.strictEqual(fs.readFileSync('test/fixtures/test_write.png', 'utf8'), fs.readFileSync('test/fixtures/octocat.png', 'utf8'));
    test.ok(compare('test/fixtures/test_write.png', 'test/fixtures/octocat.png'), 'both buffers should match');

    ['test/fixtures/test_write.js', 'test/fixtures/test_write.png'].forEach(fs.unlinkSync);
    test.done();
  },
  'copy': function(test) {
    test.expect(6);
    grunt.file.copy('test/fixtures/a.js', 'test/fixtures/test_copy.js');
    test.strictEqual(fs.readFileSync('test/fixtures/test_copy.js', 'utf8'), fs.readFileSync('test/fixtures/a.js', 'utf8'));

    var tmpltest = '// should src be a string and template process be all good.';
    grunt.file.copy('test/fixtures/a.js', 'test/fixtures/test_copy.js', {process: function(src) {
      test.equal(Buffer.isBuffer(src), false);
      test.equal(typeof src, 'string');
      return grunt.template.process(src + '<%= tmpltest %>', {tmpltest: tmpltest});
    }});
    test.strictEqual(fs.readFileSync('test/fixtures/test_copy.js', 'utf8'), grunt.utils.normalizelf(fs.readFileSync('test/fixtures/a.js', 'utf8')) + tmpltest);

    grunt.file.copy('test/fixtures/octocat.png', 'test/fixtures/test_copy.png');
    test.strictEqual(fs.readFileSync('test/fixtures/test_copy.png', 'utf8'), fs.readFileSync('test/fixtures/octocat.png', 'utf8'));
    test.ok(compare('test/fixtures/test_copy.png', 'test/fixtures/octocat.png'), 'both buffers should match');

    ['test/fixtures/test_copy.js', 'test/fixtures/test_copy.png'].forEach(fs.unlinkSync);
    test.done();
  }
};
