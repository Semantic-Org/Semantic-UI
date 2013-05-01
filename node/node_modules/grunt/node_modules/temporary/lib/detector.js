/**
 * Temporary - The lord of tmp.
 * 
 * Author: Veselin Todorov <hi@vesln.com>
 * Licensed under the MIT License.
 */
 
/**
 * Detection stolen from NPM (https://github.com/isaacs/npm/)
 * 
 * Copyright 2009, 2010, 2011 Isaac Z. Schlueter (the "Author")
 * MIT License (https://github.com/isaacs/npm/blob/master/LICENSE)
 */ 

/**
 * Detector namespace.
 * 
 * @type {Object}
 */
var detector = module.exports;

var normalize = function(path) {
  var last = Array.prototype.pop.apply(path);
  
  if (process.platform !== "win32" && last !== '/') {
    path += '/';
  }
  
  return path;
}

/**
 * Returns tmp dir. Thank you npm.
 * 
 * @returns {String} tmp dir.
 */
detector.tmp = function() {
  var temp = process.env.TMPDIR
      || process.env.TMP
      || process.env.TEMP
      || (process.platform === "win32" ? "c:\\windows\\temp\\" : "/tmp/")
  
  return normalize(temp);
};