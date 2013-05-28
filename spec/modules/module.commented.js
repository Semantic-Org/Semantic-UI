// # Semantic Modules
// This particular pattern is useful for describing a group of elements which share behavior, for example a modal or a popup.
// The module is made up of three parts: *a group definition*, *a singular definition*, and a *settings object*.
//
// Semantic is unique in that all arbitrary data is a setting. Semantic modules also are self documenting, with module.debug calls serving to explain state, and log performance data.
// [Read more about coding conventions](#)
/*
 * # Semantic Module 1.0
 * http://github.com/quirkyinc/semantic
 *
 *
 * Copyright 2013 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Released: April 17 2013
 */

;(function ( $, window, document, undefined ) {

$.fn.example = function(parameters) {

  // ## Group
  // Some properties remain constant across all instances of a module.
  var
    // Store a reference to the module group, this can be useful to refer to other modules inside each module
    $allModules     = $(this),

    // Extend settings to merge run-time settings with defaults
    settings        = $.extend(true, {}, $.fn.example.settings, parameters),

    // Define namespaces for storing module instance and binding events
    eventNamespace  = '.' + settings.namespace,
    moduleNamespace = 'module-' + settings.namespace,
    // Preserve selector from outside each scope and mark current time for performance tracking
    moduleSelector  = $allModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    // Preserve original arguments to determine if a method is being invoked
    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),
    invokedResponse
  ;

  // ## Singular
  // Iterate over all elements to initialize module
  $allModules
    .each(function() {
      var
        // Cache selectors using selector definitions for access inside instance of module
        $module        = $(this),
        $text          = $module.find(settings.selector.text),

        // Define private variables which can be used to maintain internal state, these cannot be changed from outside the module closure so use conservatively
        foo            = false,

        // Define variables used to track module state. Default values are set using `a || b` syntax
        instance        = $module.data(moduleNamespace),
        element         = this,

        // Alias settings object for convenience and performance
        namespace      = settings.namespace,
        error          = settings.error,
        className      = settings.className,

        // You may also find it useful to alias your own settings
        text           = settings.text,

        module
      ;

      // ## Module Behavior
      module = {

        // ### Required

        // #### Initialize
        // Initialize attaches events and preserves each instance in html metadata
        initialize: function() {
          module.verbose('Initializing module for', element);
          $module
            .on('click' + eventNamespace, module.exampleBehavior)
          ;
          // The instance is just a copy of the module definition, we store it in metadata so we can use it outside of scope, but also define it for immediate use
          instance = module;
          $module
            .data(moduleNamespace, instance)
          ;
        },

        // #### Destroy
        // Removes all events and the instance copy from metadata
        destroy: function() {
          module.verbose('Destroying previous module for', element);
          $module
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
        },

        // #### Refresh
        // Selectors are cached so we sometimes need to manually refresh the cache
        refresh: function() {
          module.verbose('Refreshing selector cache for', element);
          $module = $(element);
          $text   = $(this).find(settings.selector.text);
        },

        // ### Custom
        // #### By Event
        // Sometimes it makes sense to call an event handler by its type if it is dependent on the event to behave properly
        event: {
          click: function(event) {
            module.verbose('Preventing default action');
            if( !$module.hasClass(className.disabled) ) {
              module.behavior();
            }
            event.preventDefault();
          }
        },

        // #### By Function
        // Other times events make more sense for methods to be called by their function if it is ambivalent to how it is invoked
        behavior: function() {
          module.debug('Changing the text to a new value', text);
          if( !module.has.text() ) {
            module.set.text( text);
          }
        },

        // #### Vocabulary
        // Custom methods should be defined with consistent vocabulary some useful terms: "has", "set", "get", "change", "add", "remove"
        //
        // This makes it easier for new developers to get to know your module without learning your schema
        has: {
          text: function(state) {
            module.verbose('Checking whether text state exists', state);
            if( text[state] === undefined ) {
              module.error(error.noText);
              return false;
            }
            return true;
          }
        },

        set: {
          text: function(state) {
            module.verbose('Setting text to new state', state);
            if( module.has.text(state) ) {
              $text
                .text( text[state] )
              ;
              settings.onChange();
            }
          }
        },

        // ### Standard

        // #### Setting
        // Module settings can be read or set using this method
        //
        // Settings can either be specified by modifying the module defaults, by initializing the module with a settings object, or by changing a setting by invoking this method
        // `$(.foo').example('setting', 'moduleName');`
        setting: function(name, value) {
          if(value !== undefined) {
            if( $.isPlainObject(name) ) {
              $.extend(true, settings, name);
            }
            else {
              settings[name] = value;
            }
          }
          else {
            return settings[name];
          }
        },

        // #### Internal
        // Module internals can be set or retrieved as well
        // `$(.foo').example('internal', 'behavior', function() { // do something });`
        internal: function(name, value) {
          if(value !== undefined) {
            if( $.isPlainObject(name) ) {
              $.extend(true, module, name);
            }
            else {
              module[name] = value;
            }
          }
          else {
            return module[name];
          }
        },

        // #### Debug
        // Debug pushes arguments to the console formatted as a debug statement
        debug: function() {
          if(settings.debug) {
            module.performance.log(arguments[0]);
            module.debug = Function.prototype.bind.call(console.info, console, settings.moduleName + ':');
          }
        },

        // #### Verbose
        // Calling verbose internally allows for additional data to be logged which can assist in debugging
        verbose: function() {
          if(settings.verbose && settings.debug) {
            module.performance.log(arguments[0]);
            module.verbose = Function.prototype.bind.call(console.info, console, settings.moduleName + ':');
          }
        },

        // #### Error
        // Error allows for the module to report named error messages, it may be useful to modify this to push error messages to the user. Error messages are defined in the modules settings object.
        error: function() {
          if(console.log !== undefined) {
            module.error = Function.prototype.bind.call(console.log, console, settings.moduleName + ':');
          }
        },
        // #### Performance
        // This is called on each debug statement and logs the time since the last debug statement.
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime,
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({ 
                'Name'           : message, 
                'Execution Time' : executionTime
              });
              clearTimeout(module.performance.timer);
              module.performance.timer = setTimeout(module.performance.display, 100);
            }
          },
          // Performance data is assumed to be complete 500ms after the last log message receieved
          display: function() {
            var
              title              = settings.moduleName,
              caption            = settings.moduleName + ': ' + moduleSelector + '(' + $allModules.size() + ' elements)',
              totalExecutionTime = 0
            ;
            if(moduleSelector) {
              title += ' Performance (' + moduleSelector + ')';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                $.each(performance, function(index, data) {
                  totalExecutionTime += data['Execution Time'];
                });
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  totalExecutionTime += data['Execution Time'];
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.log('Total Execution Time:', totalExecutionTime +'ms');
              console.groupEnd();
              performance = [];
              time        = false;
            }
          }
        },

        // #### Invoke
        // Invoke is used to lookup and invoke a method or property by a dot notation string definition, for example
        // `$('.foo').example('invoke', 'set.text', 'Foo')`
        invoke: function(query, passedArguments, context) {
          var
            maxDepth,
            found
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
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
          return found || false;
        }
      };

      // ### Determining Intent

      // Invoking a method directly
      //     $('.foo').module('set.text', 'Ho hum');
      // The module checks to see if you passed in a method name to call
      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        invokedResponse = module.invoke(query);
      }
      // If you didn't pass in anything it can assume you are initializing the module
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  // If you called invoke, you may have a returned value which shoudl be returned, otherwise allow the call to chain
  return (invokedResponse)
    ? invokedResponse
    : this
  ;
};

// ## Settings
// It is necessary to include a settings object which specifies the defaults for your module
$.fn.example.settings = {

  // ### Required
  // Used in debug statements to refer to the module itself
  moduleName  : 'Example Module',
  // Whether debug content should be outputted to console
  debug       : true,
  // Whether extra debug content should be outputted
  verbose     : false,
  // Whether to track performance data
  performance : false,
  // A unique identifier used to namespace events,and preserve the module instance
  namespace   : 'example',
  // ### Optional

  // Selectors used by your module
  selector    : {
    example : '.example'
  },
  // Error messages returned by the module
  error: {
    noText : 'The text you tried to display has not been defined.',    method : 'The method you called is not defined.'
  },
  // Class names which your module refers to
  className   : {
    disabled : 'disabled'
  },
  // Metadata stored or retrieved by your module. `$('.foo').data('value');`
  metadata: {
    notUsed: 'notUsed'
  },
  // ### Callbacks
  // Callbacks are often useful to include in your settings object
  onChange     : function() {},
  // ### Definition Specific
  // You may also want to include settings specific to your module's function
  text: {
    hover : 'You are hovering me now',
    click : 'You clicked on me'
  }

};


})( jQuery, window , document );