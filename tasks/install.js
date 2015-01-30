/*******************************
         Install Task
*******************************/

var
  gulp           = require('gulp'),

  // node dependencies
  console        = require('better-console'),
  fs             = require('fs'),
  path           = require('path'),

  // gulp dependencies
  chmod          = require('gulp-chmod'),
  del            = require('del'),
  jsonEditor     = require('gulp-json-editor'),
  plumber        = require('gulp-plumber'),
  prompt         = require('gulp-prompt'),
  rename         = require('gulp-rename'),
  replace        = require('gulp-replace'),
  requireDotFile = require('require-dot-file'),
  wrench         = require('wrench'),

  // user config
  config         = require('./config/user'),

  // install config
  install        = require('./config/project/install'),

  // shorthand
  questions      = install.questions,
  settings       = install.settings

;

// Export install task
module.exports = function () {

  var
    currentConfig = requireDotFile('semantic.json'),
    manager       = install.getPackageManager()
  ;

  console.clear();

  // if semantic.json exists skip root questions

  // determine if is in node_modules, bower_modules and determine project root

  gulp
    .src('gulpfile.js')
    .pipe(prompt.prompt(questions.root, function(answers) {



    }))
    .pipe(prompt.prompt(questions.setup, function(answers) {
      var
        siteVariable      = /@siteFolder .*\'(.*)/mg,
        siteDestination   = answers.site || install.folders.site,

        pathToSite        = path.relative(path.resolve(install.folders.theme), path.resolve(siteDestination)).replace(/\\/g,'/'),
        sitePathReplace   = "@siteFolder   : '" + pathToSite + "/';",

        configExists      = fs.existsSync(config.files.config),
        themeConfigExists = fs.existsSync(config.files.theme),
        siteExists        = fs.existsSync(siteDestination),

        // file that will be modified
        jsonSource        = (configExists)
          ? config.files.config
          : install.templates.config,

        json = {
          paths: {
            source: {},
            output: {}
          }
        }
      ;

      // exit if config exists and user specifies not to proceed
      if(answers.overwrite !== undefined && answers.overwrite == 'no') {
        return;
      }

      console.clear();
      console.log('Installing');
      console.log('------------------------------');

      /*--------------
         Site Themes
      ---------------*/

      // create site files
      if(siteExists) {
        console.info('Site folder exists, merging files (no overwrite)', siteDestination);
      }
      else {
        console.info('Creating site theme folder', siteDestination);
      }

      // Copy _site template without overwrite
      wrench.copyDirSyncRecursive(config.templates.site, siteDestination, settings.wrench.recursive);

      /*--------------
        Theme.config
      ---------------*/

      // Adjust LESS variables for site folder location
      console.info('Adjusting @siteFolder', sitePathReplace);
      if(themeConfigExists) {
        gulp.src(config.files.site)
          .pipe(plumber())
          .pipe(replace(siteVariable, sitePathReplace))
          .pipe(chmod(config.permission))
          .pipe(gulp.dest(install.folders.theme))
        ;
      }
      else {
        console.info('Creating src/theme.config (LESS config)');
        gulp.src(config.templates.theme)
          .pipe(plumber())
          .pipe(rename({ extname : '' }))
          .pipe(replace(siteVariable, sitePathReplace))
          .pipe(chmod(config.permission))
          .pipe(gulp.dest(install.folders.theme))
        ;
      }

      /*--------------
        Semantic.json
      ---------------*/

      // add components
      if(answers.components) {
        json.components = answers.components;
      }
      // add permissions
      if(answers.permission) {
        json.permission = answers.permission;
      }

      // add dist folder paths
      if(answers.dist) {
        answers.dist = answers.dist;
        json.paths.output = {
          packaged     : answers.dist + '/',
          uncompressed : answers.dist + '/components/',
          compressed   : answers.dist + '/components/',
          themes       : answers.dist + '/themes/'
        };
      }
      // add rtl choice
      if(answers.rtl) {
        json.rtl = answers.rtl;
      }
      // add site path
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
        console.info('Extending config file (semantic.json)');
        gulp.src(jsonSource)
          .pipe(plumber())
          .pipe(rename(settings.rename.json)) // preserve file extension
          .pipe(jsonEditor(json))
          .pipe(gulp.dest('./'))
        ;
      }
      else {
        console.info('Creating config file (semantic.json)');
        gulp.src(jsonSource)
          .pipe(plumber())
          .pipe(rename({ extname : '' })) // remove .template from ext
          .pipe(jsonEditor(json))
          .pipe(gulp.dest('./'))
        ;
      }
      console.log('');
      console.log('');
    }))
    .pipe(prompt.prompt(questions.cleanup, function(answers) {
      if(answers.cleanup == 'yes') {
        del(install.setupFiles);
      }
      if(answers.build == 'yes') {
        // needs replacement for rewrite
        // config = require(config.files.config);
        // getConfigValues();
        gulp.start('build');
      }
    }))
  ;

};