/*
 * grunt-contrib-less
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 Tyler Kellen, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    less: {
      compile: {
        options: {
          paths: ['test/fixtures/include']
        },
        files: {
          'tmp/less.css': ['test/fixtures/style.less'],
          'tmp/concat.css': ['test/fixtures/style.less', 'test/fixtures/style2.less']
        }
      },
      compress: {
        options: {
          paths: ['test/fixtures/include'],
          compress: true
        },
        files: {
          'tmp/compress.css': ['test/fixtures/style.less']
        }
      },
      nopaths: {
        files: {
          'tmp/nopaths.css': ['test/fixtures/nopaths.less']
        }
      },
      yuicompress: {
        options: {
          paths: ['test/fixtures/include'],
          yuicompress: true
        },
        files: {
          'tmp/yuicompress.css': ['test/fixtures/style.less']
        }
      },
      nofiles: {
      },
      nomatchedfiles: {
        files: { "tmp/nomatchedfiles.css" : 'test/nonexistent/*.less' }
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-internal');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'less', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test', 'build-contrib']);

};
