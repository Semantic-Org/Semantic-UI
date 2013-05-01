/*global require:true */
var hooker = require('../lib/hooker');

exports['hook'] = {
  setUp: function(done) {
    this.order = [];
    this.track = function() {
      [].push.apply(this.order, arguments);
    };

    this.prop = 1;
    this.add = function(a, b) {
      this.track("add", this.prop, a, b);
      return this.prop + a + b;
    };

    this.obj = {
      that: this,
      prop: 1,
      add1: function(a, b) {
        this.that.track("add1", this.prop, a, b);
        return this.prop + a + b;
      },
      add2: function(a, b) {
        this.that.track("add2", this.prop, a, b);
        return this.prop + a + b;
      },
      add3: function(a, b) {
        this.that.track("add3", this.prop, a, b);
        return this.prop + a + b;
      }
    };

    done();
  },
  'orig': function(test) {
    test.expect(1);
    var orig = this.add;
    hooker.hook(this, "add", function() {});
    test.strictEqual(hooker.orig(this, "add"), orig, "should return a refernce to the original function.");
    test.done();
  },
  'once': function(test) {
    test.expect(5);
    var orig = this.add;
    hooker.hook(this, "add", {
      once: true,
      pre: function(a, b) {
        // Arguments are passed into pre-hook as specified.
        this.track("before", this.prop, a, b);
      }
    });
    test.strictEqual(this.add(2, 3), 6, "should return the original function's result.");
    test.deepEqual(this.order, ["before", 1, 2, 3, "add", 1, 2, 3], "functions should execute in-order.");
    test.strictEqual(this.add, orig, "should automatically unhook when once is specified.");
    this.order = [];
    test.strictEqual(this.add(2, 3), 6, "should return the original function's result.");
    test.deepEqual(this.order, ["add", 1, 2, 3], "only the original function should execute.");
    test.done();
  },
  'pre-hook (simple syntax)': function(test) {
    test.expect(3);
    // Pre-hook.
    var result = hooker.hook(this, "add", function(a, b) {
      // Arguments are passed into pre-hook as specified.
      this.track("before", this.prop, a, b);
    });
    test.deepEqual(result, ["add"], "add should have been hooked.");
    test.strictEqual(this.add(2, 3), 6, "should return the original function's result.");
    test.deepEqual(this.order, ["before", 1, 2, 3, "add", 1, 2, 3], "functions should execute in-order.");
    test.done();
  },
  'pre-hook': function(test) {
    test.expect(3);
    // Pre-hook.
    var result = hooker.hook(this, "add", {
      pre: function(a, b) {
        // Arguments are passed into pre-hook as specified.
        this.track("before", this.prop, a, b);
      }
    });
    test.deepEqual(result, ["add"], "add should have been hooked.");
    test.strictEqual(this.add(2, 3), 6, "should return the original function's result.");
    test.deepEqual(this.order, ["before", 1, 2, 3, "add", 1, 2, 3], "functions should execute in-order.");
    test.done();
  },
  'post-hook': function(test) {
    test.expect(3);
    // Post-hook.
    var result = hooker.hook(this, "add", {
      post: function(result, a, b) {
        // Arguments to post-hook are the original function's return value,
        // followed by the specified function arguments.
        this.track("after", this.prop, a, b, result);
      }
    });
    test.deepEqual(result, ["add"], "add should have been hooked.");
    test.strictEqual(this.add(2, 3), 6, "should return the original function's result.");
    test.deepEqual(this.order, ["add", 1, 2, 3, "after", 1, 2, 3, 6], "functions should execute in-order.");
    test.done();
  },
  'pre- & post-hook': function(test) {
    test.expect(2);
    // Pre- & post-hook.
    hooker.hook(this, "add", {
      pre: function(a, b) {
        // Arguments are passed into pre-hook as specified.
        this.track("before", this.prop, a, b);
      },
      post: function(result, a, b) {
        // Arguments to post-hook are the original function's return value,
        // followed by the specified function arguments.
        this.track("after", this.prop, a, b, result);
      }
    });
    test.strictEqual(this.add(2, 3), 6, "should return the original function's result.");
    test.deepEqual(this.order, ["before", 1, 2, 3, "add", 1, 2, 3, "after", 1, 2, 3, 6], "functions should execute in-order.");
    test.done();
  },

  'pre-hook, return value override': function(test) {
    test.expect(2);
    // Pre-hook.
    hooker.hook(this, "add", {
      pre: function(a, b) {
        // Arguments are passed into pre-hook as specified.
        this.track("before", this.prop, a, b);
        // This return value will override the original function's return value.
        return hooker.override("b" + this.prop + a + b);
      }
    });
    test.strictEqual(this.add(2, 3), "b123", "should return the overridden result.");
    test.deepEqual(this.order, ["before", 1, 2, 3, "add", 1, 2, 3], "functions should execute in-order.");
    test.done();
  },
  'post-hook, return value override': function(test) {
    test.expect(2);
    // Post-hook.
    hooker.hook(this, "add", {
      post: function(result, a, b) {
        // Arguments to post-hook are the original function's return value,
        // followed by the specified function arguments.
        this.track("after", this.prop, a, b, result);
        // This return value will override the original function's return value.
        return hooker.override("a" + this.prop + a + b + result);
      }
    });
    test.strictEqual(this.add(2, 3), "a1236", "should return the post-hook overridden result.");
    test.deepEqual(this.order, ["add", 1, 2, 3, "after", 1, 2, 3, 6], "functions should execute in-order.");
    test.done();
  },
  'pre- & post-hook, return value override': function(test) {
    test.expect(2);
    // Pre- & post-hook.
    hooker.hook(this, "add", {
      pre: function(a, b) {
        // Arguments are passed into pre-hook as specified.
        this.track("before", this.prop, a, b);
        // This return value will override the original function's return value.
        return hooker.override("b" + this.prop + a + b);
      },
      post: function(result, a, b) {
        // Arguments to post-hook are the original function's return value,
        // followed by the specified function arguments.
        this.track("after", this.prop, a, b, result);
        // This return value will override the original function's return value
        // AND the pre-hook's return value.
        return hooker.override("a" + this.prop + a + b + result);
      }
    });
    test.strictEqual(this.add(2, 3), "a1236", "should return the overridden result, and post-hook result should take precedence over pre-hook result.");
    test.deepEqual(this.order, ["before", 1, 2, 3, "add", 1, 2, 3, "after", 1, 2, 3, 6], "functions should execute in-order.");
    test.done();
  },

  'pre-hook, filtering arguments': function(test) {
    test.expect(2);
    // Pre-hook.
    hooker.hook(this, "add", {
      pre: function(a, b) {
        // Arguments are passed into pre-hook as specified.
        this.track("before", this.prop, a, b);
        // Return hooker.filter(context, arguments) and they will be passed into
        // the original function. The "track" and "order" propterites are just
        // set here for the same of this unit test.
        return hooker.filter({prop: "x", track: this.track, order: this.order}, ["y", "z"]);
      }
    });
    test.strictEqual(this.add(2, 3), "xyz", "should return the original function's result, given filtered context and arguments.");
    test.deepEqual(this.order, ["before", 1, 2, 3, "add", "x", "y", "z"], "functions should execute in-order.");
    test.done();
  },
  'pre- & post-hook, filtering arguments': function(test) {
    test.expect(2);
    // Pre- & post-hook.
    hooker.hook(this, "add", {
      pre: function(a, b) {
        // Arguments are passed into pre-hook as specified.
        this.track("before", this.prop, a, b);
        // Return hooker.filter(context, arguments) and they will be passed into
        // the original function. The "track" and "order" propterites are just
        // set here for the same of this unit test.
        return hooker.filter({prop: "x", track: this.track, order: this.order}, ["y", "z"]);
      },
      post: function(result, a, b) {
        // Arguments to post-hook are the original function's return value,
        // followed by the specified function arguments.
        this.track("after", this.prop, a, b, result);
      }
    });
    test.strictEqual(this.add(2, 3), "xyz", "should return the original function's result, given filtered context and arguments.");
    test.deepEqual(this.order, ["before", 1, 2, 3, "add", "x", "y", "z", "after", 1, 2, 3, "xyz"], "functions should execute in-order.");
    test.done();
  },
  'pre- & post-hook, filtering arguments, return value override': function(test) {
    test.expect(2);
    // Pre- & post-hook.
    hooker.hook(this, "add", {
      pre: function(a, b) {
        // Arguments are passed into pre-hook as specified.
        this.track("before", this.prop, a, b);
        // Return hooker.filter(context, arguments) and they will be passed into
        // the original function. The "track" and "order" propterites are just
        // set here for the same of this unit test.
        return hooker.filter({prop: "x", track: this.track, order: this.order}, ["y", "z"]);
      },
      post: function(result, a, b) {
        // Arguments to post-hook are the original function's return value,
        // followed by the specified function arguments.
        this.track("after", this.prop, a, b, result);
        // This return value will override the original function's return value
        // AND the pre-hook's return value.
        return hooker.override("a" + this.prop + a + b + result);
      }
    });
    test.strictEqual(this.add(2, 3), "a123xyz", "should return the post-hook overridden result.");
    test.deepEqual(this.order, ["before", 1, 2, 3, "add", "x", "y", "z", "after", 1, 2, 3, "xyz"], "functions should execute in-order.");
    test.done();
  },

  'pre-hook, preempt original function': function(test) {
    test.expect(2);
    // Pre-hook.
    hooker.hook(this, "add", {
      pre: function(a, b) {
        // Arguments are passed into pre-hook as specified.
        this.track("before", this.prop, a, b);
        // Returning hooker.preempt will prevent the original function from being
        // invoked and optionally set a return value.
        return hooker.preempt();
      }
    });
    test.strictEqual(this.add(2, 3), undefined, "should return the value passed to preempt.");
    test.deepEqual(this.order, ["before", 1, 2, 3], "functions should execute in-order.");
    test.done();
  },
  'pre-hook, preempt original function with value': function(test) {
    test.expect(2);
    // Pre-hook.
    hooker.hook(this, "add", {
      pre: function(a, b) {
        // Arguments are passed into pre-hook as specified.
        this.track("before", this.prop, a, b);
        // Returning hooker.preempt will prevent the original function from being
        // invoked and optionally set a return value.
        return hooker.preempt(9000);
      }
    });
    test.strictEqual(this.add(2, 3), 9000, "should return the value passed to preempt.");
    test.deepEqual(this.order, ["before", 1, 2, 3], "functions should execute in-order.");
    test.done();
  },
  'pre- & post-hook, preempt original function with value': function(test) {
    test.expect(2);
    // Pre- & post-hook.
    hooker.hook(this, "add", {
      pre: function(a, b) {
        // Arguments are passed into pre-hook as specified.
        this.track("before", this.prop, a, b);
        // Returning hooker.preempt will prevent the original function from being
        // invoked and optionally set a return value.
        return hooker.preempt(9000);
      },
      post: function(result, a, b) {
        // Arguments to post-hook are the original function's return value,
        // followed by the specified function arguments.
        this.track("after", this.prop, a, b, result);
      }
    });
    test.strictEqual(this.add(2, 3), 9000, "should return the value passed to preempt.");
    test.deepEqual(this.order, ["before", 1, 2, 3, "after", 1, 2, 3, 9000], "functions should execute in-order.");
    test.done();
  },
  'pre- & post-hook, preempt original function with value, return value override': function(test) {
    test.expect(2);
    // Pre- & post-hook.
    hooker.hook(this, "add", {
      pre: function(a, b) {
        // Arguments are passed into pre-hook as specified.
        this.track("before", this.prop, a, b);
        // Returning hooker.preempt will prevent the original function from being
        // invoked and optionally set a return value.
        return hooker.preempt(9000);
      },
      post: function(result, a, b) {
        // Arguments to post-hook are the original function's return value,
        // followed by the specified function arguments.
        this.track("after", this.prop, a, b, result);
        // This return value will override any preempt value set in pre-hook.
        return hooker.override("a" + this.prop + a + b + result);
      }
    });
    test.strictEqual(this.add(2, 3), "a1239000", "should return the overridden result, and post-hook result should take precedence over preempt value.");
    test.deepEqual(this.order, ["before", 1, 2, 3, "after", 1, 2, 3, 9000], "functions should execute in-order.");
    test.done();
  },
  'pre- & post-hook, some properties': function(test) {
    test.expect(7);
    // Pre- & post-hook.
    var result = hooker.hook(this.obj, ["add1", "add2"], {
      pre: function(a, b) {
        // Arguments are passed into pre-hook as specified.
        this.that.track("before", this.prop, a, b);
      },
      post: function(result, a, b) {
        // Arguments to post-hook are the original function's return value,
        // followed by the specified function arguments.
        this.that.track("after", this.prop, a, b, result);
      }
    });
    test.deepEqual(result.sort(), ["add1", "add2"], "both functions should have been hooked.");
    test.strictEqual(this.obj.add1(2, 3), 6, "should return the original function's result.");
    test.deepEqual(this.order, ["before", 1, 2, 3, "add1", 1, 2, 3, "after", 1, 2, 3, 6], "functions should execute in-order.");
    this.order = [];
    test.strictEqual(this.obj.add2(2, 3), 6, "should return the original function's result.");
    test.deepEqual(this.order, ["before", 1, 2, 3, "add2", 1, 2, 3, "after", 1, 2, 3, 6], "functions should execute in-order.");
    this.order = [];
    test.strictEqual(this.obj.add3(2, 3), 6, "should return the original function's result.");
    test.deepEqual(this.order, ["add3", 1, 2, 3], "functions should execute in-order.");
    test.done();
  },
  'pre- & post-hook, all properties': function(test) {
    test.expect(7);
    // Pre- & post-hook.
    var result = hooker.hook(this.obj, {
      pre: function(a, b) {
        // Arguments are passed into pre-hook as specified.
        this.that.track("before", this.prop, a, b);
      },
      post: function(result, a, b) {
        // Arguments to post-hook are the original function's return value,
        // followed by the specified function arguments.
        this.that.track("after", this.prop, a, b, result);
      }
    });
    test.deepEqual(result.sort(), ["add1", "add2", "add3"], "all functions should have been hooked.");
    test.strictEqual(this.obj.add1(2, 3), 6, "should return the original function's result.");
    test.deepEqual(this.order, ["before", 1, 2, 3, "add1", 1, 2, 3, "after", 1, 2, 3, 6], "functions should execute in-order.");
    this.order = [];
    test.strictEqual(this.obj.add2(2, 3), 6, "should return the original function's result.");
    test.deepEqual(this.order, ["before", 1, 2, 3, "add2", 1, 2, 3, "after", 1, 2, 3, 6], "functions should execute in-order.");
    this.order = [];
    test.strictEqual(this.obj.add3(2, 3), 6, "should return the original function's result.");
    test.deepEqual(this.order, ["before", 1, 2, 3, "add3", 1, 2, 3, "after", 1, 2, 3, 6], "functions should execute in-order.");
    test.done();
  },
  'pre- & post-hook, all properties, passName': function(test) {
    test.expect(6);
    // Pre- & post-hook.
    hooker.hook(this.obj, {
      passName: true,
      pre: function(name, a, b) {
        // Arguments are passed into pre-hook as specified.
        this.that.track("before", this.prop, name, a, b);
      },
      post: function(result, name, a, b) {
        // Arguments to post-hook are the original function's return value,
        // followed by the specified function arguments.
        this.that.track("after", this.prop, name, a, b, result);
      }
    });
    test.strictEqual(this.obj.add1(2, 3), 6, "should return the original function's result.");
    test.deepEqual(this.order, ["before", 1, "add1", 2, 3, "add1", 1, 2, 3, "after", 1, "add1", 2, 3, 6], "functions should execute in-order.");
    this.order = [];
    test.strictEqual(this.obj.add2(2, 3), 6, "should return the original function's result.");
    test.deepEqual(this.order, ["before", 1, "add2", 2, 3, "add2", 1, 2, 3, "after", 1, "add2", 2, 3, 6], "functions should execute in-order.");
    this.order = [];
    test.strictEqual(this.obj.add3(2, 3), 6, "should return the original function's result.");
    test.deepEqual(this.order, ["before", 1, "add3", 2, 3, "add3", 1, 2, 3, "after", 1, "add3", 2, 3, 6], "functions should execute in-order.");
    test.done();
  },
  'unhook one property': function(test) {
    test.expect(5);
    var orig = this.add;
    hooker.hook(this, "add", function() {});
    var result = hooker.unhook(this, "add");
    test.deepEqual(result, ["add"], "one function should have been unhooked.");
    test.strictEqual(this.add, orig, "should have unhooked, restoring the original function");
    result = hooker.unhook(this, "add");
    test.deepEqual(result, [], "nothing should have been unhooked.");
    test.strictEqual(this.add, orig, "shouldn't explode if already unhooked");
    test.strictEqual(this.add.orig, undefined, "original function shouldn't have an orig property");
    test.done();
  },
  'unhook some properties': function(test) {
    test.expect(6);
    var add1 = this.obj.add1;
    var add2 = this.obj.add2;
    hooker.hook(this.obj, ["add1", "add2"], function() {});
    test.strictEqual(hooker.orig(this.obj, "add1"), add1, "should return a refernce to the original function");
    test.strictEqual(hooker.orig(this.obj, "add2"), add2, "should return a refernce to the original function");
    test.strictEqual(hooker.orig(this.obj, "add3"), undefined, "should not have been hooked, so should not have an original function");
    var result = hooker.unhook(this.obj, ["add1", "add2"]);
    test.deepEqual(result.sort(), ["add1", "add2"], "both functions should have been unhooked.");
    test.strictEqual(this.obj.add1, add1, "should have unhooked, restoring the original function");
    test.strictEqual(this.obj.add2, add2, "should have unhooked, restoring the original function");
    test.done();
  },
  'unhook all properties': function(test) {
    test.expect(7);
    var add1 = this.obj.add1;
    var add2 = this.obj.add2;
    var add3 = this.obj.add3;
    hooker.hook(this.obj, function() {});
    test.strictEqual(hooker.orig(this.obj, "add1"), add1, "should return a refernce to the original function");
    test.strictEqual(hooker.orig(this.obj, "add2"), add2, "should return a refernce to the original function");
    test.strictEqual(hooker.orig(this.obj, "add3"), add3, "should return a refernce to the original function");
    var result = hooker.unhook(this.obj);
    test.deepEqual(result.sort(), ["add1", "add2", "add3"], "all functions should have been unhooked.");
    test.strictEqual(this.obj.add1, add1, "should have unhooked, restoring the original function");
    test.strictEqual(this.obj.add2, add2, "should have unhooked, restoring the original function");
    test.strictEqual(this.obj.add3, add3, "should have unhooked, restoring the original function");
    test.done();
  }
};
