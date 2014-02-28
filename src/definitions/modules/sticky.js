/*
 * # Semantic - Sticky
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2013 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

$.fn.sticky = function(parameters) {
  var
    $allModules    = $(this),
    moduleSelector = $allModules.selector || '',

    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),
    returnedValue
  ;

  $allModules
    .each(function() {
      var
        settings        = $.extend(true, {}, $.fn.sticky.settings, parameters),

        className       = settings.className,
        namespace       = settings.namespace,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        $module         = $(this),
        $window         = $(window),
        $container      = $module.offsetParent(),
        $context,

        selector        = $module.selector || '',
        instance        = $module.data(moduleNamespace),

        requestAnimationFrame = window.requestAnimationFrame
          || window.mozRequestAnimationFrame
          || window.webkitRequestAnimationFrame
          || window.msRequestAnimationFrame
          || function(callback) { setTimeout(callback, 0); },

        element         = this,
        module
      ;

      module      = {

        initialize: function() {
          module.verbose('Initializing sticky', settings);

          if(settings.context) {
            $context = $(settings.context);
          }
          else {
            $context = $container;
          }

          $window
            .on('resize' + eventNamespace, module.event.resize)
            .on('scroll' + eventNamespace, module.event.scroll)
          ;

          module.save.positions();

          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module');
          module.reset();
          $module
            .removeData(moduleNamespace)
          ;
        },

        event: {
          resize: function() {
            requestAnimationFrame(module.refresh);
          },
          scroll: function() {
            requestAnimationFrame(function() {
              module.stick();
              $.proxy(settings.onScroll, element)();
            });
          }
        },

        refresh: function() {
          module.reset();
          module.save.positions();
          $.proxy(settings.onReposition, element)();
        },

        save: {
          scroll: function(scroll) {
            module.lastScroll = scroll;
          },
          positions: function() {
            var
              window = {
                height: $window.height()
              },
              element = {
                margin: {
                  top    : parseInt($module.css('margin-top'), 10),
                  bottom : parseInt($module.css('margin-bottom'), 10),
                },
                offset : $module.offset(),
                width  : $module.outerWidth(),
                height : $module.outerHeight()
              },
              context = {
                offset: $context.offset(),
                height: $context.outerHeight()
              }
            ;
            module.cache = {
              fits : ( element.height < $window.height() ),
              window: {
                height: window.height
              },
              element: {
                margin : element.margin,
                top    : element.offset.top - element.margin.top,
                width  : element.width,
                height : element.height,
                bottom : element.offset.top + element.height
              },
              context: {
                top    : context.offset.top,
                height : context.height,
                bottom : context.offset.top + context.height
              }
            };
            module.set.containerSize();
            module.set.size();
            module.stick();
            module.debug('Caching element positions', module.cache);
          }
        },

        get: {
          direction: function(scroll) {
            var
              direction = 'down'
            ;
            scroll = scroll || $window.scrollTop();
            if(module.lastScroll !== undefined) {
              if(module.lastScroll < scroll) {
                direction = 'down';
              }
              else if(module.lastScroll > scroll) {
                direction = 'up';
              }
            }
            return direction;
          },
          currentOffset: function() {
            return ( module.is.top() )
                ? parseInt($module.css('top'), 10) || 0
                : parseInt($module.css('bottom'), 10) || 0
            ;
          },
          offsetChange: function(scroll) {
            scroll = scroll || $window.scrollTop();
            return (module.lastScroll)
              ? Math.abs(scroll - module.lastScroll)
              : 0
            ;
          },
          newOffset: function(scroll) {
            scroll = scroll || $window.scrollTop();
            var
              currentOffset = module.get.currentOffset(),
              delta         = module.get.offsetChange(scroll)
            ;
            return Math.abs(currentOffset - delta);
          }
        },

        set: {
          containerSize: function() {
            if($module.is(':visible') && $container.get(0).tagName === 'HTML') {
              module.error(error.container);
            }
            else {
              module.debug('Settings container size', module.cache.context.height);
              $container.height(module.cache.context.height);
            }
          },
          size: function() {
            $module
              .css({
                width: module.cache.element.width,
                height: module.cache.element.height
              })
            ;
          }
        },

        is: {
          top: function() {
            return $module.hasClass(className.top);
          },
          bottom: function() {
            return $module.hasClass(className.bottom);
          },
          bound: function() {
            return $module.hasClass(className.bound);
          },
          fixed: function() {
            return $module.hasClass(className.fixed);
          }
        },

        stick: function() {
          var
            cache          = module.cache,
            fits           = cache.fits,
            element        = cache.element,
            window         = cache.window,
            context        = cache.context,
            scrollTop      = $window.scrollTop(),
            screen           = {
              top    : scrollTop + settings.offset,
              bottom : scrollTop + window.height + settings.offset
            },
            direction      = module.get.direction(scrollTop),
            currentOffset  = module.get.currentOffset(),
            newOffset      = module.get.newOffset(scrollTop),
            elementPassed  = (screen.bottom > element.top + element.height),
            bottomEdge     = (cache.element.height + screen.top)
          ;
          module.save.scroll(scrollTop);
          if( module.is.fixed() ) {
            if(fits) {
              // exit top of container
              if(module.is.top()) {
                if( screen.top < element.top ) {
                  module.unfix();
                }
              }
              if(module.is.bottom() ) {
                // top edge
                if( (screen.bottom - element.height) < element.top) {
                  module.unfix();
                }
                // bottom edge
                else if(screen.bottom > context.bottom) {
                  module.bindBottom();
                }
              }
              // exit bottom of container
              if( bottomEdge > context.bottom ) {
                module.bindBottom();
              }
            }
            else {
              if(screen.bottom > context.bottom) {
                module.bindBottom();
              }
              else if(elementPassed) {
                if(module.is.top() && direction == 'down') {
                  module.debug('Stuck content at bottom edge');
                  if(newOffset >= (element.height - window.height)) {
                    $module
                      .css('top', '')
                    ;
                    module.stickBottom();
                  }
                  else {
                    $module
                      .css('top', -newOffset)
                    ;
                  }
                }
                if(module.is.bottom() && direction == 'up') {
                  module.debug('Stuck content at top edge');
                  if(newOffset >= (element.height - window.height)) {
                    $module
                      .css('bottom', '')
                    ;
                    module.stickTop();
                  }
                  else {
                    $module
                      .css('bottom', -newOffset)
                    ;
                  }
                }
              }
              else {
                module.unfix();
              }
            }
          }
          else {
            if(fits) {
              // fix to bottom of screen on way back up
              if(module.is.bottom() ) {
                if(settings.pushing) {
                  if(module.is.bound() && screen.bottom < context.bottom ) {
                    module.stickBottom();
                  }
                }
                else {
                  if(module.is.bound() && screen.top < context.bottom - element.height) {
                    module.stickTop();
                  }
                }
              }
              else if(screen.top > element.top && screen.top < context.bottom - element.height) {
                module.stickTop();
              }
            }
            else {
              if(elementPassed && screen.bottom < context.bottom ) {
                module.stickBottom();
              }
            }

          }
        },

        bindTop: function() {
          module.debug('Binding element to top of parent container');
          $module
            .removeClass(className.fixed)
            .removeClass(className.bottom)
            .addClass(className.bound)
            .addClass(className.top)
          ;
          $.proxy(settings.onTop, element)();
          $.proxy(settings.onUnstick, element)();
        },
        bindBottom: function() {
          module.debug('Binding element to bottom of parent container');
          $module
            .removeClass(className.fixed)
            .removeClass(className.top)
            .addClass(className.bound)
            .addClass(className.bottom)
          ;
          $.proxy(settings.onBottom, element)();
          $.proxy(settings.onUnstick, element)();
        },

        stickTop: function() {
          module.debug('Fixing element to top of page');
          $module
            .removeClass(className.bound)
            .removeClass(className.bottom)
            .addClass(className.fixed)
            .addClass(className.top)
          ;
          $.proxy(settings.onStick, element)();
        },

        stickBottom: function() {
          module.debug('Sticking element to bottom of page');
          $module
            .removeClass(className.bound)
            .removeClass(className.top)
            .addClass(className.fixed)
            .addClass(className.bottom)
          ;
          $.proxy(settings.onStick, element)();
        },

        unbind: function() {
          module.debug('Removing absolute position on element');
          $module
            .removeClass(className.bound)
            .removeClass(className.top)
            .removeClass(className.bottom)
          ;
        },

        unfix: function() {
          module.debug('Removing fixed position on element');
          $module
            .removeClass(className.fixed)
            .removeClass(className.top)
            .removeClass(className.bottom)
          ;
          $.proxy(settings.onUnstick, this)();
        },

        reset: function() {
          module.debug('Reseting elements position');
          module.unbind();
          module.unfix();
          $module
            .css({
              top    : '',
              bottom : '',
              width  : '',
              height : ''
            })
          ;
        },

        setting: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
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
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
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
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
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
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
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
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
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

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.sticky.settings = {

  name         : 'Sticky',
  namespace    : 'sticky',

  verbose      : true,
  debug        : true,
  performance  : true,

  pushing      : false,

  context      : false,
  offset       : 0,

  onReposition : function(){},
  onScroll     : function(){},
  onStick      : function(){},
  onUnstick    : function(){},
  onTop        : function(){},
  onBottom     : function(){},

  error     : {
    container: 'Sticky element must be inside a relative container',
    method   : 'The method you called is not defined.'
  },

  className : {
    bound  : 'bound',
    fixed  : 'fixed',
    top    : 'top',
    bottom : 'bottom'
  }

};

})( jQuery, window , document );
