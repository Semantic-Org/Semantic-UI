module.exports = function(grunt) {
  'use strict';

  var path = require('path');

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
      notasks: {
        files: ['lib/*.js'],
      },
      triggerwrite: {
        files: ['sass/*'],
        tasks: ['writecss'],
        options: {
          livereload: false,
        },
      },
      triggerlr: {
        files: ['css/*'],
      },
    },
  });

  // Load this watch task
  grunt.loadTasks('../../../tasks');

  grunt.registerTask('before', function() {
    grunt.log.writeln('I ran before livereload.');
  });

  grunt.registerTask('writecss', function() {
    grunt.file.write(path.join(__dirname, 'css', 'one.css'), '#one {}');
  });
};
