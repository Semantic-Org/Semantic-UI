//node --prof --prof_auto profile.js
//deps/v8/tools/mac-tick-processor v8.log
var sys = require("sys");
var fs = require("fs");

var testHtml = "./testdata/api.html"; //Test HTML file to load
var testIterations = 100; //Number of test loops to run

var html = fs.readFileSync(testHtml).toString();

function getMillisecs () {
	return((new Date()).getTime());
}

function timeExecutions (loops, func) {
	var start = getMillisecs();

	while (loops--)
		func();

	return(getMillisecs() - start);
}

sys.puts("HTML Length: " + html.length);

sys.puts("Test 1: " + timeExecutions(testIterations, function () {
//	function parseText (data) {
//		//
//	}
//	function parseTag (data) {
//		//
//	}
//	function parseAttrib (data) {
//		//
//	}
//	function parseComment (data) {
//		//
//	}
	var data = html.split("");
	data.meta = {
		  length: data.length
		, pos: 0
	}
	while (data.meta.length > data.meta.pos && data[data.meta.pos++] !== "");
//	sys.puts("Found: " + [data.meta.pos, data[data.meta.pos]]);
}) + "ms");

sys.puts("Test 2: " + timeExecutions(testIterations, function () {
	var data = html;
	var dataLen = data.length;
	var pos = 0;
	while (dataLen > pos && data.charAt(pos++) !== "");
//	sys.puts("Found: " + [pos, data.charAt(pos)]);
}) + "ms");
