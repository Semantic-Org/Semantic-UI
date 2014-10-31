
var
  path    = require('path'),
  fs      = require('fs'),
  package
;
try {
  package = require('../package.json')
}
catch(error) {
  // fallback
  package = {
    title : 'Semantic UI',
    url   : 'git://github.com/Semantic-Org/Semantic-UI.git'
  }
}

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
    package: package
  },
  sourcemap: {
    includeContent : true,
    sourceRoot     : '/src'
  },
  rename: {
    json   : { extname : '.json' },
    minJS  : { extname : '.min.js' },
    minCSS : { extname : '.min.css' }
  },
  wrench: {
    recursive: {
      forceDelete       : false,
      excludeHiddenUnix : true,
      preserveFiles     : true
    }
  }
};