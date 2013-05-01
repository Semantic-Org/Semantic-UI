module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-css');
  var gruntConfig = require('./grunt-config.json');
  grunt.initConfig(gruntConfig);
  grunt.registerTask('default', Object.keys(gruntConfig).join(' '));
};