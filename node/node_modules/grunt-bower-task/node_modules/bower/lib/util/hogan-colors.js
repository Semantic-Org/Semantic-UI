// ==========================================
// BOWER: Hogan.js renderWithColors extension
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

var colors = require('colors');
var hogan  = require('hogan.js');
var _      = require('lodash');
var nopt   = require('nopt');

module.exports = hogan.Template.prototype.renderWithColors = function (context, partials, indent) {
  if (nopt(process.argv).color === false) {
    colors.mode = 'none';
  }

  context = _.extend({
    yellow : function (s) { return s.yellow; },
    green  : function (s) { return s.green; },
    cyan   : function (s) { return s.cyan; },
    red    : function (s) { return s.red; },
    white  : function (s) { return s.white; }
  }, context);
  return this.ri([context], partials || {}, indent);
};
