/*
 * # Semantic - Context
 * http://github.com/jlukic/semantic-ui/
 *
 *
 * Copyright 2013 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 */

;
(function ($, window, document, undefined) {


    var RIGHT_MOUSE = 2;
    var SUPPORTS_TOUCH = "ontouchstart" in window;
    var SUPPORTS_MOUSEDOWN = !SUPPORTS_TOUCH;

    // for arguments p..., return the closest to target
    // closest(10, 5, 14, 9, 33, -1, 5.4) === 9
    var closest = function (target, p) {
        // all options after the first (p)
        var options = Array.prototype.slice.call(arguments, 2);

        // default p to being the best
        var best = p;
        for (var i = 0; i < options.length; i++) {
            if (Math.abs(target - options[i]) < Math.abs(target - best)) {
                best = options[i];
            }
        };

        return best;
    }

    $(document).one("mousedown", function () {
        SUPPORTS_MOUSEDOWN = true;
    });

    $.fn.context = function (parameters) {

        // ## Group
        // Some properties remain constant across all instances of a module.
        var
        // Store a reference to the module group, this can be useful to refer to other modules inside each module
            $allModules = $(this),

        // Preserve selector from outside each scope and mark current time for performance tracking
            moduleSelector = $allModules.selector || '',
            time = new Date().getTime(),
            performance = [],

        // Preserve original arguments to determine if a method is being invoked
            query = arguments[0],
            methodInvoked = (typeof query == 'string'),
            queryArguments = [].slice.call(arguments, 1),
            returnedValue;

        // ## Singular
        // Iterate over all elements to initialize module
        $allModules.each(function () {
            var

            // Extend settings to merge run-time settings with defaults
                settings = ($.isPlainObject(parameters)) ? $.extend(true, {}, $.fn.context.settings, parameters) : $.extend({}, $.fn.context.settings),

            // Alias settings object for convenience and performance
                namespace = settings.namespace,
                error = settings.error,
                className = settings.className,

            // Define namespaces for storing module instance and binding events
                eventNamespace = '.' + namespace,
                moduleNamespace = 'module-' + namespace,

            // Instance is stored and retreived in namespaced DOM metadata
                instance = $(this).data(moduleNamespace),
                element = this,

            // Cache selectors using selector settings object for access inside instance of module
                $module = $(this),
                $text = $module.find(settings.selector.text),

                isPressing = false,
                pressingTimer = null,

                module;

            // ## Module Behavior
            module = {

                // ### Required

                // #### Initialize
                // Initialize attaches events and preserves each instance in html metadata
                initialize: function () {
                    module.debug('Initializing context for', element);

                    // events which show the context menu
                    $(document).on('mousedown' + eventNamespace, settings.targets, module.event.down);
                    $(document).on('touchstart' + eventNamespace, settings.targets, module.event.down);
                    $(document).on('mouseup' + eventNamespace, settings.targets, module.event.up);
                    $(document).on('touchend' + eventNamespace, settings.targets, module.event.up);
                    $(document).on('contextmenu' + eventNamespace, settings.targets, function (event) {
                        return module.show(event.target, event.pageX, event.pageY);
                    });

                    // bind to events on the context menu
                    $module.on('click' + eventNamespace, settings.selector.option, module.event.select);

                    //$module.on('click' + eventNamespace, module.exampleBehavior);
                    module.instantiate();
                },

                instantiate: function () {
                    module.verbose('Storing instance of context');
                    // The instance is just a copy of the module definition, we store it in metadata so we can use it outside of scope, but also define it for immediate use
                    instance = module;
                    $module.data(moduleNamespace, instance);
                },

                // #### Destroy
                // Removes all events and the instance copy from metadata
                destroy: function () {
                    module.verbose('Destroying previous module for', element);
                    $module.removeData(moduleNamespace)
                        .off(eventNamespace);
                },

                // #### Refresh
                // Selectors or cached values sometimes need to refreshed
                refresh: function () {
                    module.verbose('Refreshing elements', element);
                    $module = $(element);
                    $text = $(this).find(settings.selector.text);
                },

                // ### Custom
                // #### By Event
                // Sometimes it makes sense to call an event handler by its type if it is dependent on the event to behave properly
                event: {
                    down: function (event) {
                        if (isPressing) {
                            module.verbose('This browser emits both mousedown and touchstart, with ' + event.type + ' being triggered second');
                            return;
                        }

                        isPressing = true;

                        if (settings.touch && (event.which === 1 || event.type === "touchstart")) {
                            pressingTimer = setTimeout(module.show.bind($module, event.target, event.pageX, event.pageY), settings.delay);
                        }

                        event.preventDefault();
                    },
                    up: function (event) {
                        if (!isPressing) {
                            module.verbose('This browser emits both mouseup and touchend, with ' + event.type + ' being triggered second');
                            return;
                        }
                        clearTimeout(pressingTimer);

                        isPressing = false;
                    },
                    contextmenu: function (event) {
                        module.show(event.target, event.pageX, event.pageY);
                    },
                    select: function () {
                        var $target = $(this);

                        // TODO: review the parameters and this binding
                        var shouldHide = settings.onSelect.call($target, $target) !== false;
                        if (shouldHide) {
                            module.hide();
                        }
                        return false;
                    }
                },

                show: function (targetElement, x, y) {
                    var $target = $(targetElement);

                    // TODO: ensure targetElement is correct before show is called
                    // to improve performance

                    // if we have .foo > .bar > .baz, and settings.targets is ".foo" but targetElement
                    // is ".baz", we need to go up in the DOM to find the correct target
                    if (!$target.is(settings.targets)) {
                        $target = $target.parents(settings.targets);
                    }

                    // strange... but okay, let's get out of here
                    if ($target.length === 0) {
                        module.debug("show was passed an invalid target, aborting");
                        return;
                    }

                    // we need a bit of sizing information to determine where to put our context menu
                    // the goal is to put it on the corner of an element where it'll be closest the the center of the viewport
                    var target = $target.offset();
                    target.width = $target.width();
                    target.height = $target.height();

                    var viewport = {
                        width: $(window).width(),
                        height: $(window).height(),
                        top: $(window).scrollTop(),
                    };

                    $module.addClass("active");
                    var context = {
                        left: 0,
                        top: 0,
                        width: $module.width(),
                        height: $module.height()
                    };

                    // if for some reason we don't have x and y coordinates, we can't do this
                    // so it'll fall through to element snapping
                    // slement snapping can also be enabled in the settings
                    if (settings.snap !== "element" && typeof x === "number" && typeof y === "number") {
                        context.left = x;
                        context.top = y;
                    } else {
                        context.left = closest(viewport.width / 2,
                            target.left - context.width,
                            target.left + target.width);
                        context.top = closest(viewport.height / 2 + viewport.top,
                            target.top - context.height,
                            target.top + target.height);
                    }

                    // clamp everything to be within the viewport

                    // the order should be [0, context.left, context.right, viewport.width]
                    context.left = Math.min(context.left, viewport.width - context.width);
                    context.left = Math.max(context.left, 0);

                    // the order should be [viewport.top, context.top, context.bottom, viewport.bottom]
                    context.top = Math.min(context.top, viewport.height + viewport.top - context.height);
                    context.top = Math.max(context.top, viewport.top);

                    // apply the new position to the context menu
                    $module.css({
                        left: context.left,
                        top: context.top
                    });


                    // allow showing to be canceled
                    // we do this after showing it to allow for the callback to select inputs, etc.
                    if (settings.onShow.call($module, $target) === false) {
                        module.debug("showing module prevented")
                        module.hide();
                    }

                    // we're showing it, so prevent the default action if applicable
                    return false;
                },

                hide: function () {
                    // allow hiding to be aborted
                    if (settings.onHide.call($module) === false) {
                        return;
                    }

                    $module.removeClass("active");
                },

                // ### Standard

                // #### Setting
                // Module settings can be read or set using this method
                //
                // Settings can either be specified by modifying the module defaults, by initializing the module with a settings object, or by changing a setting by invoking this method
                // `$(.foo').example('setting', 'moduleName');`
                setting: function (name, value) {
                    if ($.isPlainObject(name)) {
                        $.extend(true, settings, name);
                    } else if (value !== undefined) {
                        settings[name] = value;
                    } else {
                        return settings[name];
                    }
                },

                // #### Internal
                // Module internals can be set or retrieved as well
                // `$(.foo').example('internal', 'behavior', function() { // do something });`
                internal: function (name, value) {
                    if ($.isPlainObject(name)) {
                        $.extend(true, module, name);
                    } else if (value !== undefined) {
                        module[name] = value;
                    } else {
                        return module[name];
                    }
                },

                // #### Debug
                // Debug pushes arguments to the console formatted as a debug statement
                debug: function () {
                    if (settings.debug) {
                        if (settings.performance) {
                            module.performance.log(arguments);
                        } else {
                            module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
                            module.debug.apply(console, arguments);
                        }
                    }
                },

                // #### Verbose
                // Calling verbose internally allows for additional data to be logged which can assist in debugging
                verbose: function () {
                    if (settings.verbose && settings.debug) {
                        if (settings.performance) {
                            module.performance.log(arguments);
                        } else {
                            module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
                            module.verbose.apply(console, arguments);
                        }
                    }
                },

                // #### Error
                // Error allows for the module to report named error messages, it may be useful to modify this to push error messages to the user. Error messages are defined in the modules settings object.
                error: function () {
                    module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
                    module.error.apply(console, arguments);
                },

                // #### Performance
                // This is called on each debug statement and logs the time since the last debug statement.
                performance: {
                    log: function (message) {
                        var
                            currentTime,
                            executionTime,
                            previousTime;
                        if (settings.performance) {
                            currentTime = new Date().getTime();
                            previousTime = time || currentTime;
                            executionTime = currentTime - previousTime;
                            time = currentTime;
                            performance.push({
                                'Element': element,
                                'Name': message[0],
                                'Arguments': [].slice.call(message, 1) || '',
                                'Execution Time': executionTime
                            });
                        }
                        clearTimeout(module.performance.timer);
                        module.performance.timer = setTimeout(module.performance.display, 100);
                    },
                    display: function () {
                        var
                            title = settings.name + ':',
                            totalTime = 0;
                        time = false;
                        clearTimeout(module.performance.timer);
                        $.each(performance, function (index, data) {
                            totalTime += data['Execution Time'];
                        });
                        title += ' ' + totalTime + 'ms';
                        if (moduleSelector) {
                            title += ' \'' + moduleSelector + '\'';
                        }
                        if ((console.group !== undefined || console.table !== undefined) && performance.length > 0) {
                            console.groupCollapsed(title);
                            if (console.table) {
                                console.table(performance);
                            } else {
                                $.each(performance, function (index, data) {
                                    console.log(data['Name'] + ': ' + data['Execution Time'] + 'ms');
                                });
                            }
                            console.groupEnd();
                        }
                        performance = [];
                    }
                },

                // #### Invoke
                // Invoke is used to match internal functions to string lookups.
                // `$('.foo').example('invoke', 'set text', 'Foo')`
                // Method lookups are lazy, looking for many variations of a search string
                // For example 'set active', will look for both `setText : function(){}`, `set: { text: function(){} }`
                // Invoke attempts to preserve the 'this' chaining unless a value is returned.
                // If multiple values are returned an array of values matching up to the length of the selector is returned
                invoke: function (query, passedArguments, context) {
                    var
                        maxDepth,
                        found,
                        response;
                    passedArguments = passedArguments || queryArguments;
                    context = element || context;
                    if (typeof query == 'string' && instance !== undefined) {
                        query = query.split(/[\. ]/);
                        maxDepth = query.length - 1;
                        $.each(query, function (depth, value) {
                            var camelCaseValue = (depth != maxDepth) ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1) : query;
                            if ($.isPlainObject(instance[value]) && (depth != maxDepth)) {
                                instance = instance[value];
                            } else if ($.isPlainObject(instance[camelCaseValue]) && (depth != maxDepth)) {
                                instance = instance[camelCaseValue];
                            } else if (instance[value] !== undefined) {
                                found = instance[value];
                                return false;
                            } else if (instance[camelCaseValue] !== undefined) {
                                found = instance[camelCaseValue];
                                return false;
                            } else {
                                module.error(error.method, query);
                                return false;
                            }
                        });
                    }
                    if ($.isFunction(found)) {
                        response = found.apply(context, passedArguments);
                    } else if (found !== undefined) {
                        response = found;
                    }
                    // ### Invocation response
                    // If a user passes in multiple elements invoke will be called for each element and the value will be returned in an array
                    // For example ``$('.things').example('has text')`` with two elements might return ``[true, false]`` and for one element ``true``
                    if ($.isArray(returnedValue)) {
                        returnedValue.push(response);
                    } else if (returnedValue !== undefined) {
                        returnedValue = [returnedValue, response];
                    } else if (response !== undefined) {
                        returnedValue = response;
                    }
                    return found;
                }
            };

            // ### Determining Intent

            // This is where the actual action occurs.
            //     $('.foo').module('set text', 'Ho hum');
            // If you call a module with a string parameter you are most likely trying to invoke a function
            if (methodInvoked) {
                if (instance === undefined) {
                    module.initialize();
                }
                module.invoke(query);
            }
            // if no method call is required we simply initialize the plugin, destroying it if it exists already
            else {
                if (instance !== undefined) {
                    module.destroy();
                }
                module.initialize();
            }
        });

        return (returnedValue !== undefined) ? returnedValue : this;

    };

    // ## Settings
    // It is necessary to include a settings object which specifies the defaults for your module
    $.fn.context.settings = {

        // ### Required
        // Used in debug statements to refer to the module itself
        name: 'Context Menu',

        // Whether debug content should be outputted to console
        debug: true,
        // Whether extra debug content should be outputted
        verbose: false,
        // Whether to track performance data
        performance: false,
        // A unique identifier used to namespace events,and preserve the module instance
        namespace: 'context',
        // ### Optional

        // Selectors used by your module
        selector: {
            option: '.option'
        },
        // Error messages returned by the module
        error: {
            method: 'The method you called is not defined.'
        },
        // Class names which your module refers to
        className: {
            disabled: 'active'
        },
        // Metadata attributes stored or retrieved by your module. `$('.foo').data('value');`
        metadata: {
            text: 'text'
        },
        // ### Callbacks
        // Callbacks are often useful to include in your settings object
        onShow: function () {},
        onHide: function () {},
        onSelect: function () {},

        position: "auto",
        touch: true,
        closeable: true,
        delay: 500
    };


})(jQuery, window, document);