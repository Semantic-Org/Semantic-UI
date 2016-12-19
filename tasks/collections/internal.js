/*******************************
    Internal Task Collection
*******************************/

/* These tasks create packaged files from **dist** components
   Not intended to be called directly by a user because
   these do not build fresh from **src**
*/

module.exports = function(gulp) {

  const
    // node dependencies
    fs         = require('fs'),
    babel      = require('gulp-babel'),
    chmod      = require('gulp-chmod'),
    concat     = require('gulp-concat'),
    concatCSS  = require('gulp-concat-css'),
    clone      = require('gulp-clone'),
    dedupe     = require('gulp-dedupe'),
    gulpif     = require('gulp-if'),
    header     = require('gulp-header'),
    less       = require('gulp-less'),
    cleanCSS   = require('gulp-clean-css'),
    plumber    = require('gulp-plumber'),
    print      = require('gulp-print'),
    rename     = require('gulp-rename'),
    replace    = require('gulp-replace'),
    sourcemaps = require('gulp-sourcemaps')
    uglify     = require('gulp-uglify'),

    // user config
    config     = require('./../config/user'),
    docsConfig = require('./../config/docs'),

    // install config
    tasks      = require('./../config/tasks'),
    release    = require('./../config/project/release'),

    // shorthand
    globs      = config.globs,
    assets     = config.paths.assets,
    output     = config.paths.output,

    banner     = tasks.banner,
    filenames  = tasks.filenames,
    log        = tasks.log,
    settings   = tasks.settings
  ;

  /*--------------
      Packaged
  ---------------*/

  gulp.task('package uncompressed css', function() {
    return gulp.src(output.uncompressed + '/**/' + globs.components + globs.ignored + '.css')
      .pipe(plumber())
      .pipe(dedupe())
      .pipe(replace(assets.uncompressed, assets.packaged))
      .pipe(sourcemaps.init())
      .pipe(concat(filenames.concatenatedCSS, settings.concat))
        .pipe(sourcemaps.write(config.paths.sourcemaps))
        //.pipe(header(banner, settings.header))
        .pipe(gulpif(config.hasPermission, chmod(config.permission)))
        .pipe(gulp.dest(output.packaged))
        .pipe(print(log.created))
    ;
  });

  gulp.task('package compressed css', function() {
    return gulp.src(output.uncompressed + '/**/' + globs.components + globs.ignored + '.css')
      .pipe(plumber())
      .pipe(dedupe())
      .pipe(replace(assets.uncompressed, assets.packaged))
      .pipe(sourcemaps.init())
      .pipe(cleanCSS(settings.concatMinify))
      .pipe(concat(filenames.concatenatedMinifiedCSS, settings.concat))
        .pipe(sourcemaps.write(config.paths.sourcemaps))
        //.pipe(header(banner, settings.header))
        .pipe(gulpif(config.hasPermission, chmod(config.permission)))
        .pipe(gulp.dest(output.packaged))
        .pipe(print(log.created))
    ;
  });

  gulp.task('package uncompressed js', function() {
    return gulp.src(output.uncompressed + '/**/' + globs.components + globs.ignored + '.js')
      .pipe(plumber())
      .pipe(dedupe())
      .pipe(replace(assets.uncompressed, assets.packaged))
      .pipe(sourcemaps.init())
      .pipe(concat(filenames.concatenatedJS))
        .pipe(sourcemaps.write(config.paths.sourcemaps))
        //.pipe(header(banner, settings.header))
        .pipe(gulpif(config.hasPermission, chmod(config.permission)))
        .pipe(gulp.dest(output.packaged))
        .pipe(print(log.created))
    ;
  });

  gulp.task('package compressed js', function() {
    return gulp.src(output.uncompressed + '/**/' + globs.components + globs.ignored + '.js')
      .pipe(plumber())
      .pipe(dedupe())
      .pipe(replace(assets.uncompressed, assets.packaged))
      .pipe(sourcemaps.init())
      .pipe(concat(filenames.concatenatedMinifiedJS))
        .pipe(uglify(settings.concatUglify))
        .pipe(sourcemaps.write(config.paths.sourcemaps))
        //.pipe(header(banner, settings.header))
        .pipe(gulpif(config.hasPermission, chmod(config.permission)))
        .pipe(gulp.dest(output.packaged))
        .pipe(print(log.created))
    ;
  });

  /*--------------
        RTL
  ---------------*/

  if(config.rtl) {

    gulp.task('package uncompressed rtl css', function () {
      return gulp.src(output.uncompressed + '/**/' + globs.components + globs.ignoredRTL + '.rtl.css')
        .pipe(plumber())
        .pipe(dedupe())
        .pipe(replace(assets.uncompressed, assets.packaged))
        .pipe(sourcemaps.init())
        .pipe(concat(filenames.concatenatedRTLCSS, settings.concat))
          //.pipe(header(banner, settings.header))
          .pipe(sourcemaps.write(config.paths.sourcemaps))
          .pipe(gulpif(config.hasPermission, chmod(config.permission)))
          .pipe(gulp.dest(output.packaged))
          .pipe(print(log.created))
      ;
    });

    gulp.task('package compressed rtl css', function () {
      return gulp.src(output.uncompressed + '/**/' + globs.components + globs.ignoredRTL + '.rtl.css')
        .pipe(plumber())
        .pipe(dedupe())
        .pipe(replace(assets.uncompressed, assets.packaged))
        .pipe(sourcemaps.init())
        .pipe(concat(filenames.concatenatedMinifiedRTLCSS, settings.concat))
          .pipe(cleanCSS(settings.concatMinify))
          //.pipe(header(banner, settings.header))
          .pipe(sourcemaps.write(config.paths.sourcemaps))
          .pipe(gulpif(config.hasPermission, chmod(config.permission)))
          .pipe(gulp.dest(output.packaged))
          .pipe(print(log.created))
      ;
    });

    gulp.task('package uncompressed docs css', function() {
      return gulp.src(output.uncompressed + '/**/' + globs.components + globs.ignored + '.css')
        .pipe(plumber())
        .pipe(dedupe())
        .pipe(replace(assets.uncompressed, assets.packaged))
        .pipe(sourcemaps.init())
        .pipe(concat(filenames.concatenatedCSS, settings.concat))
          .pipe(sourcemaps.write(config.paths.sourcemaps))
          .pipe(gulpif(config.hasPermission, chmod(config.permission)))
          .pipe(gulp.dest(output.packaged))
          .pipe(print(log.created))
      ;
    });

    gulp.task('package compressed docs css', function() {
      return gulp.src(output.uncompressed + '/**/' + globs.components + globs.ignored + '.css')
        .pipe(plumber())
        .pipe(dedupe())
        .pipe(replace(assets.uncompressed, assets.packaged))
        .pipe(sourcemaps.init())
        .pipe(concat(filenames.concatenatedMinifiedCSS, settings.concat))
          .pipe(cleanCSS(settings.concatMinify))
          //.pipe(header(banner, settings.header))
          .pipe(sourcemaps.write(config.paths.sourcemaps))
          .pipe(gulpif(config.hasPermission, chmod(config.permission)))
          .pipe(gulp.dest(output.packaged))
          .pipe(print(log.created))
      ;
    });

  }

  /*--------------
        Docs
  ---------------*/

  const
    docsOutput = docsConfig.paths.output
  ;

  gulp.task('package uncompressed docs css', function() {
    return gulp.src(docsOutput.uncompressed + '/**/' + globs.components + globs.ignored + '.css')
      .pipe(plumber())
      .pipe(dedupe())
      .pipe(replace(assets.uncompressed, assets.packaged))
      .pipe(sourcemaps.init())
      .pipe(concat(filenames.concatenatedCSS, settings.concat))
        .pipe(sourcemaps.write(docsOutput.sourcemaps))
        .pipe(gulpif(config.hasPermission, chmod(config.permission)))
        .pipe(gulp.dest(docsOutput.packaged))
        .pipe(print(log.created))
    ;
  });

  gulp.task('package compressed docs css', function() {
    return gulp.src(docsOutput.uncompressed + '/**/' + globs.components + globs.ignored + '.css')
      .pipe(plumber())
      .pipe(dedupe())
      .pipe(replace(assets.uncompressed, assets.packaged))
      .pipe(sourcemaps.init())
      .pipe(concat(filenames.concatenatedMinifiedCSS, settings.concat))
        .pipe(cleanCSS(settings.concatMinify))
        //.pipe(header(banner, settings.header))
        .pipe(sourcemaps.write(docsOutput.sourcemaps))
        .pipe(gulpif(config.hasPermission, chmod(config.permission)))
        .pipe(gulp.dest(docsOutput.packaged))
        .pipe(print(log.created))
    ;
  });

  gulp.task('package uncompressed docs js', function() {
    return gulp.src(docsOutput.uncompressed + '/**/' + globs.components + globs.ignored + '.js')
      .pipe(plumber())
      .pipe(dedupe())
      .pipe(replace(assets.uncompressed, assets.packaged))
      .pipe(sourcemaps.init())
      .pipe(concat(filenames.concatenatedJS))
        //.pipe(header(banner, settings.header))
        .pipe(sourcemaps.write(docsOutput.sourcemaps))
        .pipe(gulpif(config.hasPermission, chmod(config.permission)))
        .pipe(gulp.dest(docsOutput.packaged))
        .pipe(print(log.created))
    ;
  });

  gulp.task('package compressed docs js', function() {
    return gulp.src(docsOutput.uncompressed + '/**/' + globs.components + globs.ignored + '.js')
      .pipe(plumber())
      .pipe(dedupe())
      .pipe(replace(assets.uncompressed, assets.packaged))
      .pipe(sourcemaps.init())
      .pipe(concat(filenames.concatenatedMinifiedJS))
        .pipe(uglify(settings.concatUglify))
        //.pipe(header(banner, settings.header))
        .pipe(sourcemaps.write(docsOutput.sourcemaps))
        .pipe(gulpif(config.hasPermission, chmod(config.permission)))
        .pipe(gulp.dest(docsOutput.packaged))
        .pipe(print(log.created))
    ;
  });

};
