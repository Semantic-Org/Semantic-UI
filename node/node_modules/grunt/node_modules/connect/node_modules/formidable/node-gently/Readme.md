# Gently

## Purpose

A node.js module that helps with stubbing and behavior verification. It allows you to test the most remote and nested corners of your code while keeping being fully unobtrusive.

## Features

* Overwrite and stub individual object functions
* Verify that all expected calls have been made in the expected order
* Restore stubbed functions to their original behavior
* Detect object / class names from obj.constructor.name and obj.toString()
* Hijack any required module function or class constructor

## Installation

Via [npm](http://github.com/isaacs/npm):

    npm install gently@latest

## Example

Make sure your dog is working properly:

    function Dog() {}

    Dog.prototype.seeCat = function() {
      this.bark('whuf, whuf');
      this.run();
    }

    Dog.prototype.bark = function(bark) {
      require('sys').puts(bark);
    }

    var gently = new (require('gently'))
      , assert = require('assert')
      , dog = new Dog();

    gently.expect(dog, 'bark', function(bark) {
      assert.equal(bark, 'whuf, whuf');
    });
    gently.expect(dog, 'run');

    dog.seeCat();

You can also easily test event emitters with this, for example a simple sequence of 2 events emitted by `fs.WriteStream`:

    var gently = new (require('gently'))
      , stream = new (require('fs').WriteStream)('my_file.txt');

    gently.expect(stream, 'emit', function(event) {
      assert.equal(event, 'open');
    });

    gently.expect(stream, 'emit', function(event) {
      assert.equal(event, 'drain');
    });

For a full read world example, check out this test case: [test-incoming-form.js](http://github.com/felixge/node-formidable/blob/master/test/simple/test-incoming-form.js) (in [node-formdiable](http://github.com/felixge/node-formidable)).

## API

### Gently

#### new Gently()

Creates a new gently instance. It listens to the process `'exit'` event to make sure all expectations have been verified.

#### gently.expect(obj, method, [[count], stubFn])

Creates an expectation for an objects method to be called. You can optionally specify the call `count` you are expecting, as well as `stubFn` function that will run instead of the original function.

Returns a reference to the function that is getting overwritten.

#### gently.expect([count], stubFn)

Returns a function that is supposed to be executed `count` times, delegating any calls to the provided `stubFn` function. Naming your stubFn closure will help to properly diagnose errors that are being thrown:

    childProcess.exec('ls', gently.expect(function lsCallback(code) {
      assert.equal(0, code);
    }));

#### gently.restore(obj, method)

Restores an object method that has been previously overwritten using `gently.expect()`.

#### gently.hijack(realRequire)

Returns a new require functions that catches a reference to all required modules into `gently.hijacked`.

To use this function, include a line like this in your `'my-module.js'`.

    if (global.GENTLY) require = GENTLY.hijack(require);

    var sys = require('sys');
    exports.hello = function() {
      sys.log('world');
    };

Now you can write a test for the module above:

    var gently = global.GENTLY = new (require('gently'))
      , myModule = require('./my-module');

    gently.expect(gently.hijacked.sys, 'log', function(str) {
      assert.equal(str, 'world');
    });

    myModule.hello();

#### gently.stub(location, [exportsName])

Returns a stub class that will be used instead of the real class from the module at `location` with the given `exportsName`.

This allows to test an OOP version of the previous example, where `'my-module.js'`.

    if (global.GENTLY) require = GENTLY.hijack(require);

    var World = require('./world');

    exports.hello = function() {
      var world = new World();
      world.hello();
    }

And `world.js` looks like this:

    var sys = require('sys');

    function World() {

    }
    module.exports = World;

    World.prototype.hello = function() {
      sys.log('world');
    };

Testing `'my-module.js'` can now easily be accomplished:

    var gently = global.GENTLY = new (require('gently'))
      , WorldStub = gently.stub('./world')
      , myModule = require('./my-module')
      , WORLD;

    gently.expect(WorldStub, 'new', function() {
      WORLD = this;
    });

    gently.expect(WORLD, 'hello');

    myModule.hello();

#### gently.hijacked

An object that holds the references to all hijacked modules.

#### gently.verify([msg])

Verifies that all expectations of this gently instance have been satisfied. If not called manually, this method is called when the process `'exit'` event is fired.

If `msg` is given, it will appear in any error that might be thrown.

## License

Gently is licensed under the MIT license.