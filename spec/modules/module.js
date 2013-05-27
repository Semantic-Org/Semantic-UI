;(function ( $, window, document, undefined ) {

$.fn.example = function(parameters) {
  var
    $allModules     = $(this),

    settings        = $.extend(true, {}, $.fn.example.settings, parameters),

    eventNamespace  = '.' + settings.namespace,
    moduleNamespace = 'module-' + settings.namespace,

    selector        = $allModules.selector || '',
    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),
    invokedResponse
  ;

  $allModules
    .each(function() {
      var
        $module        = $(this),
        $text          = $module.find(settings.selector.text),

        foo            = false,

        instance        = $module.data(moduleNamespace),
        element         = this,

        namespace      = settings.namespace,
        error          = settings.error,
        className      = settings.className,

        text           = settings.text,

        module
      ;

      module = {
        initialize: function() {
          module.verbose('Initializing module for', element);
          $module
            .on('click' + eventNamespace, module.exampleBehavior)
          ;
          instance = module;
          $module
            .data(moduleNamespace, instance)
          ;
        },
        destroy: function() {
          module.verbose('Destroying previous module for', element);
          $module
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
        },
        refresh: function() {
          module.verbose('Refreshing selector cache for', element);
          $module = $(element);
          $text   = $(this).find(settings.selector.text);
        },
        event: {
          click: function(event) {
            module.verbose('Preventing default action');
            if( !$module.hasClass(className.disabled) ) {
              module.behavior();
            }
            event.preventDefault();
          }
        },
        behavior: function() {
          module.debug('Changing the text to a new value', text);
          if( !module.has.text() ) {
            module.set.text( text);
          }
        },
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
        debug: function() {
          if(settings.debug) {
            module.performance.log(arguments[0]);
            module.debug = Function.prototype.bind.call(console.info, console, settings.moduleName + ':');
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            module.performance.log(arguments[0]);
            module.verbose = Function.prototype.bind.call(console.info, console, settings.moduleName + ':');
          }
        },
        error: function() {
          if(console.log !== undefined) {
            module.error = Function.prototype.bind.call(console.log, console, settings.moduleName + ':');
          }
        },
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
          display: function() {
            var
              title              = settings.moduleName + ' Performance (' + selector + ')',
              caption            = settings.moduleName + ': ' + selector + '(' + $allModules.size() + ' elements)',
              totalExecutionTime = 0
            ;
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title );
              if(console.table) {
                $.each(performance, function(index, data) {
                  totalExecutionTime += data['Execution Time'];
                });
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  totalExecutionTime += data['Execution Time'];
                });
              }
              console.log('Total Execution Time:', totalExecutionTime);
              console.groupEnd();
              performance = [];
              time        = false;
            }
          }
        },
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

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        invokedResponse = module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }

    })
  ;

  return (invokedResponse)
    ? invokedResponse
    : this
  ;
};

$.fn.example.settings = {

  moduleName  : 'Example Module',
  debug       : true,
  verbose     : false,
  performance : false,
  namespace   : 'example',

  selector    : {
    example : '.example'
  },

  error: {
    noText : 'The text you tried to display has not been defined.',    method : 'The method you called is not defined.'
  },

  className   : {
    disabled : 'disabled'
  },

  metadata: {
    notUsed: 'notUsed'
  },

  onChange     : function() {},

  text: {
    hover : 'You are hovering me now',
    click : 'You clicked on me'
  }

};


})( jQuery, window , document );