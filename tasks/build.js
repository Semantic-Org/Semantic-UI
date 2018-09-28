/*******************************
          Build Task
*******************************/

var
  // dependencies
  gulp         = require('gulp-help')(require('gulp')),

  // config
  config       = require('./config/user'),
  install      = require('./config/project/install')
;


// sub-tasks
if(config.rtl) {
  require('./collections/rtl')(gulp);
}
require('./collections/build')(gulp);


module.exports = function(callback) {

  console.info('Building Semantic');

  if( !install.isSetup() ) {
    console.error('Cannot find semantic.json. Run "gulp install" to set-up Semantic');
    return 1;
  }

  // check for right-to-left (RTL) language
  if(config.rtl === true || config.rtl === 'Yes') {
    (gulp.series('build-rtl', function(done) {
      done();
    }))();
    return;
  }

  if(config.rtl == 'both') {
    (gulp.series('build-rtl', 'build-javascript', 'build-css', 'build-assets', function(done) {
      done();
    }))();
  } else {
    (gulp.series('build-javascript', 'build-css', 'build-assets', function(done) {
      done();
    }))();
  }
};
