var tap = require("tap")
  , test = tap.test
  , plan = tap.plan
  , math

test("load sut", function (t) {
  math = require("../lib/math")
  t.ok(math, "object loaded")
  t.end()
})

test("validate constants", function (t) {
  t.equal(math.LN10, 2.302585092994046, "ln 10")
  t.equal(math.PI, 3.141592653589793, "pi")
  t.equal(math.E, 2.718281828459045, "e")
  t.equal(math.LOG10E, 0.4342944819032518, "log 10 e")
  t.equal(math.SQRT2, 1.4142135623730951, "sqrt 2")
  t.equal(math.SQRT1_2, 0.7071067811865476, "sqrt 1/2")
  t.equal(math.LN2, 0.6931471805599453, "ln2")
  t.end()
})

test("using this", function (t) {
  // this also works.
  this.equal(t, this, "call in scope of test obj")
  this.end()
})

// test setTimeout, just a trivial example.
test("setTimeout", function (t) {
  var start = Date.now()
  setTimeout(function () {
    t.ok(Date.now() >= start + 50, "timeout fired after delay")
    t.end()
  }, 50)
})

// another way to do the same, using a plan.
// this is more robust, but annoying when you have a long list
// of tests for something.  For async stuff, it's generally better,
// since there's a higher risk of the control flowing off to lala land.
test("setTimeout planned", function (t) {
  t.plan(1)
  var start = Date.now()
  setTimeout(function () {
    t.ok(Date.now() >= start + 50, "timeout fired after delay")
  }, 50)
})

// plans also are good for cases where things may fire in a non-deterministic
// order, since it won't be as obvious when everything is done.
test("setTimeout parallel", function (t) {
  t.plan(2)
  var start = Date.now()
  setTimeout(function A () {
    t.ok(Date.now() >= start + 50, "timeout A fired after delay")
  }, 50)
  setTimeout(function B () {
    t.ok(Date.now() >= start + 50, "timeout B fired after delay")
  }, 50)
})

// something slightly less hello worldy
test("async test", function (t) {
  t.plan(4)
  var fs = require("fs")
  t.ok(fs, "fs library should load")
  var rs = fs.createReadStream(__filename)
  t.ok(rs, "read stream should start fine.")
  rs.on("open", function (fd) {
    t.type(fd, "number", "file descriptor should be a number")
    t.equal(fd, rs.fd, "fd should match stream fd")
  })
})

// you can bail out of the entire everything if something is just
// Not Right (db not installed, etc.)
test("tarp", function (parent) {
  if (7 === 5) {
    parent.bailout("math is broken")
  }
  // bailout bubbles up a bit like "error" events
  // if unhandled, then the parent will bail, as well.
  parent.test("child bailouts", function (child) {
    child.on("bailout", function (s) {
      parent.fail("children shouldn't bail.")
    })
    child.bailout("try to bail out, but instead just fail a test")
  })

  parent.test("child bailout 2", function (child) {
    child.bailout("this one will bail out")
  })
})

// tests marked "todo" can fail without counting against the overall score
// never ever ever write tests to "verify" incorrect behavior!
test("unfinished test", function (t) {
  t.equal(math.cos(math.PI), -1, "cos(PI)")
  t.equal(math.sin(math.PI),  0, "sin(PI)")
  t.equal(math.face, "your face", "math.face should be your face # TODO")
  t.end()
})

// tests can have children.
test("http server", function (t) {
  // one test plus 4 children.
  t.plan(5)

  var http = require("http")
    , PORT = 12346

  t.ok(http, "http module should load")
  var server

  t.test("set up server", function (t) {
    t.plan(2)
    server = http.createServer(function (req, res) {
      t.comment("Request: "+req.url)
      res.writeHead(200, {})
      res.end(req.method + " " + req.url)
    })
    t.ok(server, "createServer should create a server")
    server.listen(PORT, t.cb("listen should fire callback"))
  })

  // set the "parallel" flag on this one.
  // That signals the harness to proceed immediately to the next test,
  // and run them in parallel.
  // Default behavior is to wait for each test to complete before proceeding
  // to the next one.
  // The first not-parallel test encountered will cause it to wait for that
  // test, as well as all the parallel tests before it.
  // A, B', C', D', E (where ' means "parallel")
  // Runs A, and then B, C, and D in parallel, and then E.
  t.test("testing POST", {parallel: true}, function (t) {
    t.plan(1)
    http.request("POST", { method: "POST"
                         , host: "localhost"
                         , path: "/foo"
                         , port: PORT }).on("response", function (res) {
      t.bufferStream(res, function (s) { t.equal(s, "POST /foo") })
    }).end()
  })

  t.test("testing GET", {parallel: true}, function (t) {
    t.plan(1)
    http.request("POST", { method: "GET"
                         , host: "localhost"
                         , path: "/foo"
                         , port: PORT }).on("response", function (res) {
      t.bufferStream(res, function (s) { t.equal(s, "GET /foo") })
    }).end()
  })

  // wrap in a test so that if this throws, it'll log as a failed test.
  t.test("teardown", function (t) {
    server.close()
    t.end()
  })
})

// yo dawg!
test("meta-tests", function (t) {
  t.plan(5)

  // t.fails() wraps a child test and succeeds if it fails.
  t.fails(t.test("this should fail", function (t) {
    t.ok(false, "assert false")
    t.end()
  }))

  // t.timesOut() wraps a child test and succeeds if it times out.
  // if t.end() is called, or if a plan is completed, then it fails.
  // set the timeout really low so that it will not take forever.
  t.timesOut(t.test("this should timeout", { timeout: 1 }, function (t) {
    t.ok(true, "assert true")
    // t.end() never called.
  }))

  // t.incomplete() wraps a child test and succeeds if it ends before
  // the plan is finished.
  t.incomplete(t.test("this should be incomplete", function (t) {
    t.plan(100)
    t.ok(true, "assert true")
    // calling end prematurely.
    t.end()
  }))

  // t.bailsOut() wraps a child test and succeeds if it calls bailout()
  t.bailsOut(t.test("this should bailout", function (t) {
    t.bailout("oh noes, bailing out!")
  }))

  // low-level analysis of subtests
  t.test("verifying test success/failure expectations", function (t) {
    t.once("end", function () {
      var res = t.results
        , is = t.equal
      // hijack!
      t.clear()
      is(res.ok,         false, "ok")

      is(res.bailedOut,  false, "bailed out")

      is(res.skip,       2, "skips")
      is(res.skipPass,   1, "skip that passed")
      is(res.skipFail,   1, "skip that failed")

      is(res.todo,       2, "todos")
      is(res.todoPass,   1, "todo that passed")
      is(res.todoFail,   1, "todo that failed")

      is(res.failTotal,  3, "failures total")
      is(res.fail,       1, "relevant failure")

      is(res.passTotal,  3, "passes total")
      is(res.pass,       1, "relevant pass")

      is(res.testsTotal, 6, "total tests")
      is(res.tests,      2, "should be 2 relevant tests")

      t.end()
    })

    // run the metatest.
    // *this* is the actual SUT in this case.
    t.ok(false, "failing todo #todo")
    // can also set #todo or #skip explicitly
    t.ok(true, "succeeding todo", {todo: true})
    t.ok(false, "failing skip #skip", {skip: true})
    t.ok(true, "suceeding skip #skip")
    t.ok(false, "failing test")
    t.ok(true, "succeeding test")
    t.end()
  })
})
