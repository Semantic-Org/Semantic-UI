/*global config:true, task:true*/
config.init({
  pkg: '<json:package.json>',
  meta: {
    name: 'JavaScript Hooker',
    banner: '/*! <%= meta.name %> - v<%= pkg.version %> - <%= template.today("m/d/yyyy") %>\n' +
            '* <%= pkg.homepage %>\n' +
            '* Copyright (c) <%= template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
  },
  concat: {
    'dist/ba-hooker.js': ['<banner>', '<file_strip_banner:lib/hooker.js>']
  },
  min: {
    'dist/ba-hooker.min.js': ['<banner>', 'dist/ba-hooker.js']
  },
  test: {
    files: ['test/**/*.js']
  },
  lint: {
    files: ['grunt.js', 'lib/**/*.js', 'test/**/*.js']
  },
  watch: {
    files: '<config:lint.files>',
    tasks: 'lint:files test:files'
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
      eqnull: true
    },
    globals: {
      exports: true
    }
  },
  uglify: {}
});

// Default task.
task.registerTask('default', 'lint:files test:files concat min');
