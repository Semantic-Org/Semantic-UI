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

exports.name = "Ignore empty tags";
exports.options = {
	  handler: { enforceEmptyTags: false }
	, parser: {}
};
exports.html = "<link>text</link>";
exports.expected =
	[
		  { raw: 'link', data: 'link', type: 'tag', name: 'link', children: [
		  	{ raw: 'text', data: 'text', type: 'text' }
		  ] }
	];

})();
