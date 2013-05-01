require('../common');
var Gently = require('gently')
  , gently;

function test(test) {
  process.removeAllListeners('exit');
  gently = new Gently();
  test();
}

test(function constructor() {
  assert.deepEqual(gently.expectations, []);
  assert.deepEqual(gently.hijacked, {});
  assert.equal(gently.constructor.name, 'Gently');
});

test(function expectBadArgs() {
  var BAD_ARG = 'oh no';
  try {
    gently.expect(BAD_ARG);
    assert.ok(false, 'throw needs to happen');
  } catch (e) {
    assert.equal(e.message, 'Bad 1st argument for gently.expect(), object, function, or number expected, got: '+(typeof BAD_ARG));
  }
});

test(function expectObjMethod() {
  var OBJ = {}, NAME = 'foobar';
  OBJ.foo = function(x) {
    return x;
  };

  gently._name = function() {
    return NAME;
  };

  var original = OBJ.foo
    , stubFn = function() {};

  (function testAddOne() {
    assert.strictEqual(gently.expect(OBJ, 'foo', stubFn), original);

    assert.equal(gently.expectations.length, 1);
    var expectation = gently.expectations[0];
    assert.strictEqual(expectation.obj, OBJ);
    assert.strictEqual(expectation.method, 'foo');
    assert.strictEqual(expectation.stubFn, stubFn);
    assert.strictEqual(expectation.name, NAME);
    assert.strictEqual(OBJ.foo._original, original);
  })();

  (function testAddTwo() {
    gently.expect(OBJ, 'foo', 2, stubFn);
    assert.equal(gently.expectations.length, 2);
    assert.strictEqual(OBJ.foo._original, original);
  })();

  (function testAddOneWithoutMock() {
    gently.expect(OBJ, 'foo');
    assert.equal(gently.expectations.length, 3);
  })();

  var stubFnCalled = 0, SELF = {};
  gently._stubFn = function(self, obj, method, name, args) {
    stubFnCalled++;
    assert.strictEqual(self, SELF);
    assert.strictEqual(obj, OBJ);
    assert.strictEqual(method, 'foo');
    assert.strictEqual(name, NAME);
    assert.deepEqual(args, [1, 2]);
    return 23;
  };
  assert.equal(OBJ.foo.apply(SELF, [1, 2]), 23);
  assert.equal(stubFnCalled, 1);
});

test(function expectClosure() {
  var NAME = 'MY CLOSURE';
  function closureFn() {};

  gently._name = function() {
    return NAME;
  };

  var fn = gently.expect(closureFn);
  assert.equal(gently.expectations.length, 1);
  var expectation = gently.expectations[0];
  assert.strictEqual(expectation.obj, null);
  assert.strictEqual(expectation.method, null);
  assert.strictEqual(expectation.stubFn, closureFn);
  assert.strictEqual(expectation.name, NAME);

  var stubFnCalled = 0, SELF = {};
  gently._stubFn = function(self, obj, method, name, args) {
    stubFnCalled++;
    assert.strictEqual(self, SELF);
    assert.strictEqual(obj, null);
    assert.strictEqual(method, null);
    assert.strictEqual(name, NAME);
    assert.deepEqual(args, [1, 2]);
    return 23;
  };
  assert.equal(fn.apply(SELF, [1, 2]), 23);
  assert.equal(stubFnCalled, 1);
});

test(function expectClosureCount() {
  var stubFnCalled = 0;
  function closureFn() {stubFnCalled++};

  var fn = gently.expect(2, closureFn);
  assert.equal(gently.expectations.length, 1);
  fn();
  assert.equal(gently.expectations.length, 1);
  fn();
  assert.equal(stubFnCalled, 2);
});

test(function restore() {
  var OBJ = {}, NAME = '[my object].myFn()';
  OBJ.foo = function(x) {
    return x;
  };

  gently._name = function() {
    return NAME;
  };

  var original = OBJ.foo;
  gently.expect(OBJ, 'foo');
  gently.restore(OBJ, 'foo');
  assert.strictEqual(OBJ.foo, original);

  (function testError() {
    try {
      gently.restore(OBJ, 'foo');
      assert.ok(false, 'throw needs to happen');
    } catch (e) {
      assert.equal(e.message, NAME+' is not gently stubbed');
    }
  })();
});

test(function _stubFn() {
  var OBJ1 = {toString: function() {return '[OBJ 1]'}}
    , OBJ2 = {toString: function() {return '[OBJ 2]'}, foo: function () {return 'bar';}}
    , SELF = {};

  gently.expect(OBJ1, 'foo', function(x) {
    assert.strictEqual(this, SELF);
    return x * 2;
  });

  assert.equal(gently._stubFn(SELF, OBJ1, 'foo', 'dummy_name', [5]), 10);

  (function testAutorestore() {
    assert.equal(OBJ2.foo(), 'bar');

    gently.expect(OBJ2, 'foo', function() {
      return 'stubbed foo';
    });

    gently.expect(OBJ2, 'foo', function() {
      return "didn't restore yet";
    });

    assert.equal(gently._stubFn(SELF, OBJ2, 'foo', 'dummy_name', []), 'stubbed foo');
    assert.equal(gently._stubFn(SELF, OBJ2, 'foo', 'dummy_name', []), "didn't restore yet");
    assert.equal(OBJ2.foo(), 'bar');
    assert.deepEqual(gently.expectations, []);
  })();

  (function testNoMoreCallExpected() {
    try {
      gently._stubFn(SELF, OBJ1, 'foo', 'dummy_name', [5]);
      assert.ok(false, 'throw needs to happen');
    } catch (e) {
      assert.equal(e.message, 'Unexpected call to dummy_name, no call was expected');
    }
  })();

  (function testDifferentCallExpected() {
    gently.expect(OBJ2, 'bar');
    try {
      gently._stubFn(SELF, OBJ1, 'foo', 'dummy_name', [5]);
      assert.ok(false, 'throw needs to happen');
    } catch (e) {
      assert.equal(e.message, 'Unexpected call to dummy_name, expected call to '+gently._name(OBJ2, 'bar'));
    }

    assert.equal(gently.expectations.length, 1);
  })();

  (function testNoMockCallback() {
    OBJ2.bar();
    assert.equal(gently.expectations.length, 0);
  })();
});

