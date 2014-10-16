/*******************************
             Config
*******************************/

/*
  All config options are defined inside build.config
  Please adjust this to your site's settings
*/

var
  gulp             = require('gulp-help')(require('gulp')),

  // read settings file
  config           = require('./build.json'),

  // shorthand
  base             = config.base,
  source           = config.paths.source,
  output           = config.paths.output,

  // required node components
  del              = require('del'),
  fs               = require('fs'),
  path             = require('path'),

  // required gulp components
  autoprefixer     = require('gulp-autoprefixer'),
  concat           = require('gulp-concat'),
  copy             = require('gulp-copy'),
  csscomb          = require('gulp-csscomb'),
  karma            = require('gulp-karma'),
  less             = require('gulp-less'),
  minifyCSS        = require('gulp-minify-css'),
  notify           = require('gulp-notify'),
  plumber          = require('gulp-plumber'),
  rename           = require('gulp-rename'),
  replace          = require('gulp-replace'),
  sourcemaps       = require('gulp-sourcemaps'),
  uglify           = require('gulp-uglify'),
  util             = require('gulp-util'),
  watch            = require('gulp-watch'),

  settings         = {
    minify: {
      processImport: false,
      keepSpecialComments: 0
    },
    prefix: {
      browsers: [
        "last 2 version",
        "> 1%",
        "opera 12.1",
        "safari 6",
        "ie 9",
        "bb 10",
        "android 4"
      ]
    },
    minJS: {
      extname: '.min.js'
    },
    minCSS: {
      extname: '.min.css'
    }
  },

  comments = {
    // remove variable comments from css
    variables : {
      in  : /[\s\S]+\/\* End Config \*\//m,
      out : '',
    },
    // adds spacing around comments
    large: {
      in  : /(\/\*\*\*\*[\s\S]+?\*\/)/mg,
      out : '\n\n$1\n'
    },
    small: {
      in  : /(\/\*---[\s\S]+?\*\/)/mg,
      out : '\n$1\n'
    },
    tiny: {
      in  : /(\/\* [\s\S]+? \*\/)/mg,
      out : '\n$1'
    }
  },

  assetPaths = {
    uncompressed : path.relative(output.uncompressed, output.themes),
    compressed   : path.relative(output.compressed, output.themes),
    packaged     : path.relative(output.packaged, output.themes)
  }

;

// Add base value to all paths
for(var folder in source) {
  if(source.hasOwnProperty(folder)) {
    source[folder] = base + source[folder];
  }
}
for(var folder in output) {
  if(output.hasOwnProperty(folder)) {
    output[folder] = base + output[folder];
  }
}

/*******************************
             Tasks
*******************************/

gulp.task('watch', 'Watch source directory for changes (Default Task)', function () {

  gulp.watch([
    source.definitions   + '**/*.less',
    source.site          + '**/*.{overrides,variables}',
    source.themes        + '**/*.{overrides,variables}'
  ], function(file) {

    var
      path,
      css,
      uncompressed,
      compressed,
      assets
    ;

    // recompile only definition file
    path = util.replaceExtension(file.path, '.less');
    path = path.replace(source.themes, source.definitions);
    path = path.replace(source.site, source.definitions);

    // find asset path
    assetPaths.source = path.relative(output.uncompressed, output.themes);

    console.log(assetPaths.source);

    if( fs.existsSync(path) ) {

      // copy assets
      assets = gulp.src(source.assets)
        .pipe(gulp.dest(output.themes))
      ;

      // build less
      css = gulp.src(path)
        .pipe(plumber())
        .pipe(less(settings.less))
        .pipe(replace(comments.variables.in, comments.variables.out))
        .pipe(replace(comments.large.in, comments.large.out))
        .pipe(replace(comments.small.in, comments.small.out))
        .pipe(replace(comments.tiny.in, comments.tiny.out))
        .pipe(autoprefixer(settings.prefix))
      ;
      uncompressed = css
        .pipe(replace(comments.tiny.in, comments.tiny.out))
        .pipe(gulp.dest(output.uncompressed))
      ;
      compressed = css
        .pipe(minifyCSS(settings.minify))
        .pipe(rename(settings.minCSS))
        .pipe(gulp.dest(output.compressed))
      ;

    }
    else {
      console.log('Definition file not found', path);
    }
  });

});

// Builds all files
gulp.task('build', 'Builds all files from source to dist', function(callback) {

});



// cleans distribution files
gulp.task('clean', 'Clean dist folder', function(callback) {
  del([
    config.output.compressed,
    config.output.minified,
    config.output.packaged
  ], callback);
});

gulp.task('version', 'Displays current version of Semantic', function(callback) {

});

gulp.task('default', false, [
  'watch'
]);


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


/*--------------
     Watch
---------------*/