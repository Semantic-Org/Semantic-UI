var grunt = require('../../lib/grunt');

// In case the grunt being used to test is different than the grunt being
// tested, initialize the task and config subsystems.
if (grunt.task.searchDirs.length === 0) {
  grunt.task.init([]);
  grunt.config.init({});
}

// Just tests whether options are correctly set
exports['jshint'] = function(test) {
  test.expect(1);

  var options = {
    asi: true,
    laxcomma: true,
    maxparams: 3
  };
  var globals = {
    node: true
  };

  var errorcount = grunt.fail.errorcount;
  grunt.helper('lint', grunt.file.read('test/fixtures/lintTest.js'), options, globals);
  test.equal(grunt.fail.errorcount - errorcount, 1, 'One error should have been logged.');

  test.done();
};
