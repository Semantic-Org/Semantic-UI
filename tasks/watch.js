/*******************************
           Watch Task
*******************************/

var
  gulp         = require('gulp-help')(require('gulp')),

  // node deps
  console      = require('better-console'),
  fs           = require('fs'),

  // gulp deps
  autoprefixer = require('gulp-autoprefixer'),
  chmod        = require('gulp-chmod'),
  clone        = require('gulp-clone'),
  header       = require('gulp-header'),
  less         = require('gulp-less'),
  minifyCSS    = require('gulp-minify-css'),
  plumber      = require('gulp-plumber'),
  print        = require('gulp-print'),
  rename       = require('gulp-rename'),
  replace      = require('gulp-replace'),
  uglify       = require('gulp-uglify'),
  util         = require('gulp-util'),
  watch        = require('gulp-watch'),

  // user config
  config       = require('./config/user'),

  // task config
  tasks        = require('./config/project/tasks'),
  install      = require('./config/project/install'),

  // shorthand
  globs        = config.globs,
  assets       = config.paths.assets,
  output       = config.paths.output,
  source       = config.paths.source,

  banner       = tasks.banner,
  comments     = tasks.regExp.comments,
  log          = tasks.log,
  settings     = tasks.settings

;


module.exports = function(callback) {


  if( !install.isSetup() ) {
    console.error('Cannot watch files. Run "gulp install" to set-up Semantic');
    return;
  }

  // start rtl task instead
  if(config.rtl) {
    gulp.start('watch rtl');
    return;
  }

  console.clear();
  console.log('Watching source files for changes');


  // watching changes in style
  gulp
    .watch([
      source.config,
      source.definitions   + '**/*.less',
      source.site          + '**/*.{overrides,variables}',
      source.themes        + '**/*.{overrides,variables}'
    ], function(file) {
      var
        lessPath,
        stream,
        compressedStream,
        uncompressedStream,
        isDefinition,
        isPackagedTheme,
        isSiteTheme,
        isConfig
      ;

      // log modified file
      gulp.src(file.path)
        .pipe(print(log.modified))
      ;

      // recompile on *.override , *.variable change
      isConfig        = (file.path.indexOf('.config') !== -1);
      isPackagedTheme = (file.path.indexOf(source.themes) !== -1);
      isSiteTheme     = (file.path.indexOf(source.site) !== -1);
      isDefinition    = (file.path.indexOf(source.definitions) !== -1);

      if(isConfig) {
        console.log('Change detected in theme config');
        // impossible to tell which file was updated in theme.config, rebuild all
        gulp.start('build');
      }
      else if(isPackagedTheme) {
        console.log('Change detected in packaged theme');
        lessPath = lessPath.replace(tasks.regExp.theme, source.definitions);
        lessPath = util.replaceExtension(file.path, '.less');
      }
      else if(isSiteTheme) {
        console.log('Change detected in site theme');
        lessPath = lessPath.replace(source.site, source.definitions);
        lessPath = util.replaceExtension(file.path, '.less');
      }
      else if(isDefinition) {
        console.log('Change detected in definition');
        lessPath = util.replaceExtension(file.path, '.less');
      }

      if( fs.existsSync(lessPath) ) {

        // unified css stream
        stream = gulp.src(lessPath)
          .pipe(plumber())
          .pipe(less(settings.less))
          .pipe(replace(comments.variables.in, comments.variables.out))
          .pipe(replace(comments.large.in, comments.large.out))
          .pipe(replace(comments.small.in, comments.small.out))
          .pipe(replace(comments.tiny.in, comments.tiny.out))
          .pipe(autoprefixer(settings.prefix))
        ;

        // use 2 concurrent streams from same pipe
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
            gulp.start('package compressed css');
          })
        ;

      }
      else {
        console.log('Cannot find UI definition at path', lessPath);
      }
    })
  ;

  // watch for changes in assets that match component names (or their plural)
  gulp
    .watch([
      source.themes   + '**/assets/**/' + globs.components + '?(s).*'
    ], function(file) {
      // copy assets
      gulp.src(file.path, { base: source.themes })
        .pipe(chmod(config.permission))
        .pipe(gulp.dest(output.themes))
        .pipe(print(log.created))
      ;
    })
  ;

  // watch for changes in js
  gulp
    .watch([
      source.definitions   + '**/*.js'
    ], function(file) {
      gulp.src(file.path)
        .pipe(plumber())
        .pipe(chmod(config.permission))
        .pipe(gulp.dest(output.uncompressed))
        .pipe(print(log.created))
        .pipe(uglify(settings.uglify))
        .pipe(rename(settings.rename.minJS))
        .pipe(chmod(config.permission))
        .pipe(gulp.dest(output.compressed))
        .pipe(print(log.created))
        .on('end', function() {
          gulp.start('package compressed js');
          gulp.start('package uncompressed js');
        })
      ;
    })
  ;

};