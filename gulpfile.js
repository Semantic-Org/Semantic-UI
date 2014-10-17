/*
  All configurable options are defined inside build.config
  Please adjust this to your site's settings
*/

/*******************************
            Set-up
*******************************/

var
  gulp             = require('gulp-help')(require('gulp')),

  // read settings file
  config           = require('./build.json'),

  // shorthand
  base             = config.base,
  source           = config.paths.source,
  output           = config.paths.output,
  clean            = config.paths.clean,

  // required node components (& oddballs)
  del   = require('del'),
  fs    = require('fs'),
  path  = require('path'),
  clone = require('gulp-clone'),

  // required gulp components
  autoprefixer = require('gulp-autoprefixer'),
  concat       = require('gulp-concat'),
  concatCSS    = require('gulp-concat-css'),
  copy         = require('gulp-copy'),
  debug        = require('gulp-debug'),
  flatten      = require('gulp-flatten'),
  karma        = require('gulp-karma'),
  less         = require('gulp-less'),
  minifyCSS    = require('gulp-minify-css'),
  notify       = require('gulp-notify'),
  plumber      = require('gulp-plumber'),
  print        = require('gulp-print'),
  rename       = require('gulp-rename'),
  replace      = require('gulp-replace'),
  sourcemaps   = require('gulp-sourcemaps'),
  uglify       = require('gulp-uglify'),
  util         = require('gulp-util'),
  watch        = require('gulp-watch'),

  settings         = {
    del: {
      silent: true
    },
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
      in  : /\/\*[\s\S]+\/\* End Config \*\//m,
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

  log = {
    created: function(file) {
      return "Created: " + file;
    },
    modified: function(file) {
      return "Modified: " + file;
    }
  },

  assetPaths = {
    uncompressed : path.relative(output.uncompressed, output.themes),
    compressed   : path.relative(output.compressed, output.themes),
    packaged     : path.relative(output.packaged, output.themes)
  },

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

gulp.task('watch', 'Watch for site/theme changes (Default Task)', function () {

  return gulp
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

        // copy assets
        gulp.src(source.themes + '**/assets/**')
          .pipe(gulp.dest(output.themes))
        ;

        // unified css stream
        stream = gulp.src(srcPath)
          .pipe(plumber())
          .pipe(sourcemaps.init())
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

        compressedStream = stream
          .pipe(clone())
          .pipe(replace(assetPaths.source, assetPaths.compressed))
          .pipe(minifyCSS(settings.minify))
          .pipe(rename(settings.minCSS))
          .pipe(sourcemaps.write('/', {includeContent: true, sourceRoot: '/src'}))
          .pipe(gulp.dest(output.compressed))
          .pipe(print(log.created))
          .on('end', function() {
            gulp.start('package compressed css');
          })
        ;

        uncompressedStream
          .pipe(replace(assetPaths.source, assetPaths.uncompressed))
          .pipe(sourcemaps.write('/', {includeContent: true, sourceRoot: '/src'}))
          .pipe(gulp.dest(output.uncompressed))
          .pipe(print(log.created))
          .on('end', function() {
            gulp.start('package uncompressed css');
          })
        ;

      }
      else {
        console.log('Definition file not found', path);
      }
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

  // copy assets
  gulp.src(source.themes + '**/assets/**')
    .pipe(gulp.dest(output.themes))
  ;

  // javascript stream
  stream = gulp.src(source.definitions + '**/*.js')
    .pipe(flatten())
    .pipe(sourcemaps.init())
    .pipe(gulp.dest(output.uncompressed))
    .pipe(uglify())
    .pipe(rename(settings.minJS))
    .pipe(sourcemaps.write('/', {includeContent: true, sourceRoot: '/src'}))
    .pipe(gulp.dest(output.compressed))
    .on('end', function() {
      gulp.start('package js');
    })
  ;

  // unified css stream
  stream = gulp.src(source.definitions + '**/*.less')
    .pipe(plumber())
    .pipe(sourcemaps.init())
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

  compressedStream = stream
    .pipe(clone())
    .pipe(replace(assetPaths.source, assetPaths.compressed))
    .pipe(minifyCSS(settings.minify))
    .pipe(rename(settings.minCSS))
    .pipe(sourcemaps.write('/', {includeContent: true, sourceRoot: '/src'}))
    .pipe(gulp.dest(output.compressed))
    .pipe(print(log.created))
    .on('end', function() {
      gulp.start('package compressed css');
    })
  ;

  uncompressedStream
    .pipe(replace(assetPaths.source, assetPaths.uncompressed))
    .pipe(sourcemaps.write('/', {includeContent: true, sourceRoot: '/src'}))
    .pipe(gulp.dest(output.uncompressed))
    .pipe(print(log.created))
    .on('end', function() {
      gulp.start('package uncompressed css');
    })
  ;

});



// cleans distribution files
gulp.task('clean', 'Clean dist folder', function(callback) {
  console.log('Cleaning directory: ' + clean);
  return del([clean], settings.del, callback);
});

gulp.task('version', 'Displays current version of Semantic', function(callback) {
  var package = require('./package.json');
  console.log('Semantic UI ' + package.version);
});


/*--------------
    Internal
---------------*/

gulp.task('package uncompressed css', false, function() {
  return gulp.src(output.uncompressed + '**/!(*.min|*.map)')
    .pipe(debug({verbose: true}))
    .pipe(replace(assetPaths.uncompressed, assetPaths.packaged))
    .pipe(concatCSS('semantic.css'))
      .pipe(gulp.dest(output.packaged))
      .pipe(print(log.created))
  ;
});
gulp.task('package compressed css', false, function() {
  return gulp.src(output.compressed + '**/**.min.css')
    .pipe(debug({verbose: true}))
    .pipe(replace(assetPaths.compressed, assetPaths.packaged))
    .pipe(concatCSS('semantic.min.css'))
      .pipe(gulp.dest(output.packaged))
      .pipe(print(log.created))
  ;
});

gulp.task('package uncompressed javascript', false, function() {
  return gulp.src(output.uncompressed + '**/*.js')
    .pipe(replace(assetPaths.uncompressed, assetPaths.packaged))
    .pipe(concatCSS('semantic.js'))
      .pipe(gulp.dest(output.packaged))
      .pipe(print(log.created))
  ;
});
gulp.task('package compressed javascript', false, function() {
  return gulp.src(output.compressed + '**/*.min.js')
    .pipe(replace(assetPaths.compressed, assetPaths.packaged))
    .pipe(concatCSS('semantic.min.js'))
      .pipe(gulp.dest(output.packaged))
      .pipe(print(log.created))
  ;
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
