// grunt-docco
// https://github.com/DavidSouther/grunt-docco
//
// Copyright (c) 2012 David Souther
// Licensed under the MIT license.

"use strict";
var docco = require('docco');

module.exports = function(grunt) {
  grunt.registerMultiTask('docco', 'Docco processor.', function() {
    var task = this,
        fdone = 0,
        flength = this.files.length,
        done = this.async();

    this.files.forEach(function(file) {
      docco.document(file.src, task.options({ output: file.dest }), function(){
        if(++fdone === flength) done();
      });
    });
  });
};
