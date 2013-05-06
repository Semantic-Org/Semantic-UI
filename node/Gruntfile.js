module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-css');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-watch');
  var gruntConfig = require('./grunt-config.json');
  grunt.initConfig({
    watch: {
      scripts: {
        files: ["../src/**/*"],
        tasks: ["bower"]
      }
    },
    bower: {
      install: {
      }
    }
  });
  grunt.registerTask('default', Object.keys(gruntConfig).join(' '));
};
