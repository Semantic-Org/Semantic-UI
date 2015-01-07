
var
  path     = require('path'),
  fs       = require('fs'),
  defaults = require('./defaults'),
  package  = require('../package.json')
;

module.exports = {
  del: {
    silent : true
  },
  minify: {
    processImport       : false,
    keepSpecialComments : 0
  },
  uglify: {
    mangle : true
  },
  prefix: {
    browsers: [
      'last 2 version',
      '> 1%',
      'opera 12.1',
      'safari 6',
      'ie 9',
      'bb 10',
      'android 4'
    ]
  },
  header: {
    title      : defaults.title,
    version    : package.version,
    repository : defaults.repository,
    url        : defaults.url
  },
  sourcemap: {
    includeContent : true,
    sourceRoot     : '/src'
  },
  rename: {
    json      : { extname : '.json' },
    minJS     : { extname : '.min.js' },
    minCSS    : { extname : '.min.css' },
    rtlCSS    : { extname : '.rtl.css' },
    rtlMinCSS : { extname : '.rtl.min.css' }
  },
  wrench: {
    recursive: {
      forceDelete       : true,
      excludeHiddenUnix : true,
      preserveFiles     : true
    }
  }
};