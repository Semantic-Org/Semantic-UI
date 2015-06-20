/*!
 * # Semantic UI - Push
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2015 Contributorss
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

"use strict";

$.fn.push = function(parameters) {

  var
    $allModules     = $(this),

    moduleSelector  = $allModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    requestAnimationFrame = window.requestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.msRequestAnimationFrame
      || function(callback) { setTimeout(callback, 0); },

    returnedValue
  ;
  
  $allModules
    .each(function() {
      var
        settings        = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.push.settings, parameters)
          : $.extend({}, $.fn.push.settings),

        selector                    = settings.selector,
        className                   = settings.className,
        error                       = settings.error,
        metadata                    = settings.metadata,
        namespace                   = settings.namespace,
        templates                   = settings.templates,

        eventNamespace              = '.' + namespace,
        moduleNamespace             = 'module-' + namespace,

        $window                     = $(window),
        $module                     = $(this),
        
        tickTimer                   = null,
        hadTicked                   = false,
        
        element                     = this,
        instance                    = $module.data(moduleNamespace),
        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing push behavior');
          module.instantiate();
          module.bind.events();
        },
        
        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },
        
        bind: {
          events: function() {
            module.debug('Binding push module events');
            $module
              .on('mousedown' + eventNamespace, module.tickLoop)
              .on('mouseup' + eventNamespace + ' mouseleave' + eventNamespace, module.stopLoop) // /!\ don't add 'click' or recursive hole
              .on('click' + eventNamespace, module.filterClick)
            ;
          }
        },
        
        tickLoop: function() {
          // don't move on the first iteration (actual mousedown event)
          if(tickTimer !== null) {
            hadTicked = true;
            $module.click() // .trigger() seems not to be DOM related, but only jQuery internal (?)
          } else {
            module.debug('loop starts');
            settings.onStart();
          }
          // (re)start the loop, bindings are made in order to later access $(this)
          tickTimer = window.setTimeout(module.tickLoop.bind(this), parseInt( $(this).data(settings.metadata.pushInterval) ));
        },
        
        stopLoop: function(event) {
          if(tickTimer !== null) {
            if(!hadTicked) {
              // one click if the loop hadn't ticked (~ real click)
              module.debug('loop iterates');
              $module.click() // .trigger() seems not to be DOM related, but only jQuery internal (?)
            }
            module.debug('loop stops');
            window.clearTimeout(tickTimer);
            tickTimer = null;
            hadTicked = false;
            settings.onStop();
          }
        },
        
        filterClick: function(event) {
          // human clicks are void (though they are re-triggered through the mousedown/mouseup behaviors combination)
          if(event.isTrigger === undefined) {
            module.debug('click is filtered');
            event.stopImmediatePropagation(); // it requires .push() event bindings to have been done before any other init
            event.preventDefault();
          }
        },
        
        reset: function() {
          module.debug('Clearing push');
          settings.onReset();
        },
        
        destroy: function() {
          module.verbose('Destroying previous instance of push');
          module.reset();
          $module
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
        },
        
        refresh: function() {
          module.verbose('Refreshing selector cache');
        },
        
        setting: function(name, value) {
          module.debug('Changing setting', name, value);
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
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 500);
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
            if($allModules.length > 1) {
              title += ' ' + '(' + $allModules.length + ')';
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
                  module.error(query);
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
          instance.invoke('destroy');
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


$.fn.push.settings = {

  name        : 'Push',
  namespace   : 'push',

  debug       : false,
  verbose     : false,
  performance : false,

  className   : {
    active      : 'active',
    disabled    : 'disabled'
  },
  
  metadata: {
    pushInterval: 'push-interval'
  },
  
  onStart: function() {},
  onStop: function() {},
  
};

})( jQuery, window , document );
