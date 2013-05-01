Hashish
=======

Hashish is a node.js library for manipulating hash data structures.
It is distilled from the finest that ruby, perl, and haskell have to offer by
way of hash/map interfaces.

Hashish provides a chaining interface, where you can do:

    var Hash = require('hashish');
    
    Hash({ a : 1, b : 2, c : 3, d : 4 })
        .map(function (x) { return x * 10 })
        .filter(function (x) { return x < 30 })
        .forEach(function (x, key) {
            console.log(key + ' => ' + x);
        })
    ;
    
Output:

    a => 10
    b => 20

Some functions and attributes in the chaining interface are terminal, like
`.items` or `.detect()`. They return values of their own instead of the chain
context.

Each function in the chainable interface is also attached to `Hash` in chainless
form:

    var Hash = require('hashish');
    var obj = { a : 1, b : 2, c : 3, d : 4 };
    
    var mapped = Hash.map(obj, function (x) {
        return x * 10
    });
    
    console.dir(mapped);

Output:

    { a: 10, b: 20, c: 30, d: 40 }

In either case, the 'this' context of the function calls is the same object that
the chained functions return, so you can make nested chains.

Methods
=======

forEach(cb)
-----------

For each key/value in the hash, calls `cb(value, key)`.

map(cb)
-------

For each key/value in the hash, calls `cb(value, key)`.
The return value of `cb` is the new value at `key` in the resulting hash.

filter(cb)
----------

For each key/value in the hash, calls `cb(value, key)`.
The resulting hash omits key/value pairs where `cb` returned a falsy value.

detect(cb)
----------

Returns the first value in the hash for which `cb(value, key)` is non-falsy.
Order of hashes is not well-defined so watch out for that.

reduce(cb)
----------

Returns the accumulated value of a left-fold over the key/value pairs.

some(cb)
--------

Returns a boolean: whether or not `cb(value, key)` ever returned a non-falsy
value.

update(obj1, [obj2, obj3, ...])
-----------

Mutate the context hash, merging the key/value pairs from the passed objects
and overwriting keys from the context hash if the current `obj` has keys of
the same name. Falsy arguments are silently ignored.

updateAll([ obj1, obj2, ... ])
------------------------------

Like multi-argument `update()` but operate on an array directly.

merge(obj1, [obj2, obj3, ...])
----------

Merge the key/value pairs from the passed objects into the resultant hash
without modifying the context hash. Falsy arguments are silently ignored.

mergeAll([ obj1, obj2, ... ])
------------------------------

Like multi-argument `merge()` but operate on an array directly.

has(key)
--------

Return whether the hash has a key, `key`.

valuesAt(keys)
--------------

Return an Array with the values at the keys from `keys`.

tap(cb)
-------

Call `cb` with the present raw hash.
This function is chainable.

extract(keys)
-------------

Filter by including only those keys in `keys` in the resulting hash.

exclude(keys)
-------------

Filter by excluding those keys in `keys` in the resulting hash.

Attributes
==========

These are attributes in the chaining interface and functions in the `Hash.xxx`
interface.

keys
----

Return all the enumerable attribute keys in the hash.

values
------

Return all the enumerable attribute values in the hash.

compact
-------

Filter out values which are `=== undefined`.

clone
-----

Make a deep copy of the hash.

copy
----

Make a shallow copy of the hash.

length
------

Return the number of key/value pairs in the hash.
Note: use `Hash.size()` for non-chain mode.

size
----

Alias for `length` since `Hash.length` is masked by `Function.prototype`.

See Also
========

See also [creationix's pattern/hash](http://github.com/creationix/pattern),
which does a similar thing except with hash inputs and array outputs.

Installation
============

To install with [npm](http://github.com/isaacs/npm):
 
    npm install hashish

To run the tests with [expresso](http://github.com/visionmedia/expresso):

    expresso
