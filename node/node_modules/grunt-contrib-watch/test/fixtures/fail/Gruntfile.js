module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    watch: {
      options: {
        nospawn: true,
      },
      warn: {
        files: ['lib/*.js'],
        tasks: ['warn'],
      },
      fatal: {
        files: ['lib/*.js'],
        tasks: ['fatal'],
      },
    },
  });

  // Load this watch task
  grunt.loadTasks('../../../tasks');

  grunt.registerTask('warn', function() {
    grunt.warn('This task should warn!');
  });
  grunt.registerTask('fatal', function() {
    grunt.fatal('This task should be fatal!');
  });
};
