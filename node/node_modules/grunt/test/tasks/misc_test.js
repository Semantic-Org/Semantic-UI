var grunt = require('../../lib/grunt');

// In case the grunt being used to test is different than the grunt being
// tested, initialize the task and config subsystems.
if (grunt.task.searchDirs.length === 0) {
  grunt.task.init([]);
  grunt.config.init({});
}

exports['config'] = function(test) {
  test.expect(2);
  test.deepEqual(grunt.helper('config'), grunt.config(), 'It should just pass through to config.');
  test.deepEqual(grunt.helper('config', 'meta'), grunt.config('meta'), 'It should just pass through to config.');
  test.done();
};

exports['json'] = function(test) {
  test.expect(2);
  var obj = grunt.helper('json', 'test/fixtures/test.json');
  test.equal(obj.foo, 'bar', 'JSON properties should be available as-defined.');
  test.deepEqual(obj.baz, [1, 2, 3], 'JSON properties should be available as-defined.');
  test.done();
};

exports['strip_banner'] = function(test) {
  test.expect(7);
  var src = grunt.file.read('test/fixtures/banner.js');
  test.equal(grunt.helper('strip_banner', src), '// Comment\n\n/* Comment */\n', 'It should strip the top banner.');
  test.equal(grunt.helper('strip_banner', src, {block: true}), '// Comment\n\n/* Comment */\n', 'It should strip the top banner.');
  src = grunt.file.read('test/fixtures/banner2.js');
  test.equal(grunt.helper('strip_banner', src), '\n/*! SAMPLE\n * BANNER */\n\n// Comment\n\n/* Comment */\n', 'It should not strip the top banner.');
  test.equal(grunt.helper('strip_banner', src, {block: true}), '// Comment\n\n/* Comment */\n', 'It should strip the top banner.');
  src = grunt.file.read('test/fixtures/banner3.js');
  test.equal(grunt.helper('strip_banner', src), '\n// This is\n// A sample\n// Banner\n\n// But this is not\n\n/* And neither\n * is this\n */\n', 'It should not strip the top banner.');
  test.equal(grunt.helper('strip_banner', src, {block: true}), '\n// This is\n// A sample\n// Banner\n\n// But this is not\n\n/* And neither\n * is this\n */\n', 'It should not strip the top banner.');
  test.equal(grunt.helper('strip_banner', src, {line: true}), '// But this is not\n\n/* And neither\n * is this\n */\n', 'It should strip the top banner.');
  test.done();
};

exports['file_strip_banner'] = function(test) {
  test.expect(14);
  var filepath = 'test/fixtures/banner.js';
  test.equal(grunt.helper('file_strip_banner', filepath), '// Comment\n\n/* Comment */\n', 'It should strip the top banner.');
  test.equal(grunt.helper('file_strip_banner', filepath, {block: true}), '// Comment\n\n/* Comment */\n', 'It should strip the top banner.');
  filepath = 'test/fixtures/banner2.js';
  test.equal(grunt.helper('file_strip_banner', filepath), '\n/*! SAMPLE\n * BANNER */\n\n// Comment\n\n/* Comment */\n', 'It should not strip the top banner.');
  test.equal(grunt.helper('file_strip_banner', filepath, {block: true}), '// Comment\n\n/* Comment */\n', 'It should strip the top banner.');
  filepath = 'test/fixtures/banner3.js';
  test.equal(grunt.helper('file_strip_banner', filepath), '\n// This is\n// A sample\n// Banner\n\n// But this is not\n\n/* And neither\n * is this\n */\n', 'It should not strip the top banner.');
  test.equal(grunt.helper('file_strip_banner', filepath, {block: true}), '\n// This is\n// A sample\n// Banner\n\n// But this is not\n\n/* And neither\n * is this\n */\n', 'It should not strip the top banner.');
  test.equal(grunt.helper('file_strip_banner', filepath, {line: true}), '// But this is not\n\n/* And neither\n * is this\n */\n', 'It should strip the top banner.');

  test.equal(grunt.task.directive('<file_strip_banner:test/fixtures/banner.js>'), '// Comment\n\n/* Comment */\n', 'It should strip the top banner.');
  test.equal(grunt.task.directive('<file_strip_banner:test/fixtures/banner.js:block>'), '// Comment\n\n/* Comment */\n', 'It should strip the top banner.');
  test.equal(grunt.task.directive('<file_strip_banner:test/fixtures/banner2.js>'), '\n/*! SAMPLE\n * BANNER */\n\n// Comment\n\n/* Comment */\n', 'It should not strip the top banner.');
  test.equal(grunt.task.directive('<file_strip_banner:test/fixtures/banner2.js:block>'), '// Comment\n\n/* Comment */\n', 'It should strip the top banner.');
  test.equal(grunt.task.directive('<file_strip_banner:test/fixtures/banner3.js>'), '\n// This is\n// A sample\n// Banner\n\n// But this is not\n\n/* And neither\n * is this\n */\n', 'It should not strip the top banner.');
  test.equal(grunt.task.directive('<file_strip_banner:test/fixtures/banner3.js:block>'), '\n// This is\n// A sample\n// Banner\n\n// But this is not\n\n/* And neither\n * is this\n */\n', 'It should not strip the top banner.');
  test.equal(grunt.task.directive('<file_strip_banner:test/fixtures/banner3.js:line>'), '// But this is not\n\n/* And neither\n * is this\n */\n', 'It should strip the top banner.');
  test.done();
};

exports['file_template'] = function(test) {
  test.expect(2);
  var expected = 'Version: ' + grunt.version + ', today: ' + grunt.template.today('yyyy-mm-dd') + '.';
  test.equal(grunt.helper('file_template', 'test/fixtures/template.txt'), expected, 'It should return the parsed template.');
  test.equal(grunt.task.directive('<file_template:test/fixtures/template.txt>'), expected, 'It should return the parsed template.');
  test.done();
};

exports['banner'] = function(test) {
  test.expect(5);
  grunt.config('test_config', {a: 'aaaaa', b: 'bbbbb', c: [1, 2, 3], d: [{a: 1}, {a: 2}, {a: 3}]});

  grunt.config('meta.banner', 'foo\n<%= test_config.a %>\nbar');
  test.equal(grunt.helper('banner'), grunt.utils.normalizelf('foo\naaaaa\nbar\n'), 'It should use the default banner.');

  grunt.config('test_config.banner', '<%= test_config.b %>');
  test.equal(grunt.helper('banner', 'test_config.banner'), grunt.utils.normalizelf('bbbbb\n'), 'It should use the requested banner.');

  grunt.config('test_config.banner', '<%= test_config.c.join(", ") %>');
  test.equal(grunt.helper('banner', 'test_config.banner'), grunt.utils.normalizelf('1, 2, 3\n'), 'It should join arrays.');

  grunt.config('test_config.banner', '<%= _.pluck(test_config.d, "a").join(", ") %>');
  test.equal(grunt.helper('banner', 'test_config.banner'), grunt.utils.normalizelf('1, 2, 3\n'), 'It should join arrays.');

  grunt.config('test_config.banner', '<%= grunt.template.today("yyyy-mm-dd") %>');
  test.equal(grunt.helper('banner', 'test_config.banner'), grunt.utils.normalizelf(grunt.template.today('yyyy-mm-dd') + '\n'), 'It should parse the current date correctly.');

  test.done();
};
