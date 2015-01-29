/*******************************
          Build Task
*******************************/

var
  gulp         = require('gulp-help')(require('gulp')),

  // node dependencies
  fs           = require('fs'),

  // gulp dependencies
  autoprefixer = require('gulp-autoprefixer'),
  chmod        = require('gulp-chmod'),
  clone        = require('gulp-clone'),
  flatten      = require('gulp-flatten'),
  header       = require('gulp-header'),
  less         = require('gulp-less'),
  minifyCSS    = require('gulp-minify-css'),
  plumber      = require('gulp-plumber'),
  print        = require('gulp-print'),
  rename       = require('gulp-rename'),
  replace      = require('gulp-replace'),
  uglify       = require('gulp-uglify'),

  // user config
  config       = require('./config/user'),

  // task config
  tasks        = require('./config/tasks'),

  // shorthand
  globs        = config.globs,
  assets       = config.paths.assets,
  output       = config.paths.output,
  source       = config.paths.source,

  comments     = tasks.regExp.comments,
  log          = tasks.log,
  settings     = tasks.settings
;


// gulp task to build all files from source
module.exports = function(callback) {

  var
    stream,
    compressedStream,
    uncompressedStream
  ;

  console.info('Building Semantic');

  if(!fs.existsSync(config.files.theme)) {
    console.error('Cant build LESS. Run "gulp install" to create a theme config file');
    return;
  }

  // check for RTL
  if(config.rtl) {
    gulp.start('build rtl');
    return;
  }

  // copy assets
  gulp.src(source.themes + '**/assets/**/' + globs.components + '?(s).*')
    .pipe(chmod(config.permission))
    .pipe(gulp.dest(output.themes))
  ;

  // copy source javascript
  gulp.src(source.definitions + '**/' + globs.components + '.js')
    .pipe(plumber())
    .pipe(flatten())
    .pipe(chmod(config.permission))
    .pipe(gulp.dest(output.uncompressed))
    .pipe(print(log.created))
    .pipe(uglify(settings.uglify))
    .pipe(rename(settings.rename.minJS))
    .pipe(header(config.banner, settings.header))
    .pipe(chmod(config.permission))
    .pipe(gulp.dest(output.compressed))
    .pipe(print(log.created))
    .on('end', function() {
      gulp.start('package compressed js');
      gulp.start('package uncompressed js');
    })
  ;

  // unified css stream
  stream = gulp.src(source.definitions + '**/' + globs.components + '.less')
    .pipe(plumber())
    .pipe(less(settings.less))
    .pipe(flatten())
    .pipe(autoprefixer(settings.prefix))
  ;

  // two concurrent streams from same source to concat release
  uncompressedStream = stream.pipe(clone());
  compressedStream   = stream.pipe(clone());

  uncompressedStream
    .pipe(plumber())
    .pipe(replace(comments.variables.in, comments.variables.out))
    .pipe(replace(comments.large.in, comments.large.out))
    .pipe(replace(comments.small.in, comments.small.out))
    .pipe(replace(comments.tiny.in, comments.tiny.out))
    .pipe(replace(assets.source, assets.uncompressed))
    .pipe(header(config.banner, settings.header))
    .pipe(chmod(config.permission))
    .pipe(gulp.dest(output.uncompressed))
    .pipe(print(log.created))
    .on('end', function() {
      gulp.start('package uncompressed css');
    })
  ;

  compressedStream = stream
    .pipe(plumber())
    .pipe(clone())
    .pipe(replace(assets.source, assets.compressed))
    .pipe(minifyCSS(settings.minify))
    .pipe(rename(settings.rename.minCSS))
    .pipe(header(config.banner, settings.header))
    .pipe(chmod(config.permission))
    .pipe(gulp.dest(output.compressed))
    .pipe(print(log.created))
    .on('end', function() {
      callback();
      gulp.start('package compressed css');
    })
  ;
};