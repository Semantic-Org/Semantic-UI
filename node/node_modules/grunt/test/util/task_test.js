// Test helpers.
function delay(fn) { setTimeout(fn, 10); }

var result = (function() {
  var arr;
  var push = function() { [].push.apply(arr, arguments); };
  return {
    reset: function() { arr = []; },
    push: push,
    pushTaskname: function() { push(this.name); },
    get: function() { return arr; },
    getJoined: function() { return arr.join(''); }
  };
}());

var requireTask = require.bind(this, '../../lib/util/task.js');

exports['new Task'] = {
  'create': function(test) {
    test.expect(1);
    var tasklib = requireTask();
    test.ok(tasklib.create() instanceof tasklib.Task, 'It should return a Task instance.');
    test.done();
  }
};

exports['Helpers'] = {
  setUp: function(done) {
    this.task = requireTask().create();
    this.fn = function(a, b) { return a + b; };
    this.task.registerHelper('add', this.fn);
    done();
  },
  'Task#registerHelper': function(test) {
    test.expect(1);
    var task = this.task;
    test.ok('add' in task._helpers, 'It should register the passed helper.');
    test.done();
  },
  'Task#helper': function(test) {
    test.expect(4);
    var task = this.task;
    test.strictEqual(task.helper('add', 1, 2), 3, 'It should receive arguments and return a value.');
    test.throws(function() { task.helper('nonexistent'); }, 'Attempting to execute unregistered handlers should throw an exception.');
    task.options({
      error: result.pushTaskname
    });
    result.reset();
    test.doesNotThrow(function() { task.helper('nonexistent'); }, 'It should not throw an exception because an error handler is defined.');
    test.deepEqual(result.get(), [null], 'Non-nested tasks have a null name.');
    test.done();
  },
  'Task#renameHelper': function(test) {
    test.expect(4);
    var task = this.task;
    task.renameHelper('add', 'newadd');
    test.ok('newadd' in task._helpers, 'It should rename the specified helper.');
    test.equal('add' in task._helpers, false, 'It should remove the previous helper.');
    test.doesNotThrow(function() { task.helper('newadd'); }, 'It should be accessible by its new name.');
    test.throws(function() { task.helper('add'); }, 'It should not be accessible by its previous name.');
    test.done();
  }
};

exports['Directives'] = {
  setUp: function(done) {
    this.task = requireTask().create();
    this.task.registerHelper('add', function(a, b) { return Number(a) + Number(b); });
    done();
  },
  'Task#getDirectiveParts': function(test) {
    test.expect(8);
    var task = this.task;
    test.deepEqual(task.getDirectiveParts('<add>'), ['add'], 'It should split a directive into parts.');
    test.deepEqual(task.getDirectiveParts('<add:1>'), ['add', '1'], 'It should split a directive into parts.');
    test.deepEqual(task.getDirectiveParts('<add:1:2>'), ['add', '1', '2'], 'It should split a directive into parts.');
    test.deepEqual(task.getDirectiveParts('<foo>'), null, 'It should return null if the directive does not match an existing helper.');
    test.deepEqual(task.getDirectiveParts('<foo:bar>'), null, 'It should return null if the directive does not match an existing helper.');
    test.deepEqual(task.getDirectiveParts('x<foo>'), null, 'It should return null otherwise.');
    test.deepEqual(task.getDirectiveParts('<foo>x'), null, 'It should return null otherwise.');
    test.deepEqual(task.getDirectiveParts('<--arrow!'), null, 'It should return null otherwise.');
    test.done();
  },
  'Task#directive': function(test) {
    test.expect(13);
    var task = this.task;
    var fn = function(val) { return '_' + val + '_'; };
    test.equal(task.directive('foo'), 'foo', 'If a directive is not passed, it should return the passed value.');
    test.equal(task.directive('foo', fn), '_foo_', 'If a directive is not passed, the value should be passed through the specified callback.');
    test.equal(task.directive('<foo>'), '<foo>', 'If a directive is passed but not found, it should return the passed value.');
    test.equal(task.directive('<foo>', fn), '_<foo>_', 'If a directive is passed but not found, the value should be passed through the specified callback.');
    test.equal(task.directive('<add:1:2>'), 3, 'If a directive is passed and found, it should call the directive with arguments.');

    task.registerHelper('call_as_helper', function(a, b) {
      test.ok(!this.directive, 'should not indicate the helper was called as a directive');
      test.deepEqual(this.args, [1, 2], 'Should be an array of args.');
      test.deepEqual(this.flags, {'1': true, '2': true}, 'Should be a map of flags.');
      return a + b;
    });
    test.equal(task.helper('call_as_helper', 1, 2), 3, 'Should receive the proper arguments (and return the proper result).');

    task.registerHelper('call_as_directive', function(a, b) {
      test.ok(this.directive, 'should indicate the helper was called as a directive');
      test.deepEqual(this.args, ['1', '2'], 'Should be an array of args.');
      test.deepEqual(this.flags, {'1': true, '2': true}, 'Should be a map of flags.');
      return Number(a) + Number(b);
    });
    test.equal(task.directive('<call_as_directive:1:2>'), 3, 'Should receive the proper arguments (and return the proper result).');
    test.done();
  }
};

