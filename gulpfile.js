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
  wrench       = require('wrench'),

  // gulp dependencies
  autoprefixer = require('gulp-autoprefixer'),
  clone        = require('gulp-clone'),
  concat       = require('gulp-concat'),
  concatCSS    = require('gulp-concat-css'),
  copy         = require('gulp-copy'),
  debug        = require('gulp-debug'),
  flatten      = require('gulp-flatten'),
  header       = require('gulp-header'),
  jeditor      = require('gulp-json-editor'),
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

  // config
  banner       = require('./tasks/banner'),
  comments     = require('./tasks/comments'),
  defaults     = require('./tasks/defaults'),
  log          = require('./tasks/log'),
  questions    = require('./tasks/questions'),
  settings     = require('./tasks/gulp-settings'),

  // local
  overwrite  = true,

  // default settings
  base    = defaults.base,
  clean   = defaults.paths.clean,
  output  = defaults.paths.output,
  source  = defaults.paths.source,

  // derived
  config,
  package,
  assetPaths,
  componentGlob,

  // temporary
  folder
;


/*******************************
          Read Settings
*******************************/

try {
  // settings
  var
    config  = require('./semantic.json'),
    package = require('./package.json')
  ;

  // shorthand
  base    = config.base;
  clean   = config.paths.clean;
  output  = config.paths.output;
  source  = config.paths.source;

}
catch(error) {
  var config = false;
}

/*******************************
   Values Derived From Config
*******************************/