test(function stub() {
  var LOCATION = './my_class';

  (function testRegular() {
    var Stub = gently.stub(LOCATION);
    assert.ok(Stub instanceof Function);
    assert.strictEqual(gently.hijacked[LOCATION], Stub);
    assert.ok(Stub['new'] instanceof Function);
    assert.equal(Stub.toString(), 'require('+JSON.stringify(LOCATION)+')');

    (function testConstructor() {
      var newCalled = 0
        , STUB
        , ARGS = ['foo', 'bar'];

      Stub['new'] = function(a, b) {
        assert.equal(a, ARGS[0]);
        assert.equal(b, ARGS[1]);
        newCalled++;
        STUB = this;
      };

      var stub = new Stub(ARGS[0], ARGS[1]);
      assert.strictEqual(stub, STUB);
      assert.equal(newCalled, 1);
      assert.equal(stub.toString(), 'require('+JSON.stringify(LOCATION)+')');
    })();

    (function testUseReturnValueAsInstance() {
      var R = {};

      Stub['new'] = function() {
        return R;
      };

      var stub = new Stub();
      assert.strictEqual(stub, R);

    })();
  })();

  var EXPORTS_NAME = 'MyClass';
  test(function testExportsName() {
    var Stub = gently.stub(LOCATION, EXPORTS_NAME);
    assert.strictEqual(gently.hijacked[LOCATION][EXPORTS_NAME], Stub);
    assert.equal(Stub.toString(), 'require('+JSON.stringify(LOCATION)+').'+EXPORTS_NAME);

    (function testConstructor() {
      var stub = new Stub();
      assert.equal(Stub.toString(), 'require('+JSON.stringify(LOCATION)+').'+EXPORTS_NAME);
    })();
  });
});

test(function hijack() {
  var LOCATION = './foo'
    , REQUIRE_CALLS = 0
    , EXPORTS = {}
    , REQUIRE = function() {
        REQUIRE_CALLS++;
        return EXPORTS;
      };

  var hijackedRequire = gently.hijack(REQUIRE);
  hijackedRequire(LOCATION);
  assert.strictEqual(gently.hijacked[LOCATION], EXPORTS);

  assert.equal(REQUIRE_CALLS, 1);

  // make sure we are caching the hijacked module
  hijackedRequire(LOCATION);
  assert.equal(REQUIRE_CALLS, 1);
});

test(function verify() {
  var OBJ = {toString: function() {return '[OBJ]'}};
  gently.verify();

  gently.expect(OBJ, 'foo');
  try {
    gently.verify();
    assert.ok(false, 'throw needs to happen');
  } catch (e) {
    assert.equal(e.message, 'Expected call to [OBJ].foo() did not happen');
  }

  try {
    gently.verify('foo');
    assert.ok(false, 'throw needs to happen');
  } catch (e) {
    assert.equal(e.message, 'Expected call to [OBJ].foo() did not happen (foo)');
  }
});

test(function processExit() {
  var verifyCalled = 0;
  gently.verify = function(msg) {
    verifyCalled++;
    assert.equal(msg, 'process exit');
  };

  process.emit('exit');
  assert.equal(verifyCalled, 1);
});

test(function _name() {
  (function testNamedClass() {
    function Foo() {};
    var foo = new Foo();
    assert.equal(gently._name(foo, 'bar'), '[Foo].bar()');
  })();

  (function testToStringPreference() {
    function Foo() {};
    Foo.prototype.toString = function() {
      return '[Superman 123]';
    };
    var foo = new Foo();
    assert.equal(gently._name(foo, 'bar'), '[Superman 123].bar()');
  })();

  (function testUnamedClass() {
    var Foo = function() {};
    var foo = new Foo();
    assert.equal(gently._name(foo, 'bar'), foo.toString()+'.bar()');
  })();

  (function testNamedClosure() {
    function myClosure() {};
    assert.equal(gently._name(null, null, myClosure), myClosure.name+'()');
  })();

  (function testUnamedClosure() {
    var myClosure = function() {2+2 == 5};
    assert.equal(gently._name(null, null, myClosure), '>> '+myClosure.toString()+' <<');
  })();
});

test(function verifyExpectNone() {
  var OBJ = {toString: function() {return '[OBJ]'}};
  gently.verify();

  gently.expect(OBJ, 'foo', 0);
  try {
    gently.verify();
  } catch (e) {
    assert.fail('Exception should not have been thrown');
  }
});