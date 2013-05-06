module.exports = function(grunt) {

  grunt.registerTask('print', 'Print the specified text.', function(text) {
    console.log('OUTPUT: ' + text);
    // console.log(process.cwd());
  });

};
