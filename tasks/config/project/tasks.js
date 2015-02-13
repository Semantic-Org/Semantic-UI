var
  config  = require('../user'),
  release = require('./release')
;


module.exports = {

  banner : release.banner,

  log: {
    created: function(file) {
      return 'Created: ' + file;
    },
    modified: function(file) {
      return 'Modified: ' + file;
    }
  },

  filenames: {
    concatenatedCSS            : 'semantic.css',
    concatenatedJS             : 'semantic.js',
    concatenatedMinifiedCSS    : 'semantic.min.css',
    concatenatedMinifiedJS     : 'semantic.min.js',
    concatenatedRTLCSS         : 'semantic.rtl.css',
    concatenatedMinifiedRTLCSS : 'semantic.rtl.min.css'
  },

  regExp: {

    comments: {

      // remove all comments from config files (.variable)
      variables : {
        in  : /\/\*[\s\S]+?\/\* End Config \*\//m,
        out : '',
      },

      // adds uniform spacing around comments
      large: {
        in  : /(\/\*\*\*\*[\s\S]+?\*\/)/mg,
        out : '\n\n$1\n'
      },
      small: {
        in  : /(\/\*---[\s\S]+?\*\/)/mg,
        out : '\n$1\n'
      },
      tiny: {
        in  : /(\/\* [\s\S]+? \*\/)/mg,
        out : '\n$1'
      }
    },

    theme: /.*\/themes\/.*?(?=\/)/mg

  },

  settings: {

    /* Remove Files in Clean */
    del: {
      silent : true
    },

    /* Comment Banners */
    header: {
      title      : release.title,
      version    : release.version,
      repository : release.repository,
      url        : release.url
    },

    /* Minified CSS Settings */
    minify: {
      processImport       : false,
      keepSpecialComments : 0
    },

    /* What Browsers to Prefix */
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

    /* File Renames */
    rename: {
      minJS     : { extname : '.min.js' },
      minCSS    : { extname : '.min.css' },
      rtlCSS    : { extname : '.rtl.css' },
      rtlMinCSS : { extname : '.rtl.min.css' }
    },

    /* Sourcemaps */
    sourcemap: {
      includeContent : true,
      sourceRoot     : '/src'
    },

    /* Minified JS Settings */
    uglify: {
      mangle : true
    }
  }
};