This is a mix-and-match set of utilities that you can use to write test
harnesses and frameworks that communicate with one another using the
Test Anything Protocol.

If you don't yet know what TAP is, [you better ask
somebody](http://testanything.org/).

Default Usage:

1. Make a directory.  Maybe call it 'test'.  That'd be nice and obvious.
2. Put a bunch of test scripts in there.  If they're node programs, then
   they should be ".js".  Anything else is assumed to be some kind of shell
   script, which should have a shebang line.
3. `npm install tap`
4. Update package.json scripts.test to include `tap ./test` [example
   gist](https://gist.github.com/4469613)
5. `npm test`

The output will be TAP-compliant.

For extra special bonus points, you can do something like this:

    var test = require("tap").test
    test("make sure the thingie is a thing", function (t) {
      t.equal(thingie, "thing", "thingie should be thing")
      t.type(thingie, "string", "type of thingie is string")
      t.ok(true, "this is always true")
      t.notOk(false, "this is never true")
      t.test("a child test", function (t) {
        t.equal(this, superEasy, "right!?")
        t.similar(7, 2, "ever notice 7 is kinda like 2?", {todo: true})
        t.test("so skippable", {skip: true}, function (t) {
          t.plan(1) // only one test in this block
          t.ok(true, "but when the flag changes, it'll pass")
          // no need to end, since we had a plan.
        })
        t.end()
      })
      t.ok(99, "can also skip individual assertions", {skip: true})
      // end lets it know it's over.
      t.end()
    })
    test("another one", function (t) {
      t.plan(1)
      t.ok(true, "It's ok to plan, and also end.  Watch.")
      t.end() // but it must match the plan!
    })

Node-tap is actually a collection of several modules, any of which may be
mixed and matched however you please.

If you don't like this test framework, and think you can do much much
better, *I strongly encourage you to do so!*  If you use this library,
however, at least to output TAP-compliant results when `process.env.TAP`
is set, then the data coming out of your framework will be much more
consumable by machines.

You can also use this to build programs that *consume* the TAP data, so
this is very useful for CI systems and such.

* tap-assert: A collection of assert functions that return TAP result
  objects.
* tap-consumer: A stream interface for consuming TAP data.
* tap-producer: A class that produces a TAP stream by taking in result
  objects.
* tap-results: A class for keeping track of TAP result objects as they
  pass by, counting up skips, passes, fails, and so on.
* tap-runner: A program that runs through a directory running all the
  tests in it.  (Tests which may or may not be TAP-outputting tests.  But
  it's better if they are.)
* tap-test: A class for actually running tests.
* tap-harness: A class that runs tests.  (Tests are also Harnesses,
  which is how sub-tests run.)
* tap-global-harness: A default harness that provides the top-level
  support for running TAP tests.

## Experimental Code Coverage with runforcover & bunker:

```
TAP_COV=1 tap ./test [--cover=./lib,foo.js] [--cover-dir=./coverage]
```

This feature is experimental, and will most likely change somewhat
before being finalized.  Feedback welcome.
