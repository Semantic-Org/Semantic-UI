module.exports = function(grunt) {
  'use strict';
  grunt.initConfig({
    echo: {
      files: ['lib/*.js']
    },
    watch: {
      files: ['<%= echo.files %>'],
      tasks: ['echo']
    }
  });
  // Load the echo task
  grunt.loadTasks('../tasks');
  // Load this watch task
  grunt.loadTasks('../../../tasks');
  grunt.registerTask('default', ['echo']);
};
