/**
 * Temporary - The lord of tmp.
 *
 * Author: Veselin Todorov <hi@vesln.com>
 * Licensed under the MIT License.
 */

/**
 * Dependencies.
 */
var detector = require('../lib/detector');
var should = require('chai').should();

describe('detector', function() {
  describe('tmp', function() {
    it('should return the tmp dir of the system', function() {
      var tmp =  process.env.TMPDIR
          || process.env.TMP
          || process.env.TEMP
          || (process.platform === "win32" ? "c:\\windows\\temp\\" : "/tmp/");
      detector.tmp().should.eql(tmp);
    });
  });
});
