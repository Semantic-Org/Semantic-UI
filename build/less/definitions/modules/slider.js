;(function ( $, window, document, undefined ) {
/* internal data value stored in integer now for presentation brevity of views */
$.fn.slyder = function(parameters)
{
	var
		$allModules = $(this),		

		time = new Date().getTime(),
		performance = [],

		query = arguments[0],
		methodInvoked = (typeof query == 'string'),
		queryArguments = [].slice.call(arguments, 1),

		returnedValue
	;

	$allModules
		.each(function(){
			var
				settings = ( $.isPlainObject(parameters) )
					? $.extend(true, {}, $.fn.slyder.settings, parameters)
					: $.extend({}, $.fn.slyder.settings),

				selector = settings.selector,
				className = settings.className,
				namespace = settings.namespace,
				error = settings.error,

				eventNamespace = '.' + namespace,
				moduleNamespace = 'module-' + namespace,
				moduleSelector = $allModules.selector || '',

				$module = $(this),
				$thumb = $module.find(selector.thumb),
				$window = $(window),
				$input,
				$select,
				$dropdown,

				lowerBound = 0,
				upperBound = parseInt($module.css("width")),
				range = upperBound - lowerBound,
				minValue = settings.min,
				maxValue = settings.max,
				extent = maxValue - minValue,
			    dragging = false,
			    previousLocation,
				dataValue,
				vertical = $module.hasClass(className.vertical) || false,
				inputTailing = '',
				inputChangeEvent,
				selectChangeEvent,
				defaultDropdownOnChange,

				element = this,
				instance = $module.data(moduleNamespace),
				module
			;
			
			module = {

				initialize: function() {
					module.verbose('Initializing module for', element);
					module.bind.mouseEvents();
					$thumb.attr('data-content', 50);
					inputChangeEvent = module.get.changeEvent();
					selectChangeEvent = 'change';					
					module.instantiate();
				},

				instantiate: function() {
					module.verbose('Storing instance of module', module);
					instance = module;
					$module
						.data(moduleNamespace, instance)						
					;					
				},

				destroy: function() {
					module.verbose('Destroying previous module for', element);					
					$module
						.removeData(moduleNamespace)
						.off(eventNamespace)
					;
					$thumb
						.off(eventNamespace)
					;
					$window
						.off(eventNamespace)
					;
					if ($input !== undefined) {
						$input
							.off(eventNamespace)
						;
					}
					if ($select !== undefined) {
						$select
							.off(eventNamespace)
						;
					}
					if ($dropdown !== undefined) {
						$dropdown
							.dropdown({
								onChange: defaultDropdownOnChange
							})
						;
					}
				},

				refresh: function() {
					module.verbose('Refreshing selector cache');
					$module = $(element);
				},

				bind: {
					keyboardEvents: function() {
						module.debug('Binding keyboard events');

					},
					touchEvents: function() {
						module.debug('Touch device detected binding touch events');
						
					},
					mouseEvents: function() {
						module.verbose('Mouse detected binding mouse events');
						$window
							.on('mousemove' + eventNamespace, module.event.thumb.moved)
							.on('mouseup' + eventNamespace, module.event.thumb.released)
						;
						$thumb
							.on('mousedown' + eventNamespace, module.event.thumb.holded)
						;						
					},
					input: function(bindingSelector) {
						/* Binding will be removed if re-initialized */
						module.debug('Currently binding supports only inputs(including select) and no specific attribute');
						var bind = $(bindingSelector);						
						$input = ( bind.filter(selector.input).size() > 0 ) ? bind.filter(selector.input) : undefined;
						$select = ( bind.filter(selector.select).size() > 0 ) ? bind.filter(selector.select) : undefined;
						$dropdown = (bind.filter(selector.dropdown).size() > 0 ) ? bind.filter(selector.dropdown) : undefined;						
						if ($input !== undefined) {
							$input
								.each(function() {
									$(this)
										.on(inputChangeEvent + eventNamespace, module.event.inputChange)
									;
								})
							;
						}
						if ($select !== undefined) {
							$select
								.each(function() {
									$(this)
										.on(selectChangeEvent + eventNamespace, module.event.selectChange)
									;/* if immediately change detection is required, add key and mouse events */
								})
							;	
						}
						if ($dropdown !== undefined) {
							/* Currently it overload original onChange that might be set previously */
							/* In addition, after slyder is destroyed, onChange is restored to default 
							   value , not possibly defined one previouly */
							defaultDropdownOnChange = $.fn.dropdown.settings.onChange;							
							$dropdown
								.each(function() {
									var $dropdownModule = $(this);
									var previousDropdownOnChange = $(this).dropdown('setting', 'onChange');
									$(this)
										.dropdown({
											onChange: function(value, text) {
												previousDropdownOnChange(value, text);
												module.event.dropdownChange($dropdownModule, value);
											}
										})
									;
								})
							;
						}
					}
				},

				event: {
					thumb: {
						holded: function(event) {
							previousLocation = ( vertical ) ? -event.clientY : event.clientX; // negative accounts for "low to high" direction of thumb
							dragging = true;
							$thumb.addClass(className.active);
							event.preventDefault();
							event.stopPropagation();							
						},

						moved: function(event) {							
							if (dragging) {								
								var position = parseInt($thumb.css("left"));
								var	location = ( vertical ) ? -event.clientY : event.clientX; // negative accounts for "low to high" direction of thumb
								position = position + location - previousLocation;
								module.set.value(position, true);
								previousLocation = location;
							}
						},

						released: function(event) {							
							dragging = false;
							$thumb.removeClass(className.active);
						},
					},
					
					inputChange: function() {						
						var value = $(this).val();
						var quantity = parseInt(value);						
						if (!isNaN(quantity)) {
							var unit = value.slice(quantity.toString().length);
							inputTailing = unit;
							module.set.value(quantity, false);							
						} /* currently support only cases in which number is at the beginning*/
					},

					selectChange: function() {
						var index = this.selectedIndex;
						var count = this.length;
						module.set.value(extent / count * index);
					},

					dropdownChange: function($dropdown, value) {
						var $selectedItem = $dropdown.dropdown('get item', value);
						var itemSelector = $dropdown.dropdown('setting', 'selector').item;
						var $item = $dropdown.find(itemSelector);
						var index = $item.index($selectedItem);
						var count = $item.size();
						module.set.value(extent / count * index);
					}
				},

				set: {	
					value: function(value, fromView) {
						var previous = dataValue;				
						value = ( fromView ) ? ((value - lowerBound) / range * extent + minValue) : value;
						value = ( value > minValue ) ? value : minValue;
						value = ( value < maxValue ) ? value : maxValue;
						dataValue = Math.round(value);
						module.set.appearance(dataValue);
						module.set.input(dataValue);
						module.set.select(dataValue);
						module.set.dropdown(dataValue);
						$.proxy(settings.onChange, instance)(dataValue, previous);
					},

					appearance: function(value) {
						var position = (value - minValue) / extent * range + lowerBound;
						position = Math.round(position);
						position = ( position > lowerBound ) ? position : lowerBound;  /* may be removed if performance matters */
						position = ( position < upperBound ) ? position : upperBound;  /* may be removed if performance matters */						
						$thumb.css("left", position);
						$thumb.attr('data-content', value);
						$module.css("background-size", "100%, " + position + "px 100%");
					},

					input: function(value) {												
						if ($input !== undefined) {
							$input.val(value + inputTailing);							
							if (settings.strictBinding) {
								$input.trigger(inputChangeEvent);
							}
						}						
					},

					select: function(value) {
						if ($select !== undefined) {
							$select.each(function() {
								var count = this.length;
								if (count > 0) {
									var index = Math.floor((value - minValue) / extent * count);
									this.selectedIndex = ( index < count ) ? index : count - 1;
									if (settings.strictBinding) {
										$select.trigger(selectChangeEvent);
									}
								}							
							});
						}				
					},

					dropdown: function(value) {
						if ($dropdown !== undefined) {
							$dropdown.each(function() {
								var itemSelector = $(this).dropdown('setting', 'selector').item;
								var $item = $(this).find(itemSelector);
								var count = $item.size();
								if (count > 0) {
									var index = Math.floor((value - minValue) / extent * count);
									var $selectedItem = $item.eq(index);
									var metadata = $(this).dropdown('setting', 'metadata');
									$(this).dropdown('set selected', $selectedItem.data(metadata.value));
								}
							});
						}
					}
				},

				get: {
					value: function()
					{
						return dataValue;
					},

					changeEvent: function(type) {
						return (document.createElement('input').oninput !== undefined)
							? 'input'
							: (document.createElement('input').onpropertychange !== undefined)
								? 'propertychange'
								: 'keyup'
						;
					},

					offset: function(value, previousValue) {
						previousValue = previousValue || value;
						return (value - previousValue) / extent * range;
					},							
				},				

				setting: function(name, value) {
					module.debug('Change setting', name, value);
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
				internal: function(name,value) {
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
							currentTime = new Date().getTime();
							previousTime = time || currentTime;
							executionTime = currentTime - previousTime;
							time = currentTime;
							performance.push({
								'Element' : element,
								'Name' : message[0],
								'Arguments' : [].slice.call(message, 1) || '',
								'Execution Time' : executionTime
							});
						}
						clearTimeout(module.performance.timer);
						module.performance.timer = setTimeout(module.performance.display, 100);
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
						if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
							console.groupCollapsed(title);
							if(console.table) {
								console.table(performance);
							}
							else {
								$.each(performance, function(index, data) {
									console.log(data['Name'] + ': ' + data['Execution Time'] + 'ms');									
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
					context = element || context;
					if(typeof query == 'string' && object !== undefined) {
						query = query.split(/[\. ]/);
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
								return false;
							}
						});
					}
					if ( $.isFunction( found ) ) {
						response = found.apply(context, passedArguments);						
					}
					else if (found !== undefined) {
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
					module.destroy();					
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

$.fn.slyder.settings = {
	
	name : 'Slyder',
	namespace : 'slyder',

	debug : false,
	verbose : true,
	performance : true,

	max: 100,
	min: 0,

	strictBinding: false, 
	// DO NOT use for now. Undesired Effects have not been solved.
	// multiple slyders binded to a input are also binded together if this value is set to true

	onChange: function(value, previousValue) { return value; },

	selector : {
		thumb : '.thumb',
		input : 'input, textarea',
		select : 'select',
		dropdown : '.dropdown'
	},
	className : {
		active : 'active',
		vertical : 'vertical'
	},
	error : {
		method : 'The method you called is not defined.'
	}
};

})( jQuery, window, document );