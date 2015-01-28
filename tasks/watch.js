/*******************************
           Watch Task
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
  header          = require('gulp-header'),
  less            = require('gulp-less'),
  minifyCSS       = require('gulp-minify-css'),
  plumber         = require('gulp-plumber'),
  print           = require('gulp-print'),
  rename          = require('gulp-rename'),
  replace         = require('gulp-replace'),
  uglify          = require('gulp-uglify'),
  util            = require('gulp-util'),
  watch           = require('gulp-watch'),

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


module.exports = function(callback) {

  // Exit conditions
  if(!fs.existsSync(config.files.theme)) {
    console.error('Cant compile LESS. Run "gulp install" to create a theme config file');
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
        srcPath,
        stream,
        compressedStream,
        uncompressedStream,
        isDefinition,
        isPackagedTheme,
        isSiteTheme,
        isConfig
      ;

      gulp.src(file.path)
        .pipe(print(log.modified))
      ;

      // recompile on *.override , *.variable change
      isDefinition    = (file.path.indexOf(source.definitions) !== -1);
      isPackagedTheme = (file.path.indexOf(source.themes) !== -1);
      isSiteTheme     = (file.path.indexOf(source.site) !== -1);
      isConfig        = (file.path.indexOf('.config') !== -1);

      if(isDefinition || isPackagedTheme || isSiteTheme) {
        // rebuild only matching definition file
        srcPath = util.replaceExtension(file.path, '.less');
        srcPath = srcPath.replace(config.regExp.themePath, source.definitions);
        srcPath = srcPath.replace(source.site, source.definitions);
      }
      else if(isConfig) {
        // impossible to tell which file was updated in theme.config, rebuild all
        console.log('Change detected in theme config');
        gulp.start('build');
      }
      else {
        srcPath = util.replaceExtension(file.path, '.less');
      }

      if( fs.existsSync(srcPath) ) {

        // unified css stream
        stream = gulp.src(srcPath)
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
        console.log('SRC Path Does Not Exist', srcPath);
      }
    })
  ;

  // watch for changes in assets that match component names (or their plural)
  gulp
    .watch([
      source.themes   + '**/assets/**/' + componentGlob + '?(s).*'
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