var
  getDerivedValues = function() {

    // create glob for matching filenames from selected components
    componentGlob = (typeof config.components == 'object')
      ? (config.components.length > 1)
        ? '{' + config.components.join(',') + '}'
        : config.components[0]
      : ''
    ;

    // relative paths
    assetPaths = {
      uncompressed : path.relative(output.uncompressed, output.themes),
      compressed   : path.relative(output.compressed, output.themes),
      packaged     : path.relative(output.packaged, output.themes)
    };

    // add base to values
    for(var folder in source) {
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
  }
;

getDerivedValues();


/*******************************
             Tasks
*******************************/

gulp.task('default', false, [
  'check install'
]);

gulp.task('watch', 'Watch for site/theme changes (Default Task)', function () {

  console.clear();
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
      assetPaths.source = path.relative(path.resolve(srcPath), path.resolve(source.themes));
      console.log(srcPath);
      console.log(source.themes);
      console.log(assetPaths.source);
      assetPaths.source = '../../themes';
      console.log(assetPaths.source);

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
          .pipe(rename(settings.rename.minCSS))
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
        .pipe(rename(settings.rename.minJS))
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
    .pipe(rename(settings.rename.minJS))
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
    .pipe(rename(settings.rename.minCSS))
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
  return del([clean], settings.del, callback);
});

gulp.task('version', 'Displays current version of Semantic', function(callback) {
  console.log('Semantic UI ' + package.version);
});

/*--------------
    Internal
---------------*/

gulp.task('package uncompressed css', false, function() {
  return gulp.src(output.uncompressed + '**/' + componentGlob + '!(*.min|*.map).css')
    .pipe(replace(assetPaths.uncompressed, assetPaths.packaged))
    .pipe(concatCSS('semantic.css'))
      .pipe(gulp.dest(output.packaged))
      .pipe(print(log.created))
  ;
});

gulp.task('package compressed css', false, function() {
  return gulp.src(output.uncompressed + '**/' + componentGlob + '!(*.min|*.map).css')
    .pipe(replace(assetPaths.uncompressed, assetPaths.packaged))
    .pipe(concatCSS('semantic.min.css'))
      .pipe(minifyCSS(settings.minify))
      .pipe(header(banner, settings.header))
      .pipe(gulp.dest(output.packaged))
      .pipe(print(log.created))
  ;
});

gulp.task('package uncompressed js', false, function() {
  return gulp.src(output.uncompressed + '**/' + componentGlob + '!(*.min|*.map).js')
    .pipe(replace(assetPaths.uncompressed, assetPaths.packaged))
    .pipe(concat('semantic.js'))
      .pipe(header(banner, settings.header))
      .pipe(gulp.dest(output.packaged))
      .pipe(print(log.created))
  ;
});

gulp.task('package compressed js', false, function() {
  return gulp.src(output.uncompressed + '**/' + componentGlob + '!(*.min|*.map).js')
    .pipe(replace(assetPaths.uncompressed, assetPaths.packaged))
    .pipe(concat('semantic.min.js'))
      .pipe(uglify(settings.uglify))
      .pipe(header(banner, settings.header))
      .pipe(gulp.dest(output.packaged))
      .pipe(print(log.created))
  ;
});


/*--------------
     Config
---------------*/

gulp.task('check install', false, function () {
  setTimeout(function() {
    if( !config || !fs.existsSync('./src/theme.config')) {
      console.log('No semantic.json file found. Starting install...');
      gulp.start('install');
    }
    else {
      gulp.start('watch');
    }
  }, 50);
});

gulp.task('install', 'Set-up project for first time', function () {
  console.clear();
  gulp
    .src('gulpfile.js')
    .pipe(prompt.prompt(questions.setup, function(answers) {
      var
        siteVariable  = /@siteFolder .*\'(.*)/mg,
        templates     = {
          themeConfig : './src/theme.config.example',
          jsonConfig  : './semantic.json.example',
          site        : './src/_site'
        },

        siteDestination   = answers.site || './src/site',
        themeDestination  = './src/',

        pathToSite        = path.relative(path.resolve('./src'), path.resolve(siteDestination)),
        sitePathReplace   = "@siteFolder   : '" + pathToSite + "/';",

        configExists      = fs.existsSync('./semantic.json'),
        themeConfigExists = fs.existsSync('./src/theme.config'),
        siteExists        = fs.existsSync(siteDestination),

        jsonSource = (configExists)
          ? './semantic.json'
          : './semantic.json.example',
        json = {
          paths: {
            source: {},
            output: {}
          }
        }
      ;

      // exit if config exists and user specifies no overwrite
      if(answers.overwrite !== undefined && answers.overwrite == 'no') {
        return;
      }

      console.clear();
      console.log('Installing');
      console.log('------------------------------');

      // create site files
      if(siteExists) {
        console.info('Site folder exists, merging files (no overwrite)', siteDestination);
      }
      else {
        console.info('Creating site theme folder', siteDestination);
      }
      // copy recursively without overwrite
      wrench.copyDirSyncRecursive(templates.site, siteDestination, settings.wrench.recursive);

      // adjust less variable for site folder location
      console.info('Adjusting @siteFolder', defaults.paths.source.config, themeDestination);
      if(themeConfigExists) {
        gulp.src('./src/theme.config')
          .pipe(replace(siteVariable, sitePathReplace))
          .pipe(gulp.dest(themeDestination))
        ;
      }
      else {
        console.info('Creating src/theme.config (LESS config)');
        gulp.src(templates.themeConfig)
          .pipe(rename({ extname : '' }))
          .pipe(replace(siteVariable, sitePathReplace))
          .pipe(gulp.dest(themeDestination))
        ;
      }


      // determine semantic.json config
      if(answers.components) {
        json.components = answers.components;
      }
      if(answers.dist) {
        answers.dist = answers.dist;
        json.paths.output = {
          packaged     : answers.dist + '/',
          uncompressed : answers.dist + '/components/',
          compressed   : answers.dist + '/components/',
          themes       : answers.dist + '/themes/'
        };
      }
      if(answers.site) {
        json.paths.source.site = answers.site + '/';
      }
      if(answers.packaged) {
        json.paths.output.packaged = answers.packaged + '/';
      }
      if(answers.compressed) {
        json.paths.output.compressed = answers.compressed + '/';
      }
      if(answers.uncompressed) {
        json.paths.output.uncompressed = answers.uncompressed + '/';
      }

      // write semantic.json
      if(configExists) {
        console.info('Extending semantic.json (Gulp config)');
        gulp.src(jsonSource)
          .pipe(plumber())
          .pipe(rename(settings.rename.json))
          .pipe(jeditor(json))
          .pipe(gulp.dest('./'))
        ;
      }
      else {
        console.info('Creating semantic.json (Gulp config)');
        gulp.src(jsonSource)
          .pipe(plumber())
          .pipe(rename({ extname : '' }))
          .pipe(jeditor(json))
          .pipe(gulp.dest('./'))
        ;
      }
      console.log('');
      console.log('');
    }))
    .pipe(prompt.prompt(questions.cleanup, function(answers) {
      if(answers.cleanup == 'yes') {
        del([
          './src/theme.config.example',
          './semantic.json.example',
          './src/_site'
        ]);
      }
      if(answers.build == 'yes') {
        config = require('./semantic.json');
        getDerivedValues();
        gulp.start('build');
      }
    }))
  ;
});





/*--------------
   Maintainer
---------------*/

/* Serve files to an instance of docs hosted adjacent */
gulp.task('serve', false, function () {

});


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
