module.exports = function(grunt) {
  "use strict";

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['Gruntfile.js', 'tasks/**/*.js', 'test/**/*.js'],
      options: {
        jshintrc: ".jshintrc"
      }
    },
    watch: {
      files: '<%= jshint.files %>',
      tasks: 'default'
    },
    csslint: {
      valid: 'test/valid.css',
      empty: 'test/empty.css',
      all: 'test/*.css'
    },
    cssmin: {
      plain: {
        src: 'test/valid.css',
        dest: 'valid.min.css'
      },
      banner: {
        options: {
          banner: '/* <%= pkg.name %> - v<%= pkg.version %> - my awesome css banner */'
        },
        src: 'test/valid.css',
        dest: 'valid.min.banner.css'
      }
    }
  });

  // Load local tasks.
  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task. csslint:all will fail, that's okay until there's unit tests
  grunt.registerTask('default', ['jshint', 'csslint:valid', 'csslint:empty'] );
  grunt.registerTask('all', ['jshint', 'cssmin', 'csslint'] );

};
