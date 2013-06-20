# over

JavaScript function overloading framework.

## Installation

```bash
$ npm install over
```

## Quick Examples

```javascript
var over = require('over');

var myfn = over([
  [over.string, function (str) { console.log('got a string' + str); }],
  [over.string, over.numberOptionalWithDefault(5), over.callbackOptional, function (str, number, callback) {
    console.log('got a string and a number and a callback');
    callback(str, number);
  }],
  function() {
    // default function if nothing else matches
  }
]);
```

## Builtin Test functions

* func
* funcOptional
* funcOptionalWithDefault
* callbackOptional  // Will return an empty function of parameter is not given
* string
* stringOptional
* stringOptionalWithDefault
* number
* numberOptional
* numberOptionalWithDefault
* array
* arrayOptional
* arrayOptionalWithDefault
* object
* objectOptional
* objectOptionalWithDefault

The built in optional functions with a suffix of "WithDefault" take a default value as well which will be used if
it is not passed in.

```javascript
var myfn = over([
  [over.stringOptionalWithDefault('default value'), function (str) { console.log('got a string' + str); }],
]);
```

## Write your own test functions

Simple optional test

```javascript
function greaterThan5Optional(arg) {
  return arg > 5;
}
greaterThan5Optional.optional = true; // mark it as an optional parameter

var myfn = over([
  [greaterThan5Optional, function (v) { console.log('got a value' + v); }]
]);
```

Optional test with default

```javascript
function greaterThan5OptionalWithDefault(def) {
  return function greaterThan5OptionalWithDefault2(arg) {
    if (arg === undefined) {
      return { defaultValue: def };
    }
    return arg > 5;
  }
}
greaterThan5OptionalWithDefault.optional = true; // mark it as an optional parameter

var myfn = over([
  [greaterThan5OptionalWithDefault, function (v) { console.log('got a value' + v); }]
]);
```

## License

(The MIT License)

Copyright (c) 2012 Near Infinity Corporation

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
