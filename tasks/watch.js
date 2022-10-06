/*******************************
           Watch Task
*******************************/

let
  gulp         = require('gulp'),

  // node dependencies
  console      = require('better-console'),
  fs           = require('fs'),

  // gulp dependencies
  autoprefixer = require('gulp-autoprefixer'),
  chmod        = require('gulp-chmod'),
  clone        = require('gulp-clone'),
  gulpif       = require('gulp-if'),
  less         = require('gulp-less'),
  minifyCSS    = require('gulp-clean-css'),
  plumber      = require('gulp-plumber'),
  print        = require('gulp-print').default,
  rename       = require('gulp-rename'),
  replace      = require('gulp-replace'),
  uglify       = require('gulp-uglify'),
  replaceExt   = require('replace-ext'),

  // user config
  config       = require('./config/user'),

  // task config
  tasks        = require('./config/tasks'),
  install      = require('./config/project/install'),

  // shorthand
  globs        = config.globs,
  assets       = config.paths.assets,
  output       = config.paths.output,
  source       = config.paths.source,

  banner       = tasks.banner,
  comments     = tasks.regExp.comments,
  log          = tasks.log,
  settings     = tasks.settings,

  {series, parallel} = gulp,

  watch,

  // individual watch tasks
  watchCSS,
  watchJS,
  watchAssets,

  watchCSSCallback,
  watchJSCallback,
  watchAssetsCallback

;

// add tasks referenced using gulp.run (sub-tasks)
if(config.rtl) {
  require('./collections/rtl')(gulp);
}
require('./collections/internal')(gulp);


// export task
watch = function(callback) {

  if( !install.isSetup() ) {
    console.error('Cannot watch files. Run "gulp install" to set-up Semantic');
    return;
  }

  // check for right-to-left (RTL) language
  if(config.rtl == 'both') {
    gulp.start('watch-rtl');
  }
  if(config.rtl === true || config.rtl === 'Yes') {
    gulp.start('watch-rtl');
    return;
  }

  //console.clear();
  console.log('Watching source files for changes');

  /*--------------
      Watch CSS
  ---------------*/

  watchCSS  = gulp
    .watch([
      source.config,
      source.definitions   + '/**/*.less',
      source.site          + '/**/*.{overrides,variables}',
      source.themes        + '/**/*.{overrides,variables}'
    ])
  ;
  watchCSSCallback = (filePath) => {

    let
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
    gulp.src(filePath)
      .pipe(print(log.modified))
    ;

    /*--------------
       Find Source
    ---------------*/

    // recompile on *.override , *.variable change
    isConfig        = (filePath.indexOf('theme.config') !== -1 || filePath.indexOf('site.variables') !== -1);
    isPackagedTheme = (filePath.indexOf(source.themes) !== -1);
    isSiteTheme     = (filePath.indexOf(source.site) !== -1);
    isDefinition    = (filePath.indexOf(source.definitions) !== -1);

    if(isConfig) {
      console.info('Rebuilding all UI');
      // impossible to tell which file was updated in theme.config, rebuild all
      gulp.start('build-css');
      return;
    }
    else if(isPackagedTheme) {
      console.log('Change detected in packaged theme');
      lessPath = replaceExt(filePath, '.less');
      lessPath = lessPath.replace(tasks.regExp.theme, source.definitions);
    }
    else if(isSiteTheme) {
      console.log('Change detected in site theme');
      lessPath = replaceExt(filePath, '.less');
      lessPath = lessPath.replace(source.site, source.definitions);
    }
    else {
      console.log('Change detected in definition');
      lessPath = filePath;
    }

    /*--------------
       Create CSS
    ---------------*/

    if( fs.existsSync(lessPath) ) {

      // unified css stream
      stream = gulp.src(lessPath)
        .pipe(plumber(settings.plumber.less))
        .pipe(less(settings.less))
        .pipe(print(log.created))
        .pipe(replace(comments.variables.in, comments.variables.out))
        .pipe(replace(comments.license.in, comments.license.out))
        .pipe(replace(comments.large.in, comments.large.out))
        .pipe(replace(comments.small.in, comments.small.out))
        .pipe(replace(comments.tiny.in, comments.tiny.out))
        .pipe(autoprefixer(settings.prefix))
        .pipe(gulpif(config.hasPermission, chmod(config.permission)))
      ;

      // use 2 concurrent streams from same pipe
      uncompressedStream = stream.pipe(clone());
      compressedStream   = stream.pipe(clone());

      uncompressedStream
        .pipe(plumber())
        .pipe(replace(assets.source, assets.uncompressed))
        .pipe(gulp.dest(output.uncompressed))
        .pipe(print(log.created))
        .on('end', function() {
          gulp.start('package uncompressed css');
        })
      ;

      compressedStream
        .pipe(plumber())
        .pipe(replace(assets.source, assets.compressed))
        .pipe(minifyCSS(settings.minify))
        .pipe(rename(settings.rename.minCSS))
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
  };

  // these are separate handlers in gulp 4
  watchCSS
    .on('change', watchCSSCallback)
    .on('add', watchCSSCallback)
  ;

  /*--------------
      Watch JS
  ---------------*/

  watchJS = gulp
    .watch([
      source.definitions   + '/**/*.js'
    ])
  ;
  watchJSCallback = (filePath) => {
    gulp.src(filePath)
      .pipe(plumber())
      .pipe(replace(comments.license.in, comments.license.out))
      .pipe(gulpif(config.hasPermission, chmod(config.permission)))
      .pipe(gulp.dest(output.uncompressed))
      .pipe(print(log.created))
      .pipe(uglify(settings.uglify))
      .pipe(rename(settings.rename.minJS))
      .pipe(gulp.dest(output.compressed))
      .pipe(print(log.created))
      .on('end', function() {
        gulp.start('package compressed js');
        gulp.start('package uncompressed js');
      })
    ;
  };

  watchJS
    .on('change', watchJSCallback)
    .on('add', watchJSCallback)
  ;

  /*--------------
    Watch Assets
  ---------------*/

  // only copy assets that match component names (or their plural)
  watchAssets = gulp
    .watch([
      source.themes   + '/**/assets/**/*.*'
    ])
  ;
  watchAssetsCallback = (filePath) => {
    // copy assets
    gulp.src(filePath, { base: source.themes })
      .pipe(gulpif(config.hasPermission, chmod(config.permission)))
      .pipe(gulp.dest(output.themes))
      .pipe(print(log.created))
    ;
  };
  watchAssets
    .on('change', watchAssetsCallback)
    .on('add', watchAssetsCallback)
  ;

};


/* Export with Metadata */
watch.displayName = 'watch';
watch.description = 'Watch for site/theme changes';
module.exports = series(watch);
