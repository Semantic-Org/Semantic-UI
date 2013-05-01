(function () {

function RunningInNode () {
	return(
		(typeof require) == "function"
		&&
		(typeof exports) == "object"
		&&
		(typeof module) == "object"
		&&
		(typeof __filename) == "string"
		&&
		(typeof __dirname) == "string"
		);
}

if (!RunningInNode()) {
	if (!this.Tautologistics)
		this.Tautologistics = {};
	if (!this.Tautologistics.NodeHtmlParser)
		this.Tautologistics.NodeHtmlParser = {};
	if (!this.Tautologistics.NodeHtmlParser.Tests)
		this.Tautologistics.NodeHtmlParser.Tests = [];
	exports = {};
	this.Tautologistics.NodeHtmlParser.Tests.push(exports);
}

exports.name = "Atom (1.0)";
exports.options = {
	  handler: {}
	, parser: {}
};
exports.type = "rss";
//http://en.wikipedia.org/wiki/Atom_%28standard%29
exports.html = '<?xml version="1.0" encoding="utf-8"?>\
\
<feed xmlns="http://www.w3.org/2005/Atom">\
\
	<title>Example Feed</title>\
	<subtitle>A subtitle.</subtitle>\
	<link href="http://example.org/feed/" rel="self" />\
	<link href="http://example.org/" />\
	<id>urn:uuid:60a76c80-d399-11d9-b91C-0003939e0af6</id>\
	<updated>2003-12-13T18:30:02Z</updated>\
	<author>\
		<name>John Doe</name>\
		<email>johndoe@example.com</email>\
	</author>\
\
	<entry>\
		<title>Atom-Powered Robots Run Amok</title>\
		<link href="http://example.org/2003/12/13/atom03" />\
		<link rel="alternate" type="text/html" href="http://example.org/2003/12/13/atom03.html"/>\
		<link rel="edit" href="http://example.org/2003/12/13/atom03/edit"/>\
		<id>urn:uuid:1225c695-cfb8-4ebb-aaaa-80da344efa6a</id>\
		<updated>2003-12-13T18:30:02Z</updated>\
		<summary>Some text.</summary>\
	</entry>\
\
</feed>';
exports.expected = {
	  type: "atom"
	, id: "urn:uuid:60a76c80-d399-11d9-b91C-0003939e0af6"
 	, title: "Example Feed"
	, link: "http://example.org/feed/"
	, description: "A subtitle."
	, updated: new Date("2003-12-13T18:30:02Z")
	, author: "johndoe@example.com"
	, items: [
		  {
			  id: "urn:uuid:1225c695-cfb8-4ebb-aaaa-80da344efa6a"
			, title: "Atom-Powered Robots Run Amok"
			, link: "http://example.org/2003/12/13/atom03"
			, description: "Some text."
			, pubDate: new Date("2003-12-13T18:30:02Z")
			}
		]
	};

})();
