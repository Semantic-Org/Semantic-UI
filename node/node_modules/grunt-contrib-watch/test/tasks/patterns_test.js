'use strict';

var grunt = require('grunt');
var path = require('path');
var fs = require('fs');
var helper = require('./helper');

var fixtures = helper.fixtures;

function cleanUp() {
  helper.cleanUp([
    'patterns/node_modules'
  ]);
}

exports.patterns = {
  setUp: function(done) {
    cleanUp();
    fs.symlinkSync(path.join(__dirname, '../../node_modules'), path.join(fixtures, 'patterns', 'node_modules'));
    done();
  },
  tearDown: function(done) {
    cleanUp();
    done();
  },
  negate: function(test) {
    test.expect(2);
    var cwd = path.resolve(fixtures, 'patterns');
    var assertWatch = helper.assertTask('watch', {cwd:cwd});
    assertWatch(function() {
      grunt.file.write(path.join(cwd, 'lib', 'sub', 'dontedit.js'), 'var dontedit = true;');
      setTimeout(function() {
        grunt.file.write(path.join(cwd, 'lib', 'edit.js'), 'var edit = true;');
      }, 3000);
    }, function(result) {
      helper.verboseLog(result);
      test.ok(result.indexOf('File "lib' + path.sep + 'edit.js" changed') !== -1, 'Watch should have been triggered when edit.js was edited.');
      test.ok(result.indexOf('File "lib' + path.sep + 'dontedit.js" changed') === -1, 'Watch should NOT have been triggered when dontedit.js was edited.');
      test.done();
    });
  },
};
