/*******************************
           Build Docs
*******************************/

var
  gulp         = require('gulp'),

  // node dependencies
  console      = require('better-console'),
  fs           = require('fs'),
  map          = require('map-stream'),

  // gulp dependencies
  autoprefixer = require('gulp-autoprefixer'),
  chmod        = require('gulp-chmod'),
  clone        = require('gulp-clone'),
  flatten      = require('gulp-flatten'),
  gulpif       = require('gulp-if'),
  header       = require('gulp-header'),
  less         = require('gulp-less'),
  minifyCSS    = require('gulp-clean-css'),
  plumber      = require('gulp-plumber'),
  print        = require('gulp-print'),
  rename       = require('gulp-rename'),
  replace      = require('gulp-replace'),
  uglify       = require('gulp-uglify'),

  // user config
  config       = require('../config/docs'),

  // install config
  tasks        = require('../config/tasks'),
  configSetup  = require('../config/project/config'),
  install      = require('../config/project/install'),

  // metadata parsing
  metadata     = require('./metadata'),

  // shorthand
  globs,
  assets,
  output,
  source,

  banner       = tasks.banner,
  comments     = tasks.regExp.comments,
  log          = tasks.log,
  settings     = tasks.settings
;

// add internal tasks (concat release)
require('../collections/internal')(gulp);

module.exports = function(callback) {

  var
    stream,
    compressedStream,
    uncompressedStream
  ;

  // use a different config
  config = configSetup.addDerivedValues(config);

  // shorthand
  globs  = config.globs;
  assets = config.paths.assets;
  output = config.paths.output;
  source = config.paths.source;

  /*--------------
   Parse metadata
   ---------------*/

  // parse all *.html.eco in docs repo, data will end up in
  // metadata.result object.  Note this assumes that the docs
  // repository is present and in proper directory location as
  // specified by docs.json.
  console.info('Building Metadata');
  gulp.src(config.paths.template.eco + globs.eco)
    .pipe(map(metadata.parser))
    .on('end', function() {
      fs.writeFile(output.metadata + '/metadata.json', JSON.stringify(metadata.result, null, 2));
    })
  ;

  /*--------------
    Copy Examples
  ---------------*/

  console.info('Copying examples');
  // copy src/ to server
  gulp.src('examples/**/*.*')
    .pipe(gulp.dest(output.examples))
    .pipe(print(log.created))
  ;

  /*--------------
     Copy Source
  ---------------*/

  console.info('Copying LESS source');
  // copy src/ to server
  gulp.src('src/**/*.*')
    .pipe(gulp.dest(output.less))
    .pipe(print(log.created))
  ;

  /*--------------
        Build
  ---------------*/

  console.info('Building Semantic for docs');

  if( !install.isSetup() ) {
    console.error('Cannot build files. Run "gulp install" to set-up Semantic');
    return;
  }

  // unified css stream
  stream = gulp.src(source.definitions + '/**/' + globs.components + '.less')
    .pipe(plumber())
    .pipe(less(settings.less))
    .pipe(autoprefixer(settings.prefix))
    .pipe(flatten())
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
    .pipe(header(banner, settings.header))
    .pipe(gulpif(config.hasPermission, chmod(config.permission)))
    .pipe(gulp.dest(output.uncompressed))
    .pipe(print(log.created))
    .on('end', function() {
      gulp.start('package uncompressed docs css');
    })
  ;

  compressedStream = stream
    .pipe(plumber())
    .pipe(clone())
    .pipe(replace(assets.source, assets.compressed))
    .pipe(minifyCSS(settings.minify))
    .pipe(rename(settings.rename.minCSS))
    .pipe(header(banner, settings.header))
    .pipe(gulpif(config.hasPermission, chmod(config.permission)))
    .pipe(gulp.dest(output.compressed))
    .pipe(print(log.created))
    .on('end', function() {
      callback();
      gulp.start('package compressed docs css');
    })
  ;

  // copy assets
  gulp.src(source.themes + '/**/assets/**/*.*')
    .pipe(gulpif(config.hasPermission, chmod(config.permission)))
    .pipe(gulp.dest(output.themes))
  ;

  // copy source javascript
  gulp.src(source.definitions + '/**/' + globs.components + '.js')
    .pipe(plumber())
    .pipe(flatten())
    .pipe(gulp.dest(output.uncompressed))
    .pipe(gulpif(config.hasPermission, chmod(config.permission)))
    .pipe(print(log.created))
    .pipe(uglify(settings.uglify))
    .pipe(rename(settings.rename.minJS))
    .pipe(header(banner, settings.header))
    .pipe(gulp.dest(output.compressed))
    .pipe(gulpif(config.hasPermission, chmod(config.permission)))
    .pipe(print(log.created))
    .on('end', function() {
      gulp.start('package compressed docs js');
      gulp.start('package uncompressed docs js');
    })
  ;

};
