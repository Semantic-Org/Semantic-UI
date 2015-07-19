/*******************************
          Build Task
*******************************/

var
  gulp         = require('gulp-help')(require('gulp')),

  // config
  config       = require('./config/user'),
  install      = require('./config/project/install')
;

// add sub-tasks
if(config.rtl) {
  require('./collections/rtl')(gulp);
}
require('./collections/build')(gulp);

module.exports = function(callback) {

  console.info('Building Semantic');

  if( !install.isSetup() ) {
    console.error('Cannot find semantic.json. Run "gulp install" to set-up Semantic');
    return;
  }

  // check for right-to-left (RTL) language
  if(config.rtl == 'both') {
    gulp.start('build-rtl');
  }
  if(config.rtl === true || config.rtl === 'Yes') {
    gulp.start('build-rtl');
    return;
  }

  gulp.start('build-javascript');
  gulp.start('build-css');
  gulp.start('build-assets');


};
