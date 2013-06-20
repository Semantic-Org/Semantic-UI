/**
 * Exception class thrown when an error occurs during parsing.
 *
 * @author Fabien Potencier <fabien@symfony.com>
 *
 * @api
 */
 
/**
 * Constructor.
 *
 * @param string	message	The error message
 * @param integer   parsedLine The line where the error occurred
 * @param integer   snippet	The snippet of code near the problem
 * @param string	parsedFile The file name where the error occurred
 */

var YamlParseException = function(message, parsedLine, snippet, parsedFile){

		this.rawMessage = message;
		this.parsedLine = (parsedLine !== undefined) ? parsedLine : -1;
		this.snippet = (snippet !== undefined) ? snippet : null;
		this.parsedFile = (parsedFile !== undefined) ? parsedFile : null;

		this.updateRepr();
		
		this.message = message;

};
YamlParseException.prototype =
{

	name: 'YamlParseException',
	message: null,
	
	parsedFile: null,
	parsedLine: -1,
	snippet: null,
	rawMessage: null,

	isDefined: function(input)
	{
		return input != undefined && input != null;
	},

	/**
	* Gets the snippet of code near the error.
	*
	* @return string The snippet of code
	*/
	getSnippet: function()
	{
		return this.snippet;
	},

	/**
	* Sets the snippet of code near the error.
	*
	* @param string snippet The code snippet
	*/
	setSnippet: function(snippet)
	{
		this.snippet = snippet;

		this.updateRepr();
	},

	/**
	* Gets the filename where the error occurred.
	*
	* This method returns null if a string is parsed.
	*
	* @return string The filename
	*/
	getParsedFile: function()
	{
		return this.parsedFile;
	},

	/**
	* Sets the filename where the error occurred.
	*
	* @param string parsedFile The filename
	*/
	setParsedFile: function(parsedFile)
	{
		this.parsedFile = parsedFile;

		this.updateRepr();
	},

	/**
	* Gets the line where the error occurred.
	*
	* @return integer The file line
	*/
	getParsedLine: function()
	{
		return this.parsedLine;
	},

	/**
	* Sets the line where the error occurred.
	*
	* @param integer parsedLine The file line
	*/
	setParsedLine: function(parsedLine)
	{
		this.parsedLine = parsedLine;

		this.updateRepr();
	},

	updateRepr: function()
	{
		this.message = this.rawMessage;

		var dot = false;
		if ('.' === this.message.charAt(this.message.length - 1)) {
			this.message = this.message.substring(0, this.message.length - 1);
			dot = true;
		}

		if (null !== this.parsedFile) {
			this.message += ' in ' + JSON.stringify(this.parsedFile);
		}

		if (this.parsedLine >= 0) {
			this.message += ' at line ' + this.parsedLine;
		}

		if (this.snippet) {
			this.message += ' (near "' + this.snippet + '")';
		}

		if (dot) {
			this.message += '.';
		}
	}
}
