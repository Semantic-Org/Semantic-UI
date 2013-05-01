var grunt = require('../../lib/grunt');

// In case the grunt being used to test is different than the grunt being
// tested, initialize the task and config subsystems.
if (grunt.task.searchDirs.length === 0) {
  grunt.task.init([]);
  grunt.config.init({});
}

exports['concat'] = function(test) {
  test.expect(1);
  grunt.registerHelper('test_helper', function(a, b) { return a + b; });
  var files = [
    'test/fixtures/a.js',
    '<test_helper:x:y>',
    'test/fixtures/b.js'
  ];
  var lf = grunt.utils.linefeed;
  test.equal(grunt.helper('concat', files), 'var a = 1;\n' + lf + 'xy' + lf + 'var b = 2;\n', 'It should concatenate files and directives.');
  test.done();
};
