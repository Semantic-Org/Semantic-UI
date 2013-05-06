/*
 * grunt
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
 */

// For now, run this "test suite" with:
// grunt --gruntfile ./test/gruntfile/multi-task-files.js

'use strict';

module.exports = function(grunt) {
  grunt.file.setBase('../fixtures/files');

  grunt.initConfig({
    build: '123',
    mappings: {
      cwd: 'src/',
      dest: 'foo/',
      ext: '.bar',
      rename: function(destBase, destPath) {
        return destBase + 'baz/' + destPath.replace(/\.js$/, '<%= mappings.ext %>');
      },
    },
    run: {
      options: {a: 1, b: 11},
      // This is the "compact" format, where the target name is actually the
      // dest filename. Doesn't support per-target options, templated dest, or
      // >1 srcs-dest grouping.
      'dist/built.js': 'src/*1.js',
      'dist/built1.js': ['src/*1.js', 'src/*2.js'],
      // This is the "medium" format. The target name is arbitrary and can be
      // used like "grunt run:built". Supports per-target options, templated
      // dest, and arbitrary "extra" paramters. Doesn't support >1 srcs-dest
      // grouping.
      built: {
        options: {a: 2, c: 22},
        src: ['src/*1.js', 'src/*2.js'],
        dest: 'dist/built-<%= build %>.js',
        extra: 123,
      },
      // This is the "full" format. The target name is arbitrary and can be
      // used like "grunt run:long1". Supports per-target options, templated
      // dest and >1 srcs-dest grouping.
      long1: {
        options: {a: 3, c: 33},
        files: {
          'dist/built-<%= build %>-a.js': ['src/*1.js'],
          'dist/built-<%= build %>-b.js': ['src/*1.js', 'src/*2.js'],
        }
      },
      long2: {
        options: {a: 4, c: 44},
        files: [
          {'dist/built-<%= build %>-a.js': ['src/*.whoops']},
          {'dist/built-<%= build %>-b.js': ['src/*1.js', 'src/*2.js']},
        ]
      },
      // This "full" variant supports per srcs-dest arbitrary "extra" paramters.
      long3: {
        options: {a: 5, c: 55},
        files: [
          {dest: 'dist/built-<%= build %>-a.js', src: ['src/*2.js'], extra: 456},
          {dest: 'dist/built-<%= build %>-b.js', src: ['src/*1.js', 'src/*2.js'], extra: 789},
        ]
      },
      // File mapping options can be specified in these 2 formats.
      built_mapping: {
        options: {a: 6, c: 66},
        expand: true,
        cwd: '<%= mappings.cwd %>',
        src: ['*1.js', '*2.js'],
        dest: '<%= mappings.dest %>',
        rename: '<%= mappings.rename %>',
        extra: 123
      },
      long3_mapping: {
        options: {a: 7, c: 77},
        files: [
          {
            expand: true,
            cwd: '<%= mappings.cwd %>',
            src: ['*1.js', '*2.js'],
            dest: '<%= mappings.dest %>',
            rename: '<%= mappings.rename %>',
            extra: 123
          }
        ]
      },
      // Need to ensure the task function is run if no files or options were
      // specified!
      no_files_or_options: {},
    },
  });

  var results = {};

  var counters = [];
  var counter = -1;
  grunt.registerMultiTask('run', 'Store stuff for later testing.', function() {
    var key = this.nameArgs;
    results[key] = {
      options: this.options({d: 9}),
      files: this.files,
    };
    // Test asynchronous-ness.
    var done;
    if (counter++ % 2 === 0) {
      done = this.async();
      setTimeout(function() {
        counters.push(counter);
        done();
      }, 10);
    } else {
      counters.push(counter);
    }
  });

  var expecteds = {
    'run:no_files_or_options': {
      options: {a: 1, b: 11, d: 9},
      files: [],
    },
    'run:dist/built.js': {
      options: {a: 1, b: 11, d: 9},
      files: [
        {
          dest: 'dist/built.js',
          src: ['src/file1.js'],
          orig: {
            dest: 'dist/built.js',
            src: ['src/*1.js'],
          },
        },
      ]
    },
    'run:dist/built1.js': {
      options: {a: 1, b: 11, d: 9},
      files: [
        {
          dest: 'dist/built1.js',
          src: ['src/file1.js', 'src/file2.js'],
          orig: {
            dest: 'dist/built1.js',
            src: ['src/*1.js', 'src/*2.js'],
          },
        },
      ]
    },
    'run:built': {
      options: {a: 2, b: 11, c: 22, d: 9},
      files: [
        {
          dest: 'dist/built-123.js',
          src: ['src/file1.js', 'src/file2.js'],
          extra: 123,
          orig: {
            dest: 'dist/built-123.js',
            src: ['src/*1.js', 'src/*2.js'],
            extra: 123,
          },
        },
      ],
    },
    'run:long1': {
      options: {a: 3, b: 11, c: 33, d: 9},
      files: [
        {
          dest: 'dist/built-123-a.js',
          src: ['src/file1.js'],
          orig: {
            dest: 'dist/built-123-a.js',
            src: ['src/*1.js'],
          },
        },
        {
          dest: 'dist/built-123-b.js',
          src: ['src/file1.js', 'src/file2.js'],
          orig: {
            dest: 'dist/built-123-b.js',
            src: ['src/*1.js', 'src/*2.js'],
          },
        },
      ],
    },
    'run:long2': {
      options: {a: 4, b: 11, c: 44, d: 9},
      files: [
        {
          dest: 'dist/built-123-a.js',
          src: [],
          orig: {
            dest: 'dist/built-123-a.js',
            src: ['src/*.whoops'],
          },
        },
        {
          dest: 'dist/built-123-b.js',
          src: ['src/file1.js', 'src/file2.js'],
          orig: {
            dest: 'dist/built-123-b.js',
            src: ['src/*1.js', 'src/*2.js'],
          },
        },
      ],
    },
    'run:long3': {
      options: {a: 5, b: 11, c: 55, d: 9},
      files: [
        {
          dest: 'dist/built-123-a.js',
          src: ['src/file2.js'],
          extra: 456,
          orig: {
            dest: 'dist/built-123-a.js',
            src: ['src/*2.js'],
            extra: 456,
          },
        },
        {
          dest: 'dist/built-123-b.js',
          src: ['src/file1.js', 'src/file2.js'],
          extra: 789,
          orig: {
            src: ['src/*1.js', 'src/*2.js'],
            dest: 'dist/built-123-b.js',
            extra: 789,
          },
        },
      ],
    },
    'run:built_mapping': {
      options: {a: 6, b: 11, c: 66, d: 9},
      files: [
        {
          dest: 'foo/baz/file1.bar',
          src: ['src/file1.js'],
          extra: 123,
          orig: {
            expand: true,
            cwd: grunt.config.get('mappings.cwd'),
            src: ['*1.js', '*2.js'],
            dest: grunt.config.get('mappings.dest'),
            rename: grunt.config.get('run.built_mapping.rename'),
            extra: 123,
          },
        },
        {
          dest: 'foo/baz/file2.bar',
          src: ['src/file2.js'],
          extra: 123,
          orig: {
            expand: true,
            cwd: grunt.config.get('run.built_mapping.cwd'),
            src: ['*1.js', '*2.js'],
            dest: grunt.config.get('run.built_mapping.dest'),
            rename: grunt.config.get('run.built_mapping.rename'),
            extra: 123,
          },
        },
      ],
    },
    'run:long3_mapping': {
      options: {a: 7, b: 11, c: 77, d: 9},
      files: [
        {
          dest: 'foo/baz/file1.bar',
          src: ['src/file1.js'],
          extra: 123,
          orig: {
            expand: true,
            cwd: grunt.config.get('mappings.cwd'),
            src: ['*1.js', '*2.js'],
            dest: grunt.config.get('mappings.dest'),
            rename: grunt.config.get('mappings.rename'),
            extra: 123,
          },
        },
        {
          dest: 'foo/baz/file2.bar',
          src: ['src/file2.js'],
          extra: 123,
          orig: {
            expand: true,
            cwd: grunt.config.get('mappings.cwd'),
            src: ['*1.js', '*2.js'],
            dest: grunt.config.get('mappings.dest'),
            rename: grunt.config.get('run.built_mapping.rename'),
            extra: 123,
          },
        },
      ],
    },
  };

  var assert = require('assert');
  var difflet = require('difflet')({indent: 2, comment: true});
  var test = function(name, fn) {
    try {
      fn();
    } catch (err) {
      grunt.log.subhead('Assertion Failure in ' + name);
      console.log(difflet.compare(err.expected, err.actual));
      throw new Error(err.message);
    }
  };

  grunt.registerTask('test', 'Test file and option objects.', function() {
    var key = 'run:' + this.nameArgs.replace(/^.*?:/, '');
    var all = key === 'run:all';
    var actual = all ? results : results[key];
    var expected = all ? expecteds : expecteds[key];

    test(this.name, function() {
      assert.deepEqual(actual, expected, 'Actual should match expected.');
    });

    if (all) {
      results = {};
    } else {
      delete results[key];
    }
  });

  grunt.registerTask('test:counters', 'Test function execution order.', function() {
    test(this.name, function() {
      assert.equal(counters.length, counter + 1, 'Task functions should have run the correct number of times.');
      var expected = [];
      for (var i = 0; i < counters.length; i++) { expected.push(i); }
      assert.deepEqual(counters, expected, 'Task functions should have actually executed in-order.');
    });
  });

  grunt.registerTask('default', [
    'run:no_files_or_options',
    'test:no_files_or_options',
    'run:dist/built.js',
    'test:dist/built.js',
    'run:dist/built1.js',
    'test:dist/built1.js',
    'run:built',
    'test:built',
    'run:long1',
    'test:long1',
    'run:long2',
    'test:long2',
    'run:long3',
    'test:long3',
    'run:built_mapping',
    'test:built_mapping',
    'run:long3_mapping',
    'test:long3_mapping',
    'run',
    'test:all',
    'test:counters',
  ]);

};
