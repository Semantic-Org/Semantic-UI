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

    settings        = ( $.isPlainObject(parameters) )
      ? $.extend(true, {}, $.fn.dimmer.settings, parameters)
      : $.fn.dimmer.settings,

    eventNamespace  = '.' + settings.namespace,
    moduleNamespace = 'module-' + settings.namespace,
    moduleSelector  = $allModules.selector || '',
    moduleCount     = $allModules.size(),

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    selector        = settings.selector,
    namespace       = settings.namespace,
    className       = settings.className,
    error           = settings.error,

    invokedResponse
  ;

  $allModules
    .each(function() {
      var
        $module      = $(this),
        $dimmer      = $module.children(selector.dimmer).first(),

        animationEnd = 'animationend msAnimationEnd oAnimationEnd webkitAnimationEnd',

        element      = this,
        instance     = $dimmer.data('module-' + namespace),
        module
      ;

      module      = {

        initialize: function() {
          if( module.is.dimmer() ) {
            $dimmer = $module;
            $module = $dimmer.parent();
            module.debug('Module initialized as dimmer', $dimmer);
          }
          else if( module.is.pageDimmer() ) {
            $dimmer = $module;
            $module = $('body');
            module.debug('Initializing page dimmer', $dimmer);
          }
          else {
            if( module.has.dimmer() ) {
              $dimmer = $module.find(selector.dimmer);
              module.debug('Module initialized with found dimmer', $dimmer);
            }
            else {
              $dimmer = settings.template.dimmer();
              $dimmer
                .appendTo($module)
              ;
              module.debug('Module initialized with created dimmer', $dimmer);
            }
          }
          if(settings.closable) {
            $dimmer
              .on('click', module.event.click)
            ;
          }
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module');
          instance = module;
          $dimmer
            .data('module-' + namespace, instance)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module for', $module);
          $module
            .off(namespace)
          ;
        },

        event: {

          click: function(event) {
            module.verbose('Determining if event occured on dimmer', event);
            if( event.target == element ) {
              module.hide();
            }
          }

        },

        animate: {
          show: function() {
            module.set.dimmed();
            if(settings.animation.show == 'css') {
              module.verbose('Showing dimmer animation with css');
              $dimmer
                .one(animationEnd, function() {
                  $dimmer.removeClass(className.show);
                  module.set.active();
                })
                .addClass(className.show)
              ;
            }
            else if(settings.animation.show == 'fade') {
              module.verbose('Showing dimmer animation with javascript');
              $dimmer
                .stop()
                .css({
                  opacity : 0,
                  width   : '100%',
                  height  : '100%'
                })
                .fadeTo(settings.duration, 1, module.set.active)
              ;
            }
          },
          hide: function() {
            module.remove.dimmed();
            if(settings.animation.hide == 'css') {
              module.verbose('Hiding dimmer with css');
              $dimmer
                .one(animationEnd, function(){
                  module.remove.active();
                  $dimmer.removeClass(className.hide);
                })
                .addClass(className.hide)
              ;
            }
            else if(settings.animation.hide == 'fade') {
              module.verbose('Hiding dimmer with javascript');
              $dimmer
                .stop()
                .fadeOut(settings.duration, function() {
                  $dimmer.removeAttr('style');
                  module.remove.active();
                })
              ;
            }
            else if( $.isFunction(settings.animation.hide) ) {
              $.proxy(settings.animation.hide, $dimmer)();
            }
          }
        },

        has: {
          dimmer: function() {
            return ( $module.children(selector.dimmer).size() > 0 );
          }
        },

        is: {
          animating: function() {
            return ( $dimmer.hasClass(className.show) || $dimmer.hasClass(className.hide) || $dimmer.is(':animated') );
          },
          dimmer: function() {
            return $module.is(selector.dimmer);
          },

          dimmable: function() {
            return $module.is(selector.dimmable);
          },
          enabled: function() {
            return !$module.hasClass(className.disabled);
          },
          disabled: function() {
            return $module.hasClass(className.disabled);
          },
          active: function() {
            return $dimmer.hasClass(className.active);
          },
          pageDimmer: function() {
            return $dimmer.is(selector.pageDimmer);
          }
        },

        can: {
          show: function() {
            return !$dimmer.hasClass(className.disabled);
          }
        },

        set: {
          active: function() {
            $dimmer.addClass(className.active);
          },
          dimmed: function() {
            $module.addClass(className.dimmed);
          },
          disabled: function() {
            $dimmer.addClass(className.disabled);
          }
        },

        remove: {
          active: function() {
            $dimmer.removeClass(className.active);
          },
          dimmed: function() {
            $module.removeClass(className.dimmed);
          },
          disabled: function() {
            $dimmer.removeClass(className.disabled);
          }
        },

        show: function() {
          module.debug('Showing dimmer', $dimmer);
          if( !module.is.active() && module.is.enabled() ) {
            module.animate.show();
            $.proxy(settings.onShow, element)();
            $.proxy(settings.onChange, element)();
          }
          else {
            module.debug('Dimmer is already shown or disabled');
          }
        },

        hide: function() {
          if( module.is.active() ) {
            module.debug('Hiding dimmer', $dimmer);
            module.animate.hide();
            $.proxy(settings.onHide, element)();
            $.proxy(settings.onChange, element)();
          }
          else {
            module.debug('Dimmer is not visible');
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
                'Arguments'      : message[1] || '',
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.moduleName + ':',
              totalTime = 0
            ;
            time        = false;
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
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
              }
              else if( instance[value] !== undefined ) {
                found = instance[value];
              }
              else {
                module.error(error.method);
              }
            });
          }
          if ( $.isFunction( found ) ) {
            instance.verbose('Executing invoked function', found);
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

  moduleName  : 'Dimmer',
  namespace   : 'dimmer',

  verbose     : true,
  debug       : true,
  performance : true,

  animation   : {
    show: 'fade',
    hide: 'fade'
  },

  closable : true,
  duration : 500,

  onChange : function(){},
  onShow   : function(){},
  onHide   : function(){},

  error   : {
    method   : 'The method you called is not defined.'
  },

  selector: {
    dimmable   : '.ui.dimmable',
    dimmer     : '.ui.dimmer',
    pageDimmer : '.ui.page.dimmer'
  },

  template: {
    dimmer: function() {
     return $('<div />').attr('class', 'ui dimmer');
    }
  },

  className : {
    active    : 'active',
    dimmed    : 'dimmed',
    disabled  : 'disabled',
    animating : 'animating',
    hide      : 'hide',
    show      : 'show'
  }

};

})( jQuery, window , document );