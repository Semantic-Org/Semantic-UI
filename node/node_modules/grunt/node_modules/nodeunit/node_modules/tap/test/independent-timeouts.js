// https://github.com/isaacs/node-tap/issues/23

var tap = require("../")
  , test = tap.test

test("finishes in time", {timeout: 500}, function(t) {
  setTimeout(function () {
    t.end();
  }, 300);
})
test("finishes in time too", {timeout: 500}, function(t) {
  setTimeout(function () {
    t.end();
  }, 300);
})

