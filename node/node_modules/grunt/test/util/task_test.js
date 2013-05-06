'use strict';

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

var requireTask = require.bind(exports, '../../lib/util/task.js');

exports['new Task'] = {
  'create': function(test) {
    test.expect(1);
    var tasklib = requireTask();
    test.ok(tasklib.create() instanceof tasklib.Task, 'It should return a Task instance.');
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
    task.registerTask('c d', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('y', ['a', 'b', 'c d']);
    task.registerTask('z', ['a', 'b', 'nonexistent', 'c d']);
    task.options({
      error: function() {
        result.push('!' + this.name);
      },
      done: function() {
        test.strictEqual(result.getJoined(), 'abc d!z', 'The specified tasks should have run, in-order.');
        test.done();
      }
    });
    task.run('y', 'z').start();
  },
  'Task#isTaskAlias': function(test) {
    test.expect(2);
    var task = this.task;
    task.registerTask('a', 'nothing', function() {});
    task.registerTask('b', ['a']);
    test.strictEqual(task.isTaskAlias('a'), false, 'It should not be an alias.');
    test.strictEqual(task.isTaskAlias('b'), true, 'It should be an alias.');
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
  'Task#run (async failing)': function(test) {
    test.expect(1);
    var task = this.task;
    var results = [];

    task.registerTask('sync1', 'sync, gonna succeed', function() {});

    task.registerTask('sync2', 'sync, gonna fail', function() {
      return false;
    });

    task.registerTask('sync3', 'sync, gonna fail', function() {
      return new Error('sync3: Error');
    });

    task.registerTask('sync4', 'sync, gonna fail', function() {
      return new TypeError('sync4: TypeError');
    });

    task.registerTask('sync5', 'sync, gonna fail', function() {
      throw new Error('sync5: Error');
    });

    task.registerTask('sync6', 'sync, gonna fail', function() {
      throw new TypeError('sync6: TypeError');
    });

    task.registerTask('syncs', ['sync1', 'sync2', 'sync3', 'sync4', 'sync5', 'sync6']);

    task.registerTask('async1', 'async, gonna succeed', function() {
      var done = this.async();
      setTimeout(function() {
        done();
      }, 1);
    });

    task.registerTask('async2', 'async, gonna fail', function() {
      var done = this.async();
      setTimeout(function() {
        done(false);
      }, 1);
    });

    task.registerTask('async3', 'async, gonna fail', function() {
      var done = this.async();
      setTimeout(function() {
        done(new Error('async3: Error'));
      }, 1);
    });

    task.registerTask('async4', 'async, gonna fail', function() {
      var done = this.async();
      setTimeout(function() {
        done(new TypeError('async4: TypeError'));
      }, 1);
    });

    task.registerTask('asyncs', ['async1', 'async2', 'async3', 'async4']);

    task.options({
      error: function(e) {
        results.push({name: e.name, message: e.message});
      },
      done: function() {
        test.deepEqual(results, [
          {name: 'Error', message: 'Task "sync2" failed.'},
          {name: 'Error', message: 'sync3: Error'},
          {name: 'TypeError', message: 'sync4: TypeError'},
          {name: 'Error', message: 'sync5: Error'},
          {name: 'TypeError', message: 'sync6: TypeError'},
          {name: 'Error', message: 'Task "async2" failed.'},
          {name: 'Error', message: 'async3: Error'},
          {name: 'TypeError', message: 'async4: TypeError'}
        ], 'The specified tasks should have run, in-order.');
        test.done();
      }
    });
    task.run('syncs', 'asyncs').start();
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
    task.run('yay', 'nay').start();
  },
  'Task#run (signatures, queue order)': function(test) {
    test.expect(1);
    var task = this.task;
    task.registerTask('a', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('b', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('c', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('d', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('e', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('f g', 'Push task name onto result.', result.pushTaskname);
    task.options({
      done: function() {
        test.strictEqual(result.getJoined(), 'abcdef g', 'The specified tasks should have run, in-order.');
        test.done();
      }
    });
    task.run('a').run('b', 'c').run(['d', 'e']).run('f g').start();
  },
  'Task#run (colon separated arguments)': function(test) {
    test.expect(1);
    var task = this.task;
    task.registerTask('a', 'Push task name and args onto result.', function(x, y) { result.push([this.nameArgs, 1, this.name, x, y]); });
    task.registerTask('a:b', 'Push task name and args onto result.', function(x, y) { result.push([this.nameArgs, 2, this.name, x, y]); });
    task.registerTask('a:b:c', 'Push task name and args onto result.', function(x, y) { result.push([this.nameArgs, 3, this.name, x, y]); });
    task.options({
      done: function() {
        test.deepEqual(result.get(), [
          ['a',                 1,  'a',      undefined,  undefined],
          ['a:x',               1,  'a',      'x',        undefined],
          ['a:x:c',             1,  'a',      'x',        'c'],
          ['a:b ',              1,  'a',      'b ',       undefined],
          ['a: b:c',            1,  'a',      ' b',       'c'],
          ['a:x\\:y:\\:z\\:',   1,  'a',      'x:y',      ':z:'],

          ['a:b',               2,  'a:b',    undefined,  undefined],
          ['a:b:x',             2,  'a:b',    'x',        undefined],
          ['a:b:x:y',           2,  'a:b',    'x',        'y'],
          ['a:b:c ',            2,  'a:b',    'c ',       undefined],
          ['a:b:x\\:y:\\:z\\:', 2,  'a:b',    'x:y',      ':z:'],

          ['a:b:c',             3,  'a:b:c',  undefined,  undefined],
          ['a:b:c: d',          3,  'a:b:c',  ' d',       undefined],
        ], 'Named tasks should be called as-specified if possible, and arguments should be passed properly.');
        test.done();
      }
    });
    task.run(
      'a',  'a:x', 'a:x:c', 'a:b ', 'a: b:c', 'a:x\\:y:\\:z\\:',
      'a:b', 'a:b:x', 'a:b:x:y', 'a:b:c ', 'a:b:x\\:y:\\:z\\:',
      'a:b:c', 'a:b:c: d'
    ).start();
  },
  'Task#run (nested tasks, queue order)': function(test) {
    test.expect(1);
    var task = this.task;
    task.registerTask('a', 'Push task name onto result and run other tasks.', function() { result.push(this.name); task.run('b', 'e'); });
    task.registerTask('b', 'Push task name onto result and run other tasks.', function() { result.push(this.name); task.run('c', 'd d'); });
    task.registerTask('c', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('d d', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('e', 'Push task name onto result and run other tasks.', function() { result.push(this.name); task.run('f f'); });
    task.registerTask('f f', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('g', 'Push task name onto result.', result.pushTaskname);
    task.options({
      done: function() {
        test.strictEqual(result.getJoined(), 'abcd def fg', 'The specified tasks should have run, in-order.');
        test.done();
      }
    });
    task.run('a', 'g').start();
  },
  'Task#run (async, nested tasks, queue order)': function(test) {
    test.expect(1);
    var task = this.task;
    task.registerTask('a', 'Push task name onto result and run other tasks.', function() { result.push(this.name); task.run('b', 'e'); delay(this.async()); });
    task.registerTask('b', 'Push task name onto result and run other tasks.', function() { result.push(this.name); delay(this.async()); task.run('c', 'd d'); });
    task.registerTask('c', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('d d', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('e', 'Push task name onto result and run other tasks.', function() { delay(this.async()); result.push(this.name); task.run('f f'); });
    task.registerTask('f f', 'Push task name onto result and run other tasks.', function() { this.async()(); result.push(this.name); task.run('g'); });
    task.registerTask('g', 'Push task name onto result.', result.pushTaskname);
    task.registerTask('h', 'Push task name onto result.', result.pushTaskname);
    task.options({
      done: function() {
        test.strictEqual(result.getJoined(), 'abcd def fgh', 'The specified tasks should have run, in-order.');
        test.done();
      }
    });
    task.run('a', 'h').start();
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
    task.run('a', 'b', 'c', 'd', 'e').start();
  },
  'Task#mark': function(test) {
    test.expect(1);
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
      error: function() {
        result.push('!' + this.name);
        task.clearQueue({untilMarker: true});
      },
      done: function() {
        test.strictEqual(result.getJoined(), '!ad!egh!ij!kmn!op', 'The specified tasks should have run, in-order.');
        test.done();
      }
    });
    task.run('a', 'b', 'c').mark().run('d', 'e', 'f').mark().run('g', 'h', 'i').mark().run('j', 'l').mark().run('m', 'n').mark().run('p').mark().start();
  },
  'Task#requires': function(test) {
    test.expect(1);
    var task = this.task;
    task.registerTask('notrun', 'This task is never run.', function() {});
    task.registerTask('a a', 'Push task name onto result, but fail.', function() {
      result.push(this.name);
      return false;
    });
    task.registerTask('b', 'Push task name onto result, but fail.', function() {
      var done = this.async();
      delay(function() { done(false); });
      result.push(this.name);
    });
    task.registerTask('c', 'Succeed.', result.pushTaskname);
    task.registerTask('d', 'Succeed.', result.pushTaskname);
    task.registerTask('e', 'Succeed because all required tasks ran and succeeded.', function() {
      task.requires('c', 'd');
      result.push(this.name);
    });
    task.registerTask('x', 'Fail because a required task never ran.', function() {
      task.requires('c', 'notrun', 'd');
      result.push(this.name);
    });
    task.registerTask('y', 'Fail because a synchronous required task has failed.', function() {
      task.requires('a a', 'c', 'd');
      result.push(this.name);
    });
    task.registerTask('z', 'Fail because an asynchronous required task has failed.', function() {
      task.requires('b', 'c', 'd');
      result.push(this.name);
    });
    task.options({
      error: function() {
        result.push('!' + this.name);
      },
      done: function() {
        test.strictEqual(result.getJoined(), 'a a!a ab!bcde!x!y!z', 'Tasks whose requirements have failed or are missing should not run.');
        test.done();
      }
    });
    task.run('a a', 'b', 'c', 'd', 'e', 'x', 'y', 'z').start();
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
  'arguments': function(test) {
    test.expect(4);
    test.deepEqual(this.parseTest('foo bar'), ['foo bar'], 'single argument should be converted to array.');
    test.deepEqual(this.parseTest('foo bar: aa : bb '), ['foo bar: aa : bb '], 'single argument should be converted to array.');
    test.deepEqual(this.parseTest('foo bar', 'baz', 'test 1 2 3'), ['foo bar', 'baz', 'test 1 2 3'], 'arguments should be converted to array.');
    test.deepEqual(this.parseTest('foo bar', 'baz:x y z', 'test 1 2 3: 4 : 5'), ['foo bar', 'baz:x y z', 'test 1 2 3: 4 : 5'], 'arguments should be converted to array.');
    test.done();
  },
  'array': function(test) {
    test.expect(1);
    test.deepEqual(this.parseTest(['foo bar', 'baz:x y z', 'test 1 2 3: 4 : 5']), ['foo bar', 'baz:x y z', 'test 1 2 3: 4 : 5'], 'passed array should be used.');
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

exports['Task#splitArgs'] = {
  setUp: function(done) {
    this.task = requireTask().create();
    done();
  },
  'arguments': function(test) {
    test.expect(9);
    var task = this.task;
    test.deepEqual(task.splitArgs(), [], 'missing items = empty array.');
    test.deepEqual(task.splitArgs(''), [], 'missing items = empty array.');
    test.deepEqual(task.splitArgs('a'), ['a'], 'single item should be parsed.');
    test.deepEqual(task.splitArgs('a:b:c'), ['a', 'b', 'c'], 'mutliple items should be parsed.');
    test.deepEqual(task.splitArgs('a::c'), ['a', '', 'c'], 'missing items should be parsed.');
    test.deepEqual(task.splitArgs('::'), ['', '', ''], 'missing items should be parsed.');
    test.deepEqual(task.splitArgs('\\:a:\\:b\\::c\\:'), [':a', ':b:', 'c:'], 'escaped colons should be unescaped.');
    test.deepEqual(task.splitArgs('a\\\\:b\\\\:c'), ['a\\', 'b\\', 'c'], 'escaped backslashes should not be parsed.');
    test.deepEqual(task.splitArgs('\\:a\\\\:\\\\\\:b\\:\\\\:c\\\\\\:\\\\'), [':a\\', '\\:b:\\', 'c\\:\\'], 'please avoid doing this, ok?');
    test.done();
  }
};
