'use strict';

var grunt = require('grunt');

var tmp = 'tmp/',
    fixtures = 'test/fixtures/expected/';

exports.contrib_uglify = {
  preuglified_files: function(test) {

    var files = [
      'comments.js',
      'compress.js',
      'compress_mangle.js',
      'compress_mangle_beautify.js',
      'compress_mangle_except.js',
      'compress_mangle_sourcemap',
      'sourcemapurl.js',
      'multifile.js',
      'wrap.js',
      'exportAll.js',
      'sourcemap_prefix'
    ];

    test.expect(files.length);

    files.forEach(function(file){
      var actual = grunt.file.read(tmp + file);
      var expected = grunt.file.read(fixtures + file);
      test.equal(actual, expected, 'task output should equal ' + file);
    });

    test.done();
  },
  relative_test : function(test) {

    var files = [
      'sourcemapin',
      'sourcemapin.js',
      'multiple_sourcemaps1.js',
      'multiple_sourcemaps1.map',
      'multiple_sourcemaps2.js',
      'multiple_sourcemaps2.map',
    ];

    test.expect(files.length);

    files.forEach(function(file){
      var actual = grunt.file.read(tmp + file).replace(tmp,'REPLACED');
      var expected = grunt.file.read(fixtures + file).replace(fixtures,'REPLACED');
      test.equal(actual, expected, 'task output should equal ' + file);
    });

    test.done();
  }
};
