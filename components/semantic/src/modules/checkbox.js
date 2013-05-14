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
    // make arguments available
    query           = arguments[0],
    passedArguments = [].slice.call(arguments, 1),
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
        methodInvoked = (typeof query == 'string'),
        
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
              .on(selector, 'click.' + namespace, module.toggle)
            ;
          }
          else {
            module.verbose('Initializing checkbox with bound events', $module);
            $module
              .on('click.' + namespace, module.toggle)
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

        enableAll: function() {
          module.debug('Disabling all checkbox');
          $.each($allModules, function() {
            $(this).checkbox('enable');
          });
        },
        disableAll: function() {
          module.debug('Enabling all checkbox');
          $.each($allModules, function() {
            $(this).checkbox('disable');
          });
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

        /* standard module */
        setting: function(name, value) {
          if(value === undefined) {
            return settings[name];
          }
          settings[name] = value;
        },
        verbose: function() {
          if(settings.verbose) {
            module.debug.apply(this, arguments);
          }
        },
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
        invoke: function(query, context, passedArguments) {
          var
            maxDepth,
            found
          ;
          passedArguments = passedArguments || [].slice.call( arguments, 2 );
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
              module.error(errors.method);
              return false;
            });
          }
          if ( $.isFunction( found ) ) {
            return found.apply(context, passedArguments);
          }
          // return retrieved variable or chain
          return found;
        }
      };

      // check for invoking internal method
      if(methodInvoked) {
        invokedResponse = module.invoke(query, this, passedArguments);
      }
      // otherwise initialize
      else {
        module.initialize();
      }

    })
  ;
  // chain or return queried method
  return (invokedResponse !== undefined)
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
