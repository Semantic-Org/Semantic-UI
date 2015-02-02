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
  release        = require('./config/project/release'),

  // shorthand
  questions      = install.questions,
  folders        = install.folders,
  settings       = install.settings,
  source         = install.source

;

// Export install task
module.exports = function () {


  /*--------------
    Install Tools
  ---------------*/

  var
    currentConfig = requireDotFile('semantic.json'),
    manager       = install.getPackageManager(),
    rootQuestions = questions.root
  ;

  console.clear();

  // debug
  manager = {
    name : 'NPM',
    root : path.normalize(__dirname + '/../')
  };

  if(manager == 'NPM') {
    // PM that supports Build Tools

    if(currentConfig) {
      // Upgrade run
      rootQuestions = [];
    }
    else {
      // First Run
      rootQuestions[0].message = rootQuestions[0].message
        .replace('{packageMessage}', 'We detected you are using \033[92m' + manager.name + '\033[0m. Nice! ')
        .replace('{root}', manager.root)
      ;
      // set default path to detected PM root
      rootQuestions[0].default = manager.root;
      rootQuestions[1].default = manager.root;
    }
  }
  else {
    // Unsupported package manager
    rootQuestions = [];
  }

  // insert root questions after "Install Type" question
  if(rootQuestions.length > 0) {
    Array.prototype.splice.apply(questions.setup, [2, 0].concat(rootQuestions));
  }


  /*--------------
      NPM Update
  ---------------*/

  if(currentConfig && manager === 'NPM') {

    var
      definitionPath = path.join(manager.root, currentConfig.base + currentConfig.source.definitions),
      themePath      = path.join(manager.root, currentConfig.base + currentConfig.source.themes),
      siteThemePath  = path.join(manager.root, currentConfig.base + currentConfig.source.site)
    ;

    console.info('Updating ui definitions to ' + release.version);
    wrench.copyDirSyncRecursive(source.definitions, definitionPath, settings.wrench.update);

    console.info('Updating default theme to' + release.version);
    wrench.copyDirSyncRecursive(source.themes, themePath, settings.wrench.update);

    wrench.copyDirSyncRecursive(source.site, siteThemePath, settings.wrench.site);
  }


  /*--------------
       Set-up
  ---------------*/

  return gulp
    .src('gulpfile.js')
    .pipe(prompt.prompt(questions.setup, function(answers) {

      /*--------------
       Exit Conditions
      ---------------*/

      // if config exists and user specifies not to proceed
      if(answers.overwrite !== undefined && answers.overwrite == 'no') {
        return;
      }

      console.clear();
      console.log('Installing');
      console.log('------------------------------');

      /*--------------
        Install Tools
      ---------------*/

      // We're moving things around
      if(answers.root || answers.customRoot) {

        var
          gulpRoot,
          gulpFileExists
        ;

        // Set root to custom root path
        if(answers.customRoot) {
          answers.root = answers.customRoot;
        }

        // add project root to semantic root
        if(answers.semanticRoot) {
          answers.semanticRoot = path.join(answers.root, answers.semanticRoot);
        }

        // Copy build tools to gulp root (node_modules & gulpfile)
        if(answers.semanticRoot) {

          // copy gulp node_modules
          console.info('Copying dependencies', answers.semanticRoot + folders.modules);
          wrench.copyDirSyncRecursive(source.modules, answers.semanticRoot + folders.modules, settings.wrench.modules);

          // create gulp file
          console.info('Creating gulp-file.js');
          gulp.src(source.gulpFile)
            .pipe(plumber())
            .pipe(gulp.dest(answers.semanticRoot))
          ;


        }


      }


      /*--------------
         Site Themes
      ---------------*/

      var
        siteVariable      = /@siteFolder .*\'(.*)/mg,
        siteDestination   = answers.site || folders.site,

        siteExists        = fs.existsSync(siteDestination),
        themeConfigExists = fs.existsSync(config.files.theme),

        pathToSite        = path.relative(path.resolve(folders.theme), path.resolve(siteDestination)).replace(/\\/g,'/'),
        sitePathReplace   = "@siteFolder   : '" + pathToSite + "/';"
      ;

      // create site files
      if(siteExists) {
        console.info('Site folder exists, merging files (no overwrite)', siteDestination);
      }
      else {
        console.info('Creating site theme folder', siteDestination);
      }

      // Copy _site template without overwrite
      wrench.copyDirSyncRecursive(source.site, siteDestination, settings.wrench.site);


      // Adjust theme.less in project folder
      console.info('Adjusting @siteFolder', sitePathReplace);
      if(themeConfigExists) {
        gulp.src(config.files.site)
          .pipe(plumber())
          .pipe(replace(siteVariable, sitePathReplace))
          .pipe(gulp.dest(folders.theme))
        ;
      }
      else {
        console.info('Creating src/theme.config (LESS config)');
        gulp.src(source.themeConfig)
          .pipe(plumber())
          .pipe(rename({ extname : '' }))
          .pipe(replace(siteVariable, sitePathReplace))
          .pipe(gulp.dest(folders.theme))
        ;
      }

      /*--------------
        Semantic.json
      ---------------*/

      var
        configExists = fs.existsSync(config.files.config),
        json         = install.createJSON(answers),
        jsonSource   = (configExists)
          ? config.files.config
          : source.config
      ;

      // adjust variables in theme.less
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