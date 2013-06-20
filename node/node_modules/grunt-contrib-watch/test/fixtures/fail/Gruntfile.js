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
    var done = this.async();
    setTimeout(function() {
      grunt.warn('This task should warn!');
      done();
    }, 1000);
  });
  grunt.registerTask('fatal', function() {
    var done = this.async();
    setTimeout(function() {
      grunt.fatal('This task should be fatal!');
      done();
    }, 1000);
  });
};
