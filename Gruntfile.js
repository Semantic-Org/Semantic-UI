module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        config: {
            compile: {
                src: 'src/',
                dest: 'build/compiled/'
            },
            minify: {
                src: 'build/compiled/',
                dest: 'build/minified/'
            },
            package: {
                src: 'build/minified/',
                dest: 'build/packaged/'
            }
        },

        less: {
            compile: {
                files: [{
                    expand: true,
                    cwd: '<%= config.compile.src %>',
                    src: ['**/*.less'],
                    dest: '<%= config.compile.dest %>',
                    ext: '.css'
                }]
            },
        },

        cssmin: {
            minify: {
                files: [{
                    expand: true,
                    cwd: '<%= config.minify.src %>',
                    src: ['**/*.css'],
                    dest: '<%= config.minify.dest %>',
                    ext: '.min.css'
                }]
            },
        },

        uglify: {
            minify: {
                files: [{
                    expand: true,
                    cwd: '<%= config.minify.src %>',
                    src: ['**/*.js'],
                    dest: '<%= config.minify.dest %>',
                    ext: '.min.js'
                }]
            },
        },

        concat: {
            package: {
                files: {
                    '<%= config.package.dest %>js/semantic.min.js': ['<%= config.package.src %>**/*.js'],
                    '<%= config.package.dest %>css/semantic.min.css': ['<%= config.package.src %>**/*.css']
                }
            },
        },

        copy: {
            compile: {
                files: [{
                    expand: true,
                    cwd: '<%= config.compile.src %>',
                    src: [
                        '**/*.js',
                        'fonts/**/*.*',
                        'images/**/*.*'
                    ],
                    dest: '<%= config.compile.dest %>',
                }]
            },
            minify: {
                files: [{
                    expand: true,
                    cwd: '<%= config.minify.src %>',
                    src: [
                        'fonts/**/*.*',
                        'images/**/*.*'
                    ],
                    dest: '<%= config.minify.dest %>',
                }]
            },
            package: {
                files: [{
                    expand: true,
                    cwd: '<%= config.package.src %>',
                    src: [
                        'fonts/**/*.*',
                        'images/**/*.*'
                    ],
                    dest: '<%= config.package.dest %>',
                }]
            }
        }

    })

    grunt.loadNpmTasks('grunt-contrib-less')
    grunt.loadNpmTasks('grunt-contrib-concat')
    grunt.loadNpmTasks('grunt-contrib-copy')
    grunt.loadNpmTasks('grunt-contrib-uglify')
    grunt.loadNpmTasks('grunt-contrib-cssmin')

    grunt.registerTask('compile', ['less:compile', 'copy:compile'])
    grunt.registerTask('minify', ['cssmin:minify', 'uglify:minify', 'copy:minify'])
    grunt.registerTask('package', ['concat:package', 'copy:package'])

    grunt.registerTask('build', ['compile', 'minify', 'package'])
    
}