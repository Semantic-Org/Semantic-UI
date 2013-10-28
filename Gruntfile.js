module.exports = function(grunt) {

  var

    defaultTasks = [
      // run grunt watch
      'watch'
    ],

    watchTasks = [
      // compiles less to docs
      'less:buildDocsCSS',

      // auto prefix doc files
      'autoprefixer:prefixDocs',

      // copies assets and js over to docs
      'copy:srcToDocs',

      // copies examples over to docs
      'copy:examplesToDocs'
    ],

    testWatchTasks = [
      'clear',
      'karma:watch:run'
    ],

    testTasks = [
      // compiles less to docs so phantomjs can read
      'less:buildTestCSS',

      // test components
      'karma:travis'
    ],

    specTasks = [
      // generate code docs
      'docco:generate',

      // copies spec files over to docs
      'copy:specToDocs'
    ],

    buildTasks = [
      // clean build directory
      'clean:build',

      // compiles less
      'less:buildCSS',

      // copies assets and js over to build dir
      'copy:srcToBuild',

      // creates minified css of each file
      'cssmin:minifyCSS',

      // adds custom license in header
      'cssmin:addBanner',

      // create concatenated css release
      'concat:concatenateCSS',

      // create concatenated js release
      'concat:concatenateJS',

      // creates minified js of each file
      'uglify:minifyJS',

      // creates release js of all together
      'uglify:buildReleaseJS',

      // creates minified css of each file
      'cssmin:minifyCSS',

      // creates custom license in header
      'cssmin:addBanner',

      // auto prefix build files
      'autoprefixer:prefixBuild',

      // cleans previous generated release
      'clean:release',

      // creates release zip
      'compress:everything',

      // copies assets to rtl
      'copy:buildToRTL',

      // create rtl release
      'cssjanus:rtl',

      // copies examples over to docs
      'copy:examplesToDocs',

      // copies files over to docs
      'copy:buildToDocs',

      // generate code docs
      'docco:generate',

      // copies spec files over to docs
      'copy:specToDocs'
    ],

    setWatchTests = function(action, filePath) {
      var
        karmaFiles   = grunt.config('karma.watch.files'),
        isJavascript = (filePath.search('.js') !== -1),
        isModule     = (filePath.search('modules/') !== -1),
        isSpec       = (filePath.search('.spec') !== -1),
        specFile     = (isSpec)
          ? filePath
          : filePath
              .replace('src/', 'test/')
              .replace('.js', '.spec.js')
      ;
      if(isJavascript && (isSpec || isModule) ) {
        karmaFiles.pop();
        karmaFiles.push(specFile);
      }
    },

    setWatchFiles = function(action, filePath) {
      var
        buildPath = filePath.replace('src/', 'docs/build/uncompressed/').replace('less', 'css')
      ;
      if(filePath.search('.less') !== -1) {
        grunt.config('less.buildDocsCSS.src', filePath);
        grunt.config('less.buildDocsCSS.dest', buildPath);
        grunt.config('autoprefixer.prefixDocs.src', buildPath);
      }
      else {
        grunt.config('less.buildDocsCSS.src', 'non/existant/path');
        grunt.config('less.buildDocsCSS.dest', 'non/existant/path');
      }
    },

    // this allows filenames with multiple extensions to be preserved
    preserveFileExtensions = function(folder, filename) {
      return folder + filename.substring(0, filename.lastIndexOf('.') ) + '.css';
    },

    config
  ;

  config = {

    package : grunt.file.readJSON('package.json'),

    /*******************************
                 Watch
    *******************************/

    // watches for changes in a source folder
    watch: {
      options: {
        spawn: false
      },
      scripts: {
        files: [
          'test/**/*.js',
          'src/**/*.js'
        ],
        tasks : testWatchTasks
      },
      src: {
        files: [
          'build/examples/**/*',
          'src/**/*.less',
          'src/**/*.js'
        ],
        tasks : watchTasks
      }
    },

    /*******************************
                  Test
    *******************************/

    clear: {
      terminal: {

      }
    },

    karma: {
      watch: {
        configFile : 'karma.conf.js',
        background : true
      },
      travis: {
        configFile : 'karma.conf.js',
        singleRun  : true
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
          'ie 9',
          'bb 10',
          'android 4'
        ]
      },
      prefixBuild: {
        src : 'build/**/*.css'
      },
      prefixDocs: {
        src : 'docs/build/**/*.css'
      }
    },

    clean: {
      options: {
        force: true
      },
      build : [
        'build/less',
        'build/minified',
        'build/packaged',
        'build/uncompressed'
      ],
      release : [
        'docs/build',
        'docs',
        'rtl'
      ]
    },

    docco: {
      generate: {
        options: {
          css    : 'spec/assets/docco.css',
          output : 'spec/docs/'
        },
        files: [
          {
            expand : true,
            cwd    : 'spec/',
            src    : [
              '**.commented.js'
            ]
          }
        ]
      }
    },

    cssjanus: {
      rtl: {
        expand : true,
        cwd    : 'build/',
        src    : [
          '**/*.less',
          '**/*.css',
        ],
        dest   : 'rtl'
      },
    },

    less: {

      options: {
        paths        : ['src'],
        compress     : false,
        optimization : 2
      },

      // optimized for watch, src is built on watch task using callbacks
      buildDocsCSS: {
        src    : 'src',
        dest   : 'docs/build/uncompressed/',
        rename : preserveFileExtensions
      },

      buildTestCSS: {
        expand : true,
        cwd    : 'src',
        src    : [
          '**/*.less'
        ],
        dest : 'docs/build/uncompressed/',
        rename: preserveFileExtensions
      },

      buildCSS: {
        expand : true,
        cwd    : 'src',
        src    : [
          '**/*.less'
        ],
        dest : 'build/uncompressed/',
        rename: preserveFileExtensions
      }
    },

    copy: {

      srcToDocs: {

        files: [
          // exact copy for less
          {
            expand : true,
            cwd    : 'src/**/*.less',
            src    : [
              '**/*'
            ],
            dest : 'docs/build/less'
          },
          // copy everything but less files for uncompressed release
          {
            expand : true,
            cwd    : 'src/',
            src    : [
              '**/*.js',
              'images/*',
              'fonts/*'
            ],
            dest : 'docs/build/uncompressed'
          },
          // copy everything but less for minified release
          {
            expand : true,
            cwd    : 'src/',
            src    : [
              '**/*.js',
              'images/*',
              'fonts/*'
            ],
            dest : 'docs/build/minified'
          },

          // copy assets only for packaged version
          {
            expand : true,
            cwd    : 'src/',
            src    : [
              'images/*',
              'fonts/*'
            ],
            dest : 'docs/build/packaged'
          }
        ]
      },

      srcToBuild: {

        files: [
          // exact copy for less
          {
            expand : true,
            cwd    : 'src/',
            src    : [
              '**/*'
            ],
            dest : 'build/less'
          },
          // copy everything but less files for uncompressed release
          {
            expand : true,
            cwd    : 'src/',
            src    : [
              '**/*.js',
              'images/*',
              'fonts/*'
            ],
            dest : 'build/uncompressed'
          },
          // copy everything but less for minified release
          {
            expand : true,
            cwd    : 'src/',
            src    : [
              '**/*.js',
              'images/*',
              'fonts/*'
            ],
            dest : 'build/minified'
          },

          // copy assets only for packaged version
          {
            expand : true,
            cwd    : 'src/',
            src    : [
              'images/*',
              'fonts/*'
            ],
            dest : 'build/packaged'
          }
        ]
      },

      // create new rtl assets
      buildToRTL: {
        files: [
          {
            expand : true,
            cwd    : 'build/',
            src    : [
              '**'
            ],
            dest   : 'rtl'
          }
        ]
      },

      // make library available in docs
      buildToDocs: {
        files: [
          {
            expand : true,
            cwd    : 'build/',
            src    : [
              '**'
            ],
            dest   : 'docs/build/'
          }
        ]
      },

      // copy spec files to docs
      specToDocs: {
        files: [
          {
            expand : true,
            cwd    : 'spec',
            src    : [
              '**'
            ],
            dest   : 'docs/spec/'
          }
        ]
      },

      // copy spec files to docs
      examplesToDocs: {
        files: [
          {
            expand : true,
            cwd    : 'build/examples',
            src    : [
              '**'
            ],
            dest   : 'docs/examples/'
          }
        ]
      }

    },


    compress: {
      options: {
        archive: 'docs/build/semantic.zip'
      },
      everything: {
        files: [
          {
            expand : true,
            cwd    : 'build/',
            src    : [
              '**'
            ]
          }
        ]
      }
    },

    concat: {
      options: {
      },
      concatenateCSS: {
        src: ['build/uncompressed/**/*.css'],
        dest: 'build/packaged/css/semantic.css'
      },
      concatenateJS: {
        src: ['build/uncompressed/**/*.js'],
        dest: 'build/packaged/javascript/semantic.js'
      },
    },

    cssmin: {

      // copy minified css to minified release
      minifyCSS: {
        expand : true,
        cwd    : 'build/uncompressed',
        src    : [
          '**/*.css'
        ],
        dest : 'build/minified',
        ext  : '.min.css'
      },

      // add comment banner to css release
      addBanner: {
        options : {
          banner : '' +
            '/*\n' +
            '* # <%= package.title %>\n' +
            '* Version: <%= package.version %>\n' +
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
        files: {
          'build/packaged/css/semantic.min.css': [
            'build/uncompressed/**/*.css'
          ]
        }
      }
    },

    uglify: {

      minifyJS: {
        expand : true,
        cwd    : 'build/uncompressed',
        src    : [
          '**/*.js'
        ],
        dest : 'build/minified',
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

      buildReleaseJS: {
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
          'build/packaged/javascript/semantic.min.js': [
            'build/uncompressed/**/*.js'
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
  grunt.loadNpmTasks('grunt-docco-multi');
  grunt.loadNpmTasks('grunt-cssjanus');
  grunt.loadNpmTasks('grunt-clear');
  grunt.loadNpmTasks('grunt-karma');

  grunt.initConfig(config);
  grunt.registerTask('default', defaultTasks);
  grunt.registerTask('build', buildTasks);
  grunt.registerTask('spec', specTasks);
  grunt.registerTask('test', testTasks);

  // compiles only changed less files <https://npmjs.org/package/grunt-contrib-watch>
  grunt.event.on('watch', setWatchFiles);

};
