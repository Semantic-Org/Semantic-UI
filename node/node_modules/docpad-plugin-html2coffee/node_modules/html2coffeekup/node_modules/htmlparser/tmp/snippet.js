var sys = require("sys");
var htmlparser = require("htmlparser");

var html = "<html><body><p>foo</p></body></html>";

var handler = new htmlparser.DefaultHandler(function(err, dom) {
	if (err)
		sys.debug("Error: " + err);
	else
		sys.debug(sys.inspect(dom, false, null));
}, { enforceEmptyTags: true });
var parser = new htmlparser.Parser(handler);
parser.parseComplete(html);
