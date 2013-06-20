#!/usr/bin/env node
var data = '';
process.stdin.on('readable', function(){
	var chunk = process.stdin.read();
	if (chunk)  data += chunk.toString();
});
process.stdin.on('end', function() {
	var result = require('../').stringifySync(JSON.parse(data));
	process.stdout.write(result);
});