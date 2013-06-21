module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    clean: { tests: ["docs"] },
    docco: {
      tests: {
        src: ['test/**/*.js', 'test/**/*.coffee'],
        dest: "docs/"
      },
      'custom-css-test': {
          src: ['test/**/*.js'],
          dest: 'docs/',
          options: {
              css: 'test/fixtures/custom.css'
          }
      }
    },
    nodeunit: {
      tests: ['test/*_test.js']
    }
  });

  // Load local tasks.
  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.registerTask('test', ['clean:tests', 'docco', 'nodeunit:tests']);

  // Default task.
  grunt.registerTask('default', ['lint', 'docco']);

};
