/*!
 * # Range slider for Semantic UI.
 *
 */

;(function ( $, window, document, undefined ) {

"use strict";

window = (typeof window != 'undefined' && window.Math == Math)
  ? window
  : (typeof self != 'undefined' && self.Math == Math)
    ? self
    : Function('return this')()
;

$.fn.range = function(parameters) {

  var
    $allModules    = $(this),

    moduleSelector = $allModules.selector || '',

    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),

    alphabet       = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],

    SINGLE_STEP     = 1,
    BIG_STEP        = 2,
    NO_STEP         = 0,
    SINGLE_BACKSTEP = -1,
    BIG_BACKSTEP    = -2,

    // used to manage docuemnt bound events.
    // Use this so that we can distinguish between which document events are bound to which range.
    currentRange    = 0,

    returnedValue
  ;

  $allModules
    .each(function() {

      var
        settings        = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.range.settings, parameters)
          : $.extend({}, $.fn.range.settings),

        className       = settings.className,
        metadata        = settings.metadata,
        namespace       = settings.namespace,
        error           = settings.error,
        keys            = settings.keys,

        isHover         = false,
        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        $module         = $(this),
        $currThumb,
        $thumb,
        $secondThumb,
        $track,
        $trackFill,
        $labels,

        element         = this,
        instance        = $module.data(moduleNamespace),

        docuementEventIdentifier,

        value,
        position,
        secondPos,
        offset,
        precision,
        isTouch,
        sliderObserver,

        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing range slider', settings);

          currentRange += 1;
          docuementEventIdentifier = currentRange;

          isTouch = module.setup.testOutTouch();
          module.setup.layout();

          if(!module.is.disabled())
            module.bind.events();

          module.read.metadata();
          module.read.settings();

          module.observeChanges();
          module.instantiate();
          settings.onChange.call(element, value);
        },

        instantiate: function() {
          module.verbose('Storing instance of range', module);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous range for', $module);
          clearInterval(instance.interval);
          module.unbind.events();
          module.unbind.slidingEvents();
          $module.removeData(moduleNamespace);
          module.disconnect.sliderObserver();
          instance = undefined;
        },

        observeChanges: function() {
          if('MutationObserver' in window) {
            sliderObserver = new MutationObserver(module.event.resize);
            module.debug('Setting up mutation observer', sliderObserver);
            module.observe.slider();
          }
        },

        observe: {
          slider: function() {
            sliderObserver.observe($module[0], {
              attributes: true,
            });
          },
        },

        disconnect: {
          sliderObserver: function() {
            if(sliderObserver) {
              sliderObserver.disconnect();
            }
          }
        },

        setup: {
          layout: function() {
            if( $module.attr('tabindex') === undefined) {
              $module.attr('tabindex', 0);
            }
            if($module.find('.inner').length == 0)
              $module.append("<div class='inner'><div class='track'></div><div class='track-fill'></div><div class='thumb'></div></div>");
            precision = module.get.precision();
            $thumb = $module.find('.thumb:not(.second)');
            $currThumb = $thumb;
            if(module.is.doubled()) {
              if($module.find('.thumb.second').length == 0)
                $module.find('.inner').append("<div class='thumb second'></div>");
              $secondThumb = $module.find('.thumb.second');
            }
            $track = $module.find('.track');
            $trackFill = $module.find('.track-fill');
            offset = $thumb.width()/2;
            module.setup.labels();
          },
          labels: function() {
            if(module.is.labeled()) {
              $labels = $module.find('.labels:not(.auto)');
              if($labels.length != 0) {
                module.setup.customLabel();
              } else {
                module.setup.autoLabel();
              }
            }
          },
          testOutTouch: function() {
            try {
             document.createEvent('TouchEvent');
             return true;
            } catch (e) {
             return false;
            }
          },
          customLabel: function() {
            var
              $children   = $labels.find('.label'),
              numChildren = $children.length,
              ratio,
              position
            ;
            $children.each(function(index) {
              var
                $child = $(this),
                attrValue = $child.attr('data-value')
              ;
              if(attrValue) {
                position = module.determine.positionFromValue(attrValue)
              } else {
                ratio = ((index+1)/(numChildren+1));
                position = module.determine.positionFromRatio(ratio);
              }
              var posDir =
                module.is.vertical()
                ?
                module.is.reversed() ? 'bottom' : 'top'
                :
                module.is.reversed() ? 'right' : 'left'
              ;
              $(this).css(posDir, position);
            });
          },
          autoLabel: function() {
            if(module.get.step() != 0) {
              $labels = $module.find('.labels');
              if($labels.length != 0)
                $labels.empty()
              else
                $labels = $module.append('<ul class="auto labels"></ul>').find('.labels');
              for(var i = 0; i <= module.get.numLabels(); i++) {
                var
                  $label = $('<li class="label">' + module.get.label(i+1) + '</li>'),
                  position =
                    module.is.vertical()
                    ?
                    module.is.reversed() ? 'bottom' : 'top'
                    :
                    module.is.reversed() ? 'right' : 'left'
                ;
                $label.css(position, module.determine.positionFromValue((i+1) * module.get.step() + module.get.min()));
                $labels.append($label);
              }
            }
          }
        },

        bind: {
          events: function() {
            module.bind.globalKeyboardEvents();
            module.bind.resizeListener();
            module.bind.keyboardEvents();
            module.bind.mouseEvents();
            if(module.is.touch()) {
              module.bind.touchEvents();
            }
          },
          resizeListener: function() {
            $(window).on('resize' + eventNamespace, module.event.resize);
          },
          keyboardEvents: function() {
            module.verbose('Binding keyboard events');
            $module.on('keydown' + eventNamespace, module.event.keydown);
          },
          globalKeyboardEvents: function() {
            $(document).on('keydown' + eventNamespace + docuementEventIdentifier, module.event.activateFocus);
          },
          mouseEvents: function() {
            module.verbose('Binding mouse events');
            $module.find('.track, .thumb, .inner').on('mousedown' + eventNamespace, function(event) {
              event.stopImmediatePropagation();
              event.preventDefault();
              module.event.down(event);
            });
            $module.on('mousedown' + eventNamespace, module.event.down);
            $module.on('mouseenter' + eventNamespace, function(event) {
              isHover = true;
            });
            $module.on('mouseleave' + eventNamespace, function(event) {
              isHover = false;
            });
          },
          touchEvents: function() {
            module.verbose('Binding touch events');
            $module.find('.track, .thumb, .inner').on('touchstart' + eventNamespace, function(event) {
              event.stopImmediatePropagation();
              event.preventDefault();
              module.event.down(event);
            });
            $module.on('touchstart' + eventNamespace, module.event.down);
          },
          slidingEvents: function() {
            // these don't need the identifier because we only ever want one of them to be registered with document
            module.verbose('Binding page wide events while handle is being draged');
            if(module.is.touch()) {
              $(document).on('touchmove' + eventNamespace, module.event.move);
              $(document).on('touchend' + eventNamespace, module.event.up);
            }
            else {
              $(document).on('mousemove' + eventNamespace, module.event.move);
              $(document).on('mouseup' + eventNamespace, module.event.up);
            }
          }
        },

        unbind: {
          events: function() {
            $module.find('.track, .thumb, .inner').off('mousedown' + eventNamespace);
            $module.find('.track, .thumb, .inner').off('touchstart' + eventNamespace);
            $module.off('mousedown' + eventNamespace);
            $module.off('mouseenter' + eventNamespace);
            $module.off('mouseleave' + eventNamespace);
            $module.off('touchstart' + eventNamespace);
            $module.off('keydown' + eventNamespace);
            $module.off('focusout' + eventNamespace);
            $(window).off('resize' + eventNamespace);
            $(document).off('keydown' + eventNamespace + docuementEventIdentifier, module.event.activateFocus);
          },
          slidingEvents: function() {
            if(module.is.touch()) {
              $(document).off('touchmove' + eventNamespace);
              $(document).off('touchend' + eventNamespace);
            } else {
              $(document).off('mousemove' + eventNamespace);
              $(document).off('mouseup' + eventNamespace);
            }
          },
        },

        event: {
          resize: function(event) {
            module.resync();
          },
          down: function(event, originalEvent) {
            event.preventDefault();
            if(module.is.doubled()) {
              var
                eventPos = module.determine.eventPos(event, originalEvent),
                newPos = module.determine.pos(eventPos)
              ;
              $currThumb = module.determine.closestThumb(newPos);
            }
            if(!module.is.disabled())
              module.bind.slidingEvents();
          },
          move: function(event, originalEvent) {
            event.preventDefault();
            var
              eventPos = module.determine.eventPos(event, originalEvent),
              newPos = module.determine.pos(eventPos)
            ;
            if (eventPos >= module.get.trackOffset() && eventPos <= module.get.trackOffset() + module.get.trackLength()) {
              if(module.get.step() == 0 || settings.smooth) {
                module.update.position(newPos);
                settings.onMove.call(element, module.determine.value(newPos));
              } else {
                module.update.value(module.determine.value(newPos), function() {
                  settings.onMove.call(element, value);
                });
              }
            } else if(eventPos >= module.get.trackOffset()) {
              module.update.position(
                module.determine.positionFromValue(module.get.max())
              );
            } else if(eventPos <= module.get.trackOffset() + module.get.trackLength()) {
              module.update.position(
                module.determine.positionFromValue(module.get.min())
              );
            }
          },
          up: function(event, originalEvent) {
            event.preventDefault();
            var
              eventPos = module.determine.eventPos(event, originalEvent),
              newPos = module.determine.pos(eventPos)
            ;
            if(eventPos >= module.get.trackOffset() && eventPos <= module.get.trackOffset() + module.get.trackLength()) {
              module.set.value(module.determine.value(newPos));
            } else if(eventPos >= module.get.trackOffset()) {
              module.set.value(module.get.max());
            } else if(eventPos <= module.get.trackOffset() + module.get.trackLength()) {
              module.set.value(module.get.min());
            }
            module.unbind.slidingEvents();
          },
          keydown: function(event, first) {
            if(module.is.focused()) {
              $(document).trigger(event);
            }
            if(first || module.is.focused()) {
              var step = module.determine.keyMovement(event);
              if(step != NO_STEP) {
                event.preventDefault();
                switch(step) {
                  case SINGLE_STEP:
                    module.takeStep();
                    break;
                  case BIG_STEP:
                    module.takeStep(module.get.multiplier());
                    break;
                  case SINGLE_BACKSTEP:
                    module.backStep();
                    break;
                  case BIG_BACKSTEP:
                    module.backStep(module.get.multiplier());
                    break;
                }
              }
            }
          },
          activateFocus: function(event) {
            if(!module.is.focused() && module.is.hover() && module.determine.keyMovement(event) != NO_STEP) {
              event.preventDefault();
              module.event.keydown(event, true);
              $module.focus();
            }
          },
        },

        resync: function() {
          module.verbose('Resyncing thumb position based on value');
          if(module.is.doubled()) {
            module.update.position(module.determine.positionFromValue(module.secondThumbVal), $secondThumb);
          }
          module.update.position(module.determine.positionFromValue(module.thumbVal), $thumb);
          module.setup.labels();
        },
        takeStep: function(multiplier) {
          var
            multiplier = multiplier != undefined ? multiplier : 1,
            step = module.get.step(),
            currValue = module.get.currentThumbValue()
          ;
          module.verbose('Taking a step');
          if(step > 0)
            module.set.value(currValue + step * multiplier);
        },

        backStep: function(multiplier) {
          var
            multiplier = multiplier != undefined ? multiplier : 1,
            step = module.get.step(),
            currValue = module.get.currentThumbValue()
          ;
          module.verbose('Going back a step');
          if(step > 0)
            module.set.value(currValue - step * multiplier);
        },

        is: {
          doubled: function() {
            return $module.hasClass(settings.className.doubled);
          },
          hover: function() {
            return isHover;
          },
          focused: function() {
            return $module.is(':focus');
          },
          disabled: function() {
            return $module.hasClass(settings.className.disabled);
          },
          labeled: function() {
            return $module.hasClass(settings.className.labeled);
          },
          reversed: function() {
            return $module.hasClass(settings.className.reversed);
          },
          vertical: function() {
            return $module.hasClass(settings.className.vertical);
          },
          touch: function() {
            return isTouch;
          },
        },

        get: {
          trackOffset: function() {
            if (module.is.vertical()) {
              return $track.offset().top;
            } else {
              return $track.offset().left;
            }
          },
          trackLength: function() {
            if (module.is.vertical()) {
              return $track.height();
            } else {
              return $track.width();
            }
          },
          trackLeft: function() {
            if (module.is.vertical()) {
              return $track.position().top;
            } else {
              return $track.position().left;
            }
          },
          trackStartPos: function() {
            return module.is.reversed() ? module.get.trackLeft() + module.get.trackLength() : module.get.trackLeft();
          },
          trackEndPos: function() {
            return module.is.reversed() ? module.get.trackLeft() : module.get.trackLeft() + module.get.trackLength();
          },
          precision: function() {
            var
              decimalPlaces,
              step = module.get.step()
            ;
            if(step != 0) {
              var split = String(step).split('.');
              if(split.length == 2) {
                decimalPlaces = split[1].length;
              } else {
                decimalPlaces = 0;
              }
            } else {
              decimalPlaces = settings.decimalPlaces;
            }
            var precision = Math.pow(10, decimalPlaces);
            module.debug('Precision determined', precision);
            return precision;
          },
          min: function() {
            return settings.min;
          },
          max: function() {
            return settings.max;
          },
          step: function() {
            return settings.step;
          },
          numLabels: function() {
            var value = Math.round((module.get.max() - module.get.min()) / module.get.step()) - 2;
            module.debug('Determined that their should be ' + value + ' labels');
            return value
          },
          labelType: function() {
            return settings.labelType;
          },
          label: function(value) {
            switch (settings.labelType) {
              case settings.labelTypes.number:
                return (value * module.get.step()) + module.get.min();
              case settings.labelTypes.letter:
                return alphabet[(value-1)%26];
              case settings.labelTypes.none:
                return '';
              default:
                return value;
            }
          },
          value: function() {
            return value;
          },
          currentThumbValue: function() {
            if($currThumb.hasClass('second'))
              return module.secondThumbVal;
            return module.thumbVal;
          },
          thumbValue: function(which) {
            switch(which) {
              case 'first':
                return module.thumbVal;
              case 'second':
              if(module.is.doubled())
                return module.secondThumbVal;
              else {
                module.error(error.notdouble);
                break;
              }
              default:
                return module.thumbVal;
            }
          },
          multiplier: function() {
            return settings.pageMultiplier;
          },
          thumbPosition: function(which) {
            switch(which) {
              case 'first':
                return position;
              case 'second':
                if(module.is.doubled())
                  return secondThumbPosition;
                else {
                  module.error(error.notdouble);
                  break;
                }
              default:
                return position;
            }
          },
        },

        determine: {
          pos: function(pagePos) {
            return module.is.reversed() ? module.get.trackStartPos() - pagePos + module.get.trackOffset() : pagePos - module.get.trackOffset() - module.get.trackStartPos();
          },
          closestThumb: function(eventPos) {
            var
              thumbPos = parseFloat(module.determine.thumbPos($thumb)),
              thumbDelta = Math.abs(eventPos - thumbPos),
              secondThumbPos = parseFloat(module.determine.thumbPos($secondThumb)),
              secondThumbDelta = Math.abs(eventPos - secondThumbPos)
            ;
            return thumbDelta <= secondThumbDelta ? $thumb : $secondThumb;
          },
          closestThumbPos: function(eventPos) {
            var
              thumbPos = parseFloat(module.determine.thumbPos($thumb)),
              thumbDelta = Math.abs(eventPos - thumbPos),
              secondThumbPos = parseFloat(module.determine.thumbPos($secondThumb)),
              secondThumbDelta = Math.abs(eventPos - secondThumbPos)
            ;
            return thumbDelta <= secondThumbDelta ? thumbPos : secondThumbPos;
          },
          thumbPos: function($element) {
            var pos =
              module.is.vertical()
              ?
              module.is.reversed() ? $element.css('bottom') : $element.css('top')
              :
              module.is.reversed() ? $element.css('right') : $element.css('left')
            ;
            return pos;
          },
          positionFromValue: function(value) {
            var
              min = module.get.min(),
              max = module.get.max(),
              value = value > max ? max : value < min ? min : value,
              trackLength = module.get.trackLength(),
              ratio = (value - min) / (max - min),
              position = Math.round(ratio * trackLength)
            ;
            module.verbose('Determined position: ' + position + ' from value: ' + value);
            return position;
          },
          positionFromRatio: function(ratio) {
            var
              trackLength = module.get.trackLength(),
              step = module.get.step(),
              position = Math.round(ratio * trackLength),
              adjustedPos = (step == 0) ? position : Math.round(position / step) * step
            ;
            return adjustedPos;
          },
          eventPos: function(event, originalEvent) {
            if(module.is.touch()) {
              var
                touchY = event.changedTouches[0].pageY || event.touches[0].pageY,
                touchX = event.changedTouches[0].pageX || event.touches[0].pageX
              ;
              return module.is.vertical() ? touchY : touchX;
            }
            var
              clickY = event.pageY || originalEvent.pageY,
              clickX = event.pageX || originalEvent.pageX
            ;
            return module.is.vertical() ? clickY : clickX;
          },
          value: function(position) {
            var
              startPos = module.is.reversed() ? module.get.trackEndPos() : module.get.trackStartPos(),
              endPos = module.is.reversed() ? module.get.trackStartPos() : module.get.trackEndPos(),
              ratio = (position - startPos) / (endPos - startPos),
              range = module.get.max() - module.get.min(),
              step = module.get.step(),
              value = (ratio * range),
              difference = (step == 0) ? value : Math.round(value / step) * step
            ;
            module.verbose('Determined value based upon position: ' + position + ' as: ' + value);
            if(value != difference) module.verbose('Rounding value to closest step: ' + difference);
            // Use precision to avoid ugly Javascript floating point rounding issues
            // (like 35 * .01 = 0.35000000000000003)
            difference = Math.round(difference * precision) / precision;
            module.verbose('Cutting off additional decimal places')
            return difference + module.get.min();
          },
          keyMovement: function(event) {
            var
              key = event.which,
              downArrow =
                module.is.vertical()
                ?
                module.is.reversed() ? keys.downArrow : keys.upArrow
                :
                keys.downArrow
              ,
              upArrow =
                module.is.vertical()
                ?
                module.is.reversed() ? keys.upArrow : keys.downArrow
                :
                keys.upArrow
              ,
              leftArrow =
                !module.is.vertical()
                ?
                module.is.reversed() ? keys.rightArrow : keys.leftArrow
                :
                keys.leftArrow
              ,
              rightArrow =
                !module.is.vertical()
                ?
                module.is.reversed() ? keys.leftArrow : keys.rightArrow
                :
                keys.rightArrow
            ;
            if(key == downArrow || key == leftArrow) {
              return SINGLE_BACKSTEP;
            } else if(key == upArrow || key == rightArrow) {
              return SINGLE_STEP;
            } else if (key == keys.pageDown) {
              return BIG_BACKSTEP;
            } else if (key == keys.pageUp) {
              return BIG_STEP;
            } else {
              return NO_STEP;
            }
          }
        },

        handleNewValuePosition: function(val) {
          var
            min = module.get.min(),
            max = module.get.max(),
            newPos
          ;
          if(val >= min && val <= max) {
            newPos = module.determine.positionFromValue(val);
          } else if (val <= min) {
            newPos = module.determine.positionFromValue(min);
            val = min;
          } else {
            newPos = module.determine.positionFromValue(max);
            val = max;
          }
          return newPos;
        },

        set: {
          value: function(newValue) {
            module.update.value(newValue, function(value) {
              settings.onChange.call(element, value);
            });
          },
          valueDouble: function(first, second) {
            if(module.is.doubled()) {
              module.thumbVal = first;
              module.secondThumbVal = second;
              position = module.handleNewValuePosition(module.thumbVal);
              module.update.position(position, $thumb)
              secondPos = module.handleNewValuePosition(module.secondThumbVal);
              module.update.position(secondPos, $secondThumb);
              value = Math.abs(module.thumbVal - module.secondThumbVal);
            } else {
              module.error(error.notdouble);
            }
          },
          position: function(position, which) {
            switch (which) {
              case 'first':
                module.update.position(position);
                break;
              case 'second':
                module.update.position(position, $secondThumb);
                break;
              default:
                module.update.position(position);
            }
          }
        },

        update: {
          value: function(newValue, callback) {
            var
              min = module.get.min(),
              max = module.get.max()
            ;
            if (newValue <= min) {
              newValue = min;
            } else if(newValue >= max){
              newValue = max;
            }
            if(!module.is.doubled()) {
              position = module.handleNewValuePosition(newValue);
              module.update.position(position);
              value = newValue;
              module.thumbVal = value;
            } else {
              var newPos = module.handleNewValuePosition(newValue);
              if(!$currThumb.hasClass('second')) {
                module.thumbVal = newValue;
              }
              else {
                module.secondThumbVal = newValue;
              }
              module.update.position(newPos);
              value = Math.abs(module.thumbVal - module.secondThumbVal);
            }
            module.debug('Setting range value to ' + value);
            if(typeof callback === 'function')
              callback(value);
          },
          position: function(newPos, $element) {
            var $targetThumb = $element != undefined ? $element : $currThumb;
            if(module.is.doubled()) {
              if(!$targetThumb.hasClass('second'))
                position = newPos;
              else
                secondPos = newPos;
            } else {
              position = newPos;
            }
            var
              bottomThumbValue,
              trackPosValue,
              trackFillWidth = module.is.doubled() ? Math.abs(position - secondPos) : newPos
            ;
            if (module.is.vertical()) {
              if (module.is.reversed()) {
                $targetThumb.css({bottom: String(newPos - offset) + 'px'});
                if(module.is.doubled())
                  trackPosValue = {bottom: String(parseFloat(module.determine.closestThumbPos(0)) + offset) + 'px'};
              }
              else {
                $targetThumb.css({top: String(newPos - offset) + 'px'});
                if(module.is.doubled())
                  trackPosValue = {top: String(parseFloat(module.determine.closestThumbPos(0)) + offset) + 'px'};
              }
              $trackFill.css(Object.assign({height: String(trackFillWidth) + 'px'}, trackPosValue));
            } else {
              if (module.is.reversed()) {
                $targetThumb.css({right: String(newPos - offset) + 'px'});
                if(module.is.doubled())
                  trackPosValue = {right: String(parseFloat(module.determine.closestThumbPos(0)) + offset) + 'px'};
              }
              else {
                $targetThumb.css({left: String(newPos - offset) + 'px'});
                if(module.is.doubled())
                  trackPosValue = {left: String(parseFloat(module.determine.closestThumbPos(0)) + offset) + 'px'};
              }
              $trackFill.css(Object.assign({width: String(trackFillWidth) + 'px'}, trackPosValue));
            }
            module.debug('Setting range position to ' + newPos);
          },
        },

        goto: {
          max: function() {
            module.set.value(module.get.max());
          },
          min: function() {
            module.set.value(module.get.min());
          },
        },

        read: {
          metadata: function() {
            var
              data = {
                thumbVal        : $module.data(metadata.thumbVal),
                secondThumbVal  : $module.data(metadata.secondThumbVal),
              }
            ;
            if(data.thumbVal) {
              if(module.is.doubled() && data.secondThumbVal) {
                module.debug('Current value set from metadata', data.thumbVal, data.secondThumbVal);
                module.set.valueDouble(data.thumbVal, data.secondThumbVal);
              } else {
                module.debug('Current value set from metadata', data.thumbVal);
                module.update.value(data.thumbVal);
              }
            }
          },
          settings: function() {
            if(settings.start !== false) {
              if(module.is.doubled()) {
                module.debug('Start position set from settings', settings.start, settings.doubleStart);
                module.set.valueDouble(settings.start, settings.doubleStart);
              } else {
                module.debug('Start position set from settings', settings.start);
                module.update.value(settings.start);
              }
            }
          }
        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            if($.isPlainObject(settings[name])) {
              $.extend(true, settings[name], value);
            }
            else {
              settings[name] = value;
            }
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
          if(!settings.silent && settings.debug) {
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
          if(!settings.silent && settings.verbose && settings.debug) {
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
          if(!settings.silent) {
            module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
            module.error.apply(console, arguments);
          }
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

$.fn.range.settings = {

  silent       : false,
  debug        : false,
  verbose      : false,
  performance  : true,

  name         : 'Range',
  namespace    : 'range',

  error    : {
    method    : 'The method you called is not defined.',
    notdouble : 'This slider is not a double slider'
  },

  metadata: {
    thumbVal        : 'thumbVal',
    secondThumbVal  : 'secondThumbVal',
  },

  min          : 0,
  max          : 20,
  step         : 1,
  start        : 0,
  doubleStart  : 1,
  labelType    : 'number',
  smooth       : false,

  //the decimal place to round to if step is undefined
  decimalPlaces  : 2,

  // page up/down multiplier. How many more times the steps to take on page up/down press
  pageMultiplier : 2,

  className     : {
    reversed : 'reversed',
    disabled : 'disabled',
    labeled  : 'labeled',
    vertical : 'vertical',
    doubled   : 'double',
  },

  keys : {
    pageUp     : 33,
    pageDown   : 34,
    leftArrow  : 37,
    upArrow    : 38,
    rightArrow : 39,
    downArrow  : 40
  },

  labelTypes    : {
    number  : 'number',
    none    : 'none',
    letter  : 'letter'
  },

  onChange : function(value){},
  onMove   : function(value){},
};


})( jQuery, window, document );
