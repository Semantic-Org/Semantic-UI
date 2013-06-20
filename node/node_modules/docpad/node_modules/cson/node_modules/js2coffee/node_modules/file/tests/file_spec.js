var assert = require("assert");
var util = require("util");
var minitest = require("../vendor/minitest.js/minitest");
var file = require("../lib/main");
var fs = require("fs");
var path = require("path");

minitest.setupListeners();

var madeDirs = [];
fs.mkdir = function (dir, mode, callback) {
  madeDirs.push(dir);
  callback();
};

fs.mkdirSync = function (dir, mode) {
  madeDirs.push(dir);
};

GLOBAL.fs = fs;

minitest.context("file#mkdirs", function () {
  this.setup(function () {
    madeDirs = [];
  });

  this.assertion("it should make all the directories in the tree", function (test) {
    file.mkdirs("/test/test/test/test", 0755, function(err) {
      assert.equal(madeDirs[0], "/test");
      assert.equal(madeDirs[1], "/test/test");
      assert.equal(madeDirs[2], "/test/test/test");
      assert.equal(madeDirs[3], "/test/test/test/test");
      test.finished();
    });
  });
});

minitest.context("file#mkdirsSync", function () {
  this.setup(function () {
    madeDirs = [];
  });

  this.assertion("it should make all the directories in the tree", function (test) {
    file.mkdirsSync("/test/test/test/test", 0755, function(err) {});
    assert.equal(madeDirs[0], "/test");
    assert.equal(madeDirs[1], "/test/test");
    assert.equal(madeDirs[2], "/test/test/test");
    assert.equal(madeDirs[3], "/test/test/test/test");
    test.finished();
  });
});

minitest.context("file#walk", function () {
  this.assertion("it should call \"callback\" for ever file in the tree", function (test) {
    file.walk("/test", function(start, dirs, names) {});
    test.finished();
  });
});

minitest.context("file#walkSync", function () {
  this.assertion("it should call \"callback\" for ever file in the tree", function (test) {
    file.walkSync("/test", function(start, dirs, names) {});
    test.finished();
  });
});

minitest.context("file.path#abspath", function () {
  this.setup(function () {});

  this.assertion("it should convert . to the current directory", function (test) {
    assert.equal(file.path.abspath("."), process.cwd());
    assert.equal(file.path.abspath("./test/dir"), file.path.join(process.cwd(), "test/dir"));
    test.finished();
  });

  this.assertion("it should convert .. to the parrent directory", function (test) {
    assert.equal(file.path.abspath(".."), path.dirname(process.cwd()));
    assert.equal(file.path.abspath("../test/dir"), file.path.join(path.dirname(process.cwd()), "test/dir"));
    test.finished();
  });

  this.assertion("it should convert ~ to the home directory", function (test) {
    assert.equal(file.path.abspath("~"), file.path.join(process.env.HOME, ""));
    assert.equal(file.path.abspath("~/test/dir"), file.path.join(process.env.HOME, "test/dir"));
    test.finished();
  });

  this.assertion("it should not convert paths begining with /", function (test) {
    assert.equal(file.path.abspath("/x/y/z"), "/x/y/z");
    test.finished();
  });
});


minitest.context("file.path#relativePath", function () {
  this.setup(function () {});

  this.assertion("it should return the relative path", function (test) {
    var rel = file.path.relativePath("/", "/test.js");
    assert.equal(rel, "test.js");

    var rel = file.path.relativePath("/test/loc", "/test/loc/test.js");
    assert.equal(rel, "test.js");

    test.finished();
  });

  this.assertion("it should take two equal paths and return \"\"", function (test) {
    var rel = file.path.relativePath("/test.js", "/test.js");
    assert.equal(rel, "");
    test.finished();
  });
});
