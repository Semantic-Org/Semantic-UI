# es5-ext - ECMAScript5 extensions

Methods, functions and objects that are not part of the standard, written with
EcmaScript conventions in mind.

## Installation

Can be used in any environment that implements EcmaScript 5th edition.  
Many extensions will also work with ECMAScript 3rd edition, if they're not let [es5-shim](https://github.com/kriskowal/es5-shim) be your aid.

### NPM:

	$ npm install es5-ext

### Browser:

For browser, you can create custom toolset with help of
[modules-webmake](https://github.com/medikoo/modules-webmake)

## Usage

__es5-ext__ mostly offer methods (not functions) which can directly be
assigned to native object's prototype:

	Function.prototype.partial = require('es5-ext/lib/Function/prototype/partial');

	Array.prototype.flatten = require('es5-ext/lib/Array/prototype/flatten');

	String.prototype.startsWith = require('es5-ext/lib/String/prototype/starts-with');

If you decide not to extend native prototypes, which in many cases is good idea (see
[extending-javascript-natives](http://javascriptweblog.wordpress.com/2011/12/05/extending-javascript-natives/)
for more views on that matter), you can use methods as
functions:

	var util = {};
	var call = Function.prototype.call;

	util.partial = call.bind(require('es5-ext/lib/Function/prototype/partial'));

	util.flatten = call.bind(require('es5-ext/lib/Array/prototype/flatten'));

	util.startsWith = call.bind(require('es5-ext/lib/String/prototype/starts-with'));

As with native ones most methods are generic and can be run on any object.
In more detail:

* `Array.prototype`, `Number.prototype` and `String.prototype`, methods can be run on any object (any
value that's neither _null_ nor _undefined_),
* `Date.prototype` methods should be called only on `Date` instances.
* `Function.prototype` methods can be called on any callable objects (not
necessarily functions)

API doesn't provide any methods for `Object.prototype` (extending such in any case should be avoided). All `Object` utils are provided as fuctions and most of them expect first input argument to be a valid object (any value that's neither _null_ nor _undefined_).

# API

## Global extensions

### global

Object that represents global scope

### reserved

List of EcmaScript 5th edition reserved keywords.  
Additionally under _keywords_, _future_ and _futureStrict_ properties we have lists grouped thematically.

## Array Constructor extensions

### from(x)

_In EcmaScript 6th Edition draft_  
Convert array-like object to an Array

### generate([length[, …fill]])

Generate an array of pregiven _length_ built of repeated arguments.

### of([…items])

_In EcmaScript 6th Edition draft_  
Create an array from given arguments.

## Array Prototype extensions

### binarySearch(compareFn)

In __sorted__ list search for index of item for which _compareFn_ returns value closest to _0_.  
It's variant of binary search algorithm

### clear()

Clears the array

### commonLeft([…lists])

Returns first index at which _lists_ start to differ

### compact()

Returns a copy of the list with all falsy values removed.

### contains(searchElement[, position])

Whether list contains the given value.

### copy()

Returns a copy of the list

### diff(other)

Returns the array of elements that are present in context list but not present in other list.

### eIndexOf(searchElement[, fromIndex])

[_egal_](http://wiki.ecmascript.org/doku.php?id=harmony:egal) version of `indexOf` method

### eLastIndexOf(searchElement[, fromIndex])

[_egal_](http://wiki.ecmascript.org/doku.php?id=harmony:egal) version of `lastIndexOf` method

### exclusion([…lists]])

Returns the array of elements that are found only in context list or lists given in arguments.

### find(query[, thisArg])

Return first element for which given function returns true

### first()

Returns value for first declared index

### firstIndex()

Returns first declared index of the array

### flatten()

Returns flattened version of the array

### forEachRight(cb[, thisArg])

`forEach` starting from last element

### group(cb[, thisArg])

Group list elements by value returned by _cb_ function

### indexesOf(searchElement[, fromIndex])

Returns array of all indexes of given value

### intersection([…lists])

Computes the array of values that are the intersection of all lists (context list and lists given in arguments)

### isCopy(other)

Returns true if both context and _other_ lists have same content

### isUniq()

Returns true if all values in array are unique

### last()

Returns value for last declared index

### lastIndex()

Returns last declared index of the array

### remove(value)

Remove value from the array

### someRight(cb[, thisArg])

`some` starting from last element

### uniq()

Returns duplicate-free version of the array

## Boolean Constructor extensions

### isBoolean(x)

Whether value is boolean

## Date Constructor extensions

### isDate(x)

Whether value is date instance

### validDate(x)

If given object is not date throw TypeError in other case return it.

## Date Prototype extensions

### copy(date)

Returns a copy of the date object

### daysInMonth()

Returns number of days of date's month

### floorDay()

Sets the date time to 00:00:00.000

### floorMonth()

Sets date day to 1 and date time to 00:00:00.000

### floorYear()

Sets date month to 0, day to 1 and date time to 00:00:00.000

### format(pattern)

Formats date up to given string. Supported patterns:

* `%Y` - Year with century, 1999, 2003
* `%y` - Year without century, 99, 03
* `%m` - Month, 01..12
* `%d` - Day of the month 01..31
* `%H` - Hour (24-hour clock), 00..23
* `%M` - Minute, 00..59
* `%S` - Second, 00..59
* `%L` - Milliseconds, 000..999

## Error Constructor extensions

### isError(x)

Whether value is error.  
It returns true for all Error instances and Exception host instances (e.g. DOMException)

### validError(x)

If given object is not error throw TypeError in other case return it.

## Error Prototype extensions

### throw()

Throws error

## Function Constructor extensions

Some of the functions were inspired by [Functional JavaScript](http://osteele.com/sources/javascript/functional/) project by Olivier Steele

### i(x)

Identity function. Returns first argument

_i(x)  =def  x_

### insert(name, value)

Returns a function that will set _name_ to _value_ on given object

_insert(name, value)(obj)  =def  object\[name\] = value_

### invoke(name[, …args])

Returns a function that takes an object as an argument, and applies object's
_name_ method to arguments.  
_name_ can be name of the method or method itself.

_invoke(name, …args)(object, …args2)  =def  object\[name\]\(…args, …args2\)_

### isArguments(x)

Whether value is arguments object

### isFunction(arg)

Wether value is instance of function

### k(x)

Returns a constant function that returns pregiven argument

_k(x)(y)  =def  x_

### noop()

No operation function

### pluck(name)

Returns a function that takes an object, and returns the value of its _name_
property

_pluck(name)(obj)  =def  obj[name]_

### remove(name)

Returns a function that takes an object, and deletes object's _name_ property

_remove(name)(obj)  =def  delete obj[name]_

### validFunction(arg)

If given object is not function throw TypeError in other case return it.

## Function Prototype extensions

Some of the methods were inspired by [Functional JavaScript](http://osteele.com/sources/javascript/functional/) project by Olivier Steele

### chain([…fns])

Applies the functions in argument-list order.

_f1.chain(f2, f3, f4)(…args)  =def  f4(f3(f2(f1(…arg))))_

### curry([n])

Invoking the function returned by this function only _n_ arguments are passed to the underlying function. If the underlying function is not saturated, the result is a function that passes all its arguments to the underlying function.  
If _n_ is not provided then it defaults to context function length

_f.curry(4)(arg1, arg2)(arg3)(arg4)  =def  f(arg1, args2, arg3, arg4)_

### lock([…args])

Returns a function that applies the underlying function to _args_, and ignores its own arguments.

_f.lock(…args)(…args2)  =def  f(…args)_

_Named after it's counterpart in Google Closure_

### match()

Returns a function that applies underlying function with first list argument

_f.match()(args)  =def  f.apply(null, args)_

### not()

Returns a function that returns boolean negation of value returned by underlying function.

_f.not()(…args)  =def !f(…args)_

### partial([…args])

Returns a function that when called will behave like context function called with initially passed arguments. If more arguments are suplilied, they are appended to initial args.

_f.partial(…args1)(…args2)  =def  f(…args1, …args2)_

### silent()

Returns a function that when called silents any error thrown by underlying function.
If underlying function throws error, it is the result fo the function.

_function () { throw err; }.silent()()  ==def  err_

### wrap(fn)

Wrap function with other function, it allows to specify before and after behavior, transform return value or prevent original function from being called.

Inspired by [Prototype's wrap](http://api.prototypejs.org/language/Function/prototype/wrap/)

## Number Constructor extensions

### isNaN(x)

_In EcmaScript 6th Edition draft_  

Whether value is NaN. Differs from global isNaN that it doesn't do type coercion.
See http://wiki.ecmascript.org/doku.php?id=harmony:number.isnan

### isNumber(x)

Whether given value is number

### toInt(x)

_In EcmaScript 6th Edition draft_  

Converts value to integer

### toUint(x)

Converts value to unsigned integer

### toUint32(x)

Converts value to unsigned 32 bit integer. This type is used for array lengths.
See: http://www.2ality.com/2012/02/js-integers.html

## Number Prototype extensions

### pad(length[, precision])

Pad given number with zeros. Returns string

## Object Constructor extensions

### clear(obj)

Remove all enumerable own properties of the object

### compact(obj)

Returns copy of the object with all enumerable properties that have no falsy values

### compare(obj1, obj2)

Universal cross-type compare function. To be used for e.g. array sort.

### copy(obj[, deep])

Returns copy of the object with all enumerable properties. Additionally nested objects can be copied as well

### count(obj)

Counts number of enumerable own properties on object

### descriptor([mode[, value]])
### descriptor.gs([mode[, get[, set]]])

Descriptor factory.
_mode_ is string, through we which we define whether value should be _configurable_, _enumerable_ and/or _writable_, it's accepted as string of tokens, e.g.: `c`, `ce`, `cew`, `cw`, `e`, `ew`, `w`
If _mode_ is not provided than `cw` _mode_ is assumed (it's how standard methods are defined on native objects).  
To setup descriptor with getter and/or setter use `descriptor.gs`, _mode_ is configured same way as in _value_ version, only difference is that settings for _writable_ attribute are ignored.

### diff(obj1, obj2)

Returns differences between two objects (taking into account only its own enumerable properties).  Returned object is array of three arrays. Each array holds property names:

* 0 - properties that were not present in `obj2`
* 1 - properties that have different values
* 2 - properties that were not present in `obj1`

### every(obj, cb[, thisArg[, compareFn]])

Analogous to Array.prototype.every. Returns true if every key-value pair in this object satisfies the provided testing function.  
Optionally _compareFn_ can be provided which assures that keys are tested in given order. If provided _compareFn_ is equal to `true`, then order is alphabetical (by key).

### extend(dest[, …src])

Extend _dest_ by enumerable own properties of other objects. Properties found in both objects will be overwritten.

### extendDeep(dest[, …src])

Extend _dest_ by enumerable own properties of other objects. Properties found in both objects will be overwritten with exception of plain objects which again reiterated so only matching properties from other nested plain objects are affected

### extendProperties(dest[, …src])

Extend _dest_ by all own properties of other objects. Properties found in both objects will be overwritten (unless they're not configrable and cannot be overwritten).

### filter(obj, cb[, thisArg])

Analogous to Array.prototype.filter. Returns new object with properites for which _cb_ function returned truthy value.

### flatten(obj)

Returns new object, with flatten properties of input object

_flatten({ a: { b: 1 }, c: { d: 1 } })  =def  { b: 1, d: 1 }_

### forEach(obj, cb[, thisArg[, compareFn]])

Analogous to Array.prototype.forEach. Calls a function for each key-value pair found in object
Optionally _compareFn_ can be provided which assures that properties are iterated in given order. If provided _compareFn_ is equal to `true`, then order is alphabetical (by key).

### getPropertyNames()

Get all (not just own) property names of the object

### is(x, y)

_In EcmaScript 6th Edition draft as `is` operator_  

Whether two values are equal, takes into account NaN and -0/+0 cases

### isCallable(x)

Whether object is callable

### isCopy(x, y[, depth])

Two values are considered a copy of same value when they meet following rules:

1. Are of same type (`typeof` check)
2. Have same string representation
3. (Objects only) Own enumerable properties of first object match own
enumerable properties of other object. Optionally depth can be provided at which relaxed comparision rules need to be applied. This allows deep comparision of different objects.

Objects can contain self references, algorithm is aware of possible infinite loop traps and won't into them.

### isEmpty(obj)

True if object doesn't have any own enumerable property

### isList(x)

Whether object is array-like object

### isObject(arg)

Whether value is not primitive

### isPlainObject(arg)

Whether object is plain object, its protototype should be Object.prototype and it cannot be host object.

### keyOf(obj, searchValue)

Search object for value

### map(obj, cb[, thisArg])

Analogous to Array.prototype.map. Creates a new object with properties which values are results of calling a provided function on every key-value pair in this object.

### mapKeys(obj, cb[, thisArg])

Create new object with same values, but remapped keys

### mapToArray(obj[, cb[, thisArg[, compareFn]]])

Creates an array of results of calling a provided function on every key-value pair in this object.  
Optionally _compareFn_ can be provided which assures that results are added in given order. If provided _compareFn_ is equal to `true`, then order is alphabetical (by key).

### reduce(obj, cb[, initial[, compareFn]])

Analogous to Array.prototype.reduce. Apply a function against an accumulator and each value of the object.
Optionally _compareFn_ can be provided which assures that object keys are iterated in given order. If _compareFn_ is equal to `true`, then order is alphabetical (by key).
If we need to provide _compareFn_ but don't want to provide _initial_ value, then we have to pass `reduce.NO_INITIAL` as initial argument.

### safeTraverse(obj[, …names])

Save navigation of object properties. See http://wiki.ecmascript.org/doku.php?id=strawman:existential_operator

### some(obj, cb[, thisArg[, compareFn]])

Analogous to Array.prototype.some Returns true if any key-value pair satisfies the provided
testing function.  
Optionally _compareFn_ can be provided which assures that keys are tested in given order. If provided _compareFn_ is equal to `true`, then order is alphabetical (by key).

### toPlainObject(x)

Returns plain object build from x object and it's prototypes enumerable properties
If x is not given, then empty object is returned.

### validCallable(x)

If given object is not callable throw TypeError in other case return it.

### validValue(x)

Throws error if given value is `null` or `undefined`, otherwise returns value.

### values(obj)

Return array of object own enumerable properties

## RegExp Constructor extensions

### isRegExp(x)

Whether object is regular expression

## String Constructor extensions

### isString(x)

Whether object is string

## String Prototype extensions

### camelToHyphen()

Convert camelCase string to hyphen separated, e.g. one-two-three -> oneTwoThree.
Useful when converting names from js property convention into filename convention.

### capitalize()

Capitalize first character of a string

### caseInsensitiveCompare(str)

Case insensitive compare

### contains(searchString[, position])

_In EcmaScript 6th Edition draft_  
Whether string contains given string.

### endsWith(searchString[, endPosition])

_In EcmaScript 6th Edition draft_  
Whether strings ends with given string

### format(fmap[, thisArg])

Formats given template up to provided map, e.g.:

```javascript
"%capital is a capital of %country".format({
	capital: "Warsaw",
	country: "Poland"
}); // -> "Warsaw is a capital of Poland"
```
Map may also provide not direct values but functions that resolve value, in that case optional _thisArg_ determines the context in which functions are called.

### hyphenToCamel()

Convert hyphen separated string to camelCase, e.g. one-two-three -> oneTwoThree.
Useful when converting names from filename convention to js property name convention.

### indent(str[, count])

Indents each line with provided _str_ (if _count_ given then _str_ is repeated _count_ times).

### last()

Return last character

### pad(fill[, length])

Pad string with _fill_.
If _length_ si given than _fill_ is reapated _length_ times.
If _length_ is negative then pad is applied from right.

### repeat(n)

Repeat given string _n_ times

### simpleReplace(search, replace)

Simple `replace` version. Doesn't support regular expressions. Replaces just first occurence of search string. Doesn't support insert patterns, therefore it is safe to replace text with text obtained programmatically (there's no need for additional _$_ characters escape in such case).

### startsWith(searchString[, position])

_In EcmaScript 6th Edition draft_  
Whether strings starts with given string

### trimCommonLeft([…strings])

Returns string left trimmed by characters same for all strings

## Math Object extensions

### sign(n)

_In EcmaScript 6th Edition draft_  
Returns sign of a number value

## Tests [![Build Status](https://secure.travis-ci.org/medikoo/es5-ext.png?branch=master)](https://secure.travis-ci.org/medikoo/es5-ext)

	$ npm test
