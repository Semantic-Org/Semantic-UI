/**
 * Yaml offers convenience methods to parse and dump YAML.
 *
 * @author Fabien Potencier <fabien@symfony.com>
 *
 * @api
 */

var YamlRunningUnderNode = false;
var Yaml = function(){};
Yaml.prototype =
{

	/**
	 * Parses YAML into a JS representation.
	 *
	 * The parse method, when supplied with a YAML stream (file),
	 * will do its best to convert YAML in a file into a JS representation.
	 *
	 *	Usage:
	 *	<code>
	 *	 obj = yaml.parseFile('config.yml');
	 *	</code>
	 *
	 * @param string input Path of YAML file
	 *
	 * @return array The YAML converted to a JS representation
	 *
	 * @throws YamlParseException If the YAML is not valid
	 */
	parseFile: function(file /* String */, callback /* Function */)
	{
		if ( callback == null )
		{
			var input = this.getFileContents(file);
			var ret = null;
			try
			{
				ret = this.parse(input);
			}
			catch ( e )
			{
				if ( e instanceof YamlParseException ) {
					e.setParsedFile(file);
				}
				throw e;
			}
			return ret;
		}
		
		this.getFileContents(file, function(data)
		{
			callback(new Yaml().parse(data));
		});
	},

	/**
	 * Parses YAML into a JS representation.
	 *
	 * The parse method, when supplied with a YAML stream (string),
	 * will do its best to convert YAML into a JS representation.
	 *
	 *	Usage:
	 *	<code>
	 *	 obj = yaml.parse(...);
	 *	</code>
	 *
	 * @param string input string containing YAML
	 *
	 * @return array The YAML converted to a JS representation
	 *
	 * @throws YamlParseException If the YAML is not valid
	 */
	parse: function(input /* String */)
	{
		var yaml = new YamlParser();

		return yaml.parse(input);
	},

	/**
	 * Dumps a JS representation to a YAML string.
	 *
	 * The dump method, when supplied with an array, will do its best
	 * to convert the array into friendly YAML.
	 *
	 * @param array	 array JS representation
	 * @param integer inline The level where you switch to inline YAML
	 *
	 * @return string A YAML string representing the original JS representation
    *
    * @api
    */
	dump: function(array, inline, spaces)
	{
		if ( inline == null ) inline = 2;

		var yaml = new YamlDumper();
		if (spaces) {
		    yaml.numSpacesForIndentation = spaces;
		}

		return yaml.dump(array, inline);
	},
	
	getXHR: function()
	{
		if ( window.XMLHttpRequest )
			return new XMLHttpRequest();
		 
		if ( window.ActiveXObject )
		{
			var names = [
			"Msxml2.XMLHTTP.6.0",
			"Msxml2.XMLHTTP.3.0",
			"Msxml2.XMLHTTP",
			"Microsoft.XMLHTTP"
			];
			
			for ( var i = 0; i < 4; i++ )
			{
				try{ return new ActiveXObject(names[i]); }
				catch(e){}
			}
		}
		return null;
	},
	
	getFileContents: function(file, callback)
	{
	    if ( YamlRunningUnderNode )
	    {
	        var fs = require('fs');
	        if ( callback == null )
	        {
	            var data = fs.readFileSync(file);
	            if (data == null) return null;
	            return ''+data;
	        }
	        else
	        {
	            fs.readFile(file, function(err, data)
	            {
	                if (err)
	                    callback(null);
	                else
	                    callback(data);
	            });
	        }
	    }
	    else
	    {
    		var request = this.getXHR();
		
    		// Sync
    		if ( callback == null )
    		{
    			request.open('GET', file, false);                  
    			request.send(null);

    			if ( request.status == 200 || request.status == 0 )
    				return request.responseText;
			
    			return null;
    		}
		
    		// Async
    		request.onreadystatechange = function()
    		{
    			if ( request.readyState == 4 )
    				if ( request.status == 200 || request.status == 0 )
    					callback(request.responseText);
    				else
    					callback(null);
    		};
    		request.open('GET', file, true);                  
    		request.send(null);
	    }
	}
};

var YAML =
{
	/*
	 * @param integer inline The level where you switch to inline YAML
	 */
	 
	stringify: function(input, inline, spaces)
	{
		return new Yaml().dump(input, inline, spaces);
	},
	
	parse: function(input)
	{
		return new Yaml().parse(input);
	},
	
	load: function(file, callback)
	{
		return new Yaml().parseFile(file, callback);
	}
};

// Handle node.js case
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = YAML;
        YamlRunningUnderNode = true;
        
        // Add require handler
        (function () {
            var require_handler = function (module, filename) {
                // fill in result
                module.exports = YAML.load(filename);
            };

            // register require extensions only if we're on node.js
            // hack for browserify
            if ( undefined !== require.extensions ) {
                require.extensions['.yml'] = require_handler;
                require.extensions['.yaml'] = require_handler;
            }
        }());
    }
}

// Handle browser case
if ( typeof(window) != "undefined" )
{
    window.YAML = YAML;
}
