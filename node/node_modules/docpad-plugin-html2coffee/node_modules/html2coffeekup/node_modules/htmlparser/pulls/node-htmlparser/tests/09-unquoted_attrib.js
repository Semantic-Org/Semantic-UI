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

exports.name = "Unquoted attributes";
exports.html = "<font size= 14>the text</font>";
exports.expected =
[ { raw: 'font size= 14'
  , data: 'font size= 14'
  , type: 'tag'
  , name: 'font'
  , attribs: { size: '14' }
  , children:
     [ { raw: 'the text'
       , data: 'the text'
       , type: 'text'
       }
     ]
  }
];

})();
