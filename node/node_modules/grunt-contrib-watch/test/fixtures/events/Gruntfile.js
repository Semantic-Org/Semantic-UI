module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    watch: {
      all: {
        files: ['lib/*.js'],
      },
      onlyAdded: {
        options: {
          event: 'added',
        },
        files: ['lib/*.js'],
      },
      onlyChanged: {
        options: {
          event: 'changed',
        },
        files: ['lib/*.js'],
      },
      onlyDeleted: {
        options: {
          event: 'deleted',
        },
        files: ['lib/*.js'],
      },
      onlyAddedAndDeleted: {
        options: {
          event: ['added', 'deleted'],
        },
        files: ['lib/*.js'],
      }
    },
  });

  // Load this watch task
  grunt.loadTasks('../../../tasks');

  // trigger on watch events
  var timeout;
  grunt.event.on('watch', function(action, filepath) {
    grunt.log.writeln(filepath + ' was indeed ' + action);
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      grunt.util.exit(0);
    }, 2000);
  });
};
