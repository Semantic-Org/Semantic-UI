'use strict';

var grunt = require('grunt');
var path = require('path');
var fs = require('fs');
var helper = require('./helper');

var fixtures = helper.fixtures;

function cleanUp() {
  helper.cleanUp([
    'fail/node_modules',
    'fail/lib/added.js'
  ]);
}

exports.fail = {
  setUp: function(done) {
    cleanUp();
    fs.symlinkSync(path.join(__dirname, '../../node_modules'), path.join(fixtures, 'fail', 'node_modules'));
    done();
  },
  tearDown: function(done) {
    cleanUp();
    done();
  },
  warn: function(test) {
    test.expect(1);
    var cwd = path.resolve(fixtures, 'fail');
    var assertWatch = helper.assertTask('watch:warn', {cwd: cwd});
    assertWatch([function() {
      grunt.file.write(path.join(cwd, 'lib/one.js'), 'var one = true;');
    }, function() {
      grunt.file.write(path.join(cwd, 'lib/one.js'), 'var one = true;');
    }], function(result) {
      helper.verboseLog(result);
      test.ok(result.match(/This task should warn/g).length === 2, 'grunt.warn should not stop the watch task.');
      test.done();
    });
  },
  fatal: function(test) {
    test.expect(1);
    var cwd = path.resolve(fixtures, 'fail');
    var assertWatch = helper.assertTask('watch:fatal', {cwd: cwd});
    assertWatch([function() {
      grunt.file.write(path.join(cwd, 'lib/one.js'), 'var one = true;');
    }, function() {
      grunt.file.write(path.join(cwd, 'lib/one.js'), 'var one = true;');
    }], function(result) {
      helper.verboseLog(result);
      test.ok(result.match(/This task should be fatal/g).length === 2, 'grunt.fatal should not stop the watch task.');
      test.done();
    });
  },
};
