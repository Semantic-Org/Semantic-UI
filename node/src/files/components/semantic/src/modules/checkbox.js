/*  ******************************
  Semantic Module: Checkbox
  Author: Jack Lukic
  Notes: First Commit March 25, 2013

  Simple plug-in which maintains the state for ui checkbox
  This can be done without javascript, only in instances 
  where each checkbox is assigned a unique ID. This provides a separate
  programmatic option when that is not possible.

******************************  */

;(function ( $, window, document, undefined ) {

$.fn.checkbox = function(parameters) {
  var
    $allModules     = $(this),
    
    settings        = $.extend(true, {}, $.fn.checkbox.settings, parameters),

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
        $module       = $(this),
        $input        = $(this).find(settings.selector.input),

        selector      = $module.selector || '',
        element       = this,
        instance      = $module.data('module-' + settings.namespace),
        
        className     = settings.className,
        namespace     = settings.namespace,
        errors        = settings.errors,
        module
      ;

      module      = {

        initialize: function() {
          if(settings.context && selector !== '') {
            module.verbose('Initializing checkbox with delegated events', $module);
            $(element, settings.context)
              .on(selector, 'click' + eventNamespace, module.toggle)
              .data(moduleNamespace, module)
            ;
          }
          else {
            module.verbose('Initializing checkbox with bound events', $module);
            $module
              .on('click' + eventNamespace, module.toggle)
              .data(moduleNamespace, module)
            ;
          }
        },

        destroy: function() {
          module.verbose('Destroying previous module for', $module);
          $module
            .off(namespace)
          ;
        },

        toggle: function() {
          if( $input.prop('checked') === undefined || !$input.prop('checked') ) {
            module.enable();
          }
          else {
            module.disable();
          }
        },
        
        enable: function() {
          module.debug('Enabling checkbox');
          $module
            .addClass(className.active)
          ;
          $input
            .prop('checked', true)
          ;
          $.proxy(settings.onChange, $input.get())();
          $.proxy(settings.onEnable, $input.get())();
        },

        disable: function() {
          module.debug('Disabling checkbox');
          $module
            .removeClass(className.active)
          ;
          $input
            .prop('checked', false)
          ;
          $.proxy(settings.onChange, $input.get())();
          $.proxy(settings.onDisable, $input.get())();
        },

        all: {
          enable: function() {
            module.debug('Enabling all checkbox');
            $allModules
              .checkbox('enable')
            ;
          },
          disable: function() {
            module.debug('Disabling all checkbox');
            $allModules
              .checkbox('toggle')
            ;
          },
          toggle: function() {
            module.debug('Toggling all checkbox');
            $allModules
              .checkbox('toggle')
            ;
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
            module.verbose = Function.prototype.bind.call(console.info, console, settings.moduleName + ':');
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

      // check for invoking internal method
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
  // chain or return queried method
  return (invokedResponse)
    ? invokedResponse
    : this
  ;
};

$.fn.checkbox.settings = {

  // module info
  moduleName : 'Checkbox Module',
  verbose    : false,
  debug      : true,
  namespace  : 'checkbox',

  // delegated event context
  context    : false,
  
  onChange   : function(){},
  onEnable   : function(){},
  onDisable  : function(){},
  
  // errors
  errors     : {
    method   : 'The method you called is not defined.'
  },

  selector : {
    input  : 'input'
  },

  className : {
    active : 'active'
  }

};

})( jQuery, window , document );
