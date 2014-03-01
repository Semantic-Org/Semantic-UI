/*
 * # Semantic - Visibility
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2013 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

$.fn.visibility = function(parameters) {
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
        settings        = $.extend(true, {}, $.fn.visibility.settings, parameters),

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
          module.verbose('Initializing visibility', settings);

          module.reset();
          module.save.position();
          module.bindEvents();
          module.instantiate();

          setTimeout(module.checkVisibility, settings.loadWait);
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
          $window
            .off(eventNamespace)
          ;
          $module
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        bindEvents: function() {
          $window
            .on('resize', module.event.refresh)
            .on('scroll', module.event.scroll)
          ;
        },

        event: {
          refresh: function() {
            requestAnimationFrame(module.refresh);
          },
          scroll: function() {
            requestAnimationFrame(module.checkVisibility);
          }
        },

        refresh: function() {
          module.save.position();
          module.checkVisibility();
          $.proxy(settings.onRefresh, element)();
        },

        reset: function() {
          module.cache = {
            screen  : {},
            element : {}
          };
        },

        checkVisibility: function() {
          module.verbose('Updating visibility of element', module.cache.element);
          module.save.scroll();
          module.save.direction();
          module.save.screenCalculations();
          module.save.elementCalculations();

          module.passed();
          module.passing();
          module.topVisible();
          module.bottomVisible();
          module.topPassed();
          module.bottomPassed();
        },

        passing: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            screen       = module.get.screenCalculations(),
            callback     = newCallback || settings.onPassing
          ;
          if(newCallback) {
            module.debug('Adding callback for passing', newCallback);
            settings.onPassing = newCallback;
          }
          if(callback && calculations.passing) {
            $.proxy(callback, element)(calculations, screen);
          }
          else {
            return calculations.passing;
          }
        },

        passed: function(amount, newCallback) {
          var
            calculations   = module.get.elementCalculations(),
            amountInPixels
          ;
          // assign callback
          if(amount !== undefined && newCallback !== undefined) {
            settings.onPassed[amount] = newCallback;
          }
          else if(amount !== undefined) {
            return (module.get.pixelsPassed(amount) > calculations.pixelsPassed);
          }
          else if(calculations.passing) {
            $.each(settings.onPassed, function(amount, callback) {
              if(calculations.bottomVisible || calculations.pixelsPassed > module.get.pixelsPassed(amount)) {
                callback();
              }
            });
          }
        },

        topVisible: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            screen       = module.get.screenCalculations(),
            callback     = newCallback || settings.onTopVisible
          ;
          if(newCallback) {
            module.debug('Adding callback for top visible', newCallback);
            settings.onTopVisible = newCallback;
          }
          if(callback && calculations.topVisible) {
            $.proxy(callback, element)(calculations, screen);
          }
          else {
            return calculations.topVisible;
          }
        },

        bottomVisible: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            screen       = module.get.screenCalculations(),
            callback     = newCallback || settings.onBottomVisible
          ;
          if(newCallback) {
            module.debug('Adding callback for bottom visible', newCallback);
            settings.onBottomVisible = newCallback;
          }
          if(callback && calculations.bottomVisible) {
            $.proxy(callback, element)(calculations, screen);
          }
          else {
            return calculations.bottomVisible;
          }
        },

        topPassed: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            screen       = module.get.screenCalculations(),
            callback     = newCallback || settings.onTopPassed
          ;
          if(newCallback) {
            module.debug('Adding callback for top passed', newCallback);
            settings.onTopPassed = newCallback;
          }
          if(callback && calculations.topPassed) {
            $.proxy(callback, element)(calculations, screen);
          }
          else {
            return calculations.topPassed;
          }
        },

        bottomPassed: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            screen       = module.get.screenCalculations(),
            callback     = newCallback || settings.onBottomPassed
          ;
          if(newCallback) {
            module.debug('Adding callback for bottom passed', newCallback);
            settings.bottomPassed = newCallback;
          }
          if(callback && calculations.bottomPassed) {
            $.proxy(callback, element)(calculations, screen);
          }
          else {
            return calculations.bottomPassed;
          }
        },

        save: {
          scroll: function() {
            module.cache.scroll = $window.scrollTop() + settings.offset;
          },
          direction: function() {
            var
              scroll     = module.get.scroll(),
              lastScroll = module.get.lastScroll(),
              direction
            ;
            if(scroll > lastScroll && lastScroll) {
              direction = 'down';
            }
            else if(scroll < lastScroll && lastScroll) {
              direction = 'up';
            }
            else {
              direction = 'static';
            }
            module.cache.direction = direction;
            return module.cache.direction;
          },
          elementPosition: function() {
            var
              screen = module.get.screenSize()
            ;
            module.verbose('Saving element position');
            $.extend(module.cache.element, {
              margin : {
                top    : parseInt($module.css('margin-top'), 10),
                bottom : parseInt($module.css('margin-bottom'), 10)
              },
              fits   : (element.height < screen.height),
              offset : $module.offset(),
              width  : $module.outerWidth(),
              height : $module.outerHeight()
            });
            return module.cache.element;
          },
          elementCalculations: function() {
            var
              screen  = module.get.screenCalculations(),
              element = module.get.elementPosition()
            ;
            // offset
            if(settings.includeMargin) {
              $.extend(module.cache.element, {
                top    : element.offset.top - element.margin.top,
                bottom : element.offset.top + element.height + element.margin.bottom
              });
            }
            else {
              $.extend(module.cache.element, {
                top    : element.offset.top,
                bottom : element.offset.top + element.height
              });
            }
            // visibility
            $.extend(module.cache.element, {
              topVisible       : (screen.bottom > element.top),
              topPassed        : (screen.top > element.top),
              bottomVisible    : (screen.bottom > element.bottom),
              bottomPassed     : (screen.top > element.bottom),
              pixelsPassed     : 0,
              percentagePassed : 0
            });
            // meta calculations
            $.extend(module.cache.element, {
              visible : (module.cache.element.topVisible || module.cache.element.bottomVisible),
              passing : (module.cache.element.topPassed && !module.cache.element.bottomPassed),
              hidden  : (!module.cache.element.topVisible && !module.cache.element.bottomVisible)
            });
            if(module.cache.element.passing) {
              module.cache.element.pixelsPassed = (screen.top - element.top);
              module.cache.element.percentagePassed = (screen.top - element.top) / element.height;
            }
            module.verbose('Updated element calculations', module.cache.element);
          },
          screenCalculations: function() {
            var
              scroll = $window.scrollTop()
            ;
            if(module.cache.scroll === undefined) {
              module.cache.scroll = $window.scrollTop();
            }
            module.save.direction();
            $.extend(module.cache.screen, {
              top    : scroll + settings.offset,
              bottom : scroll + settings.offset + module.cache.screen.height
            });
            return module.cache.screen;
          },
          screenSize: function() {
            module.verbose('Saving window position');
            module.cache.screen = {
              height: $window.height()
            };
          },
          position: function() {
            module.save.screenSize();
            module.save.elementPosition();
          }
        },

        get: {
          pixelsPassed: function(amount) {
            var
              element = module.get.elementCalculations()
            ;
            if(amount.search('%') > -1) {
              return ( element.height * (parseInt(amount, 10) / 100) );
            }
            return parseInt(amount, 10);
          },
          direction: function() {
            if(module.cache.direction === undefined) {
              module.save.direction();
            }
            return module.cache.direction;
          },
          elementPosition: function() {
            if(module.cache.element === undefined) {
              module.save.elementPosition();
            }
            return module.cache.element;
          },
          elementCalculations: function() {
            if(module.cache.element === undefined) {
              module.save.elementCalculations();
            }
            return module.cache.element;
          },
          screenCalculations: function() {
            if(module.cache.screen === undefined) {
              module.save.screenCalculations();
            }
            return module.cache.screen;
          },
          screenSize: function() {
            if(module.cache.screen === undefined) {
              module.save.screenSize();
            }
            return module.cache.screen;
          },
          scroll: function() {
            if(module.cache.scroll === undefined) {
              module.save.scroll();
            }
            return module.cache.scroll;
          },
          lastScroll: function() {
            if(module.cache.screen === undefined) {
              module.debug('First scroll event, no last scroll could be found');
              return false;
            }
            return module.cache.screen.top;
          }
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

$.fn.visibility.settings = {

  name              : 'Visibility',
  namespace         : 'visibility',

  verbose           : false,
  debug             : false,
  performance       : true,

  loadWait          : 1000,

  watch             : true,
  offset            : 0,
  includeMargin     : false,

  // array of callbacks
  onPassed          : {},

  // standard callbacks
  onPassing         : false,
  onTopVisible      : false,
  onBottomVisible   : false,
  onTopPassed       : false,
  onBottomPassed    : false,

  // utility callbacks
  onRefresh         : function(){},
  onScroll          : function(){},

  watchedProperties : [
    'offsetWidth',
    'offsetHeight',
    'top',
    'left'
  ],

  error : {
    method   : 'The method you called is not defined.'
  }

};

})( jQuery, window , document );
