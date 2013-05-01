/**
 * package - Easy package.json exports.
 * 
 * Author: Veselin Todorov <hi@vesln.com>
 * Licensed under the MIT License.
 */

/**
 * Dependencies.
 */ 
var package = require('../');

describe('package', function() {
  describe('read', function() {
    it('should read and parse .json file', function() {
      var result = package.read(__dirname + '/support/package.json');
      result.should.eql({
        name: 'test-package-json-file',
        version: '0.0.1',
        private: true 
      });
    });
  });
  
  it('should read and parse given .json file', function() {
    var result = package(__dirname + '/support');
    result.should.eql({
      name: 'test-package-json-file',
      version: '0.0.1',
      private: true 
    });
  });
  
  it('should autodiscover, read and parse package.json', function() {
    var result = package(module);
    result.should.eql({
      name: 'test-package-json-file',
      version: '0.0.1',
      private: true 
    });
  });
});