// Prepare
var each = require("./");
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