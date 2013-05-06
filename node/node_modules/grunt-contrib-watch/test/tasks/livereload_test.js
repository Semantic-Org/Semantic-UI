'use strict';

var grunt = require('grunt');
var path = require('path');
var fs = require('fs');
var http = require('http');
var helper = require('./helper');

var fixtures = helper.fixtures;

function cleanUp() {
  helper.cleanUp([
    'livereload/node_modules',
  ]);
}

// Helper for requesting the live reload server
function request(port, done) {
  var data = '';
  var req = http.request({
    hostname: 'localhost',
    port: port,
  }, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      data += chunk;
    });
    res.on('end', function() {
      done(data);
    });
  });
  req.end();
}

exports.livereload = {
  setUp: function(done) {
    cleanUp();
    fs.symlinkSync(path.join(__dirname, '../../node_modules'), path.join(fixtures, 'livereload', 'node_modules'));
    done();
  },
  tearDown: function(done) {
    cleanUp();
    done();
  },
  basic: function(test) {
    test.expect(4);
    var resultData = '';
    var cwd = path.resolve(fixtures, 'livereload');
    var assertWatch = helper.assertTask(['watch:basic', '-v'], {cwd: cwd});
    assertWatch([function() {
      request(35729, function(data) {
        resultData += data;
        grunt.file.write(path.join(cwd, 'lib', 'one.js'), 'var one = true;');
      });
    }], function(result) {
      result = helper.unixify(result);
      helper.verboseLog(result);
      test.ok(result.indexOf('I ran before livereload.') !== -1, 'task should have ran before live reload.');
      test.ok(result.indexOf('Live reload server started on port: 35729') !== -1, 'live reload server should have been started on port 35729.');
      test.ok(result.indexOf('Live reloading lib/one.js...') !== -1, 'live reload should have triggered on lib/one.js');
      resultData = JSON.parse(resultData);
      test.equal(resultData.tinylr, 'Welcome', 'tinylr server should have welcomed you.');
      test.done();
    });
  },
  customport: function(test) {
    test.expect(4);
    var resultData = '';
    var cwd = path.resolve(fixtures, 'livereload');
    var assertWatch = helper.assertTask(['watch:customport', '-v'], {cwd: cwd});
    assertWatch([function() {
      request(8675, function(data) {
        resultData += data;
        grunt.file.write(path.join(cwd, 'lib', 'one.js'), 'var one = true;');
      });
    }], function(result) {
      result = helper.unixify(result);
      helper.verboseLog(result);
      test.ok(result.indexOf('I ran before livereload.') !== -1, 'task should have ran before live reload.');
      test.ok(result.indexOf('Live reload server started on port: 8675') !== -1, 'live reload server should have been started on port 35729.');
      test.ok(result.indexOf('Live reloading lib/one.js...') !== -1, 'live reload should have triggered on lib/one.js');
      resultData = JSON.parse(resultData);
      test.equal(resultData.tinylr, 'Welcome', 'tinylr server should have welcomed you.');
      test.done();
    });
  },
  nospawn: function(test) {
    test.expect(4);
    var resultData = '';
    var cwd = path.resolve(fixtures, 'livereload');
    var assertWatch = helper.assertTask(['watch:nospawn', '-v'], {cwd: cwd});
    assertWatch([function() {
      request(1337, function(data) {
        resultData += data;
        grunt.file.write(path.join(cwd, 'lib', 'one.js'), 'var one = true;');
      });
    }], function(result) {
      result = helper.unixify(result);
      helper.verboseLog(result);
      test.ok(result.indexOf('I ran before livereload.') !== -1, 'task should have ran before live reload.');
      test.ok(result.indexOf('Live reload server started on port: 1337') !== -1, 'live reload server should have been started on port 35729.');
      test.ok(result.indexOf('Live reloading lib/one.js...') !== -1, 'live reload should have triggered on lib/one.js');
      resultData = JSON.parse(resultData);
      test.equal(resultData.tinylr, 'Welcome', 'tinylr server should have welcomed you.');
      test.done();
    });
  },
};
