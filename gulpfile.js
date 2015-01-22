/*
  All configurable options are defined in separate files inside the 'task/' folder
  Please adjust these files according to your personal requirements
*/

/*******************************
            Set-up
*******************************/


var
  gulp         = require('gulp-help')(require('gulp')),

  // node components & oddballs
  console      = require('better-console'),
  del          = require('del'),
  extend       = require('extend'),
  fs           = require('fs'),
  path         = require('path'),
  runSequence  = require('run-sequence'),
  wrench       = require('wrench'),

  // gulp dependencies
  autoprefixer = require('gulp-autoprefixer'),
  chmod        = require('gulp-chmod'),
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
  rtlcss       = require('gulp-rtlcss'),
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

  // admin
  release      = require('./tasks/admin/release'),
  git          = require('gulp-git'),
  githubAPI    = require('github'),

  oAuth        = fs.existsSync('./tasks/admin/oauth.js')
    ? require('./tasks/admin/oauth')
    : false,
  github,


  // local
  runSetup   = false,
  overwrite  = true,
  config,
  package,
  github,

  version,

  // derived
  base,
  clean,
  output,
  source,
  assetPaths,
  componentGlob,

  // temporary
  folder
;


/*******************************
          Read Settings
*******************************/

try {
  // try to load json
  var
    config  = require(defaults.files.config),
    package = (fs.existsSync(defaults.files.npm))
      ? require(defaults.files.npm)
      : false
  ;
}
catch(error) {
  if(error.code === 'MODULE_NOT_FOUND') {
    console.error('No semantic.json config found');
  }
  var config = false;
}

/*******************************
   Values Derived From Config
*******************************/

var
  getConfigValues = function() {

    if(!config) {
      runSetup = true;
      config = defaults;
    }

    // extend defaults using shallow copy
    config = extend(false, {}, defaults, config);

    // shorthand
    base    = config.base;
    clean   = config.paths.clean;
    output  = config.paths.output;
    source  = config.paths.source;

    // npm package.json holds true "version"
    version = (package !== undefined)
      ? package.version || 'Unknown'
      : 'Unknown'
    ;

    // create glob for matching filenames from components in semantic.json
    componentGlob = (typeof config.components == 'object')
      ? (config.components.length > 1)
        ? '{' + config.components.join(',') + '}'
        : config.components[0]
      : '{' + defaults.components.join(',') + '}'
    ;

    // relative asset paths for css
    assetPaths = {
      uncompressed : path.relative(output.uncompressed, output.themes).replace(/\\/g,'/'),
      compressed   : path.relative(output.compressed, output.themes).replace(/\\/g,'/'),
      packaged     : path.relative(output.packaged, output.themes).replace(/\\/g,'/')
    };

    // add base path to all folders
    for(var folder in source) {
      if(source.hasOwnProperty(folder)) {
        source[folder] = path.normalize(base + source[folder]);
      }
    }
    for(folder in output) {
      if(output.hasOwnProperty(folder)) {
        output[folder] = path.normalize(base + output[folder]);
      }
    }
    clean = base + clean;
  }
;

getConfigValues();


/*******************************
             Tasks
*******************************/

gulp.task('default', false, [
  'check install'
]);

