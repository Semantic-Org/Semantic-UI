//node --prof --prof_auto profile.getelement.js
//deps/v8/tools/mac-tick-processor v8.log > profile.getelement.txt
var sys = require("sys");
var fs = require("fs");
var htmlparser = require("./node-htmlparser");
var htmlparser_old = require("./node-htmlparser.old");

var testIterations = 100; //Number of test loops to run

function getMillisecs () {
	return((new Date()).getTime());
}

function timeExecutions (loops, func) {
	var start = getMillisecs();

	while (loops--)
		func();

	return(getMillisecs() - start);
}

var html = fs.readFileSync("testdata/getelement.html");
var handler = new htmlparser.DefaultHandler(function(err, dom) {
	if (err)
		sys.debug("Error: " + err);
});
var parser = new htmlparser.Parser(handler);
parser.parseComplete(html);
var dom = handler.dom;

//sys.debug(sys.inspect(dom, false, null));
sys.puts("New: " + timeExecutions(testIterations, function () {
	var foundDivs = htmlparser.DomUtils.getElementsByTagName("div", dom);
//	sys.puts("Found: " + foundDivs.length);

	var foundLimitDivs = htmlparser.DomUtils.getElementsByTagName("div", dom, null, 100);
//	sys.puts("Found: " + foundLimitDivs.length);

	var foundId = htmlparser.DomUtils.getElementById("question-summary-3018026", dom);
//	sys.puts("Found: " + foundId);
}));

sys.puts("Old: " + timeExecutions(testIterations, function () {
	var foundDivs = htmlparser_old.DomUtils.getElementsByTagName("div", dom);
//	sys.puts("Found: " + foundDivs.length);

//	var foundLimitDivs = htmlparser.DomUtils.getElementsByTagName("div", dom);
//	sys.puts("Found: " + foundLimitDivs.length);

	var foundId = htmlparser_old.DomUtils.getElementById("question-summary-3018026", dom);
//	sys.puts("Found: " + foundId);
}));
