module.exports = function(grunt) {
  var
    defaultTasks = [
      // watch less folder
      'watch' 
    ],
    watchTasks = [
      // compiles less
      'less:buildCSS',  
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
        cwd: 'src/files/components/semantic/',
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
              '**/*.js',
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
            cwd    : '../build/uncompressed',
            src    : [
              '**'
            ],
            dest   : 'src/files/components/semantic/'
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
          '../build/packaged/semantic.min.css': [
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
          '../build/packaged/semantic.min.js': [
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
  grunt.loadNpmTasks('grunt-docco');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-css');

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.initConfig(config);

  grunt.registerTask('default', defaultTasks);
  grunt.registerTask('build', buildTasks);
};
