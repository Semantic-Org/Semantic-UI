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

exports.name = "Unescaped chars in script";
exports.options = {
	  handler: {}
	, parser: {}
};
exports.html = "<head><script language=\"Javascript\">var foo = \"<bar>\"; alert(2 > foo); var baz = 10 << 2; var zip = 10 >> 1; var yap = \"<<>>>><<\";</script></head>";
exports.expected =
[ { raw: 'head'
  , data: 'head'
  , type: 'tag'
  , name: 'head'
  , children: 
     [ { raw: 'script language="Javascript"'
       , data: 'script language="Javascript"'
       , type: 'script'
       , name: 'script'
       , attribs: { language: 'Javascript' }
       , children: 
          [ { raw: 'var foo = "<bar>"; alert(2 > foo); var baz = 10 << 2; var zip = 10 >> 1; var yap = \"<<>>>><<\";'
            , data: 'var foo = "<bar>"; alert(2 > foo); var baz = 10 << 2; var zip = 10 >> 1; var yap = \"<<>>>><<\";'
            , type: 'text'
            }
          ]
       }
     ]
  }
];

})();
