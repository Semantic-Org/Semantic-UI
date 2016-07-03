/*!
 * # Range slider for Semantic UI.
 *
 */

;(function ( $, window, document, undefined ) {

"use strict";

$.fn.range = function(parameters) {

	var
		$allModules    = $(this),

		query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1)
	;

  $allModules
    .each(function() {

			var
				settings          = ( $.isPlainObject(parameters) )
					? $.extend(true, {}, $.fn.range.settings, parameters)
					: $.extend({}, $.fn.range.settings),

				namespace       = settings.namespace,
				min             = settings.min,
				max             = settings.max,
				step            = settings.step,
				start           = settings.start,
				input           = settings.input,

				eventNamespace  = '.' + namespace,
				moduleNamespace = 'module-' + namespace,

				$module         = $(this),

				element         = this,
				instance        = $module.data(moduleNamespace),

        reversed        = $module.hasClass('reversed'),

				$thumb,
        $track,
				$trackFill,
				precision,
        offset,

				module
			;

			module = {

				initialize: function() {
					module.instantiate();
				},

				instantiate: function() {
					instance = module;
					$module.data(moduleNamespace, module);
					$module.html("<div class='inner'><div class='track'></div><div class='track-fill'></div><div class='thumb'></div></div>");
          $track = $module.find('.track');
					$thumb = $module.find('.thumb');
					$trackFill = $module.find('.track-fill');
          offset = $thumb.width()/2;
					// find precision of step, used in calculating the value
					module.determinePrecision();
					// set start location
					module.setPositionBasedValue(settings.start);
					// event listeners
					$module.find('.track, .thumb, .inner').on('mousedown', function(event) {
						event.stopImmediatePropagation();
						event.preventDefault();
						$(this).closest(".range").trigger('mousedown', event);
					});
					$module.find('.track, .thumb, .inner').on('touchstart', function(event) {
						event.stopImmediatePropagation();
						event.preventDefault();
						$(this).closest(".range").trigger('touchstart', event);
					});
					$module.on('mousedown', function(event, originalEvent) {
						module.rangeMousedown(event, false, originalEvent);
					});
					$module.on('touchstart', function(event, originalEvent) {
						module.rangeMousedown(event, true, originalEvent);
					});
				},

				determinePrecision: function() {
					var split = String(settings.step).split('.');
					var decimalPlaces;
					if(split.length == 2) {
						decimalPlaces = split[1].length;
					} else {
						decimalPlaces = 0;
					}
					precision = Math.pow(10, decimalPlaces);
				},

				determineValue: function(startPos, endPos, currentPos) {
          if(reversed) {
            var temp = startPos;
            startPos = endPos;
            endPos = temp;
          }
					var
            ratio = (currentPos - startPos) / (endPos - startPos),
					  range = settings.max - settings.min,
					  difference = Math.round(ratio * range / step) * step
          ;
					// Use precision to avoid ugly Javascript floating point rounding issues
					// (like 35 * .01 = 0.35000000000000003)
          difference = Math.round(difference * precision) / precision;
					return difference + settings.min;
				},

				determinePosition: function(value) {
					var
            ratio = (value - settings.min) / (settings.max - settings.min),
            trackPos = reversed ? $track.width() - ($trackFill.position().left + $trackFill.width()) : $trackFill.position().left
          ;
					return Math.round(ratio * $track.width()) + trackPos;
				},

				setValue: function(newValue) {
					if(settings.input) {
						$(settings.input).val(newValue);
					}
					if(settings.onChange) {
						settings.onChange(newValue);
					}
				},

				setPosition: function(value) {
          if (reversed)
            $thumb.css({right: String(value - offset) + 'px'});
          else
            $thumb.css({left: String(value - offset) + 'px'});
					$trackFill.css({width: String(value) + 'px'});
				},

				rangeMousedown: function(mdEvent, isTouch, originalEvent) {
					if( !$module.hasClass('disabled') ) {
						mdEvent.preventDefault();
            var
              trackLeft = $track.position().left,
              trackOffset = $track.offset().left,
              trackWidth = $track.width(),
              trackStartPos = reversed ? trackLeft + trackWidth : trackLeft,
              trackEndPos = reversed ? trackLeft : trackLeft + trackWidth,
              pageX = isTouch ? originalEvent.originalEvent.touches[0].pageX : (typeof mdEvent.pageX != 'undefined') ? mdEvent.pageX : originalEvent.pageX,
              newPos = reversed ? trackStartPos - pageX + trackOffset : pageX - trackOffset - trackStartPos,
              value
            ;
						// if(pageX >= trackFill && pageX <= trackFill + trackWidth) {
						// 	value = module.setValueBasedPosition(newPos);
						// }
						var rangeMousemove = function(mmEvent) {
							mmEvent.preventDefault();
							if(isTouch) {
								pageX = mmEvent.originalEvent.touches[0].pageX;
							} else {
								pageX = mmEvent.pageX;
							}
              newPos = reversed ? trackStartPos - pageX + trackOffset : pageX - trackOffset - trackStartPos;
							if(pageX >= trackOffset && pageX <= trackOffset + trackWidth) {
								value = module.setValueBasedPosition(newPos);
							}
						}
						var rangeMouseup = function(muEvent) {
              if(pageX >= trackOffset && pageX <= trackOffset + trackWidth) {
  							module.setValueMoveToValueBasedPosition(newPos);
  						}
              if(isTouch) {
  							$(document).off('touchmove', rangeMousemove);
  							$(document).off('touchend', rangeMouseup);
  						}
  						else {
  							$(document).off('mousemove', rangeMousemove);
  							$(document).off('mouseup', rangeMouseup);
  						}
						}
						if(isTouch) {
							$(document).on('touchmove', rangeMousemove);
							$(document).on('touchend', rangeMouseup);
						}
						else {
							$(document).on('mousemove', rangeMousemove);
							$(document).on('mouseup', rangeMouseup);
						}
					}
				},

        setMaxPosition: function() {
          var
            trackLeft = $track.position().left,
            trackWidth = $track.width(),
            trackEndPos = reversed ? trackLeft : trackLeft + trackWidth
          ;
          module.setPosition(trackEndPos);
        },

        setMinPosition: function() {
          var
            trackLeft = $track.position().left,
            trackWidth = $track.width(),
            trackStartPos = reversed ? trackLeft + trackWidth : trackLeft
          ;
          module.setPosition(trackStartPos);
        },

				setPositionBasedValue: function(value) {
          if(value >= settings.min && value <= settings.max) {
            var position = module.determinePosition(value);
            module.setPosition(position);
            module.setValue(value);
          } else if (value <= settings.min) {
            module.setMinPosition();
            module.setValue(settings.min);
          } else {
            module.setMaxPosition();
            module.setValue(settings.max);
          }
				},

        setValueMoveToValueBasedPosition: function(position) {
          var
            trackLeft = $track.position().left,
            trackWidth = $track.width(),
            trackStartPos = reversed ? trackLeft + trackWidth : trackLeft,
            trackEndPos = reversed ? trackLeft : trackLeft + trackWidth,
            value = module.determineValue(trackStartPos, trackEndPos, position),
            pos
          ;
          if (value <= settings.min) {
            value = settings.min;
          } else if (value >= settings.max){
            value = settings.max;
          }
          pos = module.determinePosition(value);
          module.setValue(value);
          module.setPosition(pos);
        },

        setValueBasedPosition: function(position) {
          var
            trackLeft = $track.position().left,
            trackWidth = $track.width(),
            trackStartPos = reversed ? trackLeft + trackWidth : trackLeft,
            trackEndPos = reversed ? trackLeft : trackLeft + trackWidth,
            value = module.determineValue(trackStartPos, trackEndPos, position)
          ;
          if(value >= settings.min && value <= settings.max) {
            module.setPosition(position);
          } else if (value <= settings.min) {
            module.setMinPosition();
            value = settings.min;
          } else {
            module.setMaxPosition();
            value = settings.max;
          }
          module.setValue(value);
        },

				invoke: function(query) {
					switch(query) {
						case 'set value':
							if(queryArguments.length > 0) {
								instance.setPositionBasedValue(queryArguments[0]);
							}
							break;
					}
				},

			};

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        module.initialize();
      }

    })
  ;

  return this;

};

$.fn.range.settings = {

  name         : 'Range',
  namespace    : 'range',

	min          : 0,
	max          : false,
	step         : 1,
	start        : 0,
	input        : false,

	onChange     : function(value){},

};


})( jQuery, window, document );
