/**
 * YamlEscaper encapsulates escaping rules for single and double-quoted
 * YAML strings.
 *
 * @author Matthew Lewinski <matthew@lewinski.org>
 */
YamlEscaper = function(){};
YamlEscaper.prototype =
{
	/**
	 * Determines if a JS value would require double quoting in YAML.
	 *
	 * @param string value A JS value
	 *
	 * @return Boolean True if the value would require double quotes.
	 */
	requiresDoubleQuoting: function(value)
	{
		return new RegExp(YamlEscaper.REGEX_CHARACTER_TO_ESCAPE).test(value);
	},

	/**
	 * Escapes and surrounds a JS value with double quotes.
	 *
	 * @param string value A JS value
	 *
	 * @return string The quoted, escaped string
	 */
	escapeWithDoubleQuotes: function(value)
	{
		value = value + '';
		var len = YamlEscaper.escapees.length;
		var maxlen = YamlEscaper.escaped.length;
		var esc = YamlEscaper.escaped;
		for (var i = 0; i < len; ++i)
			if ( i >= maxlen ) esc.push('');

		var ret = '';		
		ret = value.replace(new RegExp(YamlEscaper.escapees.join('|'),'g'), function(str){
			for(var i = 0; i < len; ++i){
				if( str == YamlEscaper.escapees[i] )
					return esc[i];
			}
		});
		return '"' + ret + '"'; 
	},

	/**
	 * Determines if a JS value would require single quoting in YAML.
	 *
	 * @param string value A JS value
	 *
	 * @return Boolean True if the value would require single quotes.
	 */
	requiresSingleQuoting: function(value)
	{
		return /[\s'":{}[\],&*#?]|^[-?|<>=!%@`]/.test(value);
	},

	/**
	 * Escapes and surrounds a JS value with single quotes.
	 *
	 * @param string value A JS value
	 *
	 * @return string The quoted, escaped string
	 */
	escapeWithSingleQuotes : function(value)
	{
		return "'" + value.replace(/'/g, "''") + "'";
	}
};

// Characters that would cause a dumped string to require double quoting.
YamlEscaper.REGEX_CHARACTER_TO_ESCAPE = "[\\x00-\\x1f]|\xc2\x85|\xc2\xa0|\xe2\x80\xa8|\xe2\x80\xa9";

// Mapping arrays for escaping a double quoted string. The backslash is
// first to ensure proper escaping. 
YamlEscaper.escapees = ['\\\\', '\\"', '"',
									 "\x00",  "\x01",  "\x02",  "\x03",  "\x04",  "\x05",  "\x06",  "\x07",
									 "\x08",  "\x09",  "\x0a",  "\x0b",  "\x0c",  "\x0d",  "\x0e",  "\x0f",
									 "\x10",  "\x11",  "\x12",  "\x13",  "\x14",  "\x15",  "\x16",  "\x17",
									 "\x18",  "\x19",  "\x1a",  "\x1b",  "\x1c",  "\x1d",  "\x1e",  "\x1f",
									 "\xc2\x85", "\xc2\xa0", "\xe2\x80\xa8", "\xe2\x80\xa9"];
YamlEscaper.escaped = ['\\"', '\\\\', '\\"',
									 "\\0",   "\\x01", "\\x02", "\\x03", "\\x04", "\\x05", "\\x06", "\\a",
									 "\\b",   "\\t",   "\\n",   "\\v",   "\\f",   "\\r",   "\\x0e", "\\x0f",
									 "\\x10", "\\x11", "\\x12", "\\x13", "\\x14", "\\x15", "\\x16", "\\x17",
									 "\\x18", "\\x19", "\\x1a", "\\e",   "\\x1c", "\\x1d", "\\x1e", "\\x1f",
									 "\\N", "\\_", "\\L", "\\P"];
