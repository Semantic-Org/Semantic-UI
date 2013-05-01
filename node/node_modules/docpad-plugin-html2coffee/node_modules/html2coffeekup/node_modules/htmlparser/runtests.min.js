/***********************************************
Copyright 2010, Chris Winberry <chris@winberry.net>. All rights reserved.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
 
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
 
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
***********************************************/

var sys = require("sys");
var fs = require("fs");
var htmlparser = require("./lib/htmlparser.min");

var testFolder = "./tests";
var chunkSize = 5;

var testFiles = fs.readdirSync(testFolder);
var testCount = 0;
var failedCount = 0;
for (var i in testFiles) {
	testCount++;
	var fileParts = testFiles[i].split(".");
	fileParts.pop();
	var moduleName = fileParts.join(".");
	var test = require(testFolder + "/" + moduleName);
	var handlerCallback = function handlerCallback (error) {
		if (error)
			sys.puts("Handler error: " + error);
	}
	var handler = (test.type == "rss") ?
		new htmlparser.RssHandler(handlerCallback, test.options.handler)
		:
		new htmlparser.DefaultHandler(handlerCallback, test.options.handler)
		;
	var parser = new htmlparser.Parser(handler, test.options.parser);
	parser.parseComplete(test.html);
	var resultComplete = handler.dom;
	var chunkPos = 0;
	parser.reset();
	while (chunkPos < test.html.length) {
		parser.parseChunk(test.html.substring(chunkPos, chunkPos + chunkSize));
		chunkPos += chunkSize;
	}
	parser.done();
	var resultChunk = handler.dom;
	var testResult =
		sys.inspect(resultComplete, false, null) === sys.inspect(test.expected, false, null)
		&&
		sys.inspect(resultChunk, false, null) === sys.inspect(test.expected, false, null)
		;
	sys.puts("[" + test.name + "\]: " + (testResult ? "passed" : "FAILED"));
	if (!testResult) {
		failedCount++;
		sys.puts("== Complete ==");
		sys.puts(sys.inspect(resultComplete, false, null));
		sys.puts("== Chunked ==");
		sys.puts(sys.inspect(resultChunk, false, null));
		sys.puts("== Expected ==");
		sys.puts(sys.inspect(test.expected, false, null));
	}
}
sys.puts("Total tests: " + testCount);
sys.puts("Failed tests: " + failedCount);
