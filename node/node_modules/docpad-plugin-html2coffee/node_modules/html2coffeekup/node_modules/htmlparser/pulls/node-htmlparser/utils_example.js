//node --prof --prof_auto profile.js
//deps/v8/tools/mac-tick-processor v8.log
var sys = require("sys");
var htmlparser = require("./lib/node-htmlparser");

var html = "<a>text a</a><b id='x'>text b</b><c class='y'>text c</c><d id='z' class='w'><e>text e</e></d><g class='g h i'>hhh</g><yy>hellow</yy><yy id='secondyy'>world</yy>";

var handler = new htmlparser.DefaultHandler(function(err, dom) {
	if (err) {
		sys.debug("Error: " + err);
	}
	else {
		sys.debug(sys.inspect(dom, false, null));
		var id = htmlparser.DomUtils.getElementById("x", dom);
		sys.debug("id: " + sys.inspect(id, false, null));
		var class = htmlparser.DomUtils.getElements({ class: "y" }, dom);
		sys.debug("class: " + sys.inspect(class, false, null));
		var multiclass = htmlparser.DomUtils.getElements({ class: function (value) { return(value && value.indexOf("h") > -1); } }, dom);
		sys.debug("multiclass: " + sys.inspect(multiclass, false, null));
		var name = htmlparser.DomUtils.getElementsByTagName("a", dom);
		sys.debug("name: " + sys.inspect(name, false, null));
		var text = htmlparser.DomUtils.getElementsByTagType("text", dom);
		sys.debug("text: " + sys.inspect(text, false, null));
		var nested = htmlparser.DomUtils.getElements({ tag_name: "d", id: "z", class: "w" }, dom);
		nested = htmlparser.DomUtils.getElementsByTagName("e", nested);
		nested = htmlparser.DomUtils.getElementsByTagType("text", nested);
		sys.debug("nested: " + sys.inspect(nested, false, null));
		var double = htmlparser.DomUtils.getElementsByTagName("yy", dom);
		sys.debug("double: " + sys.inspect(double, false, null));
		var single = htmlparser.DomUtils.getElements( { tag_name: "yy", id: "secondyy" }, dom);
		sys.debug("single: " + sys.inspect(single, false, null));
	}
}, { verbose: false });
var parser = new htmlparser.Parser(handler);
parser.parseComplete(html);
