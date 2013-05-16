module.exports = function(grunt) {
  var

    tasks = [
      'watch',
      'uglify',
      'cssmin',
      'copy'
    ],

    config = {

      package: grunt.file.readJSON('package.json'),

      // watches for changes in a source folder
      watch: {
        scripts: {
          files: [
            '../src/**/*'
          ],
          tasks: tasks
        }
      },

      // minify javascript
      uglify: {
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
        my_target: {
          files: {
            '../semantic.min.js': [
              '../src/**/*.js'
            ]
          }
        }
      },

      // minify css
      cssmin: {
        // creates minified version of each css
        minify: {
          keepSpecialComments: true,
          expand : true,
          cwd: '../src/',
          src: [
            '**/*.css'
          ],
          dest : '../min',
          ext  : '.min.css'
        },
        // bundles all into one css file
        combine: {
          files: {
            '../semantic.min.css': [
              '../src/**/*.css'
            ]
          }
        },
        // adds banner to bundled css
        add_banner: {
          options: {
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
            '../semantic.min.css': ['../semantic.min.css']
          }
        }
      },

      // copies files to docs project
      copy: {
        main: {
          files: [
            // source files
            {
              expand : true,
              src    : [
                '../src/**/*'
              ],
              dest   : 'src/files/components/semantic/src/'
            },
            // minified
            {
              expand : true,
              src    : [
                '../src/**/*',
                '../'
              ],
              dest   : 'src/files/components/semantic/src/'
            }
          ]
        }
      }

    }
  ;

  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-css');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.initConfig(config);
  grunt.registerTask('default', tasks);
};
