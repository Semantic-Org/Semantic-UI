/*!
 * # Semantic UI - VideoHtml
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

$.fn.videohtml = function(parameters) {

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
  
  // see http://stackoverflow.com/questions/2686855/is-there-a-javascript-function-that-can-pad-a-string-to-get-to-a-determined-leng
  function utilStringPad(string, width, padding) { 
    return (width <= string.length) ? string : utilStringPad(width, padding + string, padding)
  }
  
  $allModules
    .each(function() {
      var
        settings        = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.video.settings, parameters)
          : $.extend({}, $.fn.video.settings),

        selector        = settings.selector,
        className       = settings.className,
        error           = settings.error,
        metadata        = settings.metadata,
        namespace       = settings.namespace,
        templates       = settings.templates,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        $window         = $(window),
        $module         = $(this),
        $video          = null,

        element         = this,
        instance        = $module.data(moduleNamespace),
        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing videohtml');
          module.create();
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },

        create: function() {
          $video = element
          module.debug('Reefrencing html for videohtml element');
        },
        
        
        control: {
          
          playpause: function($playpause) {
            $playpause = $($playpause);
            // from UI to video
            $playpause.on('click' + eventNamespace, function() {
              if(element.paused) {
                element.play();
              } else {
                element.pause();
              }
            });
            // from video to UI
            $module
              .on('play' + eventNamespace, function() {
                $playpause.addClass('active')
              }).on('pause' + eventNamespace, function() {
                $playpause.removeClass('active')
              });
          },
          
          // see https://developer.mozilla.org/fr/docs/Web/API/HTMLMediaElement#playbackRate
          // mode from 'switch', 'push'
          playbackrate: function($playbackrate, rate, mode) {
            $playbackrate = $($playbackrate);
            // from UI to video
            switch(mode) {
              case 'push': default:
                $playbackrate.on('mousedown' + eventNamespace, function() {
                  element.playbackRate = rate;
                });
                $playbackrate.on('mouseup' + eventNamespace + ' mouseleave' + eventNamespace, function() {
                  element.playbackRate = element.defaultPlaybackRate;
                });
              break;
              case 'switch':
                // todo
              break;
            }
            // from video to UI
            $module
              .on('ratechange' + eventNamespace, function(event) {
                console.log(element.playbackRate)
              });
          },
        
          timeDisplay: {

            current: function($el) {
              $module.on('timeupdate' + eventNamespace, function() {
                var current = new Date(element.currentTime * 1000);
                var readable = 
                  utilStringPad(String(current.getHours() - 1), 1, '0')+ ':' + 
                  utilStringPad(String(current.getMinutes()), 2, '0') + ':' + 
                  utilStringPad(String(current.getSeconds()), 2,'0');
                $el.text(readable);
              });
            },
          
            remaining: function($el) {
              $module.on('timeupdate' + eventNamespace, function() {
                var remaining = new Date((element.duration - element.currentTime) * 1000);
                var readable = 
                  utilStringPad(String(remaining.getHours() - 1), 1, '0')+ ':' + 
                  utilStringPad(String(remaining.getMinutes()), 2, '0') + ':' + 
                  utilStringPad(String(remaining.getSeconds()), 2,'0');
                $el.text(readable);
              });
            }

          },
          
          timeRange: function($range) {
            $range = $($range);
            // from UI to video
            $range.on('change', function(event) {
              var ratio = $range.val() / ($range.prop('max') - $range.prop('min'));
              element.currentTime = element.duration * ratio;
            });
            // from video to UI
            $module.on('timeupdate' + eventNamespace, function() {
              var ratio = element.currentTime / element.duration;
              var position = ratio * ($range.prop('max') - $range.prop('min'));
              $range.val(position);
            });
          }
          
        }, // end of control
       
        destroy: function() {
          module.verbose('Destroying previous instance of videohtml');
          $video = null
          module.reset();
          $module
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
        },

        refresh: function() {
          module.verbose('Refreshing selector cache');
          $video          = element
        },

        reset: function() {
          module.debug('Clearing videohtml');
          settings.onReset();
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
                module.error(error.method, query);
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


$.fn.videohtml.settings = {

  name        : 'HtmlVideo',
  namespace   : 'htmlvideo',

  debug       : true,
  verbose     : true,
  performance : true,

  className   : {
    active      : 'active'
  },

  selector    : {
    playButton  : '.play'
  }
  
};


})( jQuery, window , document );
