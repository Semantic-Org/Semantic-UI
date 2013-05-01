/**
 * Temporary - The lord of tmp.
 *
 * Author: Veselin Todorov <hi@vesln.com>
 * Licensed under the MIT License.
 */

/**
 * Dependencies.
 */
var path = require('path');
var fs = require('fs');
var existsSync = fs.existsSync || path.existsSync;

var Base = require('../lib/base');
var generator = require('../lib/generator');
var should = require('chai').should();

Base.prototype.create = function() {};

describe('Base', function() {
  describe('rename', function() {
    it('should rename the directory', function(done) {
      var tmp = new Base;
      tmp.path = generator.build();
      fs.mkdirSync(path.normalize(tmp.path), 0777);
      existsSync(tmp.path).should.be.ok;
      tmp.rename('foo', function(err) {
        existsSync(tmp.path).should.be.ok;
        done();
      });
    });
  });

  describe('renameSync', function() {
    it('should rename the directory', function() {
      var tmp = new Base('foo');
      tmp.path = generator.build();
      fs.mkdirSync(path.normalize(tmp.path), 0777);
      var oldPath = tmp.path;
      existsSync(tmp.path).should.be.ok;
      tmp.renameSync('foo3');
      existsSync(tmp.path).should.be.ok;
      path.should.not.eql(oldPath);
    });
  });

  describe('prepareArgs', function() {
    it('should convert object to array and append path as first element', function() {
      var tmp = new Base('foo');
      var args = { 0: 'foo' };
      args.length = 1;
      tmp.path = generator.build();
      tmp.prepareArgs(args).should.eql([tmp.path, 'foo']);
    });
  });
});
