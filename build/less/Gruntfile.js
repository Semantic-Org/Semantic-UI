module.exports = function(grunt) {

  var

    outputFolder = '../output',

    defaultTasks = [
      // run grunt watch
      'watch'
    ],

    watchTasks = [
      // compiles less to docs
      'less:outputCSS',

      // auto prefix doc files
      'autoprefixer:prefixFile',

      // copies assets and js over to docs
      'copy:filesToOutput',

      // create concatenated css release
      'concat:createCSSPackage',

      // create concatenated js release
      'concat:createJSPackage',
    ],

    buildTasks = [
      // (optional) clean output directory
      // 'clean:output',

      // copies assets and js over to build dir
      'copy:filesToOutput',

      // compiles less
      'less:buildCSS',

      // auto prefix build files
      'autoprefixer:prefixBuild',

      // creates minified js of each file
      'uglify:minifyJS',

      // creates minified css of each file
      'cssmin:minifyCSS',

      // create concatenated css release
      'concat:createCSSPackage',

      // create concatenated js release
      'concat:createJSPackage',

      // creates release js of all together
      'uglify:createMinJSPackage',

      // creates custom license in header
      'cssmin:createMinCSSPackage',

      // cleans previous generated release
      'clean:release'

    ],

    setWatchFiles = function(action, filePath) {
      var
        buildPath = outputFolder + filePath.replace('less', 'css')
      ;
      if(filePath.search('.less') !== -1) {
        grunt.config('less.outputCSS.src', filePath);
        grunt.config('less.outputCSS.dest', buildPath);
        grunt.config('autoprefixer.prefixFile.src', buildPath);
      }
      else {
        grunt.config('less.outputCSS.src', 'non/existant/path');
        grunt.config('less.outputCSS.dest', 'non/existant/path');
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

    cssPackage = outputFolder + '/packaged/css/semantic.min.css',
    jsPackage = outputFolder + '/packaged/javascript/semantic.min.js',

    config
  ;

  config = {

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
          'build/examples/**/*',
          './**/*.less',
          './**/*.variables',
          './**/*.config',
          './**/*.js'
        ],
        tasks : watchTasks
      }
    },

    /*******************************
                 Build
    *******************************/

    autoprefixer: {
      options: {
        browsers: [
          'last 2 version',
          '> 1%',
          'opera 12.1',
          'safari 6',
          'ie 9',
          'bb 10',
          'android 4'
        ]
      },
      prefixBuild: {
        expand : true,
        cwd    : '../output',
        dest   : './',
        src    : [
          '**/*.css'
        ]
      },
      prefixFile: {
        src : outputFolder + '**/*.css'
      }
    },

    clean: {
      options: {
        force: true
      },
      output : [outputFolder]
    },

    less: {

      options: {
        paths        : ['./'],
        compress     : false,
        optimization : 2
      },

      // optimized for watch, src is built on watch task using callbacks
      outputCSS: {
        src    : './',
        dest   : outputFolder + '/uncompressed/',
        rename : preserveFileExtensions
      },

      buildCSS: {
        expand : true,
        cwd    : './',
        src    : [
          '**/*.less'
        ],
        dest : outputFolder + '/uncompressed/',
        rename: preserveFileExtensions
      }
    },

    copy: {

      filesToOutput: {

        files: [
          // copy everything but less files for uncompressed release
          {
            expand : true,
            cwd    : './',
            src    : [
              '**/*.js',
              'themes/**/*'
            ],
            dest : outputFolder + '/uncompressed'
          },
          // copy assets only for minified version
          {
            expand : true,
            cwd    : './',
            src    : [
              'themes/**/*'
            ],
            dest : outputFolder + '/minified'
          },
          // copy assets only for packaged version
          {
            expand : true,
            cwd    : './',
            src    : [
              'themes/**/*'
            ],
            dest : outputFolder + '/packaged'
          }
        ]
      }

    },

    concat: {
      options: {
      },
      createCSSPackage: {
        src: [outputFolder + '/uncompressed/**/*.css'],
        dest: outputFolder + '/packaged/css/semantic.css'
      },
      createJSPackage: {
        src: [outputFolder + '/uncompressed/**/*.js'],
        dest: outputFolder + '/packaged/javascript/semantic.js'
      }
    },

    cssmin: {
      options : {
        keepSpecialComments: 0,
        report: 'min',
        banner : '' +
          '/*\n' +
          '* # <%= package.title %>\n' +
          '* http://github.com/jlukic/semantic-ui\n' +
          '*\n' +
          '*\n' +
          '* Copyright <%= grunt.template.today("yyyy") %> Contributors\n' +
          '* Released under the MIT license\n' +
          '* http://opensource.org/licenses/MIT\n' +
          '*\n' +
          '* Released: <%= grunt.template.today("mm/dd/yyyy") %>\n' +
          '*/\n'
      },

      // copy minified css to minified release
      minifyCSS: {
        expand : true,
        cwd    : outputFolder + '/uncompressed',
        src    : [
          '**/*.css'
        ],
        dest : outputFolder + '/minified/',
        rename: preserveMinFileExtensions
      },

      // add comment banner to css release
      createMinCSSPackage: {
        files: {
          cssPackage: [
            outputFolder + '/uncompressed/**/*.css'
          ]
        }
      }
    },

    uglify: {

      minifyJS: {
        expand : true,
        cwd    : outputFolder + '/uncompressed',
        src    : [
          '**/*.js'
        ],
        dest : outputFolder + '/minified',
        ext  : '.min.js',
        banner   : '' +
          '/*' +
          '* # <%= package.title %>\n' +
          '* Version: <%= package.version %>\n' +
          '* http://github.com/jlukic/semantic-ui\n' +
          '*\n' +
          '*\n' +
          '* Copyright <%= grunt.template.today("yyyy") %> Contributors\n' +
          '* Released under the MIT license\n' +
          '* http://opensource.org/licenses/MIT\n' +
          '*\n' +
          '* Release Date: <%= grunt.template.today("mm/dd/yyyy") %>\n' +
          '*/\n'
      },

      createMinJSPackage: {
        options: {
          mangle   : true,
          compress : true,
          banner   : '' +
            '/*' +
            '* # <%= package.title %>\n' +
            '* Version: <%= package.version %>\n' +
            '* http://github.com/jlukic/semantic-ui\n' +
            '*\n' +
            '*\n' +
            '* Copyright <%= grunt.template.today("yyyy") %> Contributors\n' +
            '* Released under the MIT license\n' +
            '* http://opensource.org/licenses/MIT\n' +
            '*\n' +
            '* Release Date: <%= grunt.template.today("mm/dd/yyyy") %>\n' +
            '*/\n'
        },
        files: {
          jsPackage: [
            outputFolder + '/uncompressed/**/*.js'
          ]
        }
      }
    }

  };


  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-autoprefixer');

  grunt.initConfig(config);

  grunt.registerTask('default', defaultTasks);
  grunt.registerTask('release', buildTasks);
  grunt.registerTask('build', buildTasks);
  grunt.registerTask('watch', watchTasks);

  // compiles only changed less files <https://npmjs.org/package/grunt-contrib-watch>
  grunt.event.on('watch', setWatchFiles);

};
