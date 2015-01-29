gulp.task('check install', false, function () {
  setTimeout(function() {
    if( runSetup || !fs.existsSync(config.files.site)) {
      console.log('No semantic.json file found. Starting install...');
      gulp.start('install');
    }
    else {
      gulp.start('watch');
    }
  }, 50);
});
