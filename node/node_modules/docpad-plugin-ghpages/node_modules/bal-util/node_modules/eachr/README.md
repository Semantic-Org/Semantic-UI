# Eachr [![Build Status](https://secure.travis-ci.org/bevry/eachr.png?branch=master)](http://travis-ci.org/bevry/eachr)
Give eachr an array or object, and the iterator, in return eachr will give the iterator the value and key of each item, and will stop if the iterator returned false.


## Install

### Backend

1. [Install Node.js](http://bevry.me/node/install)
2. `npm install --save eachr`

### Frontend

1. [See Browserify](http://browserify.org)



## Usage

``` javascript
// Prepare
var each = require(".");
var arr = ["first", "second", "third"];
var obj = {a:"first", b:"second", c:"third"};
var iterator = function(value,key){
	console.log({value:value, key:key});
	if ( value === "second" ) {
		console.log("break");
		return false;
	}
};

// Cycle Array
each(arr, iterator);
// {"value":"first",  "key":0}
// {"value":"second", "key":1}
// break

// Cycle Object
each(obj, iterator);
// {"value":"first",  "key":"a"}
// {"value":"second", "key":"b"}
// break
```



## History
You can discover the history inside the [History.md](https://github.com/bevry/eachr/blob/master/History.md#files) file



## License
Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://creativecommons.org/licenses/MIT/)
<br/>Copyright © 2013+ [Bevry Pty Ltd](http://bevry.me)
<br/>Copyright © 2011-2012 [Benjamin Arthur Lupton](http://balupton.com)
