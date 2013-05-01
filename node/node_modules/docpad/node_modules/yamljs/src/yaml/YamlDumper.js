
/**
 * YamlDumper dumps JS variables to YAML strings.
 *
 * @author Fabien Potencier <fabien@symfony.com>
 */
var YamlDumper = function(){};
YamlDumper.prototype =
{
	/**
	 * Dumps a JS value to YAML.
	 *
	 * @param	mixed	 input	The JS value
	 * @param	integer inline The level where you switch to inline YAML
	 * @param	integer indent The level o indentation indentation (used internally)
	 *
	 * @return string	The YAML representation of the JS value
	 */
	dump: function(input, inline, indent)
	{
		if ( inline == null ) inline = 0;
		if ( indent == null ) indent = 0;
		var output = '';
		var prefix = indent ? this.strRepeat(' ', indent) : '';
		var yaml;
		if (!this.numSpacesForIndentation) this.numSpacesForIndentation = 2;

		if ( inline <= 0 || !this.isObject(input) || this.isEmpty(input) )
		{
			yaml = new YamlInline();
			output += prefix + yaml.dump(input);
		}
		else
		{
			var isAHash = !this.arrayEquals(this.getKeys(input), this.range(0,input.length - 1));
			var willBeInlined;
			
			for ( var key in input )
			{
				if ( input.hasOwnProperty(key) )
				{
					willBeInlined = inline - 1 <= 0 || !this.isObject(input[key]) || this.isEmpty(input[key]);
					
					if ( isAHash ) yaml = new YamlInline();
					
					output += 
						prefix + '' +
						(isAHash ? yaml.dump(key)+':' : '-') + '' +
						(willBeInlined ? ' ' : "\n") + '' +
						this.dump(input[key], inline - 1, (willBeInlined ? 0 : indent + this.numSpacesForIndentation)) + '' +
						(willBeInlined ? "\n" : '');
				}
			}
		}

		return output;
	},
	
	strRepeat: function(str /* String */, count /* Integer */)
	{
		var i;
		var result = '';
		for ( i = 0; i < count; i++ ) result += str;
		return result;
	},
	
	isObject: function(input)
	{
		return this.isDefined(input) && typeof(input) == 'object';
	},
	
	isEmpty: function(input)
	{
		var ret = input == undefined || input == null || input == '' || input == 0 || input == "0" || input == false;
		if ( !ret && typeof(input) == "object" && !(input instanceof Array)){
			var propCount = 0;
			for ( var key in input )
				if ( input.hasOwnProperty(key) ) propCount++;
			ret = !propCount;
		}
		return ret;
	},
	
	isDefined: function(input)
	{
		return input != undefined && input != null;
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
	
	range: function(start, end)
	{
		if ( start > end ) return [];
		
		var ret = [];
		
		for ( var i = start; i <= end; i++ )
		{
			ret.push(i);
		}
		
		return ret;
	},
	
	arrayEquals: function(a,b)
	{
		if ( a.length != b.length ) return false;
		
		var len = a.length;
		
		for ( var i = 0; i < len; i++ )
		{
			if ( a[i] != b[i] ) return false;
		}
		
		return true;
	}
};
