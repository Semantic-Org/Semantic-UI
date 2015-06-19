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
        $timeLookupBuffer           = $module.find(settings.selector.timeLookupBuffer),
        $timeLookupSeekable         = $module.find(settings.selector.timeLookupSeekable),
        $timeLookupPlayed           = $module.find(settings.selector.timeLookupPlayed),
        $seekingStateCheckbox       = $module.find(settings.selector.seekingStateCheckbox),
        $seekingStateDimmer         = $module.find(settings.selector.seekingStateDimmer),
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
            $volumeUpButton.push();
            $volumeDownButton.push();
          },
          
          events: function() {
            module.debug('Binding video module events');
            // from video to UI
            $video
              .on('play' + eventNamespace + ' playing' + eventNamespace + ' pause' + eventNamespace + ' ended' + eventNamespace, module.update.playState)
              .on('ratechange' + eventNamespace, module.update.rate)
              .on('timeupdate' + eventNamespace, module.update.time) // TODO limit throttle
              .on('seeking' + eventNamespace, module.update.seeking)
              .on('seeked' + eventNamespace, module.update.seeked)
              .on('volumechange' + eventNamespace, module.update.volume)
              .on('canplaythrough' + eventNamespace + ' canplay' + eventNamespace + ' loadeddata' + eventNamespace + ' emptied' + eventNamespace + ' waiting'+ eventNamespace, module.update.readyState)
              .on('error' + eventNamespace + ' loadstart' + eventNamespace + ' emptied' + eventNamespace + ' stalled' + eventNamespace + ' suspend' + eventNamespace + ' waiting' + eventNamespace + ' loadedmetadata' + eventNamespace + ' loadeddata' + eventNamespace, module.update.networkState)
            ;
            
            // from UI to video
            $playButton.on('click' + eventNamespace, module.request.playToggle);
            $seekButton.on('click' + eventNamespace, module.request.seek.toRelativeTime);
            $timeRange
              .on('mousedown' + eventNamespace, module.activate.timeLookup)
              .on('mouseup' + eventNamespace, module.deactivate.timeLookup)
              .on('input' + eventNamespace, module.update.timeLookup)
              .on('change' + eventNamespace, module.request.seek.fromRangeValue)
            ;
            $volumeUpButton.on('click' + eventNamespace, module.request.volumeUp);
            $volumeDownButton.on('click' + eventNamespace, module.request.volumeDown);
            $volumeProgress.on('click' + eventNamespace, module.request.unmute);
            $muteButton.on('click' + eventNamespace, module.request.muteToggle);
            $rateInput.on('change' + eventNamespace, module.request.rate);
            $rateReset.on('click' + eventNamespace, module.reset.rate);
            $readyStateRadio.on('click' + eventNamespace, module.request.denied);
            $networkStateRadio.on('click' + eventNamespace, module.request.denied);
            $statesLabel.on('click' + eventNamespace, module.request.denied);
          }
        },
        
        initialValues: function() {
          module.update.playState();
          module.update.volume();
        },
        
        // the functions in the both 'get' and 'is' range will query the elements and return the current value
        get: {
          pausedState: function() {
            return $video.prop('paused'); // boolean
          },
          endedState: function() {
            return $video.prop('ended'); // boolean
          },
          currentTime: function() {
            return $video.prop('currentTime'); // double, in seconds
          },
          duration: function() {
            return $video.prop('duration'); // double, in seconds
          },
          bufferedRanges: function() {
            return $video.prop('buffered'); // TimeRanges type
          },
          seekableRanges: function() {
            return $video.prop('seekable'); // TimeRanges type
          },
          playedRanges: function() {
            return $video.prop('played'); // TimeRanges type
          },
          
          volume: function() {
            return $video.prop('volume'); // float, between 0.0 and 1.0
          },
          playbackRate: function() {
            return $video.prop('playbackRate'); // float, limits depend on browsers implementations
          },
          readyState: function() {
            // use module related constants
            var state;
            switch($video.prop('readyState')) {
              default: case $module.prop('HAVE_NOTHING'): 
                state = settings.constants.HAVE_NOTHING;
                break;
              case $video.prop('HAVE_METADATA'):
                state = settings.constants.HAVE_METADATA;
                break;
              case $video.prop('HAVE_CURRENT_DATA'):
                state = settings.constants.HAVE_CURRENT_DATA;
                break;
              case $video.prop('HAVE_FUTURE_DATA'):
                state = settings.constants.HAVE_FUTURE_DATA;
                break;
              case $video.prop('HAVE_ENOUGH_DATA'):
                state = settings.constants.HAVE_ENOUGH_DATA;
                break;
            }
            return state;
          },
          networkState: function() {
            // use module related constants
            var state;
            switch($module.prop('neworkState')) {
              default:
              case $module.prop('NETWORK_EMPTY'): 
                state = settings.constants.NETWORK_EMPTY; 
                break;
              case $video.prop('NETWORK_IDLE'):
                state = settings.constants.NETWORK_IDLE;
                break;
              case $video.prop('NETWORK_LOADING'):
                state = settings.constants.NETWORK_LOADING;
                break;
              case $video.prop('NETWORK_NO_SOURCE'):
                state = settings.constants.NETWORK_NO_SOURCE; 
                break;
            }
            return state;
          },
          timeRangeValue: function() { // as time
            return module.get.duration() * $timeRange.val() / timeRangeInterval;
          },
          readableTime: function(timeMs) {
            // see http://stackoverflow.com/questions/2686855/is-there-a-javascript-function-that-can-pad-a-string-to-get-to-a-determined-leng
            var stringPad = function (string, width, padding) { 
              return (width <= string.length) ? string : stringPad(width, padding + string, padding);
            };
            
            var time = new Date(timeMs * 1000);
            var readable = 
              stringPad(String(time.getHours() - 1), 1, '0')+ ':' + 
              stringPad(String(time.getMinutes()), 2, '0') + ':' + 
              stringPad(String(time.getSeconds()), 2,'0');
            return readable;
          }
        },
        is: {
          playing: function() {
            return !module.get.pausedState() && !module.get.endedState();
          },
          seeking: function() {
            return $video.prop('seeking'); // boolean
          },
          muted: function() {
            return $video.prop('muted'); // boolean
          },
          timeBuffered: function(time) {
            return module.is.timeInRange(time, module.get.bufferedRanges());
          },
          timePlayed: function(time) {
            return module.is.timeInRange(time, module.get.playedRanges());
          },
          timeSeekable: function(time) {
            return module.is.timeInRange(time, module.get.seekableRanges());
          },
          timeInRange: function(time, range) {
            // see https://developer.mozilla.org/en-US/docs/Web/API/TimeRanges
            for(var i = 0; i < range.length; i++) {
              if(time >= range.start(i) && time <= range.end(i)) {
                return true;
              }
            }
            return false;
          }
        },
        
        // the functions in this range will update the UI elements from the current video state, with no relevant return value
        update: {
          playState: function() {
            module.debug('Update play state');
            if(module.is.playing()) {
              $playButton.addClass(settings.className.active);
            }
            else {
              $playButton.removeClass(settings.className.active);
            }
          },
          time: function() {
            var
              currentTime = module.get.currentTime(),
              duration = module.get.duration();
            module.debug('Update time');
            // text displays
            $currentTime.text(module.get.readableTime(currentTime));
            $remainingTime.text( module.get.readableTime(duration - currentTime) );
            // range display, prevent it to update when it has been 'mousedown'ed but not 'change'd yet
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
            }
            else {
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
            } 
            else {
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
            $timeLookupBuffer.prop('checked', module.is.timeBuffered(time));
            $timeLookupSeekable.prop('checked', module.is.timeSeekable(time));
            $timeLookupPlayed.prop('checked', module.is.timePlayed(time));
            $timeLookupValue.text(module.get.readableTime(time));
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
            }
            else {
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
            toAbsoluteTime: function(time) {
              module.debug('Request time absolute seek');
              // use fastSeek if implemented
              if(video.fastSeek) {
                video.fastSeek(time);
              }
              else {
                video.currentTime = time;
              }
            },
            toRelativeTime: function() {
              module.debug('Request time relative seek from current position)');
              var position = module.get.currentTime() + $(this).data(settings.matadata.seekStep);
              module.request.seek.toAbsoluteTime(position);
            },
            fromRangeValue: function() {
              module.request.seek.toAbsoluteTime(module.get.timeRangeValue());
            }
          },
          volumeUp: function() {
            if(video.muted) {
              module.request.unmute();
            } 
            else {
              module.debug('Request volume up');
              video.volume = Math.min(video.volume + $(this).data(settings.matadata.volumeStep), 1);
            }
          },
          volumeDown: function() {
            if(video.muted) {
              module.request.unmute();
            } 
            else {
              module.debug('Request volume down');
              video.volume = Math.max(video.volume - $(this).data(settings.matadata.volumeStep), 0);
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
            module.debug('Request denied');
            event.preventDefault();
            $(this).blur();
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
            settings.onTimeLookupStart();
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
            settings.onTimeLookupStop();
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
          $video = null;
          module.reset();
          $module
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
        },
        
        refresh: function() {
          module.verbose('Refreshing selector cache');
          $video          = element;
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

  className: {
    active      : 'active',
    disabled    : 'disabled'
  },

  selector: {
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
    timeLookupValue:        '.timelookup .time',
    timeLookupBuffer:       '.timelookup .buffer.checkbox input[type="checkbox"]',
    timeLookupSeekable:     '.timelookup .seekable.checkbox input[type="checkbox"]',
    timeLookupPlayed:       '.timelookup .played.checkbox input[type="checkbox"]',
    
    statesLabel:            '.ready.state label, .network.state label, .timelookup .buffer.checkbox label, .timelookup .seekable.checkbox label, .timelookup .played.checkbox label'
    
  },
  
  matadata: {
    volumeStep: 'volume-step',
    seekStep: 'seek-step'
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
  
  seekedDelay: 250, // ms
  
  onTimeLookupStart: function() {},
  onTimeLookupStop: function() {}
  
};

})( jQuery, window , document );
