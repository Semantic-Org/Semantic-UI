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

exports.name = "Unescaped chars in style";
exports.html = "<style type=\"text/css\">\n body > p\n	{ font-weight: bold; }</style>";
exports.expected =
[ { raw: 'style type="text/css"'
  , data: 'style type="text/css"'
  , type: 'style'
  , name: 'style'
  , attribs: { type: 'text/css' }
  , children:
     [ { raw: '\n body > p\n	{ font-weight: bold; }'
       , data: '\n body > p\n	{ font-weight: bold; }'
       , type: 'text'
       }
     ]
  }
];

})();
