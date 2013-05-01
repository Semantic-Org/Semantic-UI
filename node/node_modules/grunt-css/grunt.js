module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    test: {
      files: ['test/**/*.js']
    },
    lint: {
      files: ['grunt.js', 'tasks/**/*.js', 'test/**/*.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'default'
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
        trailing: true
      },
      globals: {
        exports: true
      }
    },
    csslint: {
      valid: 'test/valid.css',
      empty: 'test/empty.css',
      all: 'test/*.css'
    },
    banner: '/*my awesome css banner */',
    cssmin: {
      plain: {
        src: 'test/valid.css',
        dest: 'valid.min.css'
      },
      banner: {
        src: ['<banner:banner>', 'test/valid.css' ],
        dest: 'valid.min.banner.css'
      }
    }
  });

  // Load local tasks.
  grunt.loadTasks('tasks');

  // Default task. csslint:all will fail, that's okay until there's unit tests
  grunt.registerTask('default', 'lint csslint');

};