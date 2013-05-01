//node --prof --prof_auto profile.js
//deps/v8/tools/mac-tick-processor v8.log
var sys = require("sys");
var fs = require("fs");
var http = require("http");
var htmlparser = require("./lib/htmlparser");
//var libxml = require('./libxmljs');

var testNHP = true; //Should node-htmlparser be exercised?
var testLXJS = false; //Should libxmljs be exercised?
var testIterations = 100; //Number of test loops to run

var testHost = "localhost"; //Host to fetch test HTML from
var testPort = 80; //Port on host to fetch test HTML from
var testPath = "/~chris/feed.xml"; //Path on host to fetch HTML from

function getMillisecs () {
	return((new Date()).getTime());
}

function timeExecutions (loops, func) {
	var start = getMillisecs();

	while (loops--)
		func();

	return(getMillisecs() - start);
}

var html = "";
http.createClient(testPort, testHost)
	.request("GET", testPath, { host: testHost })
	.addListener("response", function (response) {
		if (response.statusCode == "200") {
			response.setEncoding("utf8");
			response.addListener("data", function (chunk) {
				html += chunk;
			}).addListener("end", function() {
				var timeNodeHtmlParser = !testNHP ? 0 : timeExecutions(testIterations, function () {
					var handler = new htmlparser.DefaultHandler(function(err, dom) {
						if (err)
							sys.debug("Error: " + err);
					});
					var parser = new htmlparser.Parser(handler, { includeLocation: true });
					parser.parseComplete(html);
				})
				
				var timeLibXmlJs = !testLXJS ? 0 : timeExecutions(testIterations, function () {
					var dom = libxml.parseHtmlString(html);
				})

				if (testNHP)
					sys.debug("NodeHtmlParser: "  + timeNodeHtmlParser);
				if (testLXJS)
					sys.debug("LibXmlJs: "  + timeLibXmlJs);
				if (testNHP && testLXJS)
					sys.debug("Difference: " + ((timeNodeHtmlParser - timeLibXmlJs) / timeLibXmlJs) * 100);
			});
		}
		else
			sys.debug("Error: got response status " + response.statusCode);
	})
	.end();
