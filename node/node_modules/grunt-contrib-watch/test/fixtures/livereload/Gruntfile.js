module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    watch: {
      options: {
        livereload: true,
      },
      basic: {
        files: ['lib/*.js'],
        tasks: ['before'],
      },
      customport: {
        files: ['lib/*.js'],
        tasks: ['before'],
        options: {
          livereload: {
            port: 8675,
          },
        },
      },
      nospawn: {
        files: ['lib/*.js'],
        tasks: ['before'],
        options: {
          nospawn: true,
          livereload: 1337,
        },
      },
    },
  });

  // Load this watch task
  grunt.loadTasks('../../../tasks');

  grunt.registerTask('before', function() {
    grunt.log.writeln('I ran before livereload.');
  });
};
