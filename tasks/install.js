/*******************************
         Install Task
*******************************/

var
  gulp           = require('gulp'),

  // node dependencies
  console        = require('better-console'),
  fs             = require('fs'),
  mkdirp         = require('mkdirp'),
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

  /*--------------
     NPM Update
  ---------------*/

  if(currentConfig && manager.name === 'NPM') {

    var
      updatePaths = {
        definition : path.join(manager.root, currentConfig.paths.source.definitions),
        theme      : path.join(manager.root, currentConfig.paths.source.themes),
        site       : path.join(manager.root, currentConfig.paths.source.site),
        modules    : path.join(manager.root, folders.modules),
        tasks      : path.join(manager.root, folders.tasks)
      }
    ;

    // duck-type if there is anything actually to update
    if( fs.existsSync(updatePaths.definition) ) {

      console.info('Updating ui definitions to ' + release.version);
      wrench.copyDirSyncRecursive(source.definitions, updatePaths.definition, settings.wrench.update);

      console.info('Updating default theme to' + release.version);
      wrench.copyDirSyncRecursive(source.themes, updatePaths.theme, settings.wrench.update);

      console.info('Updating additional files...');
      wrench.copyDirSyncRecursive(source.modules, updatePaths.modules, settings.wrench.update);
      wrench.copyDirSyncRecursive(source.tasks, updatePaths.tasks, settings.wrench.update);
      wrench.copyDirSyncRecursive(source.site, updatePaths.site, settings.wrench.site);

      return;
    }

  }

  /*--------------
   Root Questions
  ---------------*/

  // PM that supports Build Tools
  if(manager.name == 'NPM') {
    rootQuestions[0].message = rootQuestions[0].message
      .replace('{packageMessage}', 'We detected you are using \033[92m' + manager.name + '\033[0m. Nice! ')
      .replace('{root}', manager.root)
    ;
    // set default path to detected PM root
    rootQuestions[0].default = manager.root;
    rootQuestions[1].default = manager.root;
  }
  else {
    // PM that does not support build tools
    rootQuestions = [];
  }

  // insert PM questions after "Install Type" question
  if(rootQuestions.length > 0) {
    Array.prototype.splice.apply(questions.setup, [2, 0].concat(rootQuestions));
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
         NPM Install
      ---------------*/

      if(answers.useRoot || answers.customRoot) {

        var
          installFolder,
          installPaths = {},
          gulpRoot,
          gulpFileExists
        ;

        // Set root to custom root path if set
        if(answers.customRoot) {
          manager.root = answers.customRoot;
        }

        // Copy semantic
        if(answers.semanticRoot) {

          // add project root to semantic root
          installFolder = path.join(manager.root, answers.semanticRoot);

          installPaths = {
            definition : path.resolve( path.join(installFolder, folders.definitions) ),
            theme      : path.resolve( path.join(installFolder, folders.themes) ),
            modules    : path.resolve( path.join(installFolder, folders.modules) ),
            tasks      : path.resolve( path.join(installFolder, folders.tasks) )
          };

          // create project folder if doesnt exist
          mkdirp.sync(installFolder);
          mkdirp.sync(installPaths.definition);
          mkdirp.sync(installPaths.theme);
          mkdirp.sync(installPaths.modules);
          mkdirp.sync(installPaths.tasks);

          // copy gulp node_modules
          console.info('Copying definitions to ', answers.semanticRoot);
          wrench.copyDirSyncRecursive(source.definitions, installPaths.definition, settings.wrench.install);
          wrench.copyDirSyncRecursive(source.themes, installPaths.theme, settings.wrench.install);

          console.info('Copying build tools', answers.semanticRoot);
          wrench.copyDirSyncRecursive(source.modules, installPaths.modules, settings.wrench.install);
          wrench.copyDirSyncRecursive(source.tasks, installPaths.tasks, settings.wrench.install);

          // create gulp file
          console.info('Creating gulp-file.js');
          gulp.src(source.gulpFile)
            .pipe(plumber())
            .pipe(gulp.dest(installFolder))
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