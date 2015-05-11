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
        $seekButton       = $module.find(settings.selector.seekButton),
        $currentTime      = $module.find(settings.selector.currentTime),
        $remainingTime    = $module.find(settings.selector.remainingTime),
        $timeRange        = $module.find(settings.selector.timeRange),
        $volumeUpButton   = $module.find(settings.selector.volumeUpButton),
        $volumeDownButton = $module.find(settings.selector.volumeDownButton),
        $volumeProgress   = $module.find(settings.selector.volumeProgress),
        $muteButton       = $module.find(settings.selector.muteButton),
        $rateInput        = $module.find(settings.selector.rateInput),
        $rateReset        = $module.find(settings.selector.rateReset),
        $readyStateRadio  = $module.find(settings.selector.readyStateRadio),
        $networkStateRadio= $module.find(settings.selector.networkStateRadio),

        timeRangeUpdateEnabled = true,
        timeRangeInterval = $timeRange.prop('max') - $timeRange.prop('min'),
        seekLoopCounter   = window.setTimeout(1, function(){} ), // subsequent calls to window.clearTimeout won't break
        seekLoopInitialPlayState = undefined, // it actually means undefined, see seek.tickLoop and seek.stopLoop functions

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
          module.initialValues(); 
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
              .on('play' + eventNamespace + ' playing' + eventNamespace + ' pause' + eventNamespace + ' ended' + eventNamespace, module.update.playState)
              .on('ratechange' + eventNamespace, module.update.rate)
              .on('timeupdate' + eventNamespace, module.update.time) // TODO: reduce throttle
              // the range input is disabled while a seek (or load) to an unbuffered area occurs
              .on('seeking' + eventNamespace + ' seeked' + eventNamespace, module.update.seek)
              .on('volumechange' + eventNamespace, module.update.volume)
              .on('canplaythrough' + eventNamespace + ' canplay' + eventNamespace + ' loadeddata' + eventNamespace + ' loadedmetadata' + eventNamespace + ' emptied' + eventNamespace + ' waiting' + eventNamespace, module.update.readyState)
              .on('error' + eventNamespace + ' loadstart' + eventNamespace + ' emptied' + eventNamespace + ' stalled' + eventNamespace + ' suspend' + eventNamespace + ' waiting' + eventNamespace + ' loadedmetadata' + eventNamespace + ' loadeddata' + eventNamespace, module.update.networkState)
            ;
            
            // from UI to video
            $playButton
              .on('click' + eventNamespace, module.request.playToggle)
            ;
            $seekButton
              .on('click' + eventNamespace, module.request.seek.toRelativeTime)
              .on('mousedown' + eventNamespace, module.request.seek.tickLoop)
              .on('mouseup' + eventNamespace + 'mouseleave' + eventNamespace, module.request.seek.stopLoop)
            ;
            $timeRange
              .on('change' + eventNamespace, module.request.seek.fromRangeValue) 
              .on('mousedown' + eventNamespace, module.deactivate.timeRangeUpdate)
              .on('mouseup' + eventNamespace, module.activate.timeRangeUpdate)
            ;
            $volumeUpButton.on('click' + eventNamespace, module.request.volumeUp);
            $volumeDownButton.on('click' + eventNamespace, module.request.volumeDown);
            $volumeProgress.on('click' + eventNamespace, module.request.unmute);
            $muteButton.on('click' + eventNamespace, module.request.muteToggle);
            $rateInput.on('change' + eventNamespace, module.request.rate);
            $rateReset.on('click' + eventNamespace, module.reset.rate);
          }
        },
        
        initialValues: function() {
          module.update.playState();
          module.update.time();
          module.update.volume();
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
          rate: function() {
            // see https://developer.mozilla.org/fr/docs/Web/API/HTMLMediaElement#playbackRate
            // seems to have a upper limit with some browsers : 
            // - 5 with FF 37.0.2
            // negative value seems to not be handled by some browsers :
            // - NS_ERROR_NOT_IMPLEMENTED with FF 37.0.2, 
            // - no visible effect with Chrome 42.0.2311.135
            // TODO: add a ln/exp step behavior to the input[type=number] step attribtute
            module.debug('Request playBack rate (from button data)');
            video.playbackRate = parseFloat( $(this).val() );
          },
          seek: {
            // TODO: better functions and data-* attributes naming ?
            toAbsoluteTime: function(time) {
              module.debug('Request time absolute seek');
              // use fastSeek if implemented
              if(video.fastSeek) {
                video.fastSeek(time);
              } else {
                video.currentTime = time;
              }
            },
            toRelativeTime: function() {
              module.debug('Request time relative seek from current position)');
              var position = video.currentTime + $(this).data('seek-step');
              module.request.seek.toAbsoluteTime(position);
            },
            fromRangeValue: function() {
              module.debug('Request time seek from absolute range value');
              var ratio = $timeRange.val() / timeRangeInterval;
              var position = video.duration * ratio;
              module.request.seek.toAbsoluteTime(position);
            },
            tickLoop: function() {
              // TODO: abstract to a 'push' button behavior ?
              module.debug('Tick seek loop');
              window.clearTimeout(seekLoopCounter);
              if(seekLoopInitialPlayState === undefined) {
                // force pause while loop seeking
                seekLoopInitialPlayState = !video.paused;
                module.request.pause();
              } else {
                // don't move on the first iteration
                module.request.seek.toRelativeTime.bind(this)();
              }
              // bindings are made in order to later access $(this)
              seekLoopCounter = window.setTimeout(module.request.seek.tickLoop.bind(this), parseInt( $(this).data('seek-interval') ));
            },
            stopLoop: function() {
              module.debug('Stop seek loop');
              window.clearTimeout(seekLoopCounter);
              if(seekLoopInitialPlayState) {
                module.request.play();
              }
              seekLoopInitialPlayState = undefined;
            }
          },
          volumeUp: function() {
            if(video.muted) {
              module.request.unmute();
            } else {
              module.debug('Request volume up');
              video.volume = Math.min(video.volume + settings.volumeStep, 1);
            }
          },
          volumeDown: function() {
            if(video.muted) {
              module.request.unmute();
            } else {
              module.debug('Request volume down');
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
          rate: function() {
            module.debug('Reset playBack rate');
            video.playbackRate = video.defaultPlaybackRate;
          },
          all: function() {
            // TODO: check modules integration
            module.debug('Clearing video');
            settings.onReset();
          }
        },
        
        update: {
          playState: function() {
            module.debug('Update play state');
            if(video.paused) {
              $playButton.removeClass(settings.className.active);
            } else {
              $playButton.addClass(settings.className.active);
            }
          },
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
          seek: function() {
            module.debug('Update seek state');
            if(video.seeking) {
              $timeRange.prop('disabled', true).addClass(settings.className.disabled);
            } else {
              $timeRange.prop('disabled', false).removeClass(settings.className.disabled);
            }
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
            $volumeProgress.progress({ percent: video.volume * 100 });
          },
          rate: function() {
            module.debug('Update playBack rate');
            $rateInput.val(video.playbackRate);
          },
          readyState: function() {
            $readyStateRadio.filter('[value=' + video.readyState + ']').prop('checked', true);
          },
          networkState: function() {
            $networkStateRadio.filter('[value=' + video.networkState + ']').prop('checked', true);
          },
        },
        
        
        activate: {
          timeRangeUpdate: function() {
            module.debug('Activate timeRange autoupdate');
            timeRangeUpdateEnabled = true;
          }
        },
        
        deactivate: {
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
    seekButton:        '.seek.button',
    currentTime:       '.current.time',
    remainingTime:     '.remaining.time',
    timeRange:         'input[type="range"].time',
    volumeUpButton:    '.volume.up.button',
    volumeDownButton:  '.volume.down.button',
    volumeProgress:    '.volume.progress',
    muteButton:        '.mute.button',
    rateInput:         '.rate input[type="number"]',
    rateReset:         '.rate .reset',
    readyStateRadio:   '.ready.state input[type="radio"]', // could work with <select>
    networkStateRadio: '.network.state input[type="radio"]'
  },
  
  volumeStep: 0.1 // it moves from 0.0 to 1.0
  
};


})( jQuery, window , document );
