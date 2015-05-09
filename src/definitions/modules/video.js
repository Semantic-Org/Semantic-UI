/*!
 * # Semantic UI - Video
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

// see http://stackoverflow.com/questions/2686855/is-there-a-javascript-function-that-can-pad-a-string-to-get-to-a-determined-leng
function utilStringPad(string, width, padding) { 
  return (width <= string.length) ? string : utilStringPad(width, padding + string, padding)
}

// see https://developer.mozilla.org/en-US/docs/Web/API/TimeRanges
function utilTimeInRange(time, range) {
  for(var i = 0; i < range.length; i++) {
    if(time >= range.start(i) && time <= range.end(i)) {
      return true;
    }
  }
  return false;
}

function utilReadableTime(timeMs) {
  var time = new Date(timeMs * 1000);
  var readable = 
    utilStringPad(String(time.getHours() - 1), 1, '0')+ ':' + 
    utilStringPad(String(time.getMinutes()), 2, '0') + ':' + 
    utilStringPad(String(time.getSeconds()), 2,'0');
  return readable;
}

$.fn.video = function(parameters) {

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
          ? $.extend(true, {}, $.fn.video.settings, parameters)
          : $.extend({}, $.fn.video.settings),

        selector          = settings.selector,
        className         = settings.className,
        error             = settings.error,
        metadata          = settings.metadata,
        namespace         = settings.namespace,
        templates         = settings.templates,

        eventNamespace    = '.' + namespace,
        moduleNamespace   = 'module-' + namespace,

        $window           = $(window),
        $module           = $(this),
        $video            = $module.find(settings.selector.video),
        $playButton       = $module.find(settings.selector.playButton),
        $playRateButton   = $module.find(settings.selector.playRateButton),
        $currentTime      = $module.find(settings.selector.currentTime),
        $remainingTime    = $module.find(settings.selector.remainingTime),
        $timeRange        = $module.find(settings.selector.timeRange),
        $volumeUpButton   = $module.find(settings.selector.volumeUpButton),
        $volumeDownButton = $module.find(settings.selector.volumeDownButton),
        $volumeProgress   = $module.find(settings.selector.volumeProgress),
        $muteButton       = $module.find(settings.selector.muteButton),

        timeRangeUpdateEnabled = true,
        timeRangeInterval = $timeRange.prop('max') - $timeRange.prop('min'),

        element           = this,
        video             = $video.get(0),
        instance          = $module.data(moduleNamespace),
        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing video');
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
            module.debug('Binding video module events');
            // from video to UI
            $video
              .on('play' + eventNamespace, module.activate.playButton)
              .on('pause' + eventNamespace, module.deactivate.playButton)
              .on('ratechange' + eventNamespace, function(event) { console.log(video.playbackRate) })
              .on('timeupdate' + eventNamespace, module.update.time)
              // the range input is disabled while a seek (or load) to an unbuffered area occurs
              .on('loadstart' + eventNamespace + ' seeking' + eventNamespace, module.update.loading)
              .on('loadeddata' + eventNamespace + ' seeked' + eventNamespace, module.update.loaded)
              .on('volumechange' + eventNamespace, module.update.volume)
            ;
            
            // from UI to video
            $playButton
              .on('click' + eventNamespace, module.request.playToggle)
            ;
            $playRateButton
               // TODO: deal with $playRateButton modes (push, switch)
              .on('mousedown' + eventNamespace, module.request.playRate)
              .on('mouseup' + eventNamespace, module.reset.playkRate)
            ;
            $timeRange
              .on('change' + eventNamespace, module.request.seek) 
              .on('mousedown' + eventNamespace, module.deactivate.timeRangeUpdate)
              .on('mouseup' + eventNamespace, module.activate.timeRangeUpdate)
            ;
            $volumeUpButton.on('click' + eventNamespace, module.request.volumeUp);
            $volumeDownButton.on('click' + eventNamespace, module.request.volumeDown);
            $volumeProgress.on('click' + eventNamespace, module.request.unmute);
            $muteButton.on('click' + eventNamespace, module.request.muteToggle);
          }
        },
        
        request: {
          playToggle: function() {
            module.debug('Request play toggle');
            if(video.paused) {
              return module.request.play();
            } else {
              return module.request.pause();
            }
          },
          play: function() {
            module.debug('Request play');
            return video.play();
          },
          pause: function() {
            module.debug('Request pause');
            return video.pause();
          },
          playRate: function() {
            // see https://developer.mozilla.org/fr/docs/Web/API/HTMLMediaElement#playbackRate
            // seems to have a upper limit with some browsers : 
            // - 5 with FF 37.0.2
            // negative value seems to not be handled by some browsers :
            // - NS_ERROR_NOT_IMPLEMENTED with FF 37.0.2, 
            // - no visible effect with Chrome 42.0.2311.135
            module.debug('Request playRate from button data');
            video.playbackRate = parseFloat( $(this).data('play-rate') );
          },
          seek: function() {
            module.debug('Request seek from range value');
            var ratio = $timeRange.val() / timeRangeInterval;
            var position = video.duration * ratio;
            // use fastSeek if implemented
            if(video.fastSeek) {
              video.fastSeek(position);
            } else {
              video.currentTime = position;
            }
          },
          volumeUp: function() {
            module.debug('Request volume up');
            if($(this).hasClass(settings.className.disabled)) {
              video.muted = false;
            } else {
              video.volume = Math.min(video.volume + settings.volumeStep, 1);
            }
          },
          volumeDown: function() {
            module.debug('Request volume down');
            if($(this).hasClass(settings.className.disabled)) {
              video.muted = false;
            } else {
              video.volume = Math.max(video.volume - settings.volumeStep, 0);
            }
          },
          mute: function() {
            module.debug('Request mute');
            video.muted = true;
          },
          unmute: function() {
            module.debug('Request unmute');
            video.muted = false;
          },
          muteToggle: function() {
            module.debug('Request mute toggle');
            video.muted = !video.muted;
          }
        },
        
        reset: {
          playRate: function() {
            module.debug('Reset play rate');
            video.playbackRate = video.defaultPlaybackRate;
          }
        },
        
        update: {
          time: function() {
            module.debug('Update time');
            // text displays
            $currentTime.text(utilReadableTime(video.currentTime));
            $remainingTime.text( utilReadableTime(video.duration - video.currentTime) );
            // range display, prevent it to update when it has been 'mousedown'ed but not 'change'd yet
            if(timeRangeUpdateEnabled) {
              $timeRange.val( timeRangeInterval * video.currentTime / video.duration );
            }
          },
          loading: function() {
            module.debug('Update to loading state');
            $timeRange.prop('disabled', true).addClass(settings.className.disabled);
          },
          loaded: function() {
            module.debug('Update to loaded state');
            $timeRange.prop('disabled', false).removeClass(settings.className.disabled);
          },
          volume: function() {
            module.debug('Update volume and mute states');
            if(video.muted) {
              $volumeUpButton.addClass(settings.className.disabled);
              $volumeDownButton.addClass(settings.className.disabled);
              $volumeProgress.addClass(settings.className.disabled);
              $muteButton.addClass(settings.className.active);
            } else {
              $volumeUpButton.removeClass(settings.className.disabled);
              $volumeDownButton.removeClass(settings.className.disabled);
              $volumeProgress.removeClass(settings.className.disabled);
              $muteButton.removeClass(settings.className.active);
            }
            var volume = video.muted ? 0 : video.volume;
            $volumeProgress.progress({ percent: volume * 100 });
          }
        },
        
        activate: {
          playButton: function() {
            module.debug('Activate playButton');
            $playButton.addClass(settings.className.active);
          },
          timeRangeUpdate: function() {
            module.debug('Activate timeRange autoupdate');
            timeRangeUpdateEnabled = true;
          }
        },
        
        deactivate: {
          playButton: function() {
            module.debug('Deactivate playButton');
            $playButton.removeClass(settings.className.active);
          },
          timeRangeUpdate: function() {
            module.debug('Deactivate timeRange autoupdate');
            timeRangeUpdateEnabled = false;
          }
        },
        
        
          
        /*
        loadProgress: function($progress) {
          $progress = $($progress)
          // from video to UI
          $module
            .on('progress' + eventNamespace, function() {
              console.log('progress');
              if(element.lengthComputable) {
                $progress.progress({ percent: loaded / total * 100 });
              }
            }).on('seeking' + eventNamespace, function() {
              console.log('seeking')
            }).on('seeked' + eventNamespace, function() {
              console.log('seeked')
              console.log(element.buffered)
            }).on('stalled' + eventNamespace, function() {
              console.log('stalled')
            }).on('suspend' + eventNamespace, function() {
              console.log('suspend')
            }).on('loadstart' + eventNamespace, function() {
              console.log('loadstart')
            }).on('loadedmetadata' + eventNamespace, function() {
              console.log('loadedmetadata')
            }).on('' + eventNamespace, function() {
              console.log('loadeddata')
            });
          
        }
        */
       
        destroy: function() {
          module.verbose('Destroying previous instance of video');
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
          module.debug('Clearing video');
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


$.fn.video.settings = {

  name        : 'Video',
  namespace   : 'video',

  debug       : true,
  verbose     : true,
  performance : true,

  className   : {
    active      : 'active',
    disabled    : 'disabled'
  },

  selector    : {
    video:             'video', 
    playButton:        '.play.button',  // not to be conflicted with .play.button > i.icon.play
    playRateButton:    '.playrate.button[data-play-rate]',
    currentTime:       '.current.time',
    remainingTime:     '.remaining.time',
    timeRange:         'input[type="range"].time',
    volumeUpButton:    '.volume.up.button',
    volumeDownButton:  '.volume.down.button',
    volumeProgress:    '.volume.progress',
    muteButton:        '.mute.button'
  },
  
  volumeStep: 0.1 // it moves from 0.0 to 1.0
  
};


})( jQuery, window , document );