exports['Tasks'] = {
  setUp: function(done) {
    result.reset();
    this.task = requireTask().create();
    var task = this.task;
    task.registerTask('nothing', 'Do nothing.', function() {});
    done();
  },
  'Task#registerTask': function(test) {
    test.expect(1);
    var task = this.task;
    test.ok('nothing' in task._tasks, 'It should register the passed task.');
    test.done();
  },
  'Task#registerTask (alias)': function(test) {
    test.expect(1);
    var task = this.task;
    task.registerTask('a', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('b', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('c', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('x', 'a b c');
    task.registerTask('y', ['a', 'b', 'c']);
    task.registerTask('z', 'a b nonexistent c');
    task.options({
      error: function(e) {
        result.push('!' + this.name);
      },
      done: function() {
        test.strictEqual(result.getJoined(), 'abcabc!z', 'The specified tasks should have run, in-order.');
        test.done();
      }
    });
    task.run('x y z').start();
  },
  'Task#isTaskAlias': function(test) {
    test.expect(2);
    var task = this.task;
    task.registerTask('a', 'nothing', function() {});
    task.registerTask('b', 'nothing', function() {});
    task.registerTask('c', 'a b');
    test.strictEqual(task.isTaskAlias('a'), false, 'It should not be an alias.');
    test.strictEqual(task.isTaskAlias('c'), true, 'It should be an alias.');
    test.done();
  },
  'Task#renameTask': function(test) {
    test.expect(4);
    var task = this.task;
    task.renameTask('nothing', 'newnothing');
    test.ok('newnothing' in task._tasks, 'It should rename the specified task.');
    test.equal('nothing' in task._tasks, false, 'It should remove the previous task.');
    test.doesNotThrow(function() { task.run('newnothing'); }, 'It should be accessible by its new name.');
    test.throws(function() { task.run('nothing'); }, 'It should not be accessible by its previous name and throw an exception.');
    test.done();
  },
  'Task#run (exception handling)': function(test) {
    test.expect(4);
    var task = this.task;
    test.doesNotThrow(function() { task.run('nothing'); }, 'Registered tasks should be runnable.');
    test.throws(function() { task.run('nonexistent'); }, 'Attempting to run unregistered tasks should throw an exception.');
    task.options({
      error: result.pushTaskname
    });
    test.doesNotThrow(function() { task.run('nonexistent'); }, 'It should not throw an exception because an error handler is defined.');
    test.deepEqual(result.get(), [null], 'Non-nested tasks have a null name.');
    test.done();
  },
  'Task#run (nested, exception handling)': function(test) {
    test.expect(2);
    var task = this.task;
    task.registerTask('yay', 'Run a registered task.', function() {
      test.doesNotThrow(function() { task.run('nothing'); }, 'Registered tasks should be runnable.');
    });
    task.registerTask('nay', 'Attempt to run an unregistered task.', function() {
      test.throws(function() { task.run('nonexistent'); }, 'Attempting to run unregistered tasks should throw an exception.');
    });
    task.options({
      done: test.done
    });
    task.run('yay nay').start();
  },
  'Task#run (signatures, queue order)': function(test) {
    test.expect(1);
    var task = this.task;
    task.registerTask('a', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('b', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('c', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('d', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('e', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('f', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('g', 'Push task name onto result.', result.pushTaskname);
    task.options({
      done: function() {
        test.strictEqual(result.getJoined(), 'abcdefg', 'The specified tasks should have run, in-order.');
        test.done();
      }
    });
    task.run('a').run('b', 'c').run(['d', 'e']).run('f g').start();
  },
  'Task#run (colon separated arguments)': function(test) {
    test.expect(1);
    var task = this.task;
    task.registerTask('a', 'Push task name and args onto result.', function(x, y) { result.push([1, this.name, this.nameArgs, x, y]); });
    task.registerTask('a:b', 'Push task name and args onto result.', function(x, y) { result.push([2, this.name, this.nameArgs, x, y]); });
    task.registerTask('a:b:c', 'Push task name and args onto result.', function(x, y) { result.push([3, this.name, this.nameArgs, x, y]); });
    task.options({
      done: function() {
        test.deepEqual(result.get(), [
          [1,  'a',      'a',       undefined,  undefined],
          [2,  'a:b',    'a:b',     undefined,  undefined],
          [3,  'a:b:c',  'a:b:c',   undefined,  undefined],
          [1,  'a',      'a:x',     'x',        undefined],
          [1,  'a',      'a:x:y',   'x',        'y'],
          [2,  'a:b',    'a:b:x',   'x',        undefined],
          [2,  'a:b',    'a:b:x:y', 'x',        'y']
        ], 'Named tasks should be called as-specified if possible, and arguments should be passed properly.');
        test.done();
      }
    });
    task.run('a a:b a:b:c a:x a:x:y a:b:x a:b:x:y').start();
  },
  'Task#run (nested tasks, queue order)': function(test) {
    test.expect(1);
    var task = this.task;
    task.registerTask('a', 'Push task name onto result and run other tasks.', function() { result.push(this.name); task.run('b e'); });
    task.registerTask('b', 'Push task name onto result and run other tasks.', function() { result.push(this.name); task.run('c d'); });
    task.registerTask('c', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('d', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('e', 'Push task name onto result and run other tasks.', function() { result.push(this.name); task.run('f'); });
    task.registerTask('f', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('g', 'Push task name onto result.', result.pushTaskname);
    task.options({
      done: function() {
        test.strictEqual(result.getJoined(), 'abcdefg', 'The specified tasks should have run, in-order.');
        test.done();
      }
    });
    task.run('a g').start();
  },
  'Task#run (async, nested tasks, queue order)': function(test) {
    test.expect(1);
    var task = this.task;
    task.registerTask('a', 'Push task name onto result and run other tasks.', function() { result.push(this.name); task.run('b e'); delay(this.async()); });
    task.registerTask('b', 'Push task name onto result and run other tasks.', function() { result.push(this.name); delay(this.async()); task.run('c d'); });
    task.registerTask('c', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('d', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('e', 'Push task name onto result and run other tasks.', function() { delay(this.async()); result.push(this.name); task.run('f'); });
    task.registerTask('f', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('g', 'Push task name onto result.', result.pushTaskname);
    task.options({
      done: function() {
        test.strictEqual(result.getJoined(), 'abcdefg', 'The specified tasks should have run, in-order.');
        test.done();
      }
    });
    task.run('a g').start();
  },
  'Task#current': function(test) {
    test.expect(8);
    var task = this.task;
    test.deepEqual(task.current, {}, 'Should start empty.');
    task.registerTask('a', 'Sample task.', function() {
      test.equal(task.current, this, 'This and task.current should be the same object.');
      test.equal(task.current.nameArgs, 'a:b:c', 'Should be task name + args, as-specified.');
      test.equal(task.current.name, 'a', 'Should be just the task name, no args.');
      test.equal(typeof task.current.async, 'function', 'Should be a function.');
      test.deepEqual(task.current.args, ['b', 'c'], 'Should be an array of args.');
      test.deepEqual(task.current.flags, {b: true, c: true}, 'Should be a map of flags.');
    });
    task.options({
      done: function() {
        test.deepEqual(task.current, {}, 'Should be empty again once tasks are done.');
        test.done();
      }
    });
    task.run('a:b:c').start();
  },
  'Task#clearQueue': function(test) {
    test.expect(1);
    var task = this.task;
    task.registerTask('a', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('b', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('c', 'Clear the queue.', function() {
      result.push(this.name);
      task.clearQueue().run('f');
    });
    task.registerTask('d', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('e', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('f', 'Push task name onto result.', result.pushTaskname);
    task.options({
      done: function() {
        test.strictEqual(result.getJoined(), 'abcf', 'The specified tasks should have run, in-order.');
        test.done();
      }
    });
    task.run('a b c d e').start();
  },
  'Task#mark': function(test) {
    // test.expect(1);
    var task = this.task;
    task.registerTask('a', 'Explode.', function() {
      throw task.taskError('whoops.');
    });
    task.registerTask('b', 'This task should never run.', result.pushTaskname);
    task.registerTask('c', 'This task should never run.', result.pushTaskname);

    task.registerTask('d', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('e', 'Explode.', function() {
      throw task.taskError('whoops.');
    });
    task.registerTask('f', 'This task should never run.', result.pushTaskname);

    task.registerTask('g', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('h', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('i', 'Explode.', function() {
      throw task.taskError('whoops.');
    });

    task.registerTask('j', 'Run a task and push task name onto result.', function() {
      task.run('k');
      result.push(this.name);
    });
    task.registerTask('k', 'Explode.', function() {
      throw task.taskError('whoops.');
    });
    task.registerTask('l', 'This task should never run.', result.pushTaskname);

    task.registerTask('m', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('n', 'Run a task and push task name onto result.', function() {
      task.run('o');
      result.push(this.name);
    });
    task.registerTask('o', 'Explode.', function() {
      throw task.taskError('whoops.');
    });

    task.registerTask('p', 'Push task name onto result.', result.pushTaskname);

    task.options({
      error: function(e) {
        result.push('!' + this.name);
        task.clearQueue({untilMarker: true});
      },
      done: function() {
        test.strictEqual(result.getJoined(), '!ad!egh!ij!kmn!op', 'The specified tasks should have run, in-order.');
        test.done();
      }
    });
    task.run('a b c').mark().run('d e f').mark().run('g h i').mark().run('j l').mark().run('m n').mark().run('p').mark().start();
  },
  'Task#requires': function(test) {
    test.expect(1);
    var task = this.task;
    task.registerTask('notrun', 'This task is never run.', function() {});
    task.registerTask('a', 'Push task name onto result, but fail.', function() {
      result.push(this.name);
      return false;
    });
    task.registerTask('b', 'Push task name onto result, but fail.', function() {
      delay(this.async().bind(this, false));
      result.push(this.name);
    });
    task.registerTask('c', 'Succeed.', result.pushTaskname);
    task.registerTask('d', 'Succeed.', result.pushTaskname);
    task.registerTask('e', 'Succeed because all required tasks ran and succeeded.', function() {
      task.requires('c d');
      result.push(this.name);
    });
    task.registerTask('x', 'Fail because a required task never ran.', function() {
      task.requires('c notrun d');
      result.push(this.name);
    });
    task.registerTask('y', 'Fail because a synchronous required task has failed.', function() {
      task.requires('a c d');
      result.push(this.name);
    });
    task.registerTask('z', 'Fail because an asynchronous required task has failed.', function() {
      task.requires('b c d');
      result.push(this.name);
    });
    task.options({
      error: function(e) {
        result.push('!' + this.name);
      },
      done: function() {
        test.strictEqual(result.getJoined(), 'a!ab!bcde!x!y!z', 'Tasks whose requirements have failed or are missing should not run.');
        test.done();
      }
    });
    task.run('a b c d e x y z').start();
  }
};

exports['Task#parseArgs'] = {
  setUp: function(done) {
    var task = requireTask().create();
    this.parseTest = function() {
      return task.parseArgs(arguments);
    };
    done();
  },
  'single task string': function(test) {
    test.expect(1);
    test.deepEqual(this.parseTest('foo'), ['foo'], 'string should be split into array.');
    test.done();
  },
  'multiple task string': function(test) {
    test.expect(1);
    test.deepEqual(this.parseTest('foo bar baz'), ['foo', 'bar', 'baz'], 'string should be split into array.');
    test.done();
  },
  'arguments': function(test) {
    test.expect(1);
    test.deepEqual(this.parseTest('foo', 'bar', 'baz'), ['foo', 'bar', 'baz'], 'arguments should be converted to array.');
    test.done();
  },
  'array': function(test) {
    test.expect(1);
    test.deepEqual(this.parseTest(['foo', 'bar', 'baz']), ['foo', 'bar', 'baz'], 'passed array should be used.');
    test.done();
  },
  'object': function(test) {
    test.expect(1);
    var obj = {};
    test.deepEqual(this.parseTest(obj), [obj], 'single object should be returned as array.');
    test.done();
  },
  'nothing': function(test) {
    test.expect(1);
    test.deepEqual(this.parseTest(), [], 'should return an empty array if nothing passed.');
    test.done();
  }
};
