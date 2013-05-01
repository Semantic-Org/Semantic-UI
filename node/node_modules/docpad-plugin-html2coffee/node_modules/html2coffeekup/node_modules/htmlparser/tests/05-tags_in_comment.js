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

exports.name = "Special char in comment";
exports.options = {
	  handler: {}
	, parser: {}
};
exports.html = "<head><!-- commented out tags <title>Test</title>--></head>";
exports.expected =
[ { raw: 'head'
  , data: 'head'
  , type: 'tag'
  , name: 'head'
  , children: 
     [ { raw: ' commented out tags <title>Test</title>'
       , data: ' commented out tags <title>Test</title>'
       , type: 'comment'
       }
     ]
  }
];

})();
