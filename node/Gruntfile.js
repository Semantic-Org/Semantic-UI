module.exports = function(grunt) {
  var
    defaultTasks = [
      // watch less folder
      'watch'
    ],
    watchTasks = [
      // compiles less
      'less:buildCSS',
      // copies assets and js over to build dir
      'copy:toBuild',
      // copies files over to docs
      'copy:libraryToDocs'
    ],
    buildTasks = [
      // clean build directory
      'clean:build',

      // compiles less
      'less:buildCSS',

      // copies assets and js over to build dir
      'copy:toBuild',

      // creates minified css of each file
      'cssmin:minifyCSS',

      // creates custom license in header
      'cssmin:addBanner',

      // creates minified js of each file
      'uglify:minifyJS',

      // creates release js of all together
      'uglify:buildReleaseJS',

      // creates release zip
      'compress:everything',

      // cleans docs folder
      'clean:docs',

      // copies spec files over to docs
      'copy:specToDocs',

      // copies files over to docs
      'copy:libraryToDocs'
    ],
    config
  ;

  config = {

    package : grunt.file.readJSON('package.json'),
    //server  : grunt.file.readJSON('server.json'),

    // watches for changes in a source folder
    watch: {
      scripts: {
        files: [
          '../src/**/*.less',
          '../src/**/*.js'
        ],
        tasks : watchTasks
      }
    },

    clean: {
      build : {
        cwd: '../build',
        src: '*'
      },
      docs : {
        cwd: 'src/files/release/uncompressed/',
        src: '*'
      }
    },

    docco: {
      generate: {
        expand : true,
        cwd    : '../spec',
        src    : [
          '**/*.commented.js'
        ],
        options: {
          output: 'src/files/generated/'
        }
      }
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
        dest : '../build/uncompressed',
        ext  : '.css'
      }
    },

    compress: {
      options: {
        archive: 'src/files/release/semantic.zip'
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

    copy: {
      toBuild: {
        files: [
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
          {
            expand : true,
            cwd    : '../src/',
            src    : [
              '**/*'
            ],
            dest : '../build/less'
          },
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
      libraryToDocs: {
        files: [
          {
            expand : true,
            cwd    : '../build/',
            src    : [
              '**'
            ],
            dest   : 'src/files/release/'
          }
        ]
      },
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
      }
    },

    cssmin: {

      minifyCSS: {
        expand : true,
        cwd    : '../build/uncompressed',
        src    : [
          '**/*.css'
        ],
        dest : '../build/minified',
        ext  : '.min.css'
      },

      addBanner: {
        options : {
          banner : '' +
            '/*\n' +
            '* # <%= package.semantic.name %>\n' +
            '* Version: <%= package.semantic.version %>\n' +
            '* http://github.com/quirkyinc/semantic\n' +
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
        ext  : '.min.js'
      },

      buildReleaseJS: {
        options: {
          mangle   : true,
          compress : true,
          banner   : '' +
            '/*' +
            '* # <%= package.semantic.name %>\n' +
            '* Version: <%= package.semantic.version %>\n' +
            '* http://github.com/quirkyinc/semantic\n' +
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
          '../build/packaged/javascript/semantic.min.js': [
            '../build/uncompressed/**/*.js'
          ]
        }
      }
    },
    s3: {
      options: '<%= server.cdn %>',
      deploy: {
        options: {
        },
        upload: [
          {
            src: '../docs',
            dest: 'docs'
          }
        ]
      }
    }

  };

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-css');
  grunt.loadNpmTasks('grunt-docco');

  grunt.initConfig(config);

  grunt.registerTask('default', defaultTasks);
  grunt.registerTask('build', buildTasks);
};
