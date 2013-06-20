#!/usr/bin/env node
var data = '';
process.stdin.on('readable', function(){
	var chunk = process.stdin.read();
	if (chunk)  data += chunk.toString();
});
process.stdin.on('end', function() {
	var result = JSON.stringify(require('../').parseSync(data));
	process.stdout.write(result);
});