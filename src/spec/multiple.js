/*  *******************************************************************************************

  Example Boilerplate - Multiple Instances

  Version 0.1

  Author        : Jack Lukic
  Last revision : April 2013

*********************************************************************************************  */

;(function ( $, window, document, undefined ) {

$.fn.example = function(parameters) {
  var
    // store a reference to the module group, this can be useful to refer to other modules inside each module
    $allModules    = $(this),

    // extend settings to merge run time settings with defaults
    settings       = $.extend(true, {}, $.fn.example.settings, parameters),
    
    // define namespaces for modules
    eventNamespace  = '.' + settings.namespace,
    moduleNamespace = 'module-' + settings.namespace,

    // preserve original arguments to determine if a method is being invoked
    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),
    invokedResponse
  ;

  // iterate over all elements to initialize module
  $allModules
    .each(function() {
      var
        // cache selectors using selector definitions for access inside instance of module 
        $module        = $(this),
        $text          = $module.find(settings.selector.text),
        
        // define private variables which can be used to maintain internal state
        foo            = false,
        
        // define variables used to track module state. In semantic modules default values are set using 'a || b' syntax
        selector        = $module.selector || '',
        instance        = $module.data(moduleNamespace),
        element         = this,
        
        // alias settings object for convenience and performance
        namespace      = settings.namespace,
        error          = settings.error,
        className      = settings.className,

        // you may also find it useful to alias your own settings
        text           = settings.text,

        module
      ;

      // define the entire module
      module = {

        // initialize attaches events and preserves each instance in html metadata
        initialize: function() {
          module.verbose('Initializing module for', element);
          $module
            .on('click' + eventNamespace, module.exampleBehavior)
          ;          
          // the instance is just a copy of the module definition, we store it in metadata so we can use it outside of scope, but also define it for immediate use
          instance = module;
          $module
            .data(moduleNamespace, instance)
          ;
        },

        // destroy removes all events and the instance from metadata
        destroy: function() {
          module.verbose('Destroying previous module for', element);
          $module
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
        },

        // selectors are cached so we need a method to manually refresh the cache
        refresh: function() {
          module.verbose('Refreshing selector cache for', element);
          $module = $(element);
          $text   = $(this).find(settings.selector.text);
        },

        exampleBehavior: function(event) {

        },

        // all of your module's specific behavior goes here. In this example our module can only get and set text of a child node
        has: {
          text: function(state) {
            return (text[state] !== undefined);
          }
        },

        set: {
          text: function(state) {
            if( module.has.text(state) ) {
              $text
                .text( text[state] )
              ; 
            }
          }
        },

        // module settings can be read or set using this method
        setting: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value === undefined) {
            return settings[name];
          }
          else {
            settings[name] = value;
          }
        },

        // verbose allows for additional data to be logged by the module which can assist in debugging
        verbose: function() {
          if(settings.verbose) {
            module.debug.apply(this, arguments);
          }
        },

        // debug pushes arguments to the console formatted as a debug statement
        debug: function() {
          var
            output    = [],
            message   = settings.moduleName + ': ' + arguments[0],
            variables = [].slice.call( arguments, 1 ),
            log       = console.info || console.log || function(){}
          ;
          log = Function.prototype.bind.call(log, console);
          if(settings.debug) {
            output.push(message);
            log.apply(console, output.concat(variables) );
          }
        },

        // error allows for the module to report named error messages
        error: function() {
          var
            output       = [],
            errorMessage = settings.moduleName + ': ' + arguments[0],
            variables    = [].slice.call( arguments, 1 ),
            log          = console.warn || console.log || function(){}
          ;
          log = Function.prototype.bind.call(log, console);
          if(settings.debug) {
            output.push(errorMessage);
            output.concat(variables);
            log.apply(console, output.concat(variables) );
          }
        },

        // invoke is used to lookup and invoke a method or property by its dot notation string definition
        invoke: function(query, passedArguments, context) {
          var
            maxDepth,
            found
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          // invoke iterates through the module instance looking for methods or properties that match the requested query
          if(typeof query == 'string' && instance !== undefined) {
            query    = query.split('.');
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              if( $.isPlainObject( instance[value] ) && (depth != maxDepth) ) {
                instance = instance[value];
                return true;
              }
              else if( instance[value] !== undefined ) {
                found = instance[value];
                return true;
              }
              module.error(error.method);
              return false;
            });
          }
          if ( $.isFunction( found ) ) {
            module.verbose('Executing invoked function', found);
            return found.apply(context, passedArguments);
          }
          // return retrieved variable or chain
          return found || false;
        }
      };

      // the module checks to see if you passed in a method name to call
      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        invokedResponse = module.invoke(query);
      }
      // if you didn't pass in anything it can assume you are initializing the module
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      } 
    })
  ;

  // if you called invoke, you may have a returned value which shoudl be returned, otherwise allow the call to chain
  return (invokedResponse)
    ? invokedResponse
    : this
  ;
};

// After you define your plugin, its necessary to include a settings object which specifies the defaults for your module
$.fn.example.settings = {

  // used in debug statements to refer to the module itself
  moduleName : 'Todo Module',

  // whether debug content should be outputted to console
  debug      : true,

  // whether extra debug content should be outputted
  verbose    : true,

  // a unique identifier used to namespace events, and preserve the module instance
  namespace  : 'example',

  // callbacks are often useful to include in your settings object
  onChange     : function() {},

  // you may also want to include settings specific to your module's function
  text: {
    hover: 'You are hovering me now',
    click: 'You clicked on me'
  },

  // error messages returned by the module
  error: {
    side   : 'You tried to switch to a side that does not exist.',
    method : 'The method you called is not defined'
  },

  // class names which your module refers to
  className   : {
    active    : 'active'
  },

  // metadata stored by your module
  metadata: {

  },

  // selectors used by your module 
  selector    : {
    example : '.example'
  }

};


})( jQuery, window , document );
