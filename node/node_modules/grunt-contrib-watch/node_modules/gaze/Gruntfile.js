module.exports = function(grunt) {
  'use strict';
  grunt.initConfig({
    benchmark: {
      all: {
        src: ['benchmarks/*.js'],
        options: { times: 10 }
      }
    },
    nodeunit: {
      files: ['test/**/*_test.js'],
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib: {
        src: ['lib/**/*.js']
      },
      test: {
        src: ['test/**/*_test.js']
      },
    }
  });
  grunt.loadNpmTasks('grunt-benchmark');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.registerTask('default', ['jshint', 'nodeunit']);
};
