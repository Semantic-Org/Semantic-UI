# Extendr

[![Build Status](https://secure.travis-ci.org/bevry/extendr.png?branch=master)](http://travis-ci.org/bevry/extendr)
[![NPM version](https://badge.fury.io/js/extendr.png)](https://npmjs.org/package/extendr)
[![Flattr this project](https://raw.github.com/balupton/flattr-buttons/master/badge-89x18.gif)](http://flattr.com/thing/344188/balupton-on-Flattr)

Utilities for cloning, extending, and de-referencing objects in shallow, deep, and safe ways



## Install

### Backend

1. [Install Node.js](http://bevry.me/node/install)
2. `npm install --save extendr`

### Frontend

1. [See Browserify](http://browserify.org)



## Usage

### Example

``` javascript
// Shallow Clone
(function(){
	var a = {a:1}, b = {b:2}
	var c = require('extendr').clone(a,b)
	console.log(a) // {a:1}
	console.log(b) // {b:2}
	console.log(c) // {a:1,b:2}
})()

// Shallow Extend
(function(){
	var a = {a:1}, b = {b:2}
	var c = require('extendr').extend(a,b)
	console.log(a) // {a:1,b:2}
	console.log(b) // {b:2}
	console.log(c) // {a:1,b:2}
})()
```

### Methods

- `clone(args...)` - shallow extend the arguments into a new object, same as `extend({},args...)`
- `deepClone(args...)` - deep extend the arguments into a new object, same as `deepExtend({},args...)`
- `dereference(obj)` - return a copy of the object with all references destroyed, same as serializing then deserializing the object
- `extend(args...)` - alias for `shallowExtendPlainObjects`
- `deepExtend(args...)` - alias for `deepExtendPlainObjects`
- `shallowExtendPlainObjects(target, args...)` - shallow extend the arguments into the target
- `deepExtendPlainObjects(target, args...)` - deep extend the arguments into the target
- `safeShallowExtendPlainObjects(target, objs...)` - shallow extend defined values from the arguments into the target
- `safeDeepExtendPlainObjects(target, args...)` - deep extend defined values from the arguments into the target

### Notes

- Use the clone methods when you don't want to modify your first object
- Use the extend methods when you want to modify the first argument
- Use the dereference method when you want to make sure that nothing has any references to the old object
- Use the safe methods when you don't want `null` and `undefined` values to overwrite a defined values



## History
You can discover the history inside the [History.md](https://github.com/bevry/extendr/blob/master/History.md#files) file



## License
Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://creativecommons.org/licenses/MIT/)
<br/>Copyright © 2013+ [Bevry Pty Ltd](http://bevry.me)
<br/>Copyright © 2011-2012 [Benjamin Arthur Lupton](http://balupton.com)
