/*
  All configurable options are defined inside build.config
  Please adjust this to your site's settings
*/

/*******************************
            Set-up
*******************************/


var
  gulp         = require('gulp-help')(require('gulp')),

  // node components & oddballs
  del          = require('del'),
  fs           = require('fs'),
  path         = require('path'),
  console      = require('better-console'),

  // gulp dependencies
  autoprefixer = require('gulp-autoprefixer'),
  clone        = require('gulp-clone'),
  concat       = require('gulp-concat'),
  concatCSS    = require('gulp-concat-css'),
  copy         = require('gulp-copy'),
  debug        = require('gulp-debug'),
  flatten      = require('gulp-flatten'),
  header       = require('gulp-header'),
  karma        = require('gulp-karma'),
  less         = require('gulp-less'),
  minifyCSS    = require('gulp-minify-css'),
  notify       = require('gulp-notify'),
  plumber      = require('gulp-plumber'),
  print        = require('gulp-print'),
  prompt       = require('gulp-prompt'),
  rename       = require('gulp-rename'),
  replace      = require('gulp-replace'),
  sourcemaps   = require('gulp-sourcemaps'),
  uglify       = require('gulp-uglify'),
  util         = require('gulp-util'),
  watch        = require('gulp-watch'),

  // settings
  config       = require('./semantic.json'),
  package      = require('./package.json'),

  // config
  banner       = require('./tasks/banner'),
  comments     = require('./tasks/comments'),
  defaults     = require('./tasks/defaults'),
  log          = require('./tasks/log'),
  questions    = require('./tasks/questions'),
  settings     = require('./tasks/settings'),

  // shorthand
  base         = config.base,
  clean        = config.paths.clean,
  output       = config.paths.output,
  source       = config.paths.source,

  // derived
  assetPaths = {
    uncompressed : path.relative(output.uncompressed, output.themes),
    compressed   : path.relative(output.compressed, output.themes),
    packaged     : path.relative(output.packaged, output.themes)
  },

  // temporary
  folder
;

// Add base directory
for(folder in source) {
  if(source.hasOwnProperty(folder)) {
    source[folder] = base + source[folder];
  }
}

for(folder in output) {
  if(output.hasOwnProperty(folder)) {
    output[folder] = base + output[folder];
  }
}

clean = base + clean;



/*******************************
             Tasks
*******************************/

gulp.task('default', false, [
  'check install'
]);

gulp.task('watch', 'Watch for site/theme changes (Default Task)', function () {

  console.log('Watching source files');

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
        uncompressedStream
      ;

      gulp.src(file.path)
        .pipe(print(log.modified))
      ;

      // recompile only definition file
      srcPath = util.replaceExtension(file.path, '.less');
      srcPath = srcPath.replace(source.themes, source.definitions);
      srcPath = srcPath.replace(source.site, source.definitions);

      // get relative asset path (path returns wrong path? hardcoded)
      //assetPaths.source = path.relative(srcPath, source.themes);
      assetPaths.source = '../../themes';

      if( fs.existsSync(srcPath) ) {

        // unified css stream
        stream = gulp.src(srcPath)
          .pipe(plumber())
          //.pipe(sourcemaps.init())
          .pipe(less(settings.less))
          .pipe(replace(comments.variables.in, comments.variables.out))
          .pipe(replace(comments.large.in, comments.large.out))
          .pipe(replace(comments.small.in, comments.small.out))
          .pipe(replace(comments.tiny.in, comments.tiny.out))
          .pipe(autoprefixer(settings.prefix))
        ;

        // use 2 concurrent streams from same source
        uncompressedStream = stream.pipe(clone());
        compressedStream   = stream.pipe(clone());

        uncompressedStream
          .pipe(replace(assetPaths.source, assetPaths.uncompressed))
          //.pipe(sourcemaps.write('/', settings.sourcemap))
          .pipe(header(banner, settings.header))
          .pipe(gulp.dest(output.uncompressed))
          .pipe(print(log.created))
          .on('end', function() {
            gulp.start('package uncompressed css');
          })
        ;

        compressedStream = stream
          .pipe(clone())
          .pipe(replace(assetPaths.source, assetPaths.compressed))
          .pipe(minifyCSS(settings.minify))
          .pipe(rename(settings.minCSS))
          //.pipe(sourcemaps.write('/', settings.sourcemap))
          .pipe(header(banner, settings.header))
          .pipe(gulp.dest(output.compressed))
          .pipe(print(log.created))
          .on('end', function() {
            gulp.start('package compressed css');
          })
        ;

      }
      else {
        console.error('Definition file not found', path);
      }
    })
  ;

  // watch changes in assets
  gulp
    .watch([
      source.themes   + '**/assets/**'
    ], function(file) {
      // copy assets
      gulp.src(file.path, { base: source.themes })
        .pipe(gulp.dest(output.themes))
        .pipe(print(log.created))
      ;
    })
  ;

  // watch changes in js
  gulp
    .watch([
      source.definitions   + '**/*.js'
    ], function(file) {
      gulp.src(file.path)
        .pipe(gulp.dest(output.uncompressed))
        .pipe(print(log.created))
        .pipe(sourcemaps.init())
        .pipe(uglify(settings.uglify))
        .pipe(rename(settings.minJS))
        .pipe(gulp.dest(output.compressed))
        .pipe(print(log.created))
        .on('end', function() {
          gulp.start('package compressed js');
          gulp.start('package uncompressed js');
        })
      ;
    })
  ;

});

