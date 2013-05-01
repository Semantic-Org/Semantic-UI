/*
 * grunt
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
 */

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    test: {
      all: ['test/**/*.js']
    },
    lint: {
      all: [
        'grunt.js',
        'lib/**/*.js',
        'tasks/*.js',
        'tasks/*/*.js',
        'test/{grunt,tasks,util}/*.js'
      ]
    },
    watch: {
      scripts: {
        files: '<config:lint.all>',
        tasks: 'lint test'
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true,
        es5: true,
        strict: false
      },
      globals: {}
    }
  });

  // Default task.
  grunt.registerTask('default', 'lint test');

};
