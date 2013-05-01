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

exports.name = "Postion data";
exports.options = {
	  handler: {}
	, parser: { includeLocation: true }
};
exports.html = "<html>\r\n\n\t<title>The Title</title><body>\nHello world\r\n\n</body>\n\n</html>";
exports.expected = [
	{
		raw: 'html',
		data: 'html',
		type: 'tag',
		name: 'html',
		location: {
			line: 1,
			col: 1
		},
		children: [{
			raw: '\r\n\n\t',
			data: '\r\n\n\t',
			type: 'text',
			location: {
				line: 1,
				col: 7
			}
		}, {
			raw: 'title',
			data: 'title',
			type: 'tag',
			name: 'title',
			location: {
				line: 3,
				col: 2
			},
			children: [{
				raw: 'The Title',
				data: 'The Title',
				type: 'text',
				location: {
					line: 3,
					col: 9
				}
			}]
		}, {
			raw: 'body',
			data: 'body',
			type: 'tag',
			name: 'body',
			location: {
				line: 3,
				col: 26
			},
			children: [{
				raw: '\nHello world\r\n\n',
				data: '\nHello world\r\n\n',
				type: 'text',
				location: {
					line: 3,
					col: 32
				}
			}]
		}, {
			raw: '\n\n',
			data: '\n\n',
			type: 'text',
			location: {
				line: 6,
				col: 8
			}
		}]
	}
	];

})();