// Builds all files
gulp.task('build', 'Builds all files from source', function(callback) {
  var
    stream,
    compressedStream,
    uncompressedStream
  ;

  console.info('Building Semantic');

  // copy assets
  gulp.src(source.themes + '**/assets/**')
    .pipe(gulp.dest(output.themes))
  ;

  // javascript stream
  gulp.src(source.definitions + '**/*.js')
    .pipe(flatten())
    .pipe(gulp.dest(output.uncompressed))
    .pipe(print(log.created))
    // .pipe(sourcemaps.init())
    .pipe(uglify(settings.uglify))
    .pipe(rename(settings.minJS))
    .pipe(header(banner, settings.header))
    .pipe(gulp.dest(output.compressed))
    .pipe(print(log.created))
    .on('end', function() {
      gulp.start('package compressed js');
      gulp.start('package uncompressed js');
    })
  ;

  // unified css stream
  stream = gulp.src(source.definitions + '**/*.less')
    .pipe(plumber())
    //.pipe(sourcemaps.init())
    .pipe(less(settings.less))
    .pipe(flatten())
    .pipe(replace(comments.variables.in, comments.variables.out))
    .pipe(replace(comments.large.in, comments.large.out))
    .pipe(replace(comments.small.in, comments.small.out))
    .pipe(replace(comments.tiny.in, comments.tiny.out))
    .pipe(autoprefixer(settings.prefix))
  ;

  // use 2 concurrent streams from same source
  uncompressedStream = stream.pipe(clone());
  compressedStream   = stream.pipe(clone());

  uncompressedStream
    .pipe(replace(assetPaths.source, assetPaths.uncompressed))
    //.pipe(sourcemaps.write('/', settings.sourcemap))
    .pipe(header(banner, settings.header))
    .pipe(gulp.dest(output.uncompressed))
    .pipe(print(log.created))
    .on('end', function() {
      gulp.start('package uncompressed css');
    })
  ;

  compressedStream = stream
    .pipe(clone())
    .pipe(replace(assetPaths.source, assetPaths.compressed))
    .pipe(minifyCSS(settings.minify))
    .pipe(rename(settings.minCSS))
    //.pipe(sourcemaps.write('/', settings.sourcemap))
    .pipe(header(banner, settings.header))
    .pipe(gulp.dest(output.compressed))
    .pipe(print(log.created))
    .on('end', function() {
      gulp.start('package compressed css');
    })
  ;


});

// cleans distribution files
gulp.task('clean', 'Clean dist folder', function(callback) {
  console.log('Cleaning directory: ' + clean);
  return del([clean], settings.del, callback);
});

gulp.task('version', 'Displays current version of Semantic', function(callback) {
  console.log('Semantic UI ' + package.version);
});


/*--------------
     Config
---------------*/

gulp.task('check install', false, function () {
  if(1) {
    setTimeout(function() {
      gulp.start('install');
    }, 100);
  }
  else {
    gulp.start('watch');
  }
});

gulp.task('install', 'Set-up project for first time', function () {
  if( !fs.existsSync(source.config) || !fs.existsSync(source.site) ) {

    console.clear();
    gulp
      .src(defaults.paths.source.config)
      .pipe(prompt.prompt(questions.setup, function( answers ) {
        console.info('Creating site folder');
        console.info('Creating theme config file (semantic.config)');
        console.info('Creating build config file (semantic.json)');
      }))
      .pipe(prompt.prompt(questions.site, function( answers ) {
        console.info('Creating site variables file');
      }))
    ;

  }
  else {
    console.log('has config');
  }
  // !

});
gulp.task('config', 'Configure basic site settings', function () {

});


/*--------------
    Internal
---------------*/


gulp.task('package uncompressed css', false, function() {
  return gulp.src(output.uncompressed + '**/!(*.min|*.map).css')
    .pipe(replace(assetPaths.uncompressed, assetPaths.packaged))
    .pipe(concatCSS('semantic.css'))
      .pipe(gulp.dest(output.packaged))
      .pipe(print(log.created))
  ;
});
gulp.task('package compressed css', false, function() {
  return gulp.src(output.uncompressed + '**/!(*.min|*.map).css')
    .pipe(replace(assetPaths.uncompressed, assetPaths.packaged))
    .pipe(concatCSS('semantic.min.css'))
      .pipe(minifyCSS(settings.minify))
      .pipe(header(banner, settings.header))
      .pipe(gulp.dest(output.packaged))
      .pipe(print(log.created))
  ;
});

gulp.task('package uncompressed js', false, function() {
  return gulp.src(output.uncompressed + '**/!(*.min|*.map).js')
    .pipe(replace(assetPaths.uncompressed, assetPaths.packaged))
    .pipe(concat('semantic.js'))
      .pipe(header(banner, settings.header))
      .pipe(gulp.dest(output.packaged))
      .pipe(print(log.created))
  ;
});
gulp.task('package compressed js', false, function() {
  return gulp.src(output.uncompressed + '**/!(*.min|*.map).js')
    .pipe(replace(assetPaths.uncompressed, assetPaths.packaged))
    .pipe(concat('semantic.min.js'))
      .pipe(uglify(settings.uglify))
      .pipe(header(banner, settings.header))
      .pipe(gulp.dest(output.packaged))
      .pipe(print(log.created))
  ;
});


/*--------------
   Maintainer
---------------*/

/* Bump Version */
gulp.task('bump', false, function () {

  // Create RTL Release

  // Create Node Release


});

/* Release */
gulp.task('release', false, function () {

  // Create SCSS Version

  // Create RTL Release

  // Create Node Release

  // Create Bower Releases



});
