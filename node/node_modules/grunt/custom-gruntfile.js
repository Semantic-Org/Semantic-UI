module.exports = function(grunt) {
  grunt.log.writeln('foo', 'bar', 'baz');

  grunt.initConfig({
    clean: {
      all: [
        'deep/**',
      ],
      exclude: [
        'deep/**',
        '!deep/deep.txt'
      ],
    }
  });

  grunt.registerMultiTask('clean', function() {
    this.filesSrc.forEach(function(filepath) {
      console.log('delete', filepath);
    });
  });
};
