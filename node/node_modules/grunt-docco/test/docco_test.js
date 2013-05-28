"use strict";
var grunt = require('grunt');
var rr = require("rimraf");

exports.docco = {
  tearDown: function (callback) {
     rr('docs', function(){});
     callback();
  },

  tests: function(test) {

     var css = grunt.file.read("docs/docco.css");
     var html = grunt.file.read("docs/docco.html");

     test.expect(2);
     test.ok(css.length > 0, "Should create CSS.");
     test.ok(html.length > 0, "Should create HTML.");
     test.done();
  },

  testCustomCss: function(test) {

     var css = grunt.file.read("docs/custom.css");
     var html = grunt.file.read("docs/docco_test.html");

     test.expect(2);
     test.ok(css.length > 0, "Should use custom.css");
     test.ok(html.length > 0, "Should create HTML.");
     test.done();
  }
};
