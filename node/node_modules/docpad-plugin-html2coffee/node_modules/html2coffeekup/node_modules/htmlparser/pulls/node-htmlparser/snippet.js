//node --prof --prof_auto profile.js
//deps/v8/tools/mac-tick-processor v8.log
var sys = require("sys");
var htmlparser = require("./node-htmlparser");

var html = "<link>text</link>";

var handler = new htmlparser.DefaultHandler(function(err, dom) {
	if (err)
		sys.debug("Error: " + err);
	else
		sys.debug(sys.inspect(dom, false, null));
}, { enforceEmptyTags: true });
var parser = new htmlparser.Parser(handler);
parser.parseComplete(html);
