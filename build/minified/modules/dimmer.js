/*  ******************************
  Semantic Module: Dimmer
  Author: Jack Lukic
  Notes: First Commit May 30, 2013

  Simple plug-in which maintains the state for ui dimmer

******************************  */

;(function ( $, window, document, undefined ) {

$.fn.dimmer = function(parameters) {
  var
    $allModules     = $(this),
    $document       = $(document),

    settings        = $.extend(true, {}, $.fn.dimmer.settings, parameters),

    eventNamespace  = '.' + settings.namespace,
    moduleNamespace = 'module-' + settings.namespace,
    moduleSelector  = $allModules.selector || '',

    selector        = $allModules.selector || '',
    time            = new Date().getTime(),
    performance     = [],

    namespace       = settings.namespace,
    className       = settings.className,
    errors          = settings.errors,

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),
    invokedResponse,
    allModules
  ;

  $allModules
    .each(function() {
      var
        $module   = $(this),
        $dimmer   = $module.children(selector.dimmer),

        element   = this,
        instance  = $module.data('module-' + namespace),
        module
      ;

      module      = {

        initialize: function() {
          if( $module.is(settings.selector.dimmer) ) {
            $dimmer = $module;
          }
          else {
            if($dimmer.size() === 0) {
              module.create();
            }
            $dimmer = $module.find(selector.dimmer);
          }
          module.debug('Module initialized with dimmer', $dimmer);
        },

        destroy: function() {
          module.verbose('Destroying previous module for', $module);
          $module
            .off(namespace)
          ;
        },

        animate: {
          show: function() {
            if(settings.animation.show == 'css') {
              $dimmer
                .addClass(className.active)
              ;
            }
            else if(settings.animation.show == 'fade') {
              $dimmer
                .fadeTo(settings.duration, settings.opacity)
              ;
            }
          },
          hide: function() {
            if(settings.animation.show == 'css') {
              $dimmer
                .addClass(className.active)
              ;
            }
            else if(settings.animation.show == 'fade') {
              $dimmer
                .fadeOut(settings.duration)
              ;
            }
            else if( $.isFunction(settings.animation.hide) ) {
              $.proxy(settings.animation.hide, $dimmer)();
            }
          }
        },

        is: {
          enabled: function() {
            return !$module.hasClass(className.disabled);
          },
          disabled: function() {
            return $module.hasClass(className.disabled);
          },
          visible: function() {
            return $dimmer.is(':visible');
          },
          hidden: function() {
            return $dimmer.is(':not(:visible)');
          }
        },

        can: {
          show: function() {
            return !$dimmer.hasClass(className.disabled);
          }
        },

        show: function() {
          module.debug('Showing dimmer', $dimmer);
          if( !module.is.visible() && module.is.enabled() ) {
            module.animate.show();
            $.proxy(settings.onShow, $module.get())();
            $.proxy(settings.onChange, $module.get())();
          }
        },

        hide: function() {
          if( !module.is.hidden() ) {
            module.debug('Hiding dimmer', $dimmer);
            module.animate.hide();
            $.proxy(settings.onHide, $module.get())();
            $.proxy(settings.onChange, $module.get())();
          }
        },

        toggle: function() {
          module.verbose('Toggling dimmer visibility', $dimmer);
          if( module.is.hidden() ) {
            module.show();
          }
          else {
            module.hide();
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
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.moduleName + ':');
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.moduleName + ':');
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.log, console, settings.moduleName + ':');
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
                'Element'        : element,
                'Name'           : message[0],
                'Arguments'      : message[1] || 'None',
                'Execution Time' : executionTime
              });
              clearTimeout(module.performance.timer);
              module.performance.timer = setTimeout(module.performance.display, 100);
            }
          },
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
              module.error(errors.method);
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
        if(instance === undefined) {
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

$.fn.dimmer.settings = {

  moduleName  : 'Dimmer Module',
  namespace   : 'dimmer',

  verbose     : true,
  debug       : true,
  performance : false,

  animation   : {
    show: 'css',
    hide: 'css'
  },

  duration : 500,
  opacity  : 0.85,

  onChange : function(){},
  onShow   : function(){},
  onHide   : function(){},

  errors   : {
    method   : 'The method you called is not defined.'
  },

  selector: {
    dimmer  : '.ui.dimmer'
  },

  className : {
    dimmed   : 'dimmed',
    active   : 'active',
    disabled : 'disabled'
  }

};

})( jQuery, window , document );