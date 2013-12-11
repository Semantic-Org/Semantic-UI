// Karma configuration
module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',

    // frameworks to use
    frameworks: [
      'jasmine'
    ],

    // list of files / patterns to load in the browser
    files: [
      // require jquery
      'server/files/javascript/library/jquery.js',
      // read css from compiled css
      'docs/build/uncompressed/**/*.css',
      // read js from src js
      'src/**/*.js',
      // require helpers
      'test/helpers/*.js',
      // require fixtures
      {
        pattern  : 'test/fixtures/*.html',
        included : false,
        served   : true
      },
      // require spec
      'test/modules/module.spec.js',
      // require tests
      'test/modules/*.js'
    ],

    // list of files to exclude
    exclude: [
      '**/*.swp',
      'karma.conf.js'
    ],

    preprocessors: {
      '**/*.html': [],
      'src/**/*.js': 'coverage'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['spec', 'coverage'],

    coverageReporter: {
      type: 'lcov'
    },

    // web server port
    port: 9999,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
