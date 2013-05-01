/**
 * YamlUnescaper encapsulates unescaping rules for single and double-quoted
 * YAML strings.
 *
 * @author Matthew Lewinski <matthew@lewinski.org>
 */
var YamlUnescaper = function(){};
YamlUnescaper.prototype =
{
	/**
	 * Unescapes a single quoted string.
	 *
	 * @param string value A single quoted string.
	 *
	 * @return string The unescaped string.
	 */
	unescapeSingleQuotedString: function(value)
	{
		return value.replace(/''/g, "'");
	},

	/**
	 * Unescapes a double quoted string.
	 *
	 * @param string value A double quoted string.
	 *
	 * @return string The unescaped string.
	 */
	unescapeDoubleQuotedString: function(value)
	{
		var callback = function(m) {
			return new YamlUnescaper().unescapeCharacter(m);
		};

		// evaluate the string
		return value.replace(new RegExp(YamlUnescaper.REGEX_ESCAPED_CHARACTER, 'g'), callback);
	},

	/**
	 * Unescapes a character that was found in a double-quoted string
	 *
	 * @param string value An escaped character
	 *
	 * @return string The unescaped character
	 */
	unescapeCharacter: function(value)
	{
		switch (value.charAt(1)) {
			case '0':
				return String.fromCharCode(0);
			case 'a':
				return String.fromCharCode(7);
			case 'b':
				return String.fromCharCode(8);
			case 't':
				return "\t";
			case "\t":
				return "\t";
			case 'n':
				return "\n";
			case 'v':
				return String.fromCharCode(11);
			case 'f':
				return String.fromCharCode(12);
			case 'r':
				return String.fromCharCode(13);
			case 'e':
				return "\x1b";
			case ' ':
				return ' ';
			case '"':
				return '"';
			case '/':
				return '/';
			case '\\':
				return '\\';
			case 'N':
				// U+0085 NEXT LINE
				return "\x00\x85";
			case '_':
				// U+00A0 NO-BREAK SPACE
				return "\x00\xA0";
			case 'L':
				// U+2028 LINE SEPARATOR
				return "\x20\x28";
			case 'P':
				// U+2029 PARAGRAPH SEPARATOR
				return "\x20\x29";
			case 'x':
				return this.pack('n', new YamlInline().hexdec(value.substr(2, 2)));
			case 'u':
				return this.pack('n', new YamlInline().hexdec(value.substr(2, 4)));
			case 'U':
				return this.pack('N', new YamlInline().hexdec(value.substr(2, 8)));
		}
	},
	
	/**
	 * @see http://phpjs.org/functions/pack
	 * @warning only modes used above copied
	 */
	 pack: function(B){var g=0,o=1,m="",l="",z=0,p=[],E,s,C,I,h,c;var d,b,x,H,u,e,A,q,D,t,w,a,G,F,y,v,f;while(g<B.length){E=B.charAt(g);s="";g++;while((g<B.length)&&(B.charAt(g).match(/[\d\*]/)!==null)){s+=B.charAt(g);g++}if(s===""){s="1"}switch(E){case"n":if(s==="*"){s=arguments.length-o}if(s>(arguments.length-o)){throw new Error("Warning:  pack() Type "+E+": too few arguments")}for(z=0;z<s;z++){m+=String.fromCharCode(arguments[o]>>8&255);m+=String.fromCharCode(arguments[o]&255);o++}break;case"N":if(s==="*"){s=arguments.length-o}if(s>(arguments.length-o)){throw new Error("Warning:  pack() Type "+E+": too few arguments")}for(z=0;z<s;z++){m+=String.fromCharCode(arguments[o]>>24&255);m+=String.fromCharCode(arguments[o]>>16&255);m+=String.fromCharCode(arguments[o]>>8&255);m+=String.fromCharCode(arguments[o]&255);o++}break;default:throw new Error("Warning:  pack() Type "+E+": unknown format code")}}if(o<arguments.length){throw new Error("Warning: pack(): "+(arguments.length-o)+" arguments unused")}return m}
}

// Regex fragment that matches an escaped character in a double quoted
// string.
// why escape quotes, ffs!
YamlUnescaper.REGEX_ESCAPED_CHARACTER = '\\\\([0abt\tnvfre "\\/\\\\N_LP]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|U[0-9a-fA-F]{8})';
