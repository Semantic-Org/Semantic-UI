
/**
 * YamlInline implements a YAML parser/dumper for the YAML inline syntax.
 */
var YamlInline = function(){};
YamlInline.prototype =
{
	i: null,
	
	/**
	 * Convert a YAML string to a JS object.
	 *
	 * @param string value A YAML string
	 *
	 * @return object A JS object representing the YAML string
	 */
	parse: function(value)
	{
		var result = null;
		value = this.trim(value);

		if ( 0 == value.length )
		{
			return '';
		}

		switch ( value.charAt(0) )
		{
			case '[':
				result = this.parseSequence(value);
				break;
			case '{':
				result = this.parseMapping(value);
				break;
			default:
				result = this.parseScalar(value);
		}

		// some comment can end the scalar
		if ( value.substr(this.i+1).replace(/^\s*#.*$/, '') != '' ) {
		    console.log("oups "+value.substr(this.i+1));
			throw new YamlParseException('Unexpected characters near "'+value.substr(this.i)+'".');
		}

		return result;
	},

	/**
	 * Dumps a given JS variable to a YAML string.
	 *
	 * @param mixed value The JS variable to convert
	 *
	 * @return string The YAML string representing the JS object
	 */
	dump: function(value)
	{
		if ( undefined == value || null == value )
			return 'null';	
		if ( value instanceof Date)
			return value.toISOString();
		if ( typeof(value) == 'object')
			return this.dumpObject(value);
		if ( typeof(value) == 'boolean' )
			return value ? 'true' : 'false';
		if ( /^\d+$/.test(value) )
			return typeof(value) == 'string' ? "'"+value+"'" : parseInt(value);
		if ( this.isNumeric(value) )
			return typeof(value) == 'string' ? "'"+value+"'" : parseFloat(value);
		if ( typeof(value) == 'number' )
			return value == Infinity ? '.Inf' : ( value == -Infinity ? '-.Inf' : ( isNaN(value) ? '.NAN' : value ) );
		var yaml = new YamlEscaper();
		if ( yaml.requiresDoubleQuoting(value) )
			return yaml.escapeWithDoubleQuotes(value);
		if ( yaml.requiresSingleQuoting(value) )
			return yaml.escapeWithSingleQuotes(value);
		if ( '' == value )
			return "";
		if ( this.getTimestampRegex().test(value) )
			return "'"+value+"'";
		if ( this.inArray(value.toLowerCase(), ['null','~','true','false']) )
			return "'"+value+"'";
		// default
			return value;
	},

	/**
	 * Dumps a JS object to a YAML string.
	 *
	 * @param object value The JS array to dump
	 *
	 * @return string The YAML string representing the JS object
	 */
	dumpObject: function(value)
	{
		var keys = this.getKeys(value);
		var output = null;
		var i;
		var len = keys.length;

		// array
		if ( value instanceof Array )
			/*( 1 == len && '0' == keys[0] )
			||
			( len > 1 && this.reduceArray(keys, function(v,w){return Math.floor(v+w);}, 0) == len * (len - 1) / 2) )*/
		{
			output = [];
			for ( i = 0; i < len; i++ )
			{
				output.push(this.dump(value[keys[i]]));
			}

			return '['+output.join(', ')+']';
		}

		// mapping
		output = [];
		for ( i = 0; i < len; i++ )
		{
			output.push(this.dump(keys[i])+': '+this.dump(value[keys[i]]));
		}

		return '{ '+output.join(', ')+' }';
	},

	/**
	 * Parses a scalar to a YAML string.
	 *
	 * @param scalar scalar
	 * @param string delimiters
	 * @param object stringDelimiters
	 * @param integer i
	 * @param boolean evaluate
	 *
	 * @return string A YAML string
	 *
	 * @throws YamlParseException When malformed inline YAML string is parsed
	 */
	parseScalar: function(scalar, delimiters, stringDelimiters, i, evaluate)
	{
		if ( delimiters == undefined ) delimiters = null;
		if ( stringDelimiters == undefined ) stringDelimiters = ['"', "'"];
		if ( i == undefined ) i = 0;
		if ( evaluate == undefined ) evaluate = true;
		
		var output = null;
		var pos = null;
		var matches = null;
		
		if ( this.inArray(scalar[i], stringDelimiters) )
		{
			// quoted scalar
			output = this.parseQuotedScalar(scalar, i);
			i = this.i;
			if (null !== delimiters) {
				var tmp = scalar.substr(i).replace(/^\s+/, '');
				if (!this.inArray(tmp.charAt(0), delimiters)) {
					throw new YamlParseException('Unexpected characters ('+scalar.substr(i)+').');
				}
			}
		}
		else
		{
			// "normal" string
			if ( !delimiters )
			{
				output = (scalar+'').substring(i);
				
				i += output.length;

				// remove comments
				pos = output.indexOf(' #');
				if ( pos != -1 )
				{
					output = output.substr(0, pos).replace(/\s+$/g,'');
				}
			}
			else if ( matches = new RegExp('^(.+?)('+delimiters.join('|')+')').exec((scalar+'').substring(i)) )
			{
				output = matches[1];
				i += output.length;
			}
			else
			{
				throw new YamlParseException('Malformed inline YAML string ('+scalar+').');
			}
			output = evaluate ? this.evaluateScalar(output) : output;
		}

		this.i = i;
		
		return output;
	},

	/**
	 * Parses a quoted scalar to YAML.
	 *
	 * @param string	scalar
	 * @param integer i
	 *
	 * @return string A YAML string
	 *
	 * @throws YamlParseException When malformed inline YAML string is parsed
	 */
	parseQuotedScalar: function(scalar, i)
	{
		var matches = null;
		//var item = /^(.*?)['"]\s*(?:[,:]|[}\]]\s*,)/.exec((scalar+'').substring(i))[1];
		
		if ( !(matches = new RegExp('^'+YamlInline.REGEX_QUOTED_STRING).exec((scalar+'').substring(i))) )
		{
			throw new YamlParseException('Malformed inline YAML string ('+(scalar+'').substring(i)+').');
		}

		var output = matches[0].substr(1, matches[0].length - 2);
		
		var unescaper = new YamlUnescaper();

		if ( '"' == (scalar+'').charAt(i) )
		{
			output = unescaper.unescapeDoubleQuotedString(output);
		}
		else
		{
			output = unescaper.unescapeSingleQuotedString(output);
		}

		i += matches[0].length;

		this.i = i;
		return output;
	},

	/**
	 * Parses a sequence to a YAML string.
	 *
	 * @param string sequence
	 * @param integer i
	 *
	 * @return string A YAML string
	 *
	 * @throws YamlParseException When malformed inline YAML string is parsed
	 */
	parseSequence: function(sequence, i)
	{
		if ( i == undefined ) i = 0;
		
		var output = [];
		var len = sequence.length;
		i += 1;

		// [foo, bar, ...]
		while ( i < len )
		{
			switch ( sequence.charAt(i) )
			{
				case '[':
					// nested sequence
					output.push(this.parseSequence(sequence, i));
					i = this.i;
					break;
				case '{':
					// nested mapping
					output.push(this.parseMapping(sequence, i));
					i = this.i;
					break;
				case ']':
					this.i = i;
					return output;
				case ',':
				case ' ':
					break;
				default:
					var isQuoted = this.inArray(sequence.charAt(i), ['"', "'"]);
					var value = this.parseScalar(sequence, [',', ']'], ['"', "'"], i);
					i = this.i;
					
					if ( !isQuoted && (value+'').indexOf(': ') != -1 )
					{
						// embedded mapping?
						try
						{
							value = this.parseMapping('{'+value+'}');
						}
						catch ( e )
						{
							if ( !(e instanceof YamlParseException ) ) throw e;
							// no, it's not
						}
					}

					output.push(value);

					i--;
			}

			i++;
		}

		throw new YamlParseException('Malformed inline YAML string "'+sequence+'"');
	},

	/**
	 * Parses a mapping to a YAML string.
	 *
	 * @param string mapping
	 * @param integer i
	 *
	 * @return string A YAML string
	 *
	 * @throws YamlParseException When malformed inline YAML string is parsed
	 */
	parseMapping: function(mapping, i)
	{
		if ( i == undefined ) i = 0;
		var output = {};
		var len = mapping.length;
		i += 1;
		var done = false;
		var doContinue = false;

		// {foo: bar, bar:foo, ...}
		while ( i < len )
		{
			doContinue = false;
			
			switch ( mapping.charAt(i) )
			{
				case ' ':
				case ',':
					i++;
					doContinue = true;
					break;
				case '}':
					this.i = i;
					return output;
			}
			
			if ( doContinue ) continue;

			// key
			var key = this.parseScalar(mapping, [':', ' '], ['"', "'"], i, false);
			i = this.i;

			// value
			done = false;
			while ( i < len )
			{
				switch ( mapping.charAt(i) )
				{
					case '[':
						// nested sequence
						output[key] = this.parseSequence(mapping, i);
						i = this.i;
						done = true;
						break;
					case '{':
						// nested mapping
						output[key] = this.parseMapping(mapping, i);
						i = this.i;
						done = true;
						break;
					case ':':
					case ' ':
						break;
					default:
						output[key] = this.parseScalar(mapping, [',', '}'], ['"', "'"], i);
						i = this.i;
						done = true;
						i--;
				}

				++i;

				if ( done )
				{
					doContinue = true;
					break;
				}
			}
			
			if ( doContinue ) continue;
		}

		throw new YamlParseException('Malformed inline YAML string "'+mapping+'"');
	},

	/**
	 * Evaluates scalars and replaces magic values.
	 *
	 * @param string scalar
	 *
	 * @return string A YAML string
	 */
	evaluateScalar: function(scalar)
	{
		scalar = this.trim(scalar);
		
		var raw = null;
		var cast = null;

		if (	( 'null' == scalar.toLowerCase() ) ||
				( '' == scalar ) ||
				( '~' == scalar ) )
			return null;
		if ( (scalar+'').indexOf('!str ') == 0 )
			return (''+scalar).substring(5);
		if ( (scalar+'').indexOf('! ') == 0 )
			return parseInt(this.parseScalar((scalar+'').substr(2)));
		if ( /^\d+$/.test(scalar) )
		{
			raw = scalar;
			cast = parseInt(scalar);
			return '0' == scalar.charAt(0) ? this.octdec(scalar) : (( ''+raw == ''+cast ) ? cast : raw);
		}
		if ( 'true' == (scalar+'').toLowerCase() )
			return true;
		if ( 'false' == (scalar+'').toLowerCase() )
			return false;
		if ( this.isNumeric(scalar) )
			return '0x' == (scalar+'').substr(0, 2) ? this.hexdec(scalar) : parseFloat(scalar);
		if ( scalar.toLowerCase() == '.inf' )
			return Infinity;
		if ( scalar.toLowerCase() == '.nan' )
			return NaN;
		if ( scalar.toLowerCase() == '-.inf' )
			return -Infinity;
		if ( /^(-|\+)?[0-9,]+(\.[0-9]+)?$/.test(scalar) )
			return parseFloat(scalar.split(',').join(''));
		if ( this.getTimestampRegex().test(scalar) )
			return new Date(this.strtotime(scalar));
		//else
			return ''+scalar;
	},

	/**
	 * Gets a regex that matches an unix timestamp
	 *
	 * @return string The regular expression
	 */
	getTimestampRegex: function()
	{
		return new RegExp('^'+
		'([0-9][0-9][0-9][0-9])'+
		'-([0-9][0-9]?)'+
		'-([0-9][0-9]?)'+
		'(?:(?:[Tt]|[ \t]+)'+
		'([0-9][0-9]?)'+
		':([0-9][0-9])'+
		':([0-9][0-9])'+
		'(?:\.([0-9]*))?'+
		'(?:[ \t]*(Z|([-+])([0-9][0-9]?)'+
		'(?::([0-9][0-9]))?))?)?'+
		'$','gi');
	},
	
	trim: function(str /* String */)
	{
		return (str+'').replace(/^\s+/,'').replace(/\s+$/,'');
	},
	
	isNumeric: function(input)
	{
		return (input - 0) == input && input.length > 0 && input.replace(/\s+/g,'') != '';
	},
	
	inArray: function(key, tab)
	{
		var i;
		var len = tab.length;
		for ( i = 0; i < len; i++ )
		{
			if ( key == tab[i] ) return true;
		}
		return false;
	},
	
	getKeys: function(tab)
	{
		var ret = [];
		
		for ( var name in tab )
		{
			if ( tab.hasOwnProperty(name) )
			{
				ret.push(name);
			}
		}
		
		return ret;
	},
	
	/*reduceArray: function(tab, fun)
	{
		var len = tab.length;
		if (typeof fun != "function")
			throw new YamlParseException("fun is not a function");
		
		// no value to return if no initial value and an empty array
		if (len == 0 && arguments.length == 1)
			throw new YamlParseException("empty array");
		
		var i = 0;
		if (arguments.length >= 2)
		{
			var rv = arguments[1];
		}
		else
		{
			do
			{
				if (i in tab)
				{
					rv = tab[i++];
					break;
				}
		
				// if array contains no values, no initial value to return
				if (++i >= len)
					throw new YamlParseException("no initial value to return");
			}
			while (true);
		}

		for (; i < len; i++)
		{
			if (i in tab)
				rv = fun.call(null, rv, tab[i], i, tab);
		}

		return rv;
	},*/
	
	octdec: function(input)
	{
	    return parseInt((input+'').replace(/[^0-7]/gi, ''), 8);
	},
	
	hexdec: function(input)
	{
		input = this.trim(input);
		if ( (input+'').substr(0, 2) == '0x' ) input = (input+'').substring(2);
	    return parseInt((input+'').replace(/[^a-f0-9]/gi, ''), 16);
	},
	
	/**
	 * @see http://phpjs.org/functions/strtotime
	 * @note we need timestamp with msecs so /1000 removed
	 * @note original contained binary | 0 (wtf?!) everywhere, which messes everything up 
	 */
	strtotime: function (h,b){var f,c,g,k,d="";h=(h+"").replace(/\s{2,}|^\s|\s$/g," ").replace(/[\t\r\n]/g,"");if(h==="now"){return b===null||isNaN(b)?new Date().getTime()||0:b||0}else{if(!isNaN(d=Date.parse(h))){return d||0}else{if(b){b=new Date(b)}else{b=new Date()}}}h=h.toLowerCase();var e={day:{sun:0,mon:1,tue:2,wed:3,thu:4,fri:5,sat:6},mon:["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"]};var a=function(i){var o=(i[2]&&i[2]==="ago");var n=(n=i[0]==="last"?-1:1)*(o?-1:1);switch(i[0]){case"last":case"next":switch(i[1].substring(0,3)){case"yea":b.setFullYear(b.getFullYear()+n);break;case"wee":b.setDate(b.getDate()+(n*7));break;case"day":b.setDate(b.getDate()+n);break;case"hou":b.setHours(b.getHours()+n);break;case"min":b.setMinutes(b.getMinutes()+n);break;case"sec":b.setSeconds(b.getSeconds()+n);break;case"mon":if(i[1]==="month"){b.setMonth(b.getMonth()+n);break}default:var l=e.day[i[1].substring(0,3)];if(typeof l!=="undefined"){var p=l-b.getDay();if(p===0){p=7*n}else{if(p>0){if(i[0]==="last"){p-=7}}else{if(i[0]==="next"){p+=7}}}b.setDate(b.getDate()+p);b.setHours(0,0,0,0)}}break;default:if(/\d+/.test(i[0])){n*=parseInt(i[0],10);switch(i[1].substring(0,3)){case"yea":b.setFullYear(b.getFullYear()+n);break;case"mon":b.setMonth(b.getMonth()+n);break;case"wee":b.setDate(b.getDate()+(n*7));break;case"day":b.setDate(b.getDate()+n);break;case"hou":b.setHours(b.getHours()+n);break;case"min":b.setMinutes(b.getMinutes()+n);break;case"sec":b.setSeconds(b.getSeconds()+n);break}}else{return false}break}return true};g=h.match(/^(\d{2,4}-\d{2}-\d{2})(?:\s(\d{1,2}:\d{2}(:\d{2})?)?(?:\.(\d+))?)?$/);if(g!==null){if(!g[2]){g[2]="00:00:00"}else{if(!g[3]){g[2]+=":00"}}k=g[1].split(/-/g);k[1]=e.mon[k[1]-1]||k[1];k[0]=+k[0];k[0]=(k[0]>=0&&k[0]<=69)?"20"+(k[0]<10?"0"+k[0]:k[0]+""):(k[0]>=70&&k[0]<=99)?"19"+k[0]:k[0]+"";return parseInt(this.strtotime(k[2]+" "+k[1]+" "+k[0]+" "+g[2])+(g[4]?g[4]:""),10)}var j="([+-]?\\d+\\s(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday)|(last|next)\\s(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday))(\\sago)?";g=h.match(new RegExp(j,"gi"));if(g===null){return false}for(f=0,c=g.length;f<c;f++){if(!a(g[f].split(" "))){return false}}return b.getTime()||0}
	 
};

/*
 * @note uses only non-capturing sub-patterns (unlike PHP original)
 */
YamlInline.REGEX_QUOTED_STRING = '(?:"(?:[^"\\\\]*(?:\\\\.[^"\\\\]*)*)"|\'(?:[^\']*(?:\'\'[^\']*)*)\')';

