
/**
 * YamlParser parses YAML strings to convert them to JS objects
 * (port of Yaml Symfony Component)
 */
var YamlParser = function(offset /* Integer */)
{
		this.offset = (offset !== undefined) ? offset : 0;
};
YamlParser.prototype =
{
	offset: 0,
	lines: [],
	currentLineNb: -1,
	currentLine: '',
	refs: {},
	
	/**
	 * Parses a YAML string to a JS value.
	 *
	 * @param String value A YAML string
	 *
	 * @return mixed A JS value
	 */
	parse: function(value /* String */)
	{
		this.currentLineNb = -1;
		this.currentLine = '';
		this.lines = this.cleanup(value).split("\n");
		
		var data = null;
      var context = null;
      		
		while ( this.moveToNextLine() )
		{
			if ( this.isCurrentLineEmpty() )
			{
				continue;
			}
			
			// tab?
			if ( this.currentLine.charAt(0) == '\t' )
			{
				throw new YamlParseException('A YAML file cannot contain tabs as indentation.', this.getRealCurrentLineNb() + 1, this.currentLine);
			}
			
			var isRef = false;
			var isInPlace = false;
			var isProcessed = false;
			var values = null;
			var matches = null;
			var c = null;
			var parser = null;
			var block = null;
			var key = null;
			var parsed = null;
			var len = null;
			var reverse = null;
			
			if ( values = /^\-((\s+)(.+?))?\s*$/.exec(this.currentLine) )
			{

				if (context && 'mapping' == context) {
					throw new YamlParseException('You cannot define a sequence item when in a mapping', this.getRealCurrentLineNb() + 1, this.currentLine);
				}
				context = 'sequence';

				if ( !this.isDefined(data) ) data = [];
				//if ( !(data instanceof Array) ) throw new YamlParseException("Non array entry", this.getRealCurrentLineNb() + 1, this.currentLine);
				
				values = {leadspaces: values[2], value: values[3]};
				
				if ( this.isDefined(values.value) && ( matches = /^&([^ ]+) *(.*)/.exec(values.value) ) )
				{
					matches = {ref: matches[1], value: matches[2]};
					isRef = matches.ref;
					values.value = matches.value;
				}
				
				// array
				if ( !this.isDefined(values.value) || '' == this.trim(values.value) || values.value.replace(/^ +/,'').charAt(0) == '#' )
				{
					c = this.getRealCurrentLineNb() + 1;
					parser = new YamlParser(c);
					parser.refs = this.refs;
					data.push(parser.parse(this.getNextEmbedBlock()));
					this.refs = parser.refs;
				}
				else
				{
					if ( this.isDefined(values.leadspaces) && 
						' ' == values.leadspaces && 
						( matches = new RegExp('^('+YamlInline.REGEX_QUOTED_STRING+'|[^ \'"\{\[].*?) *\:(\\s+(.+?))?\\s*$').exec(values.value) ) 
					) {
						matches = {key: matches[1], value: matches[3]};
						// this is a compact notation element, add to next block and parse
						c = this.getRealCurrentLineNb();
						parser = new YamlParser(c);
						parser.refs = this.refs;
						block = values.value;
						
						if ( !this.isNextLineIndented() )
						{
							block += "\n"+this.getNextEmbedBlock(this.getCurrentLineIndentation() + 2);
						}

						data.push(parser.parse(block));
						this.refs = parser.refs;
					}
					else
					{
						data.push(this.parseValue(values.value));
					}
				}
			}
			else if ( values = new RegExp('^('+YamlInline.REGEX_QUOTED_STRING+'|[^ \'"\[\{].*?) *\:(\\s+(.+?))?\\s*$').exec(this.currentLine) )
			{
				if ( !this.isDefined(data) ) data = {};
				if (context && 'sequence' == context) {
					throw new YamlParseException('You cannot define a mapping item when in a sequence', this.getRealCurrentLineNb() + 1, this.currentLine);
				}
				context = 'mapping';				
				//if ( data instanceof Array ) throw new YamlParseException("Non mapped entry", this.getRealCurrentLineNb() + 1, this.currentLine);
				
				values = {key: values[1], value: values[3]};
				
				try {
					key = new YamlInline().parseScalar(values.key);
				} catch (e) {
					if ( e instanceof YamlParseException ) {
						e.setParsedLine(this.getRealCurrentLineNb() + 1);
						e.setSnippet(this.currentLine);
					}
					throw e;
				}				
				
				
				if ( '<<' == key )
				{
					if ( this.isDefined(values.value) && '*' == (values.value+'').charAt(0) )
					{
						isInPlace = values.value.substr(1);
						if ( this.refs[isInPlace] == undefined )
						{
							throw new YamlParseException('Reference "'+value+'" does not exist', this.getRealCurrentLineNb() + 1, this.currentLine);
						}
					}
					else
					{
						if ( this.isDefined(values.value) && values.value != '' )
						{
							value = values.value;
						}
						else
						{
							value = this.getNextEmbedBlock();
						}
						
						c = this.getRealCurrentLineNb() + 1;
						parser = new YamlParser(c);
						parser.refs = this.refs;
						parsed = parser.parse(value);
						this.refs = parser.refs;
				
						var merged = [];
						if ( !this.isObject(parsed) )
						{
							throw new YamlParseException("YAML merge keys used with a scalar value instead of an array", this.getRealCurrentLineNb() + 1, this.currentLine);
						}
						else if ( this.isDefined(parsed[0]) )
						{
							// Numeric array, merge individual elements
							reverse = this.reverseArray(parsed);
							len = reverse.length;
							for ( var i = 0; i < len; i++ )
							{
								var parsedItem = reverse[i];
								if ( !this.isObject(reverse[i]) )
								{
									throw new YamlParseException("Merge items must be arrays", this.getRealCurrentLineNb() + 1, this.currentLine);
								}
								merged = this.mergeObject(reverse[i], merged);
							}
						}
						else
						{
							// Associative array, merge
							merged = this.mergeObject(merged, parsed);
						}
				
						isProcessed = merged;
					}
				}
				else if ( this.isDefined(values.value) && (matches = /^&([^ ]+) *(.*)/.exec(values.value) ) )
				{
					matches = {ref: matches[1], value: matches[2]};
					isRef = matches.ref;
					values.value = matches.value;
				}
				
				if ( isProcessed )
				{
					// Merge keys
					data = isProcessed;
				}
				// hash
				else if ( !this.isDefined(values.value) || '' == this.trim(values.value) || this.trim(values.value).charAt(0) == '#' )
				{
					// if next line is less indented or equal, then it means that the current value is null
					if ( this.isNextLineIndented() && !this.isNextLineUnIndentedCollection() )
					{
						data[key] = null;
					}
					else
					{
						c = this.getRealCurrentLineNb() + 1;
						parser = new YamlParser(c);
						parser.refs = this.refs;
						data[key] = parser.parse(this.getNextEmbedBlock());
						this.refs = parser.refs;
					}
				}
				else
				{
					if ( isInPlace )
					{
						data = this.refs[isInPlace];
					}
					else
					{
						data[key] = this.parseValue(values.value);
					}
				}
			}
			else
			{
				// 1-liner followed by newline
				if ( 2 == this.lines.length && this.isEmpty(this.lines[1]) )
				{
					try {
						value = new YamlInline().parse(this.lines[0]);
					} catch (e) {
						if ( e instanceof YamlParseException ) {
							e.setParsedLine(this.getRealCurrentLineNb() + 1);
							e.setSnippet(this.currentLine);
						}
						throw e;
					}
					
					if ( this.isObject(value) )
					{
						var first = value[0];
						if ( typeof(value) == 'string' && '*' == first.charAt(0) )
						{
							data = [];
							len = value.length;
							for ( var i = 0; i < len; i++ )
							{
								data.push(this.refs[value[i].substr(1)]);
							}
							value = data;
						}
					}
				
					return value;
				}
				
				throw new YamlParseException('Unable to parse.', this.getRealCurrentLineNb() + 1, this.currentLine);
			}
		
			if ( isRef )
			{
				if ( data instanceof Array )
					this.refs[isRef] = data[data.length-1];
				else
				{
					var lastKey = null;
					for ( var k in data )
					{
						if ( data.hasOwnProperty(k) ) lastKey = k;
					}
					this.refs[isRef] = data[k];
				}
			}
		}
		
		return this.isEmpty(data) ? null : data;
	},

	/**
	 * Returns the current line number (takes the offset into account).
	 *
	 * @return integer The current line number
	 */
	getRealCurrentLineNb: function()
	{
		return this.currentLineNb + this.offset;
	},

	/**
	 * Returns the current line indentation.
	 *
	 * @return integer The current line indentation
	 */
	getCurrentLineIndentation: function()
	{
		return this.currentLine.length - this.currentLine.replace(/^ +/g, '').length;
	},

	/**
	 * Returns the next embed block of YAML.
	 *
	 * @param integer indentation The indent level at which the block is to be read, or null for default
	 *
	 * @return string A YAML string
	 *
	 * @throws YamlParseException When indentation problem are detected
	 */
	getNextEmbedBlock: function(indentation)
	{
		this.moveToNextLine();
		var newIndent = null;
		var indent = null;

		if ( !this.isDefined(indentation) )
		{
			newIndent = this.getCurrentLineIndentation();
			
			var unindentedEmbedBlock = this.isStringUnIndentedCollectionItem(this.currentLine);

			if ( !this.isCurrentLineEmpty() && 0 == newIndent && !unindentedEmbedBlock )
			{
				throw new YamlParseException('Indentation problem A', this.getRealCurrentLineNb() + 1, this.currentLine);
			}
		}
		else
		{
			newIndent = indentation;
		}

		var data = [this.currentLine.substr(newIndent)];

		var isUnindentedCollection = this.isStringUnIndentedCollectionItem(this.currentLine);

		var continuationIndent = -1;
		if (isUnindentedCollection === true) {
			continuationIndent = 1 + /^\-((\s+)(.+?))?\s*$/.exec(this.currentLine)[2].length;
		}

		while ( this.moveToNextLine() )
		{

			if (isUnindentedCollection && !this.isStringUnIndentedCollectionItem(this.currentLine) && this.getCurrentLineIndentation() != continuationIndent) {
				this.moveToPreviousLine();
				break;
			}

			if ( this.isCurrentLineEmpty() )
			{
				if ( this.isCurrentLineBlank() )
				{
					data.push(this.currentLine.substr(newIndent));
				}

				continue;
			}

			indent = this.getCurrentLineIndentation();
			var matches;
			if ( matches = /^( *)$/.exec(this.currentLine) )
			{
				// empty line
				data.push(matches[1]);
			}
			else if ( indent >= newIndent )
			{
				data.push(this.currentLine.substr(newIndent));
			}
			else if ( 0 == indent )
			{
				this.moveToPreviousLine();

				break;
			}
			else
			{
				throw new YamlParseException('Indentation problem B', this.getRealCurrentLineNb() + 1, this.currentLine);
			}
		}

		return data.join("\n");
	},

	/**
	 * Moves the parser to the next line.
	 *
	 * @return Boolean
	 */
	moveToNextLine: function()
	{
		if ( this.currentLineNb >= this.lines.length - 1 )
		{
			return false;
		}

		this.currentLineNb++;
		this.currentLine = this.lines[this.currentLineNb];

		return true;
	},

	/**
	 * Moves the parser to the previous line.
	 */
	moveToPreviousLine: function()
	{
		this.currentLineNb--;
		this.currentLine = this.lines[this.currentLineNb];
	},

	/**
	 * Parses a YAML value.
	 *
	 * @param string value A YAML value
	 *
	 * @return mixed A JS value
	 *
	 * @throws YamlParseException When reference does not exist
	 */
	parseValue: function(value)
	{
		if ( '*' == (value+'').charAt(0) )
		{
			if ( this.trim(value).charAt(0) == '#' )
			{
				value = (value+'').substr(1, value.indexOf('#') - 2);
			}
			else
			{
				value = (value+'').substr(1);
			}

			if ( this.refs[value] == undefined )
			{
				throw new YamlParseException('Reference "'+value+'" does not exist', this.getRealCurrentLineNb() + 1, this.currentLine);
			}
			return this.refs[value];
		}

		var matches = null;
		if ( matches = /^(\||>)(\+|\-|\d+|\+\d+|\-\d+|\d+\+|\d+\-)?( +#.*)?$/.exec(value) )
		{
			matches = {separator: matches[1], modifiers: matches[2], comments: matches[3]};
			var modifiers = this.isDefined(matches.modifiers) ? matches.modifiers : '';

			return this.parseFoldedScalar(matches.separator, modifiers.replace(/\d+/g, ''), Math.abs(parseInt(modifiers)));
		}
		try {
			return new YamlInline().parse(value);
		} catch (e) {
			if ( e instanceof YamlParseException ) {
				e.setParsedLine(this.getRealCurrentLineNb() + 1);
				e.setSnippet(this.currentLine);
			}
			throw e;
		}
	},

	/**
	 * Parses a folded scalar.
	 *
	 * @param	string	separator	 The separator that was used to begin this folded scalar (| or >)
	 * @param	string	indicator	 The indicator that was used to begin this folded scalar (+ or -)
	 * @param	integer indentation  The indentation that was used to begin this folded scalar
	 *
	 * @return string	The text value
	 */
	parseFoldedScalar: function(separator, indicator, indentation)
	{
		if ( indicator == undefined ) indicator = '';
		if ( indentation == undefined ) indentation = 0;
		
		separator = '|' == separator ? "\n" : ' ';
		var text = '';
		var diff = null;

		var notEOF = this.moveToNextLine();

		while ( notEOF && this.isCurrentLineBlank() )
		{
			text += "\n";

			notEOF = this.moveToNextLine();
		}

		if ( !notEOF )
		{
			return '';
		}

		var matches = null;
		if ( !(matches = new RegExp('^('+(indentation ? this.strRepeat(' ', indentation) : ' +')+')(.*)$').exec(this.currentLine)) )
		{
			this.moveToPreviousLine();

			return '';
		}
		
		matches = {indent: matches[1], text: matches[2]};
		
		var textIndent = matches.indent;
		var previousIndent = 0;

		text += matches.text + separator;
		while ( this.currentLineNb + 1 < this.lines.length )
		{
			this.moveToNextLine();
			
			if ( matches = new RegExp('^( {'+textIndent.length+',})(.+)$').exec(this.currentLine) )
			{
				matches = {indent: matches[1], text: matches[2]};
				
				if ( ' ' == separator && previousIndent != matches.indent )
				{
					text = text.substr(0, text.length - 1)+"\n";
				}
				
				previousIndent = matches.indent;

				diff = matches.indent.length - textIndent.length;
				text += this.strRepeat(' ', diff) + matches.text + (diff != 0 ? "\n" : separator);
			}
			else if ( matches = /^( *)$/.exec(this.currentLine) )
			{
				text += matches[1].replace(new RegExp('^ {1,'+textIndent.length+'}','g'), '')+"\n";
			}
			else
			{
				this.moveToPreviousLine();

				break;
			}
		}

		if ( ' ' == separator )
		{
			// replace last separator by a newline
			text = text.replace(/ (\n*)$/g, "\n$1");
		}

		switch ( indicator )
		{
			case '':
				text = text.replace(/\n+$/g, "\n");
				break;
			case '+':
				break;
			case '-':
				text = text.replace(/\n+$/g, '');
				break;
		}

		return text;
	},

	/**
	 * Returns true if the next line is indented.
	 *
	 * @return Boolean Returns true if the next line is indented, false otherwise
	 */
	isNextLineIndented: function()
	{
		var currentIndentation = this.getCurrentLineIndentation();
		var notEOF = this.moveToNextLine();

		while ( notEOF && this.isCurrentLineEmpty() )
		{
			notEOF = this.moveToNextLine();
		}

		if ( false == notEOF )
		{
			return false;
		}

		var ret = false;
		if ( this.getCurrentLineIndentation() <= currentIndentation )
		{
			ret = true;
		}

		this.moveToPreviousLine();

		return ret;
	},

	/**
	 * Returns true if the current line is blank or if it is a comment line.
	 *
	 * @return Boolean Returns true if the current line is empty or if it is a comment line, false otherwise
	 */
	isCurrentLineEmpty: function()
	{
		return this.isCurrentLineBlank() || this.isCurrentLineComment();
	},

	/**
	 * Returns true if the current line is blank.
	 *
	 * @return Boolean Returns true if the current line is blank, false otherwise
	 */
	isCurrentLineBlank: function()
	{
		return '' == this.trim(this.currentLine);
	},

	/**
	 * Returns true if the current line is a comment line.
	 *
	 * @return Boolean Returns true if the current line is a comment line, false otherwise
	 */
	isCurrentLineComment: function()
	{
		//checking explicitly the first char of the trim is faster than loops or strpos
		var ltrimmedLine = this.currentLine.replace(/^ +/g, '');
		return ltrimmedLine.charAt(0) == '#';
	},

	/**
	 * Cleanups a YAML string to be parsed.
	 *
	 * @param string value The input YAML string
	 *
	 * @return string A cleaned up YAML string
	 */
	cleanup: function(value)
	{
		value = value.split("\r\n").join("\n").split("\r").join("\n");

		if ( !/\n$/.test(value) )
		{
			value += "\n";
		}

		// strip YAML header
		var count = 0;
		var regex = /^\%YAML[: ][\d\.]+.*\n/;
		while ( regex.test(value) )
		{
			value = value.replace(regex, '');
			count++;
		}
		this.offset += count;

		// remove leading comments
		regex = /^(#.*?\n)+/;
		if ( regex.test(value) )
		{
			var trimmedValue = value.replace(regex, '');
			
			// items have been removed, update the offset
			this.offset += this.subStrCount(value, "\n") - this.subStrCount(trimmedValue, "\n");
			value = trimmedValue;
		}

		// remove start of the document marker (---)
		regex = /^\-\-\-.*?\n/;
		if ( regex.test(value) )
		{
			trimmedValue = value.replace(regex, '');
			
			// items have been removed, update the offset
			this.offset += this.subStrCount(value, "\n") - this.subStrCount(trimmedValue, "\n");
			value = trimmedValue;

			// remove end of the document marker (...)
			value = value.replace(/\.\.\.\s*$/g, '');
		}

		return value;
	},

	/**
	 * Returns true if the next line starts unindented collection
	 *
	 * @return Boolean Returns true if the next line starts unindented collection, false otherwise
	 */
	isNextLineUnIndentedCollection: function()
	{
		var currentIndentation = this.getCurrentLineIndentation();
		var notEOF = this.moveToNextLine();

		while (notEOF && this.isCurrentLineEmpty()) {
			notEOF = this.moveToNextLine();
		}

		if (false === notEOF) {
			return false;
		}

		var ret = false;
		if (
			this.getCurrentLineIndentation() == currentIndentation
			&&
			this.isStringUnIndentedCollectionItem(this.currentLine)
		) {
			ret = true;
		}

		this.moveToPreviousLine();

		return ret;
	},

	/**
	 * Returns true if the string is unindented collection item
	 *
	 * @return Boolean Returns true if the string is unindented collection item, false otherwise
	 */
	isStringUnIndentedCollectionItem: function(string)
	{
		return (0 === this.currentLine.indexOf('- '));
	},
	
	isObject: function(input)
	{
		return typeof(input) == 'object' && this.isDefined(input);
	},
	
	isEmpty: function(input)
	{
		return input == undefined || input == null || input == '' || input == 0 || input == "0" || input == false;
	},
	
	isDefined: function(input)
	{
		return input != undefined && input != null;
	},
	
	reverseArray: function(input /* Array */)
	{
		var result = [];
		var len = input.length;
		for ( var i = len-1; i >= 0; i-- )
		{
			result.push(input[i]);
		}
		
		return result;
	},
	
	merge: function(a /* Object */, b /* Object */)
	{
		var c = {};
		var i;
		
		for ( i in a )
		{
			if ( a.hasOwnProperty(i) )
				if ( /^\d+$/.test(i) ) c.push(a);
				else c[i] = a[i];
		}
		for ( i in b )
		{
			if ( b.hasOwnProperty(i) )
				if ( /^\d+$/.test(i) ) c.push(b);
				else c[i] = b[i];
		}
		
		return c;
	},
	
	strRepeat: function(str /* String */, count /* Integer */)
	{
		var i;
		var result = '';
		for ( i = 0; i < count; i++ ) result += str;
		return result;
	},
	
	subStrCount: function(string, subString, start, length)
	{
		var c = 0;
		
		string = '' + string;
		subString = '' + subString;
		
		if ( start != undefined ) string = string.substr(start);
		if ( length != undefined ) string = string.substr(0, length); 
		
		var len = string.length;
		var sublen = subString.length;
		for ( var i = 0; i < len; i++ )
		{
			if ( subString == string.substr(i, sublen) )
				c++;
				i += sublen - 1;
		}
		
		return c;
	},
	
	trim: function(str /* String */)
	{
		return (str+'').replace(/^ +/,'').replace(/ +$/,'');
	}
};
