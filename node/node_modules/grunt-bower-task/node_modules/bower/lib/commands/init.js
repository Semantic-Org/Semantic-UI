// ==========================================
// BOWER: Init API
// ==========================================
// Copyright 2013 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================


var path        = require('path');
var fs          = require('fs');
var util        = require('util');

var nopt        = require('nopt');
var promptly    = require('promptly');
var _           = require('lodash');

var help        = require('./help');
var Manager     = require('../core/manager');
var config      = require('../core/config');

var optionTypes = { help: Boolean };
var shorthand   = { 'h': ['--help'] };

var commonIgnore = ['**/.*', 'node_modules', 'components'];

var Init = function () {
  Manager.call(this);
};

util.inherits(Init, Manager);

Init.prototype.getDependenciesJSON = function () {
  var dependencies = Object.keys(this.dependencies);
  var remaining = dependencies.length;
  var json = {};

  dependencies.forEach(function (name) {
    var pkg = this.dependencies[name][0];

    pkg.on('loadJSON', function () {
      // TODO: use fetch endpoint here
      json[pkg.name] = pkg.commit ? '*' : '~' + pkg.version;
      remaining -= 1;
      if (remaining === 0) {
        this.manager.emit('loadDependencies', json);
      }
    }).loadJSON();
  }, this);

  if (remaining === 0) {
    this.emit('loadDependencies', json);
  }

  return this;
};

Init.prototype.getMain = function (name) {
  name = path.basename(name, '.js');
  if (fs.existsSync(path.join(process.cwd(), 'index.js'))) {
    return 'index.js';
  } else if (fs.existsSync(path.join(process.cwd(), name + '.js'))) {
    return name + '.js';
  } else {
    return null;
  }
};

Init.prototype.showPrompt = function (question, cb) {
  var prompt = question.prompt + ': [' + (question.yesno ? 'y' : question.value) + ']';
  if (question.yesno) {
    promptly.confirm(prompt, {'default': 'y'}, cb);
  } else {
    promptly.prompt(prompt, {'default': question.value}, cb);
  }
  this.emit('prompt', prompt);
};

Init.prototype.prompts = function (dependencies) {
  var main = this.json.main || this.getMain(this.json.name) || '';

  var questions = _.compact([
    {key: 'name', prompt: 'name', value: this.json.name, yesno: false},
    {key: 'version', prompt: 'version', value: this.json.version, yesno: false},
    {key: 'main', prompt: 'main file', value: main, yesno: false},
    _.size(dependencies) ? {key: 'dependencies', prompt: 'add current components as dependencies? (y/n)', value: dependencies, yesno: true} : null,
    {key: 'ignore', prompt: 'add commonly ignored files to ignore list? (y/n)', value: commonIgnore, yesno: true}
  ]);
  var index = 0;
  var question = questions[index];

  var cb = function (err, value) {
    if (question.yesno) {
      if (value) {
        this.json[question.key] = question.value;
      }
    } else if (value) {
      this.json[question.key] = value;
    }
    index += 1;
    if (index < questions.length) {
      question = questions[index];
      this.showPrompt(question, cb);
    } else {
      this.emit('prompts');
    }
  }.bind(this);

  this.showPrompt(question, cb);
};

Init.prototype.save = function (data) {
  fs.writeFileSync(path.join(this.cwd, config.json), JSON.stringify(data, null, 2));
};

module.exports = function () {
  var init = new Init();

  init
    .on('resolveLocal', init.loadJSON.bind(init))
    .on('loadJSON', init.getDependenciesJSON.bind(init))
    .on('loadDependencies', init.prompts.bind(init))
    .on('prompts', function () {
      init.save(init.json);
      init.emit('end');
    })
    .resolveLocal();

  return init;
};

module.exports.Init = Init; // Purely for testing

module.exports.line = function (argv) {
  var options  = nopt(optionTypes, shorthand, argv);
  if (options.help) return help('init');
  return module.exports();
};

module.exports.completion = function (opts, cb) {
  var word = opts.word;

  // completing options?
  if (word.charAt(0) === '-') {
    return cb(null, Object.keys(optionTypes).map(function (option) {
      return '--' + option;
    }));
  }
};

