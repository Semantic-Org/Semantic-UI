var grunt = require('../../lib/grunt');

exports['utils'] = {
  'linefeed': function(test) {
    test.expect(1);
    if (process.platform === 'win32') {
      test.equal(grunt.utils.linefeed, '\r\n', 'linefeed should be operating-system appropriate.');
    } else {
      test.equal(grunt.utils.linefeed, '\n', 'linefeed should be operating-system appropriate.');
    }
    test.done();
  },
  'normalizelf': function(test) {
    test.expect(1);
    if (process.platform === 'win32') {
      test.equal(grunt.utils.normalizelf('foo\nbar\r\nbaz\r\n\r\nqux\n\nquux'), 'foo\r\nbar\r\nbaz\r\n\r\nqux\r\n\r\nquux', 'linefeeds should be normalized');
    } else {
      test.equal(grunt.utils.normalizelf('foo\nbar\r\nbaz\r\n\r\nqux\n\nquux'), 'foo\nbar\nbaz\n\nqux\n\nquux', 'linefeeds should be normalized');
    }
    test.done();
  }
};
