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
  regExp         = install.regExp,
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
        modules    : path.join(manager.root, currentConfig.base + folders.modules),
        tasks      : path.join(manager.root, currentConfig.base + folders.tasks)
      }
    ;

    // duck-type if there is anything actually to update
    if( fs.existsSync(updatePaths.definition) ) {

      console.info('Updating ui definitions to ' + release.version);
      // fs.renameSync(oldPath, newPath); swap to move before debut
      wrench.copyDirSyncRecursive(source.definitions, updatePaths.definition, settings.wrench.update);

      console.info('Updating default theme to ' + release.version);
      wrench.copyDirSyncRecursive(source.themes, updatePaths.theme, settings.wrench.update);

      console.info('Updating gulp tasks...');
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
      var
        installPaths = {},
        installFolder
      ;

      if(answers.useRoot || answers.customRoot) {

        // Set root to custom root path if set
        if(answers.customRoot) {
          manager.root = answers.customRoot;
        }

        console.log(currentConfig.version, release.version);
        return;

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

          // create project folders if doesnt exist
          mkdirp.sync(installFolder);
          mkdirp.sync(installPaths.definition);
          mkdirp.sync(installPaths.theme);
          mkdirp.sync(installPaths.modules);
          mkdirp.sync(installPaths.tasks);

          // fs.renameSync(oldPath, newPath); swap to move before debut
          // copy gulp node_modules
          console.info('Copying definitions to ', installPaths.definition);
          wrench.copyDirSyncRecursive(source.definitions, installPaths.definition, settings.wrench.install);
          wrench.copyDirSyncRecursive(source.themes, installPaths.theme, settings.wrench.install);

          console.info('Copying build tools', installPaths.tasks);
          wrench.copyDirSyncRecursive(source.modules, installPaths.modules, settings.wrench.install);
          wrench.copyDirSyncRecursive(source.tasks, installPaths.tasks, settings.wrench.install);

          // create gulp file
          console.info('Creating gulp-file.js');
          gulp.src(source.userGulpFile)
            .pipe(plumber())
            .pipe(gulp.dest(installFolder))
          ;

        }


      }


      /*--------------
         Site Theme
      ---------------*/

      var
        configDestination,
        siteDestination,
        pathToSite,
        siteVariable
      ;

      // determine path to site folder from src/
      siteDestination   = answers.site || folders.site;
      configDestination = folders.themeConfig;

      // add base path when npm install
      if(installFolder) {
        siteDestination   = installFolder + siteDestination;
        configDestination = installFolder + configDestination;
      }

      // Copy _site templates without overwrite current site theme
      wrench.copyDirSyncRecursive(source.site, siteDestination, settings.wrench.site);

      // determine path to _site folder from theme config
      pathToSite   = path.relative(path.resolve(folders.themeConfig), path.resolve(siteDestination));
      siteVariable = "@siteFolder   : '" + pathToSite + "/';";

      // force less variables to use forward slashes for paths
      pathToSite = pathToSite.replace(/\\/g,'/');

      // create site files
      if( fs.existsSync(siteDestination) ) {
        console.info('Site folder exists, merging files (no overwrite)', siteDestination);
      }
      else {
        console.info('Creating site theme folder', siteDestination);
      }

      /*--------------
        Theme Config
      ---------------*/

      // rewrite site variable in theme.less
      console.info('Adjusting @siteFolder', siteVariable);

      if(fs.existsSync(config.files.theme)) {
        console.info('Modifying src/theme.config (LESS config)');
        gulp.src(config.files.site)
          .pipe(plumber())
          .pipe(replace(regExp.siteVariable, siteVariable))
          .pipe(gulp.dest(folders.themeConfig))
        ;
      }
      else {
        console.info('Creating src/theme.config (LESS config)');
        gulp.src(source.themeConfig)
          .pipe(plumber())
          .pipe(rename({ extname : '' }))
          .pipe(replace(regExp.siteVariable, siteVariable))
          .pipe(gulp.dest(folders.themeConfig))
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