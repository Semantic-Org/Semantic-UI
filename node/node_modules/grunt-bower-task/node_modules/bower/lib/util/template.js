// ==========================================
// BOWER: Hogan Renderer w/ template cache
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

var events = require('events');
var hogan  = require('hogan.js');
var path   = require('path');
var fs     = require('fs');

require('../util/hogan-colors');

var templates = {};

module.exports = function (name, context, sync) {
  var emitter = new events.EventEmitter;

  var templateName = name + '.mustache';
  var templatePath = path.join(__dirname, '../../templates/', templateName);

  if (sync) {
    if (!templates[templatePath]) templates[templatePath] = fs.readFileSync(templatePath, 'utf-8');
    return hogan.compile(templates[templatePath]).renderWithColors(context);
  } else if (templates[templatePath]) {
    process.nextTick(function () {
      emitter.emit('data', hogan.compile(templates[templatePath]).renderWithColors(context));
    });
  } else {
    fs.readFile(templatePath, 'utf-8', function (err, file) {
      if (err) return emitter.emit('error', err);

      templates[templatePath] = file;
      emitter.emit('data', hogan.compile(file).renderWithColors(context));
    });
  }

  return emitter;
};