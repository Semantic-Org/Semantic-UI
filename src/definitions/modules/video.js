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

function utilVoidCallback(event) {
  event.preventDefault();
  $(this).blur();
}

function utilAddNamespaceToEvents(events, namespace) {
  var events_with_namespace = [];
  while(events.length > 0) {
    events_with_namespace.push(events.pop() + namespace)
  }
  return events_with_namespace.join(' ');
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
        $video                      = $module.find(settings.selector.video),
        $playButton                 = $module.find(settings.selector.playButton),
        $seekButton                 = $module.find(settings.selector.seekButton),
        $currentTime                = $module.find(settings.selector.currentTime),
        $remainingTime              = $module.find(settings.selector.remainingTime),
        $timeRange                  = $module.find(settings.selector.timeRange),
        $volumeUpButton             = $module.find(settings.selector.volumeUpButton),
        $volumeDownButton           = $module.find(settings.selector.volumeDownButton),
        $volumeProgress             = $module.find(settings.selector.volumeProgress),
        $muteButton                 = $module.find(settings.selector.muteButton),
        $rateInput                  = $module.find(settings.selector.rateInput),
        $rateReset                  = $module.find(settings.selector.rateReset),
        $readyStateRadio            = $module.find(settings.selector.readyStateRadio),
        $networkStateRadio          = $module.find(settings.selector.networkStateRadio),
        $statesLabel                = $module.find(settings.selector.statesLabel),
        $bufferCheckbox             = $module.find(settings.selector.bufferCheckbox),
        $seekableCheckbox           = $module.find(settings.selector.seekableCheckbox),
        $playedCheckbox             = $module.find(settings.selector.playedCheckbox),
        $seekingStateCheckbox       = $module.find(settings.selector.seekingStateCheckbox),
        $seekingStateDimmer         = $module.find(settings.selector.seekingStateDimmer),
        $timeLookupActivator        = $timeRange.parent('.ui.input'),
        $timeLookupValue            = $module.find(settings.selector.timeLookupValue),

        timeRangeUpdateEnabled      = true,
        timeRangeInterval           = $timeRange.prop('max') - $timeRange.prop('min'),
        
        seekLoopInitialPlayState    = undefined, // it actually means undefined, see seek.tickLoop and seek.stopLoop functions,
        seekedTimer                 = window.setTimeout(1, function(){} ), // subsequent calls to window.clearTimeout won't break

        element                     = this,
        video                       = $video.get(0),
        instance                    = $module.data(moduleNamespace),
        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing video');
          module.instantiate();
          module.bind.pushes();
          module.bind.popups();
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
          pushes: function() {
            // sub-module init
            $seekButton.push({
              onStart: module.activate.holdPlayState,
              onStop: module.deactivate.holdPlayState
            });
            $volumeUpButton.push()
            $volumeDownButton.push();
          },
          popups: function() {
            $timeLookupActivator.popup({
              popup: $module.find(settings.selector.timeLookupPopup),
              position: 'top center',
              on: 'manual',
              preserve: true,
            });
          },
          events: function() {
            module.debug('Binding video module events');
            // from video to UI
            $video
              .on(utilAddNamespaceToEvents(['play', 'playing', 'pause', 'ended'], eventNamespace), module.update.playState)
              .on(utilAddNamespaceToEvents(['ratechange'], eventNamespace), module.update.rate)
              .on(utilAddNamespaceToEvents(['timeupdate'], eventNamespace), module.update.time) // TODO limit throttle
              .on(utilAddNamespaceToEvents(['seeking'], eventNamespace), module.update.seeking)
              .on(utilAddNamespaceToEvents(['seeked'], eventNamespace), module.update.seeked)
              .on(utilAddNamespaceToEvents(['volumechange'], eventNamespace), module.update.volume)
              .on(utilAddNamespaceToEvents(['canplaythrough', 'canplay', 'loadeddata', 'emptied', 'waiting'], eventNamespace), module.update.readyState)
              .on(utilAddNamespaceToEvents(['error', 'loadstart', 'emptied', 'stalled', 'suspend', 'waiting', 'loadedmetadata', 'loadeddata'], eventNamespace), module.update.networkState)
            ;
            
            // from UI to video
            $playButton.on(utilAddNamespaceToEvents(['click'], eventNamespace), module.request.playToggle);
            $seekButton.on(utilAddNamespaceToEvents(['click'], eventNamespace), module.request.seek.toRelativeTime);
            $timeRange
              .on(utilAddNamespaceToEvents(['mousedown'], eventNamespace), module.activate.timeLookup)
              .on(utilAddNamespaceToEvents(['mouseup'], eventNamespace), module.deactivate.timeLookup)
              .on(utilAddNamespaceToEvents(['input'], eventNamespace), module.update.timeLookup)
              .on(utilAddNamespaceToEvents(['change'], eventNamespace), module.request.seek.fromRangeValue)
            ;
            $volumeUpButton.on(utilAddNamespaceToEvents(['click'], eventNamespace), module.request.volumeUp);
            $volumeDownButton.on(utilAddNamespaceToEvents(['click'], eventNamespace), module.request.volumeDown);
            $volumeProgress.on(utilAddNamespaceToEvents(['click'], eventNamespace), module.request.unmute);
            $muteButton.on(utilAddNamespaceToEvents(['click'], eventNamespace), module.request.muteToggle);
            $rateInput.on(utilAddNamespaceToEvents(['change'], eventNamespace), module.request.rate);
            $rateReset.on(utilAddNamespaceToEvents(['click'], eventNamespace), module.reset.rate);
            $readyStateRadio.on(utilAddNamespaceToEvents(['click'], eventNamespace), module.request.denied);
            $networkStateRadio.on(utilAddNamespaceToEvents(['click'], eventNamespace), utilVoidCallback);
            $statesLabel.on(utilAddNamespaceToEvents(['click'], eventNamespace), utilVoidCallback);
          }
        },
        
        initialValues: function() {
          module.update.playState();
          module.update.volume();
        },
        
        // the functions in the both 'get' and 'is' range will query the elements and return the current value
        get: {
          
          pausedState: function() {
            module.debug('Get paused state');
            return $video.prop('paused'); // boolean
          },
          endedState: function() {
            module.debug('Get ended state');
            return $video.prop('ended'); // boolean
          },
          currentTime: function() {
            module.debug('Get current time value');
            return $video.prop('currentTime'); // double, in seconds
          },
          duration: function() {
            module.debug('Get duration value');
            return $video.prop('duration'); // double, in seconds
          },
          bufferedRanges: function() {
            module.debug('Get buffered ranges');
            return $video.prop('buffered'); // TimeRanges type
          },
          seekableRanges: function() {
            module.debug('Get seekable ranges');
            return $video.prop('seekable'); // TimeRanges type
          },
          playedRanges: function() {
            module.debug('Get played ranges');
            return $video.prop('played'); // TimeRanges type
          },
          
          volume: function() {
            module.debug('Get volume value');
            return $video.prop('volume'); // float, between 0.0 and 1.0
          },
          playbackRate: function() {
            module.debug('Get playback rate value');
            return $video.prop('playbackRate'); // float, limits depend on browsers implementations
          },
          readyState: function() {
            module.debug('Get ready state value');
            // use module related constants
            switch($video.prop('readyState')) {
              default: case $module.prop('HAVE_NOTHING'): return settings.constants.HAVE_NOTHING; break;
              case $video.prop('HAVE_METADATA'): return settings.constants.HAVE_METADATA; break;
              case $video.prop('HAVE_CURRENT_DATA'): return settings.constants.HAVE_CURRENT_DATA; break;
              case $video.prop('HAVE_FUTURE_DATA'): return settings.constants.HAVE_FUTURE_DATA; break;
              case $video.prop('HAVE_ENOUGH_DATA'): return settings.constants.HAVE_ENOUGH_DATA; break;
            }
          },
          networkState: function() {
            module.debug('Get network state value');
            // use module related constants
            switch($module.prop('neworkState')) {
              default: case $module.prop('NETWORK_EMPTY'): return settings.constants.NETWORK_EMPTY; break;
              case $video.prop('NETWORK_IDLE'): return settings.constants.NETWORK_IDLE; break;
              case $video.prop('NETWORK_LOADING'): return settings.constants.NETWORK_LOADING; break;
              case $video.prop('NETWORK_NO_SOURCE'): return settings.constants.NETWORK_NO_SOURCE; break;
            } 
          },
          timeRangeValue: function() { // as time
            return module.get.duration() * $timeRange.val() / timeRangeInterval;
          }
        },
        is: {
          playing: function() {
            module.debug('Is playing');
            return !module.get.pausedState() && !module.get.endedState();
          },
          seeking: function() {
            module.debug('Is seeking');
            return $video.prop('seeking'); // boolean
          },
          muted: function() {
            module.debug('Is muted');
            return $video.prop('muted'); // boolean
          },
          timeBuffered: function(time) {
            module.debug('Is timeBuffered');
            return utilTimeInRange(time, module.get.bufferedRanges());
          },
          timePlayed: function(time) {
            module.debug('Is timePlayed');
            return utilTimeInRange(time, module.get.playedRanges());
          },
          timeSeekable: function(time) {
            module.debug('Is timeSeekable');
            return utilTimeInRange(time, module.get.seekableRanges());
          }
        },
        
        // the functions in this range will update the UI elements from the current video state, with no relevant return value
        update: {
          playState: function() {
            module.debug('Update play state');
            if(module.is.playing()) {
              $playButton.addClass(settings.className.active);
            } else {
              $playButton.removeClass(settings.className.active);
            }
          },
          time: function() {
            var
              currentTime = module.get.currentTime(),
              duration = module.get.duration();
            module.debug('Update time');
            // text displays
            $currentTime.text(utilReadableTime(currentTime));
            $remainingTime.text( utilReadableTime(duration - currentTime) );
            // range display, prevent it to update when it has been 'mousedown'ed but not 'change'd yet
            console.log(timeRangeUpdateEnabled);
            if(timeRangeUpdateEnabled) {
              $timeRange.val( timeRangeInterval * currentTime / duration );
            }
          },
          seeking: function() {
            module.debug('Update seek state (seeking)');
            window.clearTimeout(seekedTimer);
            $seekingStateCheckbox.prop('checked', true);
            $seekingStateDimmer.dimmer('show');
          },
          seeked: function(event) {
            module.debug('Update seek state (seeked)');
            // a seeking loop makes "seeking" and "seeked" events to fire alternatively, add a delay to prevent the elements to blink
            if(event !== undefined) {
              // an real undelayed event has occured 
              seekedTimer = window.setTimeout(module.update.seeked, settings.seekedDelay);
            } else {
              // it has been delayed and now is handled through the UI
              $seekingStateCheckbox.prop('checked', false);
              $seekingStateDimmer.dimmer('hide');
            }
          },
          volume: function() {
            var 
              muted = module.is.muted(),
              volume = module.get.volume();
            module.debug('Update volume and mute states');
            if(muted) {
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
            $volumeProgress.progress({ percent: volume * 100 });
          },
          rate: function() {
            module.debug('Update playBack rate');
            $rateInput.val(module.get.playbackRate());
          },
          readyState: function() {
            module.debug('Update ready state');
            $readyStateRadio.filter('[value=' + module.get.readyState() + ']').prop('checked', true);
          },
          networkState: function() {
            module.debug('Update network state');
            $networkStateRadio.filter('[value=' + module.get.networkState() + ']').prop('checked', true);
          },
          timeLookup: function(event) {
            // virtual time indicator based on the $timeRange "dragged" time
            module.debug('Update timelookup state');
            var time = module.get.timeRangeValue();
            $bufferCheckbox.prop('checked', module.is.timeBuffered(time));
            $seekableCheckbox.prop('checked', module.is.timeSeekable(time));
            $playedCheckbox.prop('checked', module.is.timePlayed(time));
            $timeLookupValue.text(utilReadableTime(time));
          }
        },
        
        // the functions in this range will change the video element state, with no relevant return value
        request: {
          play: function() {
            module.debug('Request play');
            video.play();
          },
          pause: function() {
            module.debug('Request pause');
            video.pause();
          },
          playToggle: function() {
            module.debug('Request play toggle');
            if(module.is.playing()) {
              video.pause();
            } else {
              video.play();
            }
          },
          rate: function() {
            // see https://developer.mozilla.org/fr/docs/Web/API/HTMLMediaElement#playbackRate
            // seems to have a upper limit with some browsers : 
            // - 5 with FF 37.0.2
            // negative value seems to not be handled by some browsers :
            // - NS_ERROR_NOT_IMPLEMENTED with FF 37.0.2, 
            // - no visible effect with Chrome 42.0.2311.135
            // TODO: add a ln/exp step behavior to the input[type=number] step attribtute
            module.debug('Request playback rate (from button data)');
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
              var position = module.get.currentTime() + $(this).data('seek-step');
              module.request.seek.toAbsoluteTime(position);
            },
            fromRangeValue: function() {
              module.debug('Request time seek from absolute range value');
              module.request.seek.toAbsoluteTime(module.get.timeRangeValue());
            }
          },
          volumeUp: function() {
            if(video.muted) {
              module.request.unmute();
            } else {
              module.debug('Request volume up');
              video.volume = Math.min(video.volume + $(this).data('volume-step'), 1);
            }
          },
          volumeDown: function() {
            if(video.muted) {
              module.request.unmute();
            } else {
              module.debug('Request volume down');
              video.volume = Math.max(video.volume - $(this).data('volume-step'), 0);
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
          },
          denied: function(event) {
            module.debug('Requet denied');
            event.preventDefault();
          }
        },
         
        activate: {
          holdPlayState: function() {
            module.debug('Hold play state (while an other operation is occuring)');
            seekLoopInitialPlayState = module.is.playing();
            module.request.pause();
          },
          timeLookup: function() {
            module.debug('Activate time lookup');
            $timeLookupActivator.popup('show');
            timeRangeUpdateEnabled = false;
          }
        },
        
        deactivate: {
          holdPlayState: function() {
            module.debug('Unhold play state (after an other operation has occured)');
            if(seekLoopInitialPlayState) {
              module.request.play();
            }
            seekLoopInitialPlayState = undefined;
          },
          timeLookup: function() {
            module.debug('Deactivate time lookup');
            $timeLookupActivator.popup('hide');
            timeRangeUpdateEnabled = true;
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


$.fn.video.settings = {

  name        : 'Video',
  namespace   : 'video',

  debug       : true,
  verbose     : false,
  performance : false,

  className   : {
    active      : 'active',
    disabled    : 'disabled'
  },

  selector    : {
    video:                  'video', 
    playButton:             '.play.button',  // not to be conflicted with .play.button > i.icon.play
    seekButton:             '.seek.button',
    currentTime:            '.current.time',
    remainingTime:          '.remaining.time',
    timeRange:              'input[type="range"].time',
    volumeUpButton:         '.volume.up.button',    // could be a input[type="range"]
    volumeDownButton:       '.volume.down.button',  // |
    volumeProgress:         '.volume.progress',     // |
    muteButton:             '.mute.button',
    rateInput:              '.rate input[type="number"]',
    rateReset:              '.rate .reset',
    seekingStateCheckbox:   '.seeking.checkbox input[type="checkbox"]',
    seekingStateDimmer:     '.seeking.dimmer',
    readyStateRadio:        '.ready.state input[type="radio"]',           // could work with <select>
    networkStateRadio:      '.network.state input[type="radio"]',         // |
    bufferCheckbox:         '.buffer.checkbox input[type="checkbox"]',    // 
    seekableCheckbox:       '.seekable.checkbox input[type="checkbox"]',  //
    playedCheckbox:         '.played.checkbox input[type="checkbox"]',    //
    statesLabel:            '.ready.state label, .network.state label, .buffer.checkbox label, .seekable.checkbox label, .played.checkbox label',
    timeLookupPopup:        '.timelookup.popup',
    timeLookupValue:        '.timelookup.popup .time'
    
  },
  
  constants: {
    // used for the ready state
    HAVE_NOTHING: 0,
    HAVE_METADATA: 1,
    HAVE_CURRENT_DATA: 2,
    HAVE_FUTURE_DATA: 3,
    HAVE_ENOUGH_DATA: 4,
  
    // used for the network state
    NETWORK_EMPTY: 0,
    NETWORK_IDLE: 1,
    NETWORK_LOADING: 2,
    NETWORK_NO_SOURCE: 3
  },
  
  volumeStep: 0.1, // it moves from 0.0 to 1.0, TODO: use a data-* attribute
  seekedDelay: 250 // ms
  
};

})( jQuery, window , document );
