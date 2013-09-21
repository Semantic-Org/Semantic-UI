module.exports = function (grunt) {

    grunt.initConfig({
        package: grunt.file.readJSON('package.json'),

        /*
         * Less file compilation
         */
        less: {
            /* 
             * Compiles less files to 'build/semantic-ui.min.css' (minified)
             */
            production: {
                options: {
                    paths: ["src/less/"],
                    yuicompress: true
                },
                files: {
                    "build/semantic-ui.min.css": "src/less/semantic-ui.less"
                }
            },

            /*
             * Compiles less files to 'build/semantic-ui.css' (unminified)
             */
            development: {
                options: {
                    paths: ["src/less/"]
                },
                files: {
                    "build/semantic-ui.css": "src/less/semantic-ui.less"
                }
            }
        },

        watch: {
            /*
             * Watches for changes to the less files in 'src/less'
             */
            css: {
                files: ['src/less/**/*.less'],
                tasks: ["build-css"]
            },

            /*
             * Watches for changes to the coffeescript files in 'src/coffee'
             */
            js: {
                files: ['src/js/**/*.js'],
                tasks: ["build-js"]
            }
        },

        /*
         * Cleans the 'build' and 'files/release' folders.
         */
        clean: {
            build: ["build/*"],
            docs: ["node/src/files/release/*"]
        },

        docco: {
            generate: {
                expand: true,
                cwd: '../spec',
                src: ['**/*.commented.js'],
                options: {
                    output: 'src/files/generated/'
                }
            }
        },


        compress: {
            options: {
                archive: 'build/semantic-ui.zip'
            },
            minified: {
                files: [{
                    expand: true,
                    cwd: 'build/',
                    src: [
                        '*.min.js',
                        '*.min.css',
                        'font/*',
                        'img/*'
                    ]
                }]
            }
        },

        copy: {
            fonts: {
                    expand: true,
                    cwd: 'src/',
                    src: ['font/*'],
                    dest: 'build/'
            },
            images: {
                    expand: true,
                    cwd: 'src/',
                    src: ['img/*'],
                    dest: 'build/'
            }
        },


        concat: {
            js: {
                options: {
                    banner: '' + '/*' + '* # <%= package.semantic.name %>\n' + '* Version: <%= package.semantic.version %>\n' + '* http://github.com/quirkyinc/semantic\n' + '*\n' + '*\n' + '* Copyright <%= grunt.template.today("yyyy") %> Contributors\n' + '* Released under the MIT license\n' + '* http://opensource.org/licenses/MIT\n' + '*\n' + '* Released: <%= grunt.template.today("mm/dd/yyyy") %>\n' + '*/\n'

                },
                files: {
                    "build/semantic-ui.js": ["src/js/**/*.js"]
                }
            }
        },

        uglify: {
            options: {
              mangle: true
            },
            js: {
                files: {
                  "build/semantic-ui.min.js": "build/semantic-ui.js"
                }
            },
        },

        s3: {
            options: '<%= server.cdn %>',
            deploy: {
                options: {},
                upload: [{
                    src: '../docs',
                    dest: 'docs'
                }]
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-docco');
    grunt.loadNpmTasks('grunt-css');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');

    /*
     * Build aliases
     */
    grunt.registerTask('build-css', ['less']);
    grunt.registerTask('build-js', ['concat:js', 'uglify:js']);
    grunt.registerTask('build-images', ['copy:images']);
    grunt.registerTask('build-fonts', ['copy:fonts']);
    grunt.registerTask('build', ['clean', 'build-css', 'build-js', 'build-images', 'build-fonts']);

    grunt.registerTask('default', ['build', 'compress']);

};