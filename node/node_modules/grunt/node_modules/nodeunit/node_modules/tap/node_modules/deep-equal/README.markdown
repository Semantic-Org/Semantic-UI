deep-equal
==========

Node's `assert.deepEqual() algorithm` as a standalone module.

example
=======

``` js
var equal = require('deep-equal');
console.dir([
    equal(
        { a : [ 2, 3 ], b : [ 4 ] },
        { a : [ 2, 3 ], b : [ 4 ] }
    ),
    equal(
        { x : 5, y : [6] },
        { x : 5, y : 6 }
    )
]);
```

methods
=======

var deepEqual = require('deep-equal')

deepEqual(a, b)
---------------

Compare objects `a` and `b`, returning whether they are equal according to a
recursive equality algorithm.

install
=======

With [npm](http://npmjs.org) do:

```
npm install deep-equal
```

test
====

With [npm](http://npmjs.org) do:

```
npm test
```

license
=======

MIT. Derived largely from node's assert module.
