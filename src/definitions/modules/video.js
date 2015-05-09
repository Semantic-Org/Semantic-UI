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
        $backwardButton   = $module.find(settings.selector.backwardButton),
        $forwardButton    = $module.find(settings.selector.forwardButton),
        $currentTime      = $module.find(settings.selector.currentTime),
        $remainingTime    = $module.find(settings.selector.remainingTime),
        $timeRange        = $module.find(settings.selector.timeRange),
        $volumeUpButton   = $module.find(settings.selector.volumeUpButton),
        $volumeDownButton = $module.find(settings.selector.volumeDownButton),
        $volumeProgress   = $module.find(settings.selector.volumeProgress),
        $muteButton       = $module.find(settings.selector.muteButton),

        element           = this,
        video             = $video.get(0),
        instance          = $module.data(moduleNamespace),
        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing video');
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
          module.debug('Add controls');
          $module.video('add play button');
          $module.video('add forward button') ;
          //$module.video('add backward button',);
          $module.video('add current time');
          $module.video('add remaining time');
          $module.video('add time range');
          //$module.video('control loadProgress', $('#loadprogress'));
          $module.video('add volume up button');
          $module.video('add volume down button');
          $module.video('add volume progress ');
          $module.video('add mute button');
        },
        
        add: {
          
          playButton: function() {
            // from UI to video
            $playButton.on('click' + eventNamespace, function() {
              if(video.paused) {
                video.play();
              } else {
                video.pause();
              }
            });
            // from video to UI
            $video
              .on('play' + eventNamespace, function() {
                $playButton.addClass(settings.className.active)
              }).on('pause' + eventNamespace, function() {
                $playButton.removeClass(settings.className.active)
              });
          },
          
          // see https://developer.mozilla.org/fr/docs/Web/API/HTMLMediaElement#playbackRate
          // seems to have a upper limit with some browsers : 
          // - 5 with FF 37.0.2
          // negative value seems to not be handled by some browsers :
          // - NS_ERROR_NOT_IMPLEMENTED with FF 37.0.2, 
          // - no visible effect with Chrome 42.0.2311.135
          // TODO: abstract it for backward
          // TODO: deal with modes (push, switch)
          forwardButton: function() {
            // from UI to video
            $forwardButton.on('mousedown' + eventNamespace, function() {
              video.playbackRate = settings.backwardRate;
            });
            $forwardButton.on('mouseup' + eventNamespace + ' mouseleave' + eventNamespace, function() {
              video.playbackRate = video.defaultPlaybackRate;
            });
            // from video to UI
            $video
              .on('ratechange' + eventNamespace, function(event) {
                console.log(video.playbackRate)
              });
          },
        
          currentTime: function() {
            $video.on('timeupdate' + eventNamespace, function() {
              var current = new Date(video.currentTime * 1000);
              var readable = 
                utilStringPad(String(current.getHours() - 1), 1, '0')+ ':' + 
                utilStringPad(String(current.getMinutes()), 2, '0') + ':' + 
                utilStringPad(String(current.getSeconds()), 2,'0');
              $currentTime.text(readable);
            });
          },
        
          remainingTime: function() {
            $video.on('timeupdate' + eventNamespace, function() {
              var remaining = new Date((video.duration - video.currentTime) * 1000);
              var readable = 
                utilStringPad(String(remaining.getHours() - 1), 1, '0')+ ':' + 
                utilStringPad(String(remaining.getMinutes()), 2, '0') + ':' + 
                utilStringPad(String(remaining.getSeconds()), 2,'0');
              $remainingTime.text(readable);
            });
          },
        
         timeRange: function() {
            var update_enabled = true;
            var range_interval = $timeRange.prop('max') - $timeRange.prop('min');
            // from UI to video
            $timeRange
              .on('change', function(event) {
                var ratio = $timeRange.val() / range_interval;
                // use fastSeek if implemented
                if(video.fastSeek) {
                  video.fastSeek(video.duration * ratio);
                } else {
                  video.currentTime = video.duration * ratio;
                }
              })
              // prevent the input to update when it has been 'mousedown'ed but not 'change'd yet
              .on('mousedown' + eventNamespace, function() {
                update_enabled = false;
              })
              .on('mouseup' + eventNamespace, function() {
                update_enabled = true;
              })
            ;
            // from video to UI
            $video
              .on('timeupdate' + eventNamespace, function() {
                if(update_enabled) {
                  var ratio = video.currentTime / video.duration;
                  var position = ratio * range_interval;
                  $timeRange.val(position);
                }
              })
              // the range input is disabled while a seek (or load) to an unbuffered area occurs
              .on('loadstart' + eventNamespace + ' seeking' + eventNamespace, function() {
                if(!utilTimeInRange(video.currentTime, video.buffered)) {
                  $timeRange.prop('disabled', true).addClass(settings.className.disabled);
                }
              })
              .on('loadeddata' + eventNamespace + ' seeked' + eventNamespace, function() {
                $timeRange.prop('disabled', false).removeClass(settings.className.disabled);
              })
            ;
          
          },
          
          volume: {
            
            upButton: function() {
              $volumeUpButton.on('click' + eventNamespace, function() {
                video.volume = Math.min(video.volume + settings.volume_step, 1);
                if($(this).hasClass(settings.className.disabled) && video.muted) {
                  video.muted = false;
                }
              });
              $video.on('volumechange' + eventNamespace, function() {
                if(video.muted) {
                  $volumeUpButton.addClass(settings.className.disabled);
                } else {
                  $volumeUpButton.removeClass(settings.className.disabled);
                }
              });
            },
          
            downButton: function() {
              $volumeDownButton.on('click' + eventNamespace, function() {
                video.volume = Math.max(video.volume - settings.volume_step, 0);
                if($(this).hasClass(settings.className.disabled) && video.muted) {
                  video.muted = false;
                }
              });
              $video.on('volumechange' + eventNamespace, function() {
                if(video.muted) {
                  $volumeDownButton.addClass(settings.className.disabled);
                } else {
                  $volumeDownButton.removeClass(settings.className.disabled);
                }
              });
            },
          
            progress: function() {
              $volumeProgress.progress({ percent: 100 });
              $volumeProgress.on('click' + eventNamespace, function() {
                // TODO : check position of click within the progress
                if($(this).hasClass(settings.className.disabled) && video.muted) {
                  video.muted = false;
                }
              });
              $video.on('volumechange' + eventNamespace, function() {
                var volume = video.muted ? 0 : video.volume;
                $volumeProgress.progress({ percent: volume * 100 });
                if(video.muted) {
                  $volumeProgress.addClass(settings.className.disabled);
                } else {
                  $volumeProgress.removeClass(settings.className.disabled);
                }
              });
            }
          },
          
          muteButton: function($mute) {
            $muteButton.on('click' + eventNamespace, function() {
              video.muted = !video.muted;
            });
            $video.on('volumechange' + eventNamespace, function() {
              if(element.muted) {
                $muteButton.addClass(settings.className.active);
              } else {
                $muteButton.removeClass(settings.className.active);
              }
            });
          }
          
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
          
        }, // end of control
       
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
    playButton:        '.play.button',
    backwardButton:    '.backward.button',
    forwardButton:     '.forward.button',
    currentTime:       '.current.time',
    remainingTime:     '.remaining.time',
    timeRange:         'input[type="range"].time',
    volumeUpButton:    '.volume.up.button', // not to be conflicted with .ui.button.volume.up > i.icon.volume.up
    volumeDownButton:  '.volume.down.button',
    volumeProgress:    '.volume.progress',
    muteButton:        '.mute.button'
  },
  
  backwardRate: 6,
  forwardRate: -4,
  volume_step: 0.1
  
};


})( jQuery, window , document );
