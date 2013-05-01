/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({{% if (min_concat) { if (package_json) { %}
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },{% } else { %}
    meta: {
      version: '0.1.0',
      banner: '/*! PROJECT_NAME - v<%= meta.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '* http://PROJECT_WEBSITE/\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
        'YOUR_NAME; Licensed MIT */'
    },{% } } %}
    lint: {
      files: ['grunt.js', '{%= lib_dir %}/**/*.js', '{%= test_dir %}/**/*.js']
    },{% if (dom) { %}
    qunit: {
      files: ['{%= test_dir %}/**/*.html']
    },{% } else { %}
    test: {
      files: ['{%= test_dir %}/**/*.js']
    },{% } %}{% if (min_concat) { %}
    concat: {
      dist: {
        src: ['<banner:meta.banner>', '<file_strip_banner:{%= lib_dir %}/{%= file_name %}.js>'],
        dest: 'dist/{%= file_name %}.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'dist/{%= file_name %}.min.js'
      }
    },{% } %}
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint {%= test_task %}'
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
        eqnull: true{% if (dom) { %},
        browser: true{% } %}
      },
      globals: {{% if (jquery) { %}
        jQuery: true
      {% } %}}
    }{% if (min_concat) { %},
    uglify: {}{% } %}
  });

  // Default task.
  grunt.registerTask('default', 'lint {%= test_task %}{%= min_concat ? " concat min" : "" %}');

};
