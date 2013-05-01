bunker
======

Bunker is a module to calculate code coverage using native javascript
[burrito](https://github.com/substack/node-burrito) AST trickery.

[![build status](https://secure.travis-ci.org/substack/node-bunker.png)](http://travis-ci.org/substack/node-bunker)

![code coverage](http://substack.net/images/code_coverage.png)

examples
========

tiny
----

````javascript
var bunker = require('bunker');
var b = bunker('var x = 0; for (var i = 0; i < 30; i++) { x++ }');

var counts = {};

b.on('node', function (node) {
    if (!counts[node.id]) {
        counts[node.id] = { times : 0, node : node };
    }
    counts[node.id].times ++;
});

b.run();

Object.keys(counts).forEach(function (key) {
    var count = counts[key];
    console.log(count.times + ' : ' + count.node.source());
});
````

output:

    $ node example/tiny.js 
    1 : var x=0;
    31 : i<30
    30 : i++
    30 : x++;
    30 : x++

methods
=======

var bunker = require('bunker');

var b = bunker(src)
-------------------

Create a new bunker code coverageifier with some source `src`.

The bunker object `b` is an `EventEmitter` that emits `'node'` events with two
parameters:

* `node` - the [burrito](https://github.com/substack/node-burrito) node object
* `stack` - the stack, [stackedy](https://github.com/substack/node-stackedy) style

b.include(src)
--------------

Include some source into the bunker.

b.compile()
-----------

Return the source wrapped with burrito.

b.assign(context={})
--------------------

Assign the statement-tracking functions into `context`.

b.run(context={})
-----------------

Run the source using `vm.runInNewContext()` with some `context`.
The statement-tracking functions will be added to `context` by `assign()`.
