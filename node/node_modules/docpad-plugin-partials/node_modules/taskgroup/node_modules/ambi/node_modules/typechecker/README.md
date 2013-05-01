# TypeChecker [![Build Status](https://secure.travis-ci.org/bevry/typechecker.png?branch=master)](http://travis-ci.org/bevry/typechecker)
Utilities to get and check variable types (isString, isPlainObject, isRegExp, etc)



## Install

### Backend

1. [Install Node.js](http://bevry.me/node/install)
2. `npm install --save typechecker`

### Frontend

1. [See Browserify](http://browserify.org/)



## Usage

### Example

``` javascript
require('typechecker').isRegExp(/^a/)
```

### Available Methods

- `getObjectType` (e.g. `[object RegExp]`)
- `getType` (e.g. `regexp`)
- `isPlainObject` (checks for no custom prototype)
- `isError`
- `isDate`
- `isArguments`
- `isFunction`
- `isRegExp`
- `isArray`
- `isNumber`
- `isString`
- `isBoolean`
- `isNull`
- `isUndefined`
- `isEmpty` (checks for `null` or `undefined`)
- `isEmptyObject` (checks for no keys that are its own)



## History
You can discover the history inside the [History.md](https://github.com/bevry/typechecker/blob/master/History.md#files) file



## License
Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://creativecommons.org/licenses/MIT/)
<br/>Copyright © 2013+ [Bevry Pty Ltd](http://bevry.me)
<br/>Copyright © 2011-2012 [Benjamin Arthur Lupton](http://balupton.com)
