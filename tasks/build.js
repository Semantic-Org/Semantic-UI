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
    gulp.start('build-rtl');
    return;
  }

  if(config.rtl == 'both') {
    gulp.task('build', gulp.series('build-rtl', 'build-javascript', 'build-css', 'build-assets', function(done) {
      callback();
      done();
    }));
  }
  else {
    console.log('starting task');
    gulp.task('build', gulp.series('build-javascript', 'build-css', 'build-assets', function(done) {
      console.log('im here');
      callback();
      done();
    }));
  }
};