gulp.task('watch', 'Watch for site/theme changes (Default Task)', function(callback) {

  console.clear();
  console.log('Watching source files for changes');


  if(!fs.existsSync(config.files.theme)) {
    console.error('Cant compile LESS. Run "gulp install" to create a theme config file');
    return;
  }

  // start rtl task instead
  if(config.rtl) {
    gulp.start('watch rtl');
    return;
  }

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

      // get relative asset path (path returns wrong path? hardcoded)
      // assetPaths.source = path.relative(srcPath, path.resolve(source.themes));
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

        // use 2 concurrent streams from same pipe
        uncompressedStream = stream.pipe(clone());
        compressedStream   = stream.pipe(clone());

        uncompressedStream
          .pipe(plumber())
          .pipe(replace(assetPaths.source, assetPaths.uncompressed))
          //.pipe(sourcemaps.write('/', settings.sourcemap))
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
          .pipe(replace(assetPaths.source, assetPaths.compressed))
          .pipe(minifyCSS(settings.minify))
          .pipe(rename(settings.rename.minCSS))
          //.pipe(sourcemaps.write('/', settings.sourcemap))
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

  // watch for changes in assets
  gulp
    .watch([
      source.themes   + '**/assets/**'
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
        .pipe(sourcemaps.init())
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

});

// Builds all files
gulp.task('build', 'Builds all files from source', function(callback) {
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

  // Run RTL build instead
  if(config.rtl) {
    gulp.start('build rtl');
    return;
  }

  // assetPaths.source = path.relative(srcPath, path.resolve(source.themes));
  assetPaths.source = '../../themes';  // path.relative returns wrong path (hardcoded for src)

  // copy assets
  gulp.src(source.themes + '**/assets/**')
    .pipe(chmod(config.permission))
    .pipe(gulp.dest(output.themes))
  ;

  // javascript stream
  gulp.src(source.definitions + '**/' + componentGlob + '.js')
    .pipe(plumber())
    .pipe(flatten())
    .pipe(chmod(config.permission))
    .pipe(gulp.dest(output.uncompressed))
    .pipe(print(log.created))
    // .pipe(sourcemaps.init())
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
  stream = gulp.src(source.definitions + '**/' + componentGlob + '.less')
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

  // use 2 concurrent streams from same source to concat release
  uncompressedStream = stream.pipe(clone());
  compressedStream   = stream.pipe(clone());

  uncompressedStream
    .pipe(plumber())
    .pipe(replace(assetPaths.source, assetPaths.uncompressed))
    //.pipe(sourcemaps.write('/', settings.sourcemap))
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
    .pipe(replace(assetPaths.source, assetPaths.compressed))
    .pipe(minifyCSS(settings.minify))
    .pipe(rename(settings.rename.minCSS))
    //.pipe(sourcemaps.write('/', settings.sourcemap))
    .pipe(header(banner, settings.header))
    .pipe(chmod(config.permission))
    .pipe(gulp.dest(output.compressed))
    .pipe(print(log.created))
    .on('end', function() {
      callback();
      gulp.start('package compressed css');
    })
  ;

});

// cleans distribution files
gulp.task('clean', 'Clean dist folder', function(callback) {
  return del([clean], settings.del, callback);
});

gulp.task('version', 'Displays current version of Semantic', function(callback) {
  console.log('Semantic UI ' + version);
});

/*******************************
            RTL Tasks
*******************************/


/* Watch RTL */
gulp.task('watch rtl', 'Watch for site/theme changes (Default Task)', function(callback) {

  console.clear();
  console.log('Watching RTL source files for changes');

  if(!fs.existsSync(config.files.theme)) {
    console.error('Cant compile LESS. Run "gulp install" to create a theme config file');
    return;
  }

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
        srcPath = util.replaceExtension(file.path, '.less');
        srcPath = srcPath.replace(config.regExp.themePath, source.definitions);
        srcPath = srcPath.replace(source.site, source.definitions);
      }
      else if(isConfig) {
        console.log('Change detected in theme config');
        gulp.start('build');
      }
      else {
        srcPath = util.replaceExtension(file.path, '.less');
      }

      // get relative asset path (path returns wrong path? hardcoded)
      // assetPaths.source = path.relative(srcPath, path.resolve(source.themes));
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
          .pipe(rtlcss())
        ;

        // use 2 concurrent streams from same source
        uncompressedStream = stream.pipe(clone());
        compressedStream   = stream.pipe(clone());

        uncompressedStream
          .pipe(plumber())
          .pipe(replace(assetPaths.source, assetPaths.uncompressed))
          //.pipe(sourcemaps.write('/', settings.sourcemap))
          .pipe(header(banner, settings.header))
          .pipe(chmod(config.permission))
          .pipe(rename(settings.rename.rtlCSS))
          .pipe(gulp.dest(output.uncompressed))
          .pipe(print(log.created))
          .on('end', function() {
            gulp.start('package uncompressed rtl css');
          })
        ;

        compressedStream = stream
          .pipe(plumber())
          .pipe(clone())
          .pipe(replace(assetPaths.source, assetPaths.compressed))
          .pipe(minifyCSS(settings.minify))
          //.pipe(sourcemaps.write('/', settings.sourcemap))
          .pipe(header(banner, settings.header))
          .pipe(chmod(config.permission))
          .pipe(rename(settings.rename.rtlMinCSS))
          .pipe(gulp.dest(output.compressed))
          .pipe(print(log.created))
          .on('end', function() {
            gulp.start('package compressed rtl css');
          })
        ;

      }
      else {
        console.log('SRC Path Does Not Exist', srcPath);
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
        .pipe(chmod(config.permission))
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
        .pipe(plumber())
        .pipe(chmod(config.permission))
        .pipe(gulp.dest(output.uncompressed))
        .pipe(print(log.created))
        .pipe(sourcemaps.init())
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

});

/* Build RTL */
gulp.task('build rtl', 'Builds all files from source', function(callback) {
  var
    stream,
    compressedStream,
    uncompressedStream
  ;

  console.info('Building Semantic RTL');

  if(!fs.existsSync(config.files.theme)) {
    console.error('Cant build LESS. Run "gulp install" to create a theme config file');
    return;
  }

  // get relative asset path (path returns wrong path?)
  // assetPaths.source = path.relative(srcPath, path.resolve(source.themes));
  assetPaths.source = '../../themes'; // hardcoded

  // copy assets
  gulp.src(source.themes + '**/assets/**')
    .pipe(chmod(config.permission))
    .pipe(gulp.dest(output.themes))
  ;

  // javascript stream
  gulp.src(source.definitions + '**/' + componentGlob + '.js')
    .pipe(plumber())
    .pipe(flatten())
    .pipe(chmod(config.permission))
    .pipe(gulp.dest(output.uncompressed))
    .pipe(print(log.created))
    // .pipe(sourcemaps.init())
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
  stream = gulp.src(source.definitions + '**/' + componentGlob + '.less')
    .pipe(plumber())
    //.pipe(sourcemaps.init())
    .pipe(less(settings.less))
    .pipe(flatten())
    .pipe(replace(comments.variables.in, comments.variables.out))
    .pipe(replace(comments.large.in, comments.large.out))
    .pipe(replace(comments.small.in, comments.small.out))
    .pipe(replace(comments.tiny.in, comments.tiny.out))
    .pipe(autoprefixer(settings.prefix))
    .pipe(rtlcss())
  ;

  // use 2 concurrent streams from same source to concat release
  uncompressedStream = stream.pipe(clone());
  compressedStream   = stream.pipe(clone());

  uncompressedStream
    .pipe(plumber())
    .pipe(replace(assetPaths.source, assetPaths.uncompressed))
    //.pipe(sourcemaps.write('/', settings.sourcemap))
    .pipe(rename(settings.rename.rtlCSS))
    .pipe(header(banner, settings.header))
    .pipe(chmod(config.permission))
    .pipe(gulp.dest(output.uncompressed))
    .pipe(print(log.created))
    .on('end', function() {
      gulp.start('package uncompressed rtl css');
    })
  ;

  compressedStream = stream
    .pipe(plumber())
    .pipe(clone())
    .pipe(replace(assetPaths.source, assetPaths.compressed))
    .pipe(minifyCSS(settings.minify))
    .pipe(rename(settings.rename.rtlMinCSS))
    //.pipe(sourcemaps.write('/', settings.sourcemap))
    .pipe(header(banner, settings.header))
    .pipe(chmod(config.permission))
    .pipe(gulp.dest(output.compressed))
    .pipe(print(log.created))
    .on('end', function() {
      callback();
      gulp.start('package compressed rtl css');
    })
  ;

});

gulp.task('package uncompressed rtl css', false, function () {
  return gulp.src(output.uncompressed + '**/' + componentGlob + '!(*.min|*.map).rtl.css')
    .pipe(replace(assetPaths.uncompressed, assetPaths.packaged))
    .pipe(concatCSS('semantic.rtl.css'))
      .pipe(gulp.dest(output.packaged))
      .pipe(print(log.created))
  ;
});

gulp.task('package compressed rtl css', false, function () {
  return gulp.src(output.uncompressed + '**/' + componentGlob + '!(*.min|*.map).rtl.css')
    .pipe(replace(assetPaths.uncompressed, assetPaths.packaged))
    .pipe(concatCSS('semantic.rtl.min.css'))
      .pipe(minifyCSS(settings.minify))
      .pipe(header(banner, settings.header))
      .pipe(gulp.dest(output.packaged))
      .pipe(print(log.created))
  ;
});

/*--------------
    Internal
---------------*/

gulp.task('package uncompressed css', false, function() {
  return gulp.src(output.uncompressed + '**/' + componentGlob + config.ignoredFiles + '.css')
    .pipe(plumber())
    .pipe(replace(assetPaths.uncompressed, assetPaths.packaged))
    .pipe(concatCSS('semantic.css'))
    .pipe(chmod(config.permission))
      .pipe(gulp.dest(output.packaged))
      .pipe(print(log.created))
  ;
});

gulp.task('package compressed css', false, function() {
  return gulp.src(output.uncompressed + '**/' + componentGlob + config.ignoredFiles + '.css')
    .pipe(plumber())
    .pipe(replace(assetPaths.uncompressed, assetPaths.packaged))
    .pipe(concatCSS('semantic.min.css'))
      .pipe(minifyCSS(settings.minify))
      .pipe(header(banner, settings.header))
      .pipe(chmod(config.permission))
      .pipe(gulp.dest(output.packaged))
      .pipe(print(log.created))
  ;
});

gulp.task('package uncompressed js', false, function() {
  return gulp.src(output.uncompressed + '**/' + componentGlob + '!(*.min|*.map).js')
    .pipe(plumber())
    .pipe(replace(assetPaths.uncompressed, assetPaths.packaged))
    .pipe(concat('semantic.js'))
      .pipe(header(banner, settings.header))
      .pipe(chmod(config.permission))
      .pipe(gulp.dest(output.packaged))
      .pipe(print(log.created))
  ;
});

gulp.task('package compressed js', false, function() {
  return gulp.src(output.uncompressed + '**/' + componentGlob + '!(*.min|*.map).js')
    .pipe(plumber())
    .pipe(replace(assetPaths.uncompressed, assetPaths.packaged))
    .pipe(concat('semantic.min.js'))
      .pipe(uglify(settings.uglify))
      .pipe(header(banner, settings.header))
      .pipe(chmod(config.permission))
      .pipe(gulp.dest(output.packaged))
      .pipe(print(log.created))
  ;
});


/*--------------
     Config
---------------*/

gulp.task('check install', false, function () {
  setTimeout(function() {
    if( runSetup || !fs.existsSync(config.files.site)) {
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
        siteVariable      = /@siteFolder .*\'(.*)/mg,
        siteDestination   = answers.site || config.folders.site,

        pathToSite        = path.relative(path.resolve(config.folders.theme), path.resolve(siteDestination)).replace(/\\/g,'/'),
        sitePathReplace   = "@siteFolder   : '" + pathToSite + "/';",

        configExists      = fs.existsSync(config.files.config),
        themeConfigExists = fs.existsSync(config.files.theme),
        siteExists        = fs.existsSync(siteDestination),

        jsonSource        = (configExists)
          ? config.files.config
          : config.templates.config,
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
      wrench.copyDirSyncRecursive(config.templates.site, siteDestination, settings.wrench.recursive);

      // adjust less variable for site folder location
      console.info('Adjusting @siteFolder', sitePathReplace);
      if(themeConfigExists) {
        gulp.src(config.files.site)
          .pipe(plumber())
          .pipe(replace(siteVariable, sitePathReplace))
          .pipe(chmod(config.permission))
          .pipe(gulp.dest(config.folders.theme))
        ;
      }
      else {
        console.info('Creating src/theme.config (LESS config)');
        gulp.src(config.templates.theme)
          .pipe(plumber())
          .pipe(rename({ extname : '' }))
          .pipe(replace(siteVariable, sitePathReplace))
          .pipe(chmod(config.permission))
          .pipe(gulp.dest(config.folders.theme))
        ;
      }


      // determine semantic.json config
      if(answers.components) {
        json.components = answers.components;
      }
      if(answers.permission) {
        json.permission = +answers.permission;
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
      if(answers.rtl) {
        json.rtl = (answers.rtl == 'yes')
          ? true
          : false
        ;
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
          .pipe(rename(settings.rename.json)) // preserve file extension
          .pipe(jeditor(json))
          .pipe(chmod(config.permission))
          .pipe(gulp.dest('./'))
        ;
      }
      else {
        console.info('Creating semantic.json (Gulp config)');
        gulp.src(jsonSource)
          .pipe(plumber())
          .pipe(rename({ extname : '' })) // remove .template from ext
          .pipe(jeditor(json))
          .pipe(chmod(config.permission))
          .pipe(gulp.dest('./'))
        ;
      }
      console.log('');
      console.log('');
    }))
    .pipe(prompt.prompt(questions.cleanup, function(answers) {
      if(answers.cleanup == 'yes') {
        del(config.setupFiles);
      }
      if(answers.build == 'yes') {
        config = require(config.files.config);
        getConfigValues();
        gulp.start('build');
      }
    }))
  ;
});

/*******************************
          Admin Tasks
*******************************/

var
  adminQuestions = require('./tasks/admin/questions'),
  newVersion = false
;

/* Moves watched files to static site generator output */
gulp.task('serve-docs', false, function () {
  config = require('./tasks/admin/docs.json');
  getConfigValues();


  // copy source files
  gulp
    .watch([
      'src/**/*.*'
    ], function(file) {
      console.clear();
      return gulp.src(file.path, { base: 'src/' })
        .pipe(chmod(config.permission))
        .pipe(gulp.dest(output.less))
        .pipe(print(log.created))
      ;
    })
  ;
  gulp.start('watch');
});


/* Builds files to docs source */
gulp.task('build-docs', false, function () {
  console.clear();
  // pushes to docpad files
  config = require('./tasks/admin/docs.json');
  getConfigValues();
  gulp.start('build');

  // copy source
  gulp.src('src/**/*.*')
    .pipe(chmod(config.permission))
    .pipe(gulp.dest(output.less))
    .pipe(print(log.created))
  ;

});


/* Release */
gulp.task('release', false, function() {
  // gulp bump
  // Ask for release type (minor, major, patch)
  // Bump package.json
  // Bump composer.json
  if(!oAuth) {
    console.error('Must add node include tasks/admin/oauth.js with oauth token for GitHub');
    return;
  }

  github = new githubAPI({
    version    : '3.0.0',
    debug      : true,
    protocol   : 'https',
    timeout    : 5000
  });

  github.authenticate({
    type: 'oauth',
    token: oAuth.token
  });

  // gulp build
  //runSequence('update git');
  runSequence('build', 'create repos', 'update git');

  // #Create SCSS Version
  // #Create RTL Release

});

/* Build Component Release Only */
gulp.task('build release', false, function() {
  runSequence('build', 'create repos');
});


/*--------------
    Internal
---------------*/


gulp.task('create repos', false, function(callback) {
  var
    stream,
    index,
    tasks = []
  ;

  for(index in release.components) {

    var
      component            = release.components[index]
    ;

    // streams... designed to save time and make coding fun...
    (function(component) {

      var
        outputDirectory      = release.outputRoot + component,
        isJavascript         = fs.existsSync(output.compressed + component + '.js'),
        isCSS                = fs.existsSync(output.compressed + component + '.css'),
        capitalizedComponent = component.charAt(0).toUpperCase() + component.slice(1),
        packageName          = release.packageRoot + component,
        repoName             = release.repoRoot + capitalizedComponent,
        gitURL               = 'https://github.com/' + release.org + '/' + repoName + '.git',
        repoURL              = 'https://github.com/' + release.org + '/' + repoName + '/',
        regExp               = {
          match            : {
            // readme
            name              : '{component}',
            titleName         : '{Component}',
            // release notes
            spacedVersions    : /(###.*\n)\n+(?=###)/gm,
            spacedLists       : /(^- .*\n)\n+(?=^-)/gm,
            trim              : /^\s+|\s+$/g,
            unrelatedNotes    : new RegExp('^((?!(^.*(' + component + ').*$|###.*)).)*$', 'gmi'),
            whitespace        : /\n\s*\n\s*\n/gm,
            // npm
            export            : /\$\.fn\.\w+\s*=\s*function\(parameters\)\s*{/g,
            formExport        : /\$\.fn\.\w+\s*=\s*function\(fields, parameters\)\s*{/g,
            settingsExport    : /\$\.fn\.\w+\.settings\s*=/g,
            settingsReference : /\$\.fn\.\w+\.settings/g,
            jQuery            : /jQuery/g
          },
          replace : {
            // readme
            name              : component,
            titleName         : capitalizedComponent,
            // release notes
            spacedVersions    : '',
            spacedLists       : '$1',
            trim              : '',
            unrelatedNotes    : '',
            whitespace        : '\n\n',
            // npm
            export            :  'module.exports = function(parameters) {\n  var _module = module;\n',
            formExport        :  'module.exports = function(fields, parameters) {\n  var _module = module;\n',
            settingsExport    :  'module.exports.settings =',
            settingsReference :  '_module.exports.settings',
            jQuery            :  'require("jquery")'
          }
        },
        task = {
          all      : component + ' creating',
          repo     : component + ' create repo',
          bower    : component + ' create bower.json',
          readme   : component + ' create README',
          readme   : component + ' create README',
          npm      : component + ' create NPM Module',
          notes    : component + ' create release notes',
          composer : component + ' create composer.json',
          package  : component + ' create package.json'
        }
      ;

      // copy dist files into output folder adjusting asset paths
      gulp.task(task.repo, false, function() {
        return gulp.src(release.source + component + '.*')
          .pipe(plumber())
          .pipe(flatten())
          .pipe(replace(release.paths.source, release.paths.output))
          .pipe(chmod(config.permission))
          .pipe(gulp.dest(outputDirectory))
        ;
      });

      // create npm module
      gulp.task(task.npm, false, function() {
        return gulp.src(release.source + component + '!(*.min|*.map).js')
          .pipe(plumber())
          .pipe(flatten())
          .pipe(replace(regExp.match.export, regExp.replace.export))
          .pipe(replace(regExp.match.formExport, regExp.replace.formExport))
          .pipe(replace(regExp.match.settingsExport, regExp.replace.settingsExport))
          .pipe(replace(regExp.match.settingsReference, regExp.replace.settingsReference))
          .pipe(replace(regExp.match.jQuery, regExp.replace.jQuery))
          .pipe(rename('index.js'))
          .pipe(chmod(config.permission))
          .pipe(gulp.dest(outputDirectory))
        ;
      });

      // create readme
      gulp.task(task.readme, false, function() {
        return gulp.src(release.templates.readme)
          .pipe(plumber())
          .pipe(flatten())
          .pipe(replace(regExp.match.name, regExp.replace.name))
          .pipe(replace(regExp.match.titleName, regExp.replace.titleName))
          .pipe(chmod(config.permission))
          .pipe(gulp.dest(outputDirectory))
        ;
      });

      // extend bower.json
      gulp.task(task.bower, false, function() {
        return gulp.src(release.templates.bower)
          .pipe(plumber())
          .pipe(flatten())
          .pipe(jeditor(function(bower) {
            bower.name = packageName;
            bower.description = capitalizedComponent + ' - Semantic UI';
            if(isJavascript) {
              if(isCSS) {
                bower.main = [
                  component + '.js',
                  component + '.css'
                ];
              }
              else {
                bower.main = [
                  component + '.js'
                ];
              }
              bower.dependencies = {
                jquery: '>=1.8'
              };
            }
            else {
              bower.main = [
                component + '.css'
              ];
            }
            return bower;
          }))
          .pipe(chmod(config.permission))
          .pipe(gulp.dest(outputDirectory))
        ;
      });

      // extend package.json
      gulp.task(task.package, false, function() {
        return gulp.src(release.templates.package)
          .pipe(plumber())
          .pipe(flatten())
          .pipe(jeditor(function(package) {
            if(isJavascript) {
              package.dependencies = {
                jquery: 'x.x.x'
              };
              package.main = 'index.js';
            }
            package.name = packageName;
            if(version) {
              package.version = version;
            }
            package.title       = 'Semantic UI - ' + capitalizedComponent;
            package.description = 'Single component release of ' + component;
            package.repository  = {
              type : 'git',
              url  : gitURL
            };
            return package;
          }))
          .pipe(chmod(config.permission))
          .pipe(gulp.dest(outputDirectory))
        ;
      });

      // extend composer.json
      gulp.task(task.composer, false, function() {
        return gulp.src(release.templates.composer)
          .pipe(plumber())
          .pipe(flatten())
          .pipe(jeditor(function(composer) {
            if(isJavascript) {
              composer.dependencies = {
                jquery: 'x.x.x'
              };
              composer.main = component + '.js';
            }
            composer.name        = 'semantic/' + component;
            if(version) {
              composer.version     = version;
            }
            composer.description = 'Single component release of ' + component;
            return composer;
          }))
          .pipe(chmod(config.permission))
          .pipe(gulp.dest(outputDirectory))
        ;
      });

      // create release notes
      gulp.task(task.notes, false, function() {
        return gulp.src(release.templates.notes)
          .pipe(plumber())
          .pipe(flatten())
          // Remove release notes for lines not mentioning component
          .pipe(replace(regExp.match.unrelatedNotes, regExp.replace.unrelatedNotes))
          .pipe(replace(regExp.match.whitespace, regExp.replace.whitespace))
          .pipe(replace(regExp.match.spacedVersions, regExp.replace.spacedVersions))
          .pipe(replace(regExp.match.spacedLists, regExp.replace.spacedLists))
          .pipe(replace(regExp.match.trim, regExp.replace.trim))
          .pipe(chmod(config.permission))
          .pipe(gulp.dest(outputDirectory))
        ;
      });

      // synchronous tasks in orchestrator? I think not
      gulp.task(task.all, false, function(callback) {
        runSequence([
          task.repo,
          task.npm,
          task.bower,
          task.readme,
          task.package,
          task.composer,
          task.notes
        ], callback);
      });

      tasks.push(task.all);

    })(component);
  }

  runSequence(tasks, callback);

});
gulp.task('register repos', false, function(callback) {
  var
    index = -1,
    total = release.components.length,
    process = require('child_process'),
    stream,
    stepRepo
  ;
  console.log('Registering repos with package managers');

  // Do Git commands synchronously per component, to avoid issues
  stepRepo = function() {
    index = index + 1;
    if(index >= total) {
      return;
    }
    var
      component            = release.components[index],
      outputDirectory      = release.outputRoot + component + '/',
      capitalizedComponent = component.charAt(0).toUpperCase() + component.slice(1),
      packageName          = release.packageRoot + component,
      repoName             = release.repoRoot + capitalizedComponent,
      gitURL               = 'https://github.com/' + release.org + '/' + repoName + '.git',
      exec                 = process.exec,
      execSettings         = {cwd: outputDirectory},
      registerBower        = 'bower register ' + packageName + ' ' + gitURL,
      registerNPM          = 'npm publish'

    ;
    /* One time register
    exec(registerBower, execSettings, function(err, stdout, stderr) {
      stepRepo();
    });
    */
    /* Update npm
    exec(registerNPM, execSettings, function(err, stdout, stderr) {
      console.log(err, stdout, stderr);
      stepRepo();
    });
    */
  }
  stepRepo();
});

gulp.task('update git', false, function() {
  var
    index = -1,
    total = release.components.length,
    stream,
    stepRepo
  ;
  console.log('Handling git');

  // Do Git commands synchronously per component, to avoid issues
  stepRepo = function() {

    index = index + 1;
    if(index >= total) {
      return;
    }

    var
      component            = release.components[index],
      outputDirectory      = release.outputRoot + component + '/',
      capitalizedComponent = component.charAt(0).toUpperCase() + component.slice(1),
      repoName             = release.repoRoot + capitalizedComponent,
      gitURL               = 'https://github.com/' + release.org + '/' + repoName + '.git',
      repoURL              = 'https://github.com/' + release.org + '/' + repoName + '/',
      gitOptions           = { cwd: outputDirectory },
      quietOptions         = { args: '-q', cwd: outputDirectory },
      isRepository         = fs.existsSync(outputDirectory + '.git/')
      componentPackage     = fs.existsSync(outputDirectory + 'package.json' )
        ? require(outputDirectory + 'package.json')
        : false,
      commitArgs = (oAuth.name !== undefined && oAuth.email !== undefined)
        ? '--author "' + oAuth.name + ' <' + oAuth.email + '>"'
        : '',
      isNewVersion  = (version && componentPackage.version != version),
      mergeMessage  = 'Merged from upstream',
      commitMessage = (isNewVersion)
        ? 'Updated component to version ' + version
        : 'Updated component release from Semantic-UI (Automatic)'
    ;

    console.log('Processing repository:' + outputDirectory);

    if(isRepository) {
      commitFiles();
    }
    else {
      createRepo();
    }

    // standard path
    function commitFiles() {
      // commit files
      console.log('Committing files', commitArgs);
      gulp.src('**/*', gitOptions)
        .pipe(git.add(gitOptions))
        .pipe(git.commit(commitMessage, { args: commitArgs, cwd: outputDirectory }))
        .on('error', function(error) {
          console.log('Nothing new to commit');
          stepRepo();
        })
        .on('finish', function(callback) {
          pullFiles();
        })
      ;
    }
    function pullFiles() {
      console.log('Pulling files');
      git.pull('origin', 'master', { args: '', cwd: outputDirectory }, function(error) {
        if(error && error.message.search("Couldn't find remote ref") != -1) {
          createRepo();
        }
        else {
          console.log('Pull completed successfully');
          mergeCommit();
        }
      });
    };
    function mergeCommit() {
      // commit files
      console.log('Adding merge commit', commitArgs);
      gulp.src('', gitOptions)
        .pipe(git.add(gitOptions))
        .pipe(git.commit(mergeMessage, { args: commitArgs, cwd: outputDirectory }))
        .on('error', function(error) {
          console.log('Nothing new to merge', error);
        })
        .on('finish', function(callback) {
          if(1) {
            tagFiles();
          }
          else {
            pushFiles();
          }
        })
      ;
    }
    function tagFiles() {
      console.log('Tagging new version ', version);
      git.tag(version, 'Updated version from semantic-ui (automatic)', function (err) {
        pushFiles();
      });
    }
    function pushFiles() {
      console.log('Pushing files');
      git.push('origin', 'master', { args: '', cwd: outputDirectory }, function(error) {
        if(error && error.message.search("Couldn't find remote ref") == -1) {
          createRepo();
        }
        console.log('Push completed successfully');
        stepRepo();
      });
    };

    // set-up path
    function createRepo() {
      console.log('Creating repository ' + repoURL);
      github.repos.createFromOrg({
        org      : release.org,
        name     : repoName,
        homepage : release.homepage
      }, function() {
        if(isRepository) {
          addRemote();
        }
        else {
          initRepo();
        }
      });
    }
    function initRepo() {
      console.log('Initializing repository in ' + outputDirectory);
      git.init(gitOptions, function(error) {
        if(error) {
          console.error('Error initializing repo');
          return;
        }
        addRemote();
      });
    }
    function addRemote() {
      console.log('Adding remote origin as ' + gitURL);
      git.addRemote('origin', gitURL, gitOptions, firstPushFiles);
    }
    function firstPushFiles() {
      console.log('Pushing files');
      git.push('origin', 'master', { args: '-u', cwd: outputDirectory }, function(error) {
        if(error) {
          console.log(error);
          pullFiles();
        }
        else {
          console.log('First push completed successfully');
          stepRepo();
        }
      });
    };

  };

  return stepRepo();

});
