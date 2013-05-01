var tap = require("../")
  , test = tap.test
  , Test = require("../lib/tap-test")
  , Harness = require("../lib/tap-harness")

test("testing the test object", function (t) {

  t.isa(t, Test, "test object should be instanceof Test")
  t.isa(t, Harness, "test object should be instanceof Harness")
  t.is(t._Test, Test, "test._Test should be the Test class")

  // now test all the methods.
  ; [ "isNotDeepEqual"
    , "equals"
    , "inequivalent"
    , "threw"
    , "strictEqual"
    , "emit"
    , "fail"
    , "strictEquals"
    , "notLike"
    , "dissimilar"
    , "true"
    , "assert"
    , "is"
    , "ok"
    , "isEqual"
    , "isDeeply"
    , "deepEqual"
    , "deepEquals"
    , "pass"
    , "length"
    , "skip"
    , "isNotEqual"
    , "looseEquals"
    , "false"
    , "notDeeply"
    , "ifErr"
    , "hasFields"
    , "isNotDeeply"
    , "like"
    , "similar"
    , "notOk"
    , "isDissimilar"
    , "isEquivalent"
    , "doesNotEqual"
    , "isSimilar"
    , "notDeepEqual"
    , "type"
    , "notok"
    , "isInequivalent"
    , "isNot"
    , "same"
    , "isInequal"
    , "_endNice"
    , "ifError"
    , "iferror"
    , "clear"
    , "has"
    , "not"
    , "timeout"
    , "notSimilar"
    , "isUnlike"
    , "notEquals"
    , "unsimilar"
    , "result"
    , "doesNotThrow"
    , "error"
    , "constructor"
    , "notEqual"
    , "throws"
    , "isLike"
    , "isNotSimilar"
    , "isNotEquivalent"
    , "inequal"
    , "notEquivalent"
    , "isNotLike"
    , "equivalent"
    , "looseEqual"
    , "equal"
    , "unlike"
    , "doesNotHave"
    , "comment"
    , "isa"
    ].forEach(function (method) {
      t.ok(t[method], "should have "+method+" method")
      t.isa(t[method], "function", method+" method should be a function")
    })
    t.end()
})

