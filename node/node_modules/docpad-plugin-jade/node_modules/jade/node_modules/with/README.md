# with

Compile time `with` for strict mode JavaScript

[![build status](https://secure.travis-ci.org/ForbesLindesay/with.png)](http://travis-ci.org/ForbesLindesay/with)
[![Dependency Status](https://gemnasium.com/ForbesLindesay/with.png)](https://gemnasium.com/ForbesLindesay/with)
[![NPM version](https://badge.fury.io/js/with.png)](http://badge.fury.io/js/with)

## Installation

    $ npm install with

## Usage

```js
var addWith = require('with')

addWith('obj', 'console.log(a)')
// => "var a = obj.a;console.log(a)"

addWith("obj || {}", "console.log(helper(a))", ["helper"])
// => var locals = (obj || {}),a = locals.a;console.log(helper(a))
```

## API

### addWith(obj, src, [exclude])

The idea is that this is roughly equivallent to:

```js
with (obj) {
  src
}
```

There are a few differences though.  For starters, it will be assumed that all variables used in `src` come from `obj` so any that don't (e.g. template helpers) need to have their names parsed to `exclude` as an array.

It also makes everything be declared, so you can always do:

```js
if (foo === undefined)
```

instead of

```js
if (typeof foo === 'undefined')
```

It is also safe to use in strict mode (unlike `with`) and it minifies properly (`with` disables virtually all minification).

## License

  MIT