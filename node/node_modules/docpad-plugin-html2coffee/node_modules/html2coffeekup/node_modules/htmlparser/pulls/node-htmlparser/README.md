#NodeHtmlParser
A forgiving HTML/XML/RSS parser written in JS for both the browser and NodeJS (yes, despite the name it works just fine in any modern browser). The parser can handle streams (chunked data) and supports custom handlers for writing custom DOMs/output.

##Installing

	npm install htmlparser

##Running Tests

###Run tests under node:
	node runtests.js

###Run tests in browser:
View runtests.html in any browser

##Usage In Node
	var htmlparser = require("node-htmlparser");
	var rawHtml = "Xyz <script language= javascript>var foo = '<<bar>>';< /  script><!--<!-- Waah! -- -->";
	var handler = new htmlparser.DefaultHandler(function (error, dom) {
		if (error)
			[...do something for errors...]
		else
			[...parsing done, do something...]
	});
	var parser = new htmlparser.Parser(handler);
	parser.parseComplete(rawHtml);
	sys.puts(sys.inspect(handler.dom, false, null));

##Usage In Browser
	var handler = new Tautologistics.NodeHtmlParser.DefaultHandler(function (error, dom) {
		if (error)
			[...do something for errors...]
		else
			[...parsing done, do something...]
	});
	var parser = new Tautologistics.NodeHtmlParser.Parser(handler);
	parser.parseComplete(document.body.innerHTML);
	alert(JSON.stringify(handler.dom, null, 2));

##Example output
	[ { raw: 'Xyz ', data: 'Xyz ', type: 'text' }
	, { raw: 'script language= javascript'
	  , data: 'script language= javascript'
	  , type: 'script'
	  , name: 'script'
	  , attribs: { language: 'javascript' }
	  , children: 
	     [ { raw: 'var foo = \'<bar>\';<'
	       , data: 'var foo = \'<bar>\';<'
	       , type: 'text'
	       }
	     ]
	  }
	, { raw: '<!-- Waah! -- '
	  , data: '<!-- Waah! -- '
	  , type: 'comment'
	  }
	]

##Streaming To Parser
	while (...) {
		...
		parser.parseChunk(chunk);
	}
	parser.done();	

##Parsing RSS/Atom Feeds

	new htmlparser.RssHandler(function (error, dom) {
		...
	});

##DefaultHandler Options

###Usage
	var handler = new htmlparser.DefaultHandler(
		  function (error) { ... }
		, { verbose: false, ignoreWhitespace: true }
		);
	
###Option: ignoreWhitespace
Indicates whether the DOM should exclude text nodes that consists solely of whitespace. The default value is "false".

####Example: true
The following HTML:
	<font>
		<br>this is the text
	<font>
becomes:
	[ { raw: 'font'
	  , data: 'font'
	  , type: 'tag'
	  , name: 'font'
	  , children: 
	     [ { raw: 'br', data: 'br', type: 'tag', name: 'br' }
	     , { raw: 'this is the text\n'
	       , data: 'this is the text\n'
	       , type: 'text'
	       }
	     , { raw: 'font', data: 'font', type: 'tag', name: 'font' }
	     ]
	  }
	]

####Example: false
The following HTML:
	<font>
		<br>this is the text
	<font>
becomes:
	[ { raw: 'font'
	  , data: 'font'
	  , type: 'tag'
	  , name: 'font'
	  , children: 
	     [ { raw: '\n\t', data: '\n\t', type: 'text' }
	     , { raw: 'br', data: 'br', type: 'tag', name: 'br' }
	     , { raw: 'this is the text\n'
	       , data: 'this is the text\n'
	       , type: 'text'
	       }
	     , { raw: 'font', data: 'font', type: 'tag', name: 'font' }
	     ]
	  }
	]

###Option: verbose
Indicates whether to include extra information on each node in the DOM. This information consists of the "raw" attribute (original, unparsed text found between "<" and ">") and the "data" attribute on "tag", "script", and "comment" nodes. The default value is "true". 

####Example: true
The following HTML:
	<a href="test.html">xxx</a>
becomes:
	[ { raw: 'a href="test.html"'
	  , data: 'a href="test.html"'
	  , type: 'tag'
	  , name: 'a'
	  , attribs: { href: 'test.html' }
	  , children: [ { raw: 'xxx', data: 'xxx', type: 'text' } ]
	  }
	]

####Example: false
The following HTML:
	<a href="test.html">xxx</a>
becomes:
	[ { type: 'tag'
	  , name: 'a'
	  , attribs: { href: 'test.html' }
	  , children: [ { data: 'xxx', type: 'text' } ]
	  }
	]

###Option: enforceEmptyTags
Indicates whether the DOM should prevent children on tags marked as empty in the HTML spec. Typically this should be set to "true" HTML parsing and "false" for XML parsing. The default value is "true".

####Example: true
The following HTML:
	<link>text</link>
becomes:
	[ { raw: 'link', data: 'link', type: 'tag', name: 'link' }
	, { raw: 'text', data: 'text', type: 'text' }
	]

####Example: false
The following HTML:
	<link>text</link>
becomes:
	[ { raw: 'link'
	  , data: 'link'
	  , type: 'tag'
	  , name: 'link'
	  , children: [ { raw: 'text', data: 'text', type: 'text' } ]
	  }
	]

##DomUtils

###TBD (see utils_example.js for now)

##Related Projects

Looking for CSS selectors to search the DOM? Try Node-SoupSelect, a port of SoupSelect to NodeJS: http://github.com/harryf/node-soupselect

There's also a port of hpricot to NodeJS that uses node-HtmlParser for HTML parsing: http://github.com/silentrob/Apricot

