module.exports = function(grunt) {

  var

    site    = grunt.file.readJSON('grunt.config'),

    // shortcut
    paths   = site.paths,

    defaultTasks = [
      // run grunt watch
      'watch'
    ],

    watchTasks = [
      // compiles less
      'less:build',

      // copy js
      'copy:file',

      // auto prefix outputted file
      'autoprefixer:prefixFile'
    ],

    resetTasks = [
      // clean build directory
      'clean:output'
    ],

    buildTasks = [
      // clean build directory
      'clean:output',

      // compiles less definitions
      'less:buildAll',

      // copy assets
      'copy:uncompressedAssets',
      'copy:minifiedAssets',
      'copy:packagedAssets',

      // copy javascript definitions
      'copy:javascript',

      // auto prefix all outputted files
      'autoprefixer:prefixOutput',

      // creates minified js of each output file
      'uglify:minifyOutput',

      // creates minified css of each output file
      'cssmin:minifyOutput',

      // create concatenated css release
      'concat:createCSSPackage',

      // create concatenated js release
      'concat:createJSPackage'
    ],

    setWatchFiles = function(action, filePath) {
      var
        outputPath = filePath.replace(paths.source.definitions, paths.output.uncompressed + 'definitions/')
      ;
      // build less and prefix
      if(filePath.search('.less') !== -1) {
        outputPath = outputPath.replace('less', 'css');
        grunt.config('less.build.src', filePath);
        grunt.config('less.build.dest', outputPath);
        grunt.config('autoprefixer.prefixFile.src', outputPath);
      }
      // copy just the one js file
      else if(filePath.search('.js') !== -1) {
        grunt.config('copy.file.src', filePath);
        grunt.config('copy.file.dest', outputPath);
      }
      // do nothing
      else {
        grunt.config('less.build.src', 'non/existant/path');
        grunt.config('less.build.dest', 'non/existant/path');
        grunt.config('autoprefixer.prefixFile.src', 'non/existant/path');
      }
    },

    // this allows filenames with multiple extensions to be preserved
    preserveFileExtensions = function(folder, filename) {
      return folder + filename.substring(0, filename.lastIndexOf('.') ) + '.css';
    },
    preserveMinFileExtensions = function(folder, filename) {
      return folder + filename.substring(0, filename.lastIndexOf('.') ) + '.min.css';
    },

    config
  ;

  config = {

    site    : site,
    paths   : site.paths,

    /*******************************
                 Watch
    *******************************/

    // watches for changes in a source folder
    watch: {
      options: {
        spawn: false
      },
      src: {
        files: [
          paths.source.definitions + '**/*.less',
          paths.source.definitions + '**/*.variables',
          paths.source.definitions + '**/*.overrides',
          paths.source.definitions + '**/*.js'
        ],
        tasks : watchTasks
      }
    },

    /*******************************
                  Test
    *******************************/

    // Clear terminal output
    clear: {
      terminal: {}
    },

    // Configured at run time
    copy: {
      file: {},
      uncompressedAssets: {
        expand: true,
        cwd: paths.source.themes,
        src    : [
          [
            '**/assets/**/*'
          ]
        ],
        dest   : paths.output.uncompressed + '/themes'
      },
      minifiedAssets: {
        expand: true,
        cwd: paths.source.themes,
        src    : [
          [
            '**/assets/**/*'
          ]
        ],
        dest   : paths.output.minified + '/themes'
      },
      packagedAssets: {
        expand: true,
        cwd: paths.source.themes,
        src    : [
          [
            '**/assets/**/*'
          ]
        ],
        dest   : paths.output.packaged + '/themes'
      },
      javascript: {
        expand : true,
        cwd    : paths.source.definitions,
        src    : ['**/*.js'],
        dest   : paths.output.uncompressed + '/definitions/'
      }
    },
    less: {
      options: {
        paths        : ['src'],
        compress     : false,
        optimization : 2
      },
      build: {
        rename : preserveFileExtensions
      },
      buildAll: {
        expand : true,
        cwd    : paths.source.definitions,
        src    : ['**/*.less'],
        dest   : paths.output.uncompressed + '/definitions/',
        rename : preserveFileExtensions
      }
    },

    // Clean a folder
    clean: {
      options: {
        force: true
      },
      output : [
        paths.output.uncompressed,
        paths.output.minified,
        paths.output.packaged
      ]
    },

    // Prefix
    autoprefixer: {
      options: {
        browsers: site.support
      },
      prefixOutput: {
        expand : true,
        cwd    : paths.output.uncompressed,
        dest   : paths.output.uncompressed,
        src    : [
          '**/*.css'
        ]
      },
      prefixFile: {
        src : paths.output.uncompressed + '**/*.css'
      }
    },

    // Minify
    cssmin: {
      options : {
        keepSpecialComments: 0,
        report: 'min',
        banner : '' +
          '/*\n' +
          '* # Semantic UI ' +
          '* http://github.com/semantic-org/semantic-ui\n' +
          '*\n' +
          '* Copyright <%= grunt.template.today("yyyy") %> \n' +
          '* Built: <%= grunt.template.today("mm/dd/yyyy") %>\n' +
          '*/\n'
      },
      minifyOutput: {
        expand : true,
        cwd    : paths.output.uncompressed,
        src    : [
          '**/*.css'
        ],
        dest   : paths.output.minified,
        rename : preserveMinFileExtensions
      }
    },

    // Minify JS
    uglify: {

      minifyOutput: {
        expand : true,
        cwd    : paths.output.uncompressed,
        src    : [
          '**/*.js'
        ],
        dest : paths.output.minified,
        ext  : '.min.js',
        banner   : '' +
          '/*' +
          '* # Semantic UI\n' +
          '* http://github.com/semantic-org/semantic-ui\n' +
          '*\n' +
          '* Copyright <%= grunt.template.today("yyyy") %> Contributors\n' +
          '*\n' +
          '* Build Date: <%= grunt.template.today("mm/dd/yyyy") %>\n' +
          '*/\n'
      }
    },

    concat: {
      options: {
      },
      createCSSPackage: {
        src: [ paths.output.minified + '**/*.css'],
        dest: paths.output.packaged + 'definitions/css/semantic.css'
      },
      createJSPackage: {
        src: [ paths.output.minified + '**/*.js'],
        dest: paths.output.packaged + 'definitions/js/semantic.js'
      }
    }

  };

  // filesys & terminal
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-clear');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // css
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-autoprefixer');

  // javascript
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.initConfig(config);
  grunt.registerTask('default', defaultTasks);
  grunt.registerTask('build', buildTasks);
  grunt.registerTask('reset', resetTasks);

  // compiles only changed less files <https://npmjs.org/package/grunt-contrib-watch>
  grunt.event.on('watch', setWatchFiles);

};