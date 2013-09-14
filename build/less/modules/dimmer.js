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

    selector        = settings.selector,
    namespace       = settings.namespace,
    className       = settings.className,
    error           = settings.error,

    eventNamespace  = '.' + namespace,
    moduleNamespace = 'module-' + namespace,
    moduleSelector  = $allModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),
    clickEvent      = ('ontouchstart' in document.documentElement)
      ? 'touchstart'
      : 'click',

    invokedResponse
  ;

  $allModules
    .each(function() {
      var
        $module      = $(this),
        $dimmer      = $module.children(selector.dimmer).first(),

        element      = this,
        instance     = $dimmer.data(moduleNamespace),
        module
      ;

      module      = {

        initialize: function() {
          if( module.is.dimmer() ) {
            $dimmer = $module;
            $module = $dimmer.parent();
            module.debug('Module initialized as dimmer', settings);
          }
          else {
            if( module.has.dimmer() ) {
              $dimmer = $module.children(selector.dimmer).first();
              module.debug('Module initialized with found dimmer', settings);
            }
            else {
              module.create();
              module.debug('Module initialized with created dimmer', settings);
            }
            if(settings.on == 'hover') {
              $module
                .on('mouseenter' + eventNamespace, module.show)
                .on('mouseleave' + eventNamespace, module.hide)
              ;
            }
            else if(settings.on == 'click') {
              $module
                .on(clickEvent + eventNamespace, module.toggle)
              ;
            }
          }
          if(settings.closable) {
            $dimmer
              .on(clickEvent, module.event.click)
            ;
          }
          module.set.dimmable();
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module');
          instance = module;
          $dimmer
            .data(moduleNamespace, instance)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module');
          $module
            .off(eventNamespace)
          ;
        },

        event: {

          click: function(event) {
            module.verbose('Determining if event occured on dimmer', event);
            if( $dimmer.find(event.target).size() === 0 || $(event.target).is(selector.content) ) {
              module.hide();
              event.stopImmediatePropagation();
            }
          }

        },

        create: function() {
          $dimmer = settings.template.dimmer();
          $dimmer
            .appendTo($module)
          ;
          if(module.is.page()) {
            module.set.pageDimmer();
          }
        },

        animate: {
          show: function(callback) {
            callback = callback || function(){};
            module.set.dimmed();
            if($.fn.transition !== undefined) {
              $dimmer
                .transition(settings.transition + ' in', settings.duration, function() {
                  module.set.active();
                  callback();
                })
              ;
            }
            else {
              module.verbose('Showing dimmer animation with javascript');
              $dimmer
                .stop()
                .css({
                  opacity : 0,
                  width   : '100%',
                  height  : '100%'
                })
                .fadeTo(settings.duration, 1, function() {
                  $dimmer.removeAttr('style');
                  module.set.active();
                  callback();
                })
              ;
            }
          },
          hide: function(callback) {
            callback = callback || function(){};
            module.remove.dimmed();
            if($.fn.transition !== undefined) {
              module.verbose('Hiding dimmer with css');
              $dimmer
                .transition(settings.transition + ' out', settings.duration, function() {
                  module.remove.active();
                  callback();
                })
              ;
            }
            else {
              module.verbose('Hiding dimmer with javascript');
              $dimmer
                .stop()
                .fadeOut(settings.duration, function() {
                  $dimmer.removeAttr('style');
                  module.remove.active();
                  callback();
                })
              ;
            }
          }
        },

        has: {
          dimmer: function() {
            return ( $module.children(selector.dimmer).size() > 0 );
          }
        },

        is: {
          active: function() {
            return $dimmer.hasClass(className.active);
          },
          animating: function() {
            return ( $dimmer.hasClass(className.show) || $dimmer.hasClass(className.hide) || $dimmer.is(':animated') );
          },
          dimmer: function() {
            return $module.is(selector.dimmer);
          },
          page: function () {
            return $module.is('body');
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
          pageDimmer: function() {
            return $dimmer.hasClass(className.pageDimmer);
          }
        },

        can: {
          show: function() {
            return !$dimmer.hasClass(className.disabled);
          }
        },

        set: {
          active: function() {
            $dimmer
              .removeClass(className.transition)
              .addClass(className.active)
            ;
          },
          dimmable: function() {
            $module
              .addClass(className.dimmable)
            ;
          },
          dimmed: function() {
            $module.addClass(className.dimmed);
          },
          pageDimmer: function() {
            $dimmer.addClass(className.pageDimmer);
          },
          disabled: function() {
            $dimmer.addClass(className.disabled);
          }
        },

        remove: {
          active: function() {
            $dimmer
              .removeClass(className.transition)
              .removeClass(className.active)
            ;
          },
          dimmed: function() {
            $module.removeClass(className.dimmed);
          },
          disabled: function() {
            $dimmer.removeClass(className.disabled);
          }
        },

        show: function(callback) {
          module.debug('Showing dimmer', $dimmer);
          if( (!module.is.active() || module.is.animating() ) && module.is.enabled() ) {
            module.animate.show(callback);
            $.proxy(settings.onShow, element)();
            $.proxy(settings.onChange, element)();
          }
          else {
            module.debug('Dimmer is already shown or disabled');
          }
        },

        hide: function(callback) {
          if( module.is.active() || module.is.animating() ) {
            module.debug('Hiding dimmer', $dimmer);
            module.animate.hide(callback);
            $.proxy(settings.onHide, element)();
            $.proxy(settings.onChange, element)();
          }
          else {
            module.debug('Dimmer is not visible');
          }
        },

        toggle: function() {
          module.verbose('Toggling dimmer visibility', $dimmer);
          if( !module.is.active() ) {
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
              module.debug.apply(console, arguments);
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
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.moduleName + ':');
          module.error.apply(console, arguments);
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
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Element'        : element,
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if($allModules.size() > 1) {
              title += ' ' + '(' + $allModules.size() + ')';
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
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && instance !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( instance[value] ) && (depth != maxDepth) ) {
                instance = instance[value];
              }
              else if( $.isPlainObject( instance[camelCaseValue] ) && (depth != maxDepth) ) {
                instance = instance[camelCaseValue];
              }
              else if( instance[value] !== undefined ) {
                found = instance[value];
                return false;
              }
              else if( instance[camelCaseValue] !== undefined ) {
                found = instance[camelCaseValue];
                return false;
              }
              else {
                module.error(error.method);
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(invokedResponse)) {
            invokedResponse.push(response);
          }
          else if(typeof invokedResponse == 'string') {
            invokedResponse = [invokedResponse, response];
          }
          else if(response !== undefined) {
            invokedResponse = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (invokedResponse !== undefined)
    ? invokedResponse
    : this
  ;
};

$.fn.dimmer.settings = {

  name        : 'Dimmer',
  namespace   : 'dimmer',

  verbose     : true,
  debug       : true,
  performance : true,

  transition  : 'fade',

  on          : false,
  closable    : true,
  duration    : 500,

  onChange    : function(){},
  onShow      : function(){},
  onHide      : function(){},

  error   : {
    method   : 'The method you called is not defined.'
  },

  selector: {
    dimmable : '.ui.dimmable',
    dimmer   : '.ui.dimmer',
    content  : '.ui.dimmer > .content, .ui.dimmer > .content > .center'
  },

  template: {
    dimmer: function() {
     return $('<div />').attr('class', 'ui dimmer');
    }
  },

  className : {
    active     : 'active',
    animating  : 'animating',
    dimmable   : 'ui dimmable',
    dimmed     : 'dimmed',
    disabled   : 'disabled',
    pageDimmer : 'page',
    hide       : 'hide',
    show       : 'show',
    transition : 'transition hidden visible'
  }

};

})( jQuery, window , document );