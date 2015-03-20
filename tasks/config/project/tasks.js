var
  console = require('better-console'),
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
        in  : /(\/\*[\s\S]+?\*\/+)[\s\S]+?\/\* End Config \*\//,
        out : '$1',
      },

      // add version to first comment
      license: {
        in  : /(^\/\*[\s\S]+)(# Semantic UI )([\s\S]+?\*\/)/,
        out : '$1$2' + release.version + ' $3'
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

    plumber: {
      less: {
        errorHandler: function(error) {
          if(error.filename.match(/theme.less/)) {
            console.error('Looks like your theme.config is out of date. You will need to add new elements from theme.config.example');
          }
          else {
            console.log(error);
            this.emit('end');
          }
        }
      }
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

    /* Minified CSS Concat */
    minify: {
      processImport       : false,
      restructuring       : false,
      keepSpecialComments : 1
    },

    /* Minified JS Settings */
    uglify: {
      mangle           : true,
      preserveComments : 'some'
    },

    /* Minified Concat CSS Settings */
    concatMinify: {
      processImport       : false,
      restructuring       : false,
      keepSpecialComments : false
    },

    /* Minified Concat JS */
    concatUglify: {
      mangle           : true,
      preserveComments : false
    }

  }
};