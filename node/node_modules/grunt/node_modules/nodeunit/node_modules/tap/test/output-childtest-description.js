var tap  =  require("../")
  , fs   =  require("fs")
  , path =  require('path')
  , cp   =  require("child_process")
  , nestedTests = 
      [ "var test = require('..').test"
      , "test('parent test description', function (t) {"
      , " t.plan(2)"
      , " t.ok(true, 'test in parent')"
      , " t.test('child test description', function (t) {"
      , "    t.plan(1)"
      , "    t.ok(true, 'test in child')  "
      , " })"
      , "})"
      ].join("\n")
  , nestedTestsFile = path.join(__dirname, "nested-tests-fixture.js")

fs.writeFileSync(nestedTestsFile, nestedTests, "utf8")
console.log(nestedTestsFile);

tap.test("nested tests, parent and child pass", function (t) {
  /*
   * Ensure the output includes the following lines in the right order:
   * '# parent test description'
   *   'ok 1 test in parent'
   * '# child test description'
   *   'ok 2 test in child'
   */

  t.plan(5)

  cp.exec("node " + nestedTestsFile, function (err, stdo, stde) {
    var lines = stdo.split("\n")
      , parentDes =  lines.indexOf("# parent test description")
      , parentRes =  lines.indexOf("ok 1 test in parent")
      , childDes  =  lines.indexOf("# child test description")
      , childRes  =  lines.indexOf("ok 2 test in child")

    t.notEqual(parentDes, -1, "outputs parent description")
    t.notEqual(childDes, -1, "outputs child description")

    t.ok(parentDes < parentRes ,  "outputs parent description before parent result")
    t.ok(parentRes < childDes  ,  "outputs parent result before child description")
    t.ok(childDes  < childRes  ,  "outputs child description before child result")

    fs.unlinkSync(nestedTestsFile);
    t.end()
  })
})

