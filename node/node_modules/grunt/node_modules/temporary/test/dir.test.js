/**
 * Temporary - The lord of tmp.
 *
 * Author: Veselin Todorov <hi@vesln.com>
 * Licensed under the MIT License.
 */

/**
 * Dependencies.
 */
var fs = require('fs');
var path = require('path');
var existsSync = fs.existsSync || path.existsSync;

var Tempdir = require('../lib/dir');
var sinon = require('sinon');
var should = require('chai').should();

describe('Tempdir', function() {
  it('should create file', function() {
    var tmp = new Tempdir('foo');
    existsSync(tmp.path).should.be.ok;
  });

  describe('rmdir', function() {
    it('should remove the directory', function() {
      var tmp = new Tempdir('foo');
      sinon.spy(fs, 'rmdir');
      tmp.rmdir();
      fs.rmdir.getCall(0).args[0].should.eql(tmp.path);
      fs.rmdir.restore();
    });
  });

  describe('rmdirSync', function() {
    it('should remove the directory', function() {
      var tmp = new Tempdir('foo');
      sinon.spy(fs, 'rmdirSync');
      tmp.rmdirSync();
      fs.rmdirSync.getCall(0).args[0].should.eql(tmp.path);
      fs.rmdirSync.restore();
    });
  });
});
