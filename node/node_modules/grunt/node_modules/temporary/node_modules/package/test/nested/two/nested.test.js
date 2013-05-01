/**
 * package - Easy package.json exports.
 * 
 * Author: Veselin Todorov <hi@vesln.com>
 * Licensed under the MIT License.
 */
 
/**
 * Dependencies.
 */ 
var package = require('../../../');

describe('nested package json', function() {
  it('should autodiscover, read and parse package.json', function() {
    var result = package(module);
    result.should.eql({
      name: 'test-package-json-file',
      version: '0.0.1',
      private: true 
    });
  });
});