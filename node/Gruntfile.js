module.exports = function(grunt) {

  var
    defaultTasks = [
      // watch less folder
      'watch'
    ],

    watchTasks = [
      // clean build directory
      'clean:build',

      // compiles less
      'less:buildCSS',

      // create concatenated css release
      'concat:concatenateCSS',

      // create concatenated js release
      'concat:concatenateJS',

      // copies assets and js over to build dir
      'copy:srcToBuild',

      // copies semantic over to docs
      'copy:buildToDocs',

      // copies examples over to docs
      'copy:examplesToDocs'
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

      // creates custom license in header
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

      // generate code docs
      'docco:generate',

      // creates release zip
      'compress:everything',

      // copies assets to rtl
      'copy:buildToRTL',

      // create rtl release
      'cssjanus:rtl',

      // cleans docs build folder
      'clean:docs',

      // copies spec files over to docs
      'copy:specToDocs',

      // copies examples over to docs
      'copy:examplesToDocs',

      // copies files over to docs
      'copy:buildToDocs'
    ],
    config
  ;

  config = {

    package : grunt.file.readJSON('package.json'),

    /*******************************
                 Watch
    *******************************/

    // watches for changes in a source folder
    watch: {
      scripts: {
        files: [
          '../build/examples/**/*',
          '../src/**/*.less',
          '../src/**/*.js'
        ],
        tasks : watchTasks
      }
    },

    /*******************************
                Build
    *******************************/

    clean: {
      build : {
        cwd: '../build',
        src: '*'
      },
      docs : {
        cwd: 'src/files/build/',
        src: '*'
      }
    },

    docco: {
      generate: {
        options: {
          css    : '../spec/assets/docco.css',
          output : '../spec/docs/'
        },
        files: [
          {
            expand : true,
            cwd    : '../spec/',
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
        cwd    : '../build/',
        src    : [
          '**/*.less',
          '**/*.css',
        ],
        dest   : '../rtl'
      },
    },

    less: {
      options: {
        compress     : false,
        optimization : 2
      },
      buildCSS: {
        options : {
          paths : ['../build']
        },
        expand : true,
        cwd    : '../src',
        src    : [
          '**/*.less'
        ],
        dest : '../build/uncompressed/',
        // this allows multiple dot names to be preserved
        rename: function(folder, filename) {
          return folder + filename.substring(0, filename.lastIndexOf('.') ) + '.css';
        }
      }
    },

    copy: {

      srcToBuild: {

        files: [
          // exact copy for less
          {
            expand : true,
            cwd    : '../src/',
            src    : [
              '**/*'
            ],
            dest : '../build/less'
          },
          // copy everything but less files for uncompressed release
          {
            expand : true,
            cwd    : '../src/',
            src    : [
              '**/*.js',
              'images/*',
              'fonts/*'
            ],
            dest : '../build/uncompressed'
          },
          // copy everything but less for minified release
          {
            expand : true,
            cwd    : '../src/',
            src    : [
              '**/*.js',
              'images/*',
              'fonts/*'
            ],
            dest : '../build/minified'
          },

          // copy assets only for packaged version
          {
            expand : true,
            cwd    : '../src/',
            src    : [
              'images/*',
              'fonts/*'
            ],
            dest : '../build/packaged'
          }
        ]
      },

      // copy assets to rtl
      buildToRTL: {
        files: [
          {
            expand : true,
            cwd    : '../build/',
            src    : [
              '**'
            ],
            dest   : '../rtl'
          }
        ]
      },

      // make library available in docs
      buildToDocs: {
        files: [
          {
            expand : true,
            cwd    : '../build/',
            src    : [
              '**'
            ],
            dest   : 'src/files/build/'
          }
        ]
      },

      // copy spec files to docs
      specToDocs: {
        files: [
          {
            expand : true,
            cwd    : '../spec',
            src    : [
              '**'
            ],
            dest   : 'src/files/spec/'
          }
        ]
      },

      // copy spec files to docs
      examplesToDocs: {
        files: [
          {
            expand : true,
            cwd    : '../examples',
            src    : [
              '**'
            ],
            dest   : 'src/files/examples/'
          }
        ]
      }

    },


    compress: {
      options: {
        archive: 'src/files/build/semantic.zip'
      },
      everything: {
        files: [
          {
            expand : true,
            cwd    : '../build/',
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
        src: ["../build/uncompressed/**/*.css"],
        dest: "../build/packaged/css/semantic.css"
      },
      concatenateJS: {
        src: ["../build/uncompressed/**/*.js"],
        dest: "../build/packaged/javascript/semantic.js"
      },
    },

    cssmin: {

      // copy minified css to minified release
      minifyCSS: {
        expand : true,
        cwd    : '../build/uncompressed',
        src    : [
          '**/*.css'
        ],
        dest : '../build/minified',
        ext  : '.min.css'
      },

      // add comment banner to css release
      addBanner: {
        options : {
          banner : '' +
            '/*\n' +
            '* # <%= package.semantic.name %>\n' +
            '* Version: <%= package.semantic.version %>\n' +
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
          '../build/packaged/css/semantic.min.css': [
            '../build/uncompressed/**/*.css'
          ]
        }
      }
    },

    uglify: {

      minifyJS: {
        expand : true,
        cwd    : '../build/uncompressed',
        src    : [
          '**/*.js'
        ],
        dest : '../build/minified',
        ext  : '.min.js',
        banner   : '' +
          '/*' +
          '* # <%= package.semantic.name %>\n' +
          '* Version: <%= package.semantic.version %>\n' +
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
            '* # <%= package.semantic.name %>\n' +
            '* Version: <%= package.semantic.version %>\n' +
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
          '../build/packaged/javascript/semantic.min.js': [
            '../build/uncompressed/**/*.js'
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
  grunt.loadNpmTasks('grunt-docco-multi');
  grunt.loadNpmTasks('grunt-cssjanus');

  grunt.initConfig(config);

  grunt.registerTask('default', defaultTasks);

  grunt.registerTask('build', buildTasks);

};
