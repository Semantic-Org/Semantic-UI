var grunt = require('grunt');
var fs = require('fs');

exports.less = {
  compile: function(test) {
    'use strict';

    test.expect(2);

    var actual = grunt.file.read('tmp/less.css');
    var expected = grunt.file.read('test/expected/less.css');
    test.equal(expected, actual, 'should compile less, with the ability to handle imported files from alternate include paths');

    actual = grunt.file.read('tmp/concat.css');
    expected = grunt.file.read('test/expected/concat.css');
    test.equal(expected, actual, 'should concat output when passed an array');

    test.done();
  },
  compress: function(test) {
    'use strict';

    test.expect(1);

    var actual = grunt.file.read('tmp/compress.css');
    var expected = grunt.file.read('test/expected/compress.css');
    test.equal(expected, actual, 'should compress output when compress option is true');

    test.done();
  },
  nopaths: function(test) {
    'use strict';

    test.expect(1);

    var actual = grunt.file.read('tmp/nopaths.css');
    var expected = grunt.file.read('test/expected/nopaths.css');
    test.equal(expected, actual, 'should default paths to the dirname of the less file');

    test.done();
  },
  yuicompress: function(test) {
    'use strict';

    test.expect(1);

    var actual = grunt.file.read('tmp/yuicompress.css');
    var expected = grunt.file.read('test/expected/yuicompress.css');
    test.equal(expected, actual, 'should yuicompress output when yuicompress option is true');

    test.done();
  }
};
