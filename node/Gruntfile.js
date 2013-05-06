module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-css');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  var gruntConfig = require('./grunt-config.json');
  grunt.initConfig({
    watch: {
      scripts: {
        files: ["../src/**/*"],
        tasks: ["copy"]
      }
    },
    copy: {
      main: {
        files: [
          {expand: true, src: ["../src/**/*"], dest: 'src/files/components/semantic/src/'}
        ]
      }
    }
  });
  grunt.registerTask('default', Object.keys(gruntConfig).join(' '));
};
