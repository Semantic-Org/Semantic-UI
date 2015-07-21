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
        $video                      = $module.find(selector.video),
        $playButton                 = $module.find(selector.playButton),
        $seekButton                 = $module.find(selector.seekButton),
        $currentTime                = $module.find(selector.currentTime),
        $remainingTime              = $module.find(selector.remainingTime),
        $timeRange                  = $module.find(selector.timeRange),
        $volumeChangeButton         = $module.find(selector.volumeChangeButton),
        $volumeProgress             = $module.find(selector.volumeProgress),
        $muteButton                 = $module.find(selector.muteButton),
        $rateInput                  = $module.find(selector.rateInput),
        $rateReset                  = $module.find(selector.rateReset),
        $readyStateRadio            = $module.find(selector.readyStateRadio),
        $networkStateRadio          = $module.find(selector.networkStateRadio),
        $statesLabel                = $module.find(selector.statesLabel),
        $timeLookupBuffer           = $module.find(selector.timeLookupBuffer),
        $timeLookupPlayed           = $module.find(selector.timeLookupPlayed),
        $loaderDimmer               = $module.find(selector.loaderDimmer),
        $timeLookupValue            = $module.find(selector.timeLookupValue),
        $sourceDropdown             = $module.find(selector.sourceDropdown),
        $fullScreenButton           = $module.find(selector.fullScreenButton),
        $autoplayCheckbox           = $module.find(selector.autoplayCheckbox),
        $loopCheckbox               = $module.find(selector.loopCheckbox),
        $preloadCheckbox            = $module.find(selector.preloadCheckbox),
        
        $requirePlayableMode        = $playButton.add($seekButton),
        
        loaderTimer                 = setTimeout(function(){}, 1), // subsequent calls to clearTimeout won't break
        timeLookupActive            = false,
        timeRangeInterval           = $timeRange.prop('max') - $timeRange.prop('min'),
        seekTickTimer               = null,
        seekHadTicked               = false,
        seekLoopInitialPlayState    = undefined, // it actually means undefined, see activate.holdPlayState and deactivate.holdPlayState functions,

        element                     = this,
        video                       = $video.get(0),
        instance                    = $module.data(moduleNamespace),
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
            // from video events
            $video
              .on('play'            + eventNamespace + 
                  ' playing'        + eventNamespace + 
                  ' pause'          + eventNamespace +
                  ' ended'          + eventNamespace + 
                  ' emptied'        + eventNamespace, module.update.playState)
              .on('canplaythrough'  + eventNamespace +
                  ' canplay'        + eventNamespace +
                  ' loadeddata'     + eventNamespace +
                  ' emptied'        + eventNamespace +
                  ' waiting'        + eventNamespace, module.update.readyState)
              .on('error'           + eventNamespace +
                  ' canplay'        + eventNamespace +
                  ' canplaythrough' + eventNamespace +
                  ' loadstart'      + eventNamespace +
                  ' loadedmetadata' + eventNamespace + 
                  ' loadeddata'     + eventNamespace +
                  ' stalled'        + eventNamespace + 
                  ' suspend'        + eventNamespace + 
                  ' emptied'        + eventNamespace + 
                  ' waiting'        + eventNamespace, module.update.networkState)
              .on('ratechange'      + eventNamespace, module.update.rate)
              .on('timeupdate'      + eventNamespace +
                  ' loadedmetadata' + eventNamespace, module.update.time)
              .on('seeking'         + eventNamespace + 
                  ' waiting'        + eventNamespace + 
                  ' emptied'        + eventNamespace + 
                  ' stalled'        + eventNamespace , module.activate.loader)
              .on('seeked'          + eventNamespace + 
                  ' canplay'        + eventNamespace + 
                  ' canplaythrough' + eventNamespace, module.deactivate.loader)
              .on('volumechange'    + eventNamespace, module.update.volume)
              .on('emptied'         + eventNamespace + 
                  ' stalled'        + eventNamespace, module.deactivate.playable)
              .on('suspend'         + eventNamespace, module.activate.playable)
            ;
            
            // from UI events
            $seekButton
              .on('mousedown'       + eventNamespace, module.request.seek.loop.tick)
              .on('mouseup'         + eventNamespace + 
                  ' mouseleave'     + eventNamespace, module.request.seek.loop.stop)
              .on('click'           + eventNamespace, module.request.seek.loop.filterClick)
            ;
            $playButton
              .on('click'           + eventNamespace, module.request.playToggle)
            ;
            $timeRange
              .on('mousedown'       + eventNamespace, module.activate.timeLookup)
              .on('mouseup'         + eventNamespace, module.deactivate.timeLookup)
              .on('input'           + eventNamespace, module.update.timeLookup)
              .on('change'          + eventNamespace, module.request.seek.fromRangeValue)
            ;
            $volumeChangeButton
              .on('click'           + eventNamespace, module.request.volume.shift)
            ;
            $volumeProgress
              .on('click'           + eventNamespace, module.request.unmute)
            ;
            $muteButton
              .on('click'           + eventNamespace, module.request.muteToggle)
            ;
            $rateInput
              .on('change'          + eventNamespace, module.request.rate)
            ;
            $rateReset
              .on('click'           + eventNamespace, module.reset.rate)
            ;
            $readyStateRadio
              .on('click'           + eventNamespace, module.request.void)
            ;
            $networkStateRadio
              .on('click'           + eventNamespace, module.request.void)
            ;
            $statesLabel
              .on('click'           + eventNamespace, module.request.void)
            ;
            $sourceDropdown
              .on('change'          + eventNamespace, module.request.source)
            ;
            $fullScreenButton
              .on('click'           + eventNamespace, module.request.fullScreen)
            ;
            $autoplayCheckbox
              .on('change'          + eventNamespace, module.request.autoplay)
            ;
            $loopCheckbox    
              .on('change'          + eventNamespace, module.request.loop)
            ;
            $preloadCheckbox 
              .on('change'          + eventNamespace, module.request.preload)
            ;
          }
        },
        
        initialValues: function() {
          module.deactivate.playable();
          module.update.playState();
          module.update.readyState();
          module.update.networkState();
          module.update.rate();
          module.update.time();
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
            var state;
            switch($video.prop('readyState')) {
              default:
              case $video.prop('HAVE_NOTHING'): 
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
            // outputs SUI module related constants
            return state;
          },
          networkState: function() {
            // TODO check wether the browsers actually update this prop, primary tests look like it is stuck on
            // - NETWORK_LOADING with FF 37.0.2, 
            // - NETWORK_IDLE with Chrome 42.0.2311.135
            var state;
            switch($video.prop('networkState')) {
              default:
              case $video.prop('NETWORK_EMPTY'): 
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
            // outputs SUI module related constants
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
          },
          formatSupported: function(mime) {
            var supported;
            // see https://developer.mozilla.org/fr/docs/Web/API/HTMLMediaElement#Methods
            switch(video.canPlayType(mime)) {
              case 'probably':
              case 'maybe':
                supported = true;
                break;
              default: 
                supported = false;
                break;
            }
            return supported;
          }
        },
        
        // the functions in this range will update the UI elements from the current video state, with no relevant return value
        update: {
          playState: function() {
            var playing = module.is.playing();
            module.debug('Update play state', playing);
            if(playing) {
              $playButton.addClass(className.active);
            }
            else {
              $playButton.removeClass(className.active);
            }
          },
          time: function() {
            var
              currentTime = module.get.currentTime(),
              duration = module.get.duration();
            if(isNaN(duration)) {
              module.reset.time();
            }
            else {
              module.debug('Update time', currentTime);
              // text displays
              $currentTime.text( module.get.readableTime(currentTime) );
              $remainingTime.text( module.get.readableTime(duration - currentTime) );
              // range display, prevent it to update when it has been 'mousedown'ed but not 'change'd yet
              if(!timeLookupActive) {
                $timeRange.val( timeRangeInterval * currentTime / duration );
              }
            }
          },
          volume: function() {
            var 
              muted = module.is.muted(),
              volume = module.get.volume();
            module.debug('Update volume and mute states', volume, muted);
            if(muted) {
              $volumeChangeButton.addClass(className.disabled);
              $volumeProgress.addClass(className.disabled);
              $muteButton.addClass(className.active);
            } 
            else {
              $volumeChangeButton.removeClass(className.disabled);
              $volumeProgress.removeClass(className.disabled);
              $muteButton.removeClass(className.active);
            }
            $volumeProgress.progress({ percent: volume * 100 });
          },
          rate: function() {
            var rate = module.get.playbackRate();
            module.debug('Update playBack rate', rate);
            $rateInput.val(rate);
          },
          readyState: function() {
            var state = module.get.readyState();
            module.debug('Update ready state', state);
            $readyStateRadio.filter('[value=' + state + ']').prop('checked', true);
          },
          networkState: function() {
            var state = module.get.networkState();
            module.debug('Update network state', state);
            $networkStateRadio.filter('[value=' + state + ']').prop('checked', true);
          },
          timeLookup: function() {
            // virtual time indicator based on the $timeRange "dragged" time
            var time = module.get.timeRangeValue();
            module.debug('Update timelookup state', time);
            $timeLookupBuffer.prop('checked', module.is.timeBuffered(time));
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
            if(module.is.playing()) {
              video.pause();
            }
            else {
              video.play();
            }
          },
          rate: function(value) {
            // see https://developer.mozilla.org/fr/docs/Web/API/HTMLMediaElement#playbackRate
            // seems to have a upper limit with some browsers : 
            // - 5 with FF 37.0.2
            // negative value seems to not be handled by some browsers :
            // - NS_ERROR_NOT_IMPLEMENTED with FF 37.0.2, 
            // - no visible effect with Chrome 42.0.2311.135
            if(typeof value != 'number') {
              value = parseFloat( $(this).val() );
            }
            module.debug('Request playback rate', value);
            video.playbackRate = value;
          },
          seek: {
            toAbsoluteTime: function(time) {
              if(module.is.timeSeekable(time)) {
                module.debug('Request seek', time);
                if(video.fastSeek) {
                  // use fastSeek if implemented
                  video.fastSeek(time);
                }
                else {
                  video.currentTime = time;
                }
              }
              else {
                module.debug('Time out of seekable ranges', time);
              }
            },
            toRelativeTime: function(shift) {
              if(typeof shift != 'number') {
                shift = parseFloat($(this).data(metadata.seekStep));
              }
              var position = module.get.currentTime() + shift;
              module.request.seek.toAbsoluteTime(position);
            },
            fromRangeValue: function() {
              module.request.seek.toAbsoluteTime(module.get.timeRangeValue());
            },
            loop: {
              tick: function() {
                if(seekTickTimer === null) {
                  module.debug('seek loop starts');
                  module.activate.holdPlayState();
                } 
                else {
                  seekHadTicked = true;
                  $(this).click();
                }
                // (re)start the loop, bindings are made in order to later access $(this)
                seekTickTimer = setTimeout(module.request.seek.loop.tick.bind(this), parseInt( $(this).data(metadata.seekLoopInterval) ));
              },
              stop: function() {
                if(seekTickTimer !== null) {
                  if(!seekHadTicked) {
                    // one click if the loop hadn't ticked (~ real click)
                    $(this).click(); // .trigger() seems not to be DOM related, but only jQuery internal (?)
                  }
                  module.debug('seek loop stops');
                  clearTimeout(seekTickTimer);
                  seekTickTimer = null;
                  seekHadTicked = false;
                  module.deactivate.holdPlayState();
                }
              },
              filterClick: function(event) {
                // human clicks are void (though they are re-triggered through the mousedown/mouseup behaviors combination), 
                // in order to avoid the final one which looks like a double one
                if(typeof event.isTrigger != 'undefined') {
                  // make them also void if the current time isn't in buffer, letting it time to heat down
                  if( !module.is.timeBuffered(module.get.currentTime()) ) {
                    //$(this).addClass(className.loading);
                  } 
                  else {
                    module.update.time();
                    module.request.seek.toRelativeTime.call(this);
                  }
                }
              }
            }
          },
          volume: {
            value: function(volume) {
              module.debug('Request volume value', volume);
              volume = Math.min(volume, 1);
              volume = Math.max(volume, 0);
              video.volume = volume;
            },
            shift: function(shift) {
              if(typeof shift != 'number') {
                shift = parseFloat($(this).data(metadata.volumeStep));
              }
              module.request.volume.value(module.get.volume() + shift);
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
            if(module.is.muted()) {
              module.request.unmute();
            }
            else {
              module.request.mute();
            }
          },
          void: function(event) {
            event.preventDefault();
            $(this).blur();
          },
          source: function(source, type) {
            if(typeof source != 'string') {
              source = $(this).dropdown('get value');
            }
            if(typeof type != 'string') {
              type = $(this).find('select option[value="' + source + '"]').data(metadata.videoType);
            }
            
            if(module.is.formatSupported(type)) {
              module.debug('Request source', source);
              $video.empty().append($('<source>', {src: source, type: type}));
              setTimeout(video.load.bind(video), 1);
            } 
            else {
              module.error('Request unsupported type', type, source);
            }
          },
          fullScreen: function() {
            module.debug('Request full screen');
            if (video.requestFullscreen) {
              video.requestFullscreen();
            } else if (video.msRequestFullscreen) {
              video.msRequestFullscreen();
            } else if (video.mozRequestFullScreen) {
              video.mozRequestFullScreen();
            } else if (video.webkitRequestFullscreen) {
              video.webkitRequestFullscreen();
            } else {
              module.error('Full screen is not available');
            }
          },
          loop: function(flag) {
            if(typeof flag != 'boolean') {
              flag = $(this).prop('checked');
            }
            module.debug('Request loop', flag);
            $video.prop('loop', flag);
          },
          preload: function(flag) {
            if(typeof flag != 'boolean') {
              flag = $(this).prop('checked');
            }
            module.debug('Request preload', flag);
            $video.prop('preload', flag);
          },
          autoplay: function(flag) {
            if(typeof flag != 'boolean') {
              flag = $(this).prop('checked');
            }
            module.debug('Request autoplay', flag);
            $video.prop('autoplay', flag);
          }
        },
        
        activate: {
          holdPlayState: function() {
            seekLoopInitialPlayState = module.is.playing();
            module.debug('Hold play state', seekLoopInitialPlayState);
            module.request.pause();
          },
          timeLookup: function() {
            module.debug('Activate time lookup');
            timeLookupActive = true;
            settings.onTimeLookupStart();
          },
          loader: function() {
            clearTimeout(loaderTimer);
            $loaderDimmer.dimmer('show');
          },
          playable: function() {
            if($requirePlayableMode.hasClass(className.disabled)) {
              module.debug('Activate playable mode');
              module.update.time();
              module.deactivate.loader();
              $requirePlayableMode.removeClass(className.disabled);
              module.request.seek.toAbsoluteTime(0);
            }
          }
        },
        
        deactivate: {
          holdPlayState: function() {
            module.debug('Unhold play state', seekLoopInitialPlayState);
            if(seekLoopInitialPlayState) {
              module.request.play();
            }
            seekLoopInitialPlayState = undefined;
          },
          timeLookup: function() {
            module.debug('Deactivate time lookup');
            timeLookupActive = false;
            settings.onTimeLookupStop();
          },
          loader: function(event) {
            // a seeking loop makes "seeking" and "seeked" events to fire alternatively, add a delay to prevent the state to blink
            if(event !== undefined) {
              // a native undelayed event has occured 
              loaderTimer = setTimeout(module.deactivate.loader, settings.seekedDelay);
            }
            else {
              // a delayed call has occured
              $loaderDimmer.dimmer('hide');
            }
          },
          playable: function() {
            module.debug('Deactivate playable mode');
            module.reset.time();
            $requirePlayableMode.addClass(className.disabled);
          }
        },
        
        reset: {
          rate: function() {
            var defaultRate = video.defaultPlaybackRate;
            module.debug('Reset playBack rate', defaultRate);
            video.playbackRate = defaultRate;
          },
          source: function() {
            module.debug('Reset (empty) source');
            $video.empty();
            setTimeout(video.load.bind(video), 1);
          },
          time: function() {
            module.debug('Reset time');
            $currentTime.add($remainingTime).text(settings.timeResetText);
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
          module.reset.all(); // TODO : check module integration
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
  verbose     : false,
  performance : false,

  className: {
    active      : 'active',
    disabled    : 'disabled',
    loading     : 'loading'
  },

  selector: {
    video:                  'video', 
    playButton:             '.play.button',  // not to be conflicted with .play.button > i.icon.play
    seekButton:             '.seek.button',
    currentTime:            '.current.time',
    remainingTime:          '.remaining.time',
    timeRange:              'input[type="range"].time',
    volumeChangeButton:     '.volume.push.button',
    volumeProgress:         '.volume.progress', // could be a input[type="range"]
    muteButton:             '.mute.button',
    rateInput:              '.rate input[type="number"]',
    rateReset:              '.rate .reset',
    loaderDimmer:           '.load.dimmer',
    readyStateRadio:        '.ready.state input[type="radio"]',           // could work with <select>
    networkStateRadio:      '.network.state input[type="radio"]',         // |
    timeLookupValue:        '.timelookup .time',
    timeLookupBuffer:       '.timelookup .buffer.checkbox input[type="checkbox"]',
    timeLookupPlayed:       '.timelookup .played.checkbox input[type="checkbox"]',
    sourceDropdown:         '.source.dropdown', // it needs to be .dropdown() initialized
    fullScreenButton:       '.fullscreen.button',
    autoplayCheckbox:       '.autoplay.checkbox input[type="checkbox"]',
    loopCheckbox:           '.loop.checkbox input[type="checkbox"]',
    preloadCheckbox:        '.preload.checkbox input[type="checkbox"]',
    
    statesLabel:            '.ready.state label, .network.state label, .timelookup .buffer.checkbox label, .timelookup .played.checkbox label'
    
  },
  
  metadata: {
    volumeStep: 'volume-step',
    seekStep: 'seek-step',
    seekLoopInterval: 'push-interval',
    videoType: 'video-type'
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
  
  seekedDelay: 500, // ms
  timeResetText: '0:00:00',
  
  onTimeLookupStart: function() {},
  onTimeLookupStop: function() {},
  onReset: function() {}
  
};

})( jQuery, window , document );
