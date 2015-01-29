/*******************************
         Install Tasks
*******************************/

var
  // install dependencies
  jeditor   = require('gulp-json-editor'),
  prompt    = require('gulp-prompt'),
  wrench    = require('wrench'),
  questions = require('./tasks/questions')

;
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