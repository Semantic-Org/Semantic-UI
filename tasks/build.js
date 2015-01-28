/*******************************
          Build Task
*******************************/

var
  gulp            = require('gulp-help')(require('gulp')),

  // user config
  config          = require('config'),

  // node deps
  fs              = require('fs'),

  // gulp deps
  autoprefixer    = require('gulp-autoprefixer'),
  chmod           = require('gulp-chmod'),
  clone           = require('gulp-clone'),
  flatten         = require('gulp-flatten'),
  header          = require('gulp-header'),
  less            = require('gulp-less'),
  minifyCSS       = require('gulp-minify-css'),
  plumber         = require('gulp-plumber'),
  print           = require('gulp-print'),
  rename          = require('gulp-rename'),
  replace         = require('gulp-replace'),
  uglify          = require('gulp-uglify'),

  // gulp config
  banner          = require('./tasks/config/gulp/banner'),
  comments        = require('./tasks/config/gulp/comments'),
  log             = require('./tasks/config/gulp/log'),
  settings        = require('./tasks/config/gulp/settings'),

  // shorthand
  paths  = config.paths,
  globs  = config.globs,

  assets = paths.assets,
  output = paths.output,
  source = paths.source

;


// Gulp task to build all files from source
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

  // Check for RTL
  if(config.rtl) {
    gulp.start('build rtl');
    return;
  }

  // copy only assets matching selected components
  gulp.src(source.themes + '**/assets/**/' + globs.components + '?(s).*')
    .pipe(chmod(config.permission))
    .pipe(gulp.dest(output.themes))
  ;

  // copy source files matching selected components
  gulp.src(source.definitions + '**/' + globs.components + '.js')
    .pipe(plumber())
    .pipe(flatten())
    .pipe(chmod(config.permission))
    .pipe(gulp.dest(output.uncompressed))
    .pipe(print(log.created))
    .pipe(uglify(settings.uglify))
    .pipe(rename(settings.rename.minJS))
    .pipe(header(banner, settings.header))
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
    .pipe(replace(comments.variables.in, comments.variables.out))
    .pipe(replace(comments.large.in, comments.large.out))
    .pipe(replace(comments.small.in, comments.small.out))
    .pipe(replace(comments.tiny.in, comments.tiny.out))
    .pipe(autoprefixer(settings.prefix))
  ;

  // two concurrent streams from same source to concat release
  uncompressedStream = stream.pipe(clone());
  compressedStream   = stream.pipe(clone());

  uncompressedStream
    .pipe(plumber())
    .pipe(replace(assets.source, assets.uncompressed))
    .pipe(header(banner, settings.header))
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
    .pipe(header(banner, settings.header))
    .pipe(chmod(config.permission))
    .pipe(gulp.dest(output.compressed))
    .pipe(print(log.created))
    .on('end', function() {
      callback();
      gulp.start('package compressed css');
    })
  ;
};