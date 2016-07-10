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
        input           = settings.input,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        $module         = $(this),
        $thumb,
        $track,
        $trackFill,
        $labels,

        element         = this,
        instance        = $module.data(moduleNamespace),

        offset,
        precision,
        isTouch,

        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing range slider', settings);
          isTouch = module.get.isTouch();
          module.setup.layout();
          if(!module.is.disabled())
            module.bind.events();
          module.read.metadata();
          module.read.settings();
          module.instantiate();
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
          module.unbind.documentEvents();
          $module.removeData(moduleNamespace);
          instance = undefined;
        },

        setup: {
          layout: function() {
            if($module.find('.inner').length == 0)
              $module.append("<div class='inner'><div class='track'></div><div class='track-fill'></div><div class='thumb'></div></div>");
            precision = module.get.precision();
            $thumb = $module.find('.thumb');
            $track = $module.find('.track');
            $trackFill = $module.find('.track-fill');
            offset = $thumb.width()/2;
            if(module.is.labeled()) {
              $labels = $module.find('.labels:not(.auto)');
              if($labels.length != 0) {
                module.setup.customLabel();
              } else {
                module.setup.autoLabel();
              }
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
              ratio = ((index+1)/(numChildren+1));
              position = module.determine.positionFromRatio(ratio);
              $(this).css(module.is.reversed() ? 'right' : 'left', position);
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
                var $label = $('<li class="label">' + module.get.label(i+1) + '</li>');
                $label.css(module.is.reversed() ? 'right' : 'left', module.determine.positionFromValue((i+1) * module.get.step()));
                $labels.append($label);
              }
            }
          }
        },

        bind: {
          events: function() {
            // event listeners
            $module.find('.track, .thumb, .inner').on('mousedown' + eventNamespace, function(event) {
              event.stopImmediatePropagation();
              event.preventDefault();
              $(this).closest(".range").trigger('mousedown' + eventNamespace, event);
              module.event.down(event);
            });
            $module.on('mousedown' + eventNamespace, module.event.down);
            if(module.get.isTouch()) {
              $module.find('.track, .thumb, .inner').on('touchstart' + eventNamespace, function(event) {
                event.stopImmediatePropagation();
                event.preventDefault();
                $(this).closest(".range").trigger('touchstart' + eventNamespace, event);
                module.event.down(event);
              });
              $module.on('touchstart' + eventNamespace, module.event.down);
            }
          },
          documentEvents: function() {
            if(module.get.isTouch()) {
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
            $module.off('touchstart' + eventNamespace);
          },
          documentEvents: function() {
            if(module.get.isTouch()) {
              $(document).off('touchmove' + eventNamespace);
              $(document).off('touchend' + eventNamespace);
            }
            else {
              $(document).off('mousemove' + eventNamespace);
              $(document).off('mouseup' + eventNamespace);
            }
          },
        },

        event: {
          down: function(event, originalEvent) {
            event.preventDefault();
            if(!module.is.disabled())
              module.bind.documentEvents();
          },
          move: function(event, originalEvent) {
            event.preventDefault();
            var
              pageX = module.determine.eventXPos(event, originalEvent),
              newPos = module.determine.pos(pageX)
            ;
            if (pageX >= module.get.trackOffset() && pageX <= module.get.trackOffset() + module.get.trackWidth()) {
              module.set.valueBasedPosition(newPos);
            }
          },
          up: function(event, originalEvent) {
            event.preventDefault();
            var
              pageX = module.determine.eventXPos(event, originalEvent),
              newPos = module.determine.pos(pageX)
            ;
            if(pageX >= module.get.trackOffset() && pageX <= module.get.trackOffset() + module.get.trackWidth()) {
              module.set.valueMoveToValueBasedPosition(newPos);
            }
            module.unbind.documentEvents();
          },
        },

        is: {
          disabled: function() {
            return $module.hasClass(settings.className.disabled);
          },
          labeled: function() {
            return $module.hasClass(settings.className.labeled);
          },
          reversed: function() {
            return $module.hasClass(settings.className.reversed);
          }
        },

        get: {
          isTouch: function () {
           try {
             document.createEvent('TouchEvent');
             return true;
           } catch (e) {
             return false;
           }
         },
          trackOffset: function() {
            return $track.offset().left;
          },
          trackWidth: function() {
            return $track.width();
          },
          trackLeft: function() {
            return $track.position().left;
          },
          trackStartPos: function() {
            return module.is.reversed() ? module.get.trackLeft() + module.get.trackWidth() : module.get.trackLeft();
          },
          trackEndPos: function() {
            return module.is.reversed() ? module.get.trackLeft() : module.get.trackLeft() + module.get.trackWidth();
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
                return value * module.get.step();
              case settings.labelTypes.letter:
                return alphabet[value-1];
              case settings.labelTypes.none:
                return '';
              default:
                return value;
            }
          }
        },

        determine: {
          pos: function(pagePos) {
            return module.is.reversed() ? module.get.trackStartPos() - pagePos + module.get.trackOffset() : pagePos - module.get.trackOffset() - module.get.trackStartPos();
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
            return difference - module.get.min();
          },
          positionFromValue: function(value) {
            var
              min = module.get.min(),
              max = module.get.max(),
              trackWidth = module.get.trackWidth(),
              ratio = (value - min) / (max - min),
              trackPos = module.is.reversed() ? trackWidth - ($trackFill.position().left + $trackFill.width()) : $trackFill.position().left,
              position = Math.round(ratio * trackWidth) + trackPos
            ;
            module.verbose('Determined position: ' + position + ' from value: ' + value);
            return position;
          },
          positionFromRatio: function(ratio) {
            var
              trackWidth = module.get.trackWidth(),
              trackPos = module.is.reversed() ? trackWidth - ($trackFill.position().left + $trackFill.width()) : $trackFill.position().left,
              step = module.get.step(),
              position = Math.round(ratio * trackWidth) + trackPos,
              adjustedPos = (step == 0) ? position : Math.round(position / step) * step
            ;
            return adjustedPos;
          },
          eventXPos: function(event, originalEvent) {
            return isTouch ? originalEvent.originalEvent.touches[0].pageX : (typeof event.pageX != 'undefined') ? event.pageX : originalEvent.pageX
          },
        },

        set: {
          value: function(newValue) {
            if(input) {
              $(input).val(newValue);
            }
            settings.onChange.call(element, newValue);
            module.debug('Setting range value to ' + newValue);
          },
          position: function(value) {
            if (module.is.reversed())
              $thumb.css({right: String(value - offset) + 'px'});
            else
              $thumb.css({left: String(value - offset) + 'px'});
            $trackFill.css({width: String(value) + 'px'});
            module.position = value;
            module.debug('Setting range position to ' + value);
          },
          positionBasedValue: function(value) {
            var
              min = module.get.min(),
              max = module.get.max()
            ;
            if(value >= min && value <= max) {
              var position = module.determine.positionFromValue(value);
              module.set.position(position);
              module.set.value(value);
            } else if (value <= min) {
              module.goto.min();
              module.set.value(min);
            } else {
              module.goto.max();
              module.set.value(max);
            }
          },
          valueMoveToValueBasedPosition: function(position) {
            var
              value = module.determine.value(position),
              min = module.get.min(),
              max = module.get.max(),
              pos
            ;
            if (value <= min) {
              value = min;
            } else if (value >= max){
              value = max;
            }
            pos = module.determine.positionFromValue(value);
            module.set.value(value);
            module.set.position(pos);
          },
          valueBasedPosition: function(position) {
            var
              value = module.determine.value(position),
              min = module.get.min(),
              max = module.get.max()
            ;
            if(value >= min && value <= max) {
              module.set.position(position);
            } else if (value <= min) {
              module.goto.min();
              value = min;
            } else {
              module.goto.max();
              value = max;
            }
            module.set.value(value);
          },
        },

        goto: {
          max: function() {
            module.set.position(module.get.trackEndPos());
          },
          min: function() {
            module.set.position(module.get.trackStartPos());
          },
        },

        remove : {
          state: function() {
            module.verbose('Removing stored state');
            delete module.value;
          }
        },

        read: {
          metadata: function() {
            var
              data = {
                value   : $module.data(metadata.value)
              }
            ;
            if(data.value) {
              module.debug('Current value set from metadata', data.value);
              module.set.value(data.value);
              module.set.positionBasedValue(data.value);
            }
          },
          settings: function() {
            if(settings.start !== false) {
              module.debug('Start position set from settings', settings.start);
              module.set.positionBasedValue(settings.start);
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
    method : 'The method you called is not defined.',
  },

  metadata: {
    value : 'value'
  },

  min          : 0,
  max          : 20,
  step         : 1,
  start        : 0,
  input        : false,
  labelType    : 'number',

  //the decimal place to round to if step is undefined
  decimalPlaces  : 2,

  className     : {
    reversed : 'reversed',
    disabled : 'disabled',
    labeled  : 'labeled'
  },

  labelTypes    : {
    number  : 'number',
    none    : 'none',
    letter  : 'letter'
  },

  onChange : function(value){},

};


})( jQuery, window, document );
