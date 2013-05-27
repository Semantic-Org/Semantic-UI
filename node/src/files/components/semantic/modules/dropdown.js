/*  ******************************
  Semantic Module: Checkbox
  Author: Jack Lukic
  Notes: First Commit MAy 25, 2013

  Simple plug-in which maintains the state for ui dropdown

******************************  */

;(function ( $, window, document, undefined ) {

$.fn.dropdown = function(parameters) {
  var
    $allModules     = $(this),
    $document       = $(document),
    
    settings        = $.extend(true, {}, $.fn.dropdown.settings, parameters),

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
        $menu         = $(this).find(settings.selector.menu),
        
        isTouchDevice = ('ontouchstart' in document.documentElement),
        
        selector      = $module.selector || '',
        element       = this,
        instance      = $module.data('module-' + settings.namespace),
        
        className     = settings.className,
        namespace     = settings.namespace,
        animation     = settings.animation,

        errors        = settings.errors,
        module
      ;

      module      = {

        initialize: function() {
          if(settings.context && selector !== '') {
            module.verbose('Initializing dropdown with delegated events', $module);
            $(element, settings.context)
              .on(selector, 'click' + eventNamespace, module.toggle)
              .data(moduleNamespace, module)
            ;
          }
          else {
            module.verbose('Initializing dropdown with bound events', $module);
            
            $module
              .on(module.get.event() + eventNamespace, module.toggle)
            ;

            $module
              .data(moduleNamespace, module)
            ;
          }
        },

        intent: {

          test: function(event) {
            module.debug('Checking if click was inside the dropdown', event.target);
            if( $(event.target).closest($module).size() == 0 ) {
              module.hide();
            }
          },

          bind: function() {
            module.verbose('Binding hide intent event to document');
            $(document)
              .on('click', module.intent.test)
            ;
          },

          unbind: function() {
            module.verbose('Removing hide intent event from document');
            $document
              .off('click')
            ;
          }

        },

        get: {

          event: function() {
            if(isTouchDevice) {
              return 'touchstart';
            }
            if(settings.on == 'hover') {
              return 'hover';
            }
            else if(settings.on == 'click') {
              return 'click';
            }
          }

        },

        can: {
          click: function() {
            return (isTouchDevice || settings.on == 'click');
          },
          show: function() {
            return !$module.hasClass(className.disabled);
          }
        },

        destroy: function() {
          module.verbose('Destroying previous dropdown for', $module);
          $module
            .off(namespace)
          ;
        },

        animate: {
          show: function() {
            if(animation.show == 'show') {
              $menu
                .show()
              ;
            }
            else if(animation.show == 'slide') {
              $menu
                .children()
                  .css('opacity', 0)
                  .delay(100)
                  .animate({
                    opacity : 1
                  }, 300, 'easeOutQuad')
                  .end()
                .slideDown(200, 'easeOutQuad')
              ;
            }
          },
          hide: function() {
            console.log(animation.hide);
            if(animation.hide == 'hide') {
              $menu
                .hide()
              ;
            }
            else if(animation.hide == 'slide') {
              $menu
                .children()
                  .css('opacity', 1)
                  .animate({
                    opacity : 0
                  }, 300, 'easeOutQuad')
                  .end()
                .delay(100)
                .slideUp(200, 'easeOutQuad')
              ;
            }
          }
        },

        show: function() {
          module.debug('Showing dropdown');
          $module
            .addClass(className.active)
          ;
          module.animate.show();
          if( module.can.click() ) {
            module.intent.bind();
          }
          $.proxy(settings.onChange, $menu.get())();
          $.proxy(settings.onShow, $menu.get())();
        },

        hide: function() {
          module.debug('Hiding dropdown');
          $module
            .removeClass(className.active)
          ;
          if( module.can.click() ) {
            module.intent.unbind();
          }
          module.animate.hide();
          $.proxy(settings.onChange, $menu.get())();
          $.proxy(settings.onHide, $menu.get())();
        },

        toggle: function() {
          if(module.can.show() && $menu.is(':not(:visible)') ) {
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
                'Element'        : element,
                'Name'           : message, 
                'Execution Time' : executionTime
              });
              clearTimeout(module.performance.timer);
              module.performance.timer = setTimeout(module.performance.display, 100);
            }
          },
          display: function() {
            var
              title              = settings.moduleName,
              caption            = settings.moduleName + ': ' + selector + '(' + $allModules.size() + ' elements)',
              totalExecutionTime = 0
            ;
            if(selector) {
              title += 'Performance (' + selector + ')';
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

$.fn.dropdown.settings = {

  moduleName  : 'Dropdown Module',
  namespace   : 'dropdown',
  
  verbose     : true,
  debug       : true,
  performance : false,

  animation: {
    show: 'slide',
    hide: 'slide'
  },
  
  on          : 'click',

  onChange    : function(){},
  onShow      : function(){},
  onHide      : function(){},
  
  errors      : {
    method   : 'The method you called is not defined.'
  },

  selector : {
    menu  : '.menu'
  },

  className : {
    active : 'visible'
  }

};

})( jQuery, window , document );
