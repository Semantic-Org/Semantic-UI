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

var Tempfile = require('../lib/file');
var sinon = require('sinon');
var should = require('chai').should();

describe('Tempfile', function() {
  it('should create file', function() {
    var tmp = new Tempfile('foo');
    existsSync(tmp.path).should.be.ok;
  });

  describe('readFile', function() {
    it('should call fs.readfile', function() {
      sinon.spy(fs, 'readFile');
      var tmp = new Tempfile;
      tmp.readFile();
      fs.readFile.getCall(0).args[0].should.eql(tmp.path);
      fs.readFile.restore();
    });
  });

  describe('readFileSync', function() {
    it('should call fs.readfileSync', function() {
      sinon.spy(fs, 'readFileSync');
      var tmp = new Tempfile;
      tmp.readFileSync();
      fs.readFileSync.getCall(0).args[0].should.eql(tmp.path);
      fs.readFileSync.restore();
    });
  });

  describe('writeFile', function() {
    it('should call fs.readfile', function() {
      sinon.spy(fs, 'writeFile');
      var tmp = new Tempfile;
      tmp.writeFile();
      fs.writeFile.getCall(0).args[0].should.eql(tmp.path);
      fs.writeFile.restore();
    });
  });

  describe('writeFileSync', function() {
    it('should call fs.writeFileSync', function() {
      sinon.spy(fs, 'writeFileSync');
      var tmp = new Tempfile;
      tmp.writeFileSync();
      fs.writeFileSync.getCall(0).args[0].should.eql(tmp.path);
      fs.writeFileSync.restore();
    });
  });

  describe('open', function() {
    it('should call fs.open', function() {
      sinon.spy(fs, 'open');
      var tmp = new Tempfile;
      tmp.open('r');
      fs.open.getCall(0).args[0].should.eql(tmp.path);
      fs.open.restore();
    });
  });

  describe('openSync', function() {
    it('should call fs.openSync', function() {
      sinon.spy(fs, 'openSync');
      var tmp = new Tempfile;
      tmp.openSync('r');
      fs.openSync.getCall(0).args[0].should.eql(tmp.path);
      fs.openSync.restore();
    });
  });

  describe('close', function() {
    it('should call fs.close', function() {
      sinon.spy(fs, 'close');
      var tmp = new Tempfile;
      var fd = tmp.openSync('r');
      tmp.close(fd);
      fs.close.getCall(0).args[0].should.eql(fd);
      fs.close.restore();
    });
  });

  describe('closeSync', function() {
    it('should call fs.closeSync', function() {
      sinon.spy(fs, 'closeSync');
      var tmp = new Tempfile;
      var fd = tmp.openSync('r');
      tmp.closeSync(fd);
      fs.closeSync.getCall(0).args[0].should.eql(fd);
      fs.closeSync.restore();
    });
  });

  describe('unlink', function() {
    it('should call fs.unlink', function() {
      sinon.spy(fs, 'unlink');
      var tmp = new Tempfile;
      tmp.unlink();
      fs.unlink.getCall(0).args[0].should.eql(tmp.path);
      fs.unlink.restore();
    });
  });

  describe('unlinkSync', function() {
    it('should call fs.readfileSync', function() {
      sinon.spy(fs, 'unlinkSync');
      var tmp = new Tempfile;
      tmp.unlinkSync();
      fs.unlinkSync.getCall(0).args[0].should.eql(tmp.path);
      fs.unlinkSync.restore();
    });
  });
});
