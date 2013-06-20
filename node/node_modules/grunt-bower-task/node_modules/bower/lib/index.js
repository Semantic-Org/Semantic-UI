// ==========================================
// BOWER: Public API Definition
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

var abbrev = require('abbrev');
var commands = require('./commands');

var abbreviations = abbrev(Object.keys(commands));
abbreviations.i = 'install';
abbreviations.rm = 'uninstall';

module.exports = {
  commands: commands,
  abbreviations: abbreviations,
  config: require('./core/config')
};
