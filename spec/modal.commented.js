// # UI Modal
// A modal displays content that temporarily blocks interactions with a web site

;(function ( $, window, document, undefined ) {

$.fn.modal = function(parameters) {
  var
    // ## Group
    // Store a cached version of all elements initialized together
    $allModules = $(this),
    // Store cached versions of elements which are the same across all instances
    $window     = $(window),
    $document   = $(document),

    // Save a reference to the selector used for logs
    moduleSelector  = $allModules.selector || '',

    // Store a reference to current time for performance
    time            = new Date().getTime(),
    performance     = [],

    // Save a reference to arguments to access this 'special variable' outside of scope
    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    returnedValue
  ;

  // ## Singular
  // Iterate over all elements to initialize module
  $allModules
    .each(function() {
      var
        // Extend setting if parameters is a settings object
        settings    = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.modal.settings, parameters)
          : $.extend({}, $.fn.modal.settings),

        // Shortcut values for common settings
        selector        = settings.selector,
        className       = settings.className,
        namespace       = settings.namespace,
        error           = settings.error,

        // Namespace to store DOM Events
        eventNamespace  = '.' + namespace,

        // Namespace to store instance in metadata
        moduleNamespace = 'module-' + namespace,

        // Cache DOM elements
        $module      = $(this),
        $context     = $(settings.context),
        $otherModals = $allModules.not($module),
        $close       = $module.find(selector.close),

        // Set up blank variables for data stored across an instance
        $focusedElement,
        $dimmable,
        $dimmer,

        // Save a reference to the 'pure' DOM element node and current defined instance
        element      = this,
        instance     = $module.data(moduleNamespace),
        module
      ;

      // ## Module Behavior
      module  = {

        // ### Initialize
        // Attaches modal events to page
        initialize: function() {

          // Debug/Verbose allows for a trace to be passed for the javascript console
          module.verbose('Initializing dimmer', $context);

          // Make sure all dependencies are available or provide an error
          if(typeof $.fn.dimmer === undefined) {
            module.error(error.dimmer);
            return;
          }

          // Initialize a dimmer in the current modal context that
          // Dimmer appears and hides slightly quicker than modal to avoid race conditions in callbacks
          $dimmable = $context
            .dimmer({
              closable : false,
              show     : settings.duration * 0.95,
              hide     : settings.duration * 1.05
            })
            .dimmer('add content', $module)
          ;

          // Use Dimmer's Behavior API to retrieve a reference to the dimmer DOM element
          $dimmer = $dimmable
            .dimmer('get dimmer')
          ;

          module.verbose('Attaching close events', $close);

          // Attach some dimmer event
          $close
            .on('click' + eventNamespace, module.event.close)
          ;
          $window
            .on('resize', function() {
              module.event.debounce(module.refresh, 50);
            })
          ;
          module.instantiate();
        },

        // Store instance in metadata so it can be retrieved and modified on future invocations
        instantiate: function() {
          module.verbose('Storing instance of modal');
          // Immediately define possibly undefined instance
          instance = module;
          // Store new reference in metadata
          $module
            .data(moduleNamespace, instance)
          ;
        },

        // ### Destroy
        // Remove all module data from metadata and remove all events
        destroy: function() {
          module.verbose('Destroying previous modal');
          $module
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
          // Child elements must also have their events removed
          $close
            .off(eventNamespace)
          ;
          // Destroy the initialized dimmer
          $context
            .dimmer('destroy')
          ;
        },

        // ### Refresh
        // Modal must modify its behavior depending on whether or not it can fit
        refresh: function() {
          // Remove scrolling/fixed type
          module.remove.scrolling();
          // Cache new module size
          module.cacheSizes();
          // Set type to either scrolling or fixed
          module.set.type();
          module.set.position();
        },

        // ### Attach events
        // Attaches any module method to another element selector
        attachEvents: function(selector, event) {
          var
            $toggle = $(selector)
          ;
          // default to toggle event if none specified
          event = $.isFunction(module[event])
            ? module[event]
            : module.toggle
          ;
          // determine whether element exists
          if($toggle.size() > 0) {
            module.debug('Attaching modal events to element', selector, event);
            // attach events
            $toggle
              .off(eventNamespace)
              .on('click' + eventNamespace, event)
            ;
          }
          else {
            module.error(error.notFound);
          }
        },

        // ### Events
        // Events contain event handlers where the ``this`` context may be specific to a part of an element
        event: {
          // ### Event Close
          // Make sure appropriate callback occurs before hiding dimmer on close
          close: function() {
            module.verbose('Closing element pressed');
            // Only hide modal if onDeny or onApprove return true
            if( $(this).is(selector.approve) ) {
              if($.proxy(settings.onApprove, element)()) {
                modal.hide();
              }
            }
            if( $(this).is(selector.deny) ) {
              if($.proxy(settings.onDeny, element)()) {
                modal.hide();
              }
            }
            else {
              module.hide();
            }
          },
          // ### Event Click
          // Only allow click event on dimmer to close modal if the click was not inside the dimmer
          click: function(event) {
            module.verbose('Determining if event occured on dimmer', event);
            if( $dimmer.find(event.target).size() === 0 ) {
              module.hide();
              event.stopImmediatePropagation();
            }
          },
          // ### Debounce
          // Make sure resize event fires maximum of once every 50ms
          debounce: function(method, delay) {
            clearTimeout(module.timer);
            module.timer = setTimeout(method, delay);
          },
          // ### Event Keyboard
          // Determine whether keydown event was on escape key
          keyboard: function(event) {
            var
              keyCode   = event.which,
              escapeKey = 27
            ;
            if(keyCode == escapeKey) {
              if(settings.closable) {
                module.debug('Escape key pressed hiding modal');
                module.hide();
              }
              else {
                module.debug('Escape key pressed, but closable is set to false');
              }
              event.preventDefault();
            }
          },
          // ### Event Resize
          // Only refresh if dimmer is visible
          resize: function() {
            if( $dimmable.dimmer('is active') ) {
              module.refresh();
            }
          }
        },

        // ### Toggle
        // Change visibility depending on current visibility state
        toggle: function() {
          if( module.is.active() ) {
            module.hide();
          }
          else {
            module.show();
          }
        },

        // ### Show
        // Find position then shows dimmer
        show: function() {
          module.showDimmer();
          module.cacheSizes();
          module.set.position();
          module.hideAll();
          // #### Loose Coupling
          if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
            // Use dimmer plugin if available
            $module
              .transition(settings.transition + ' in', settings.duration, module.set.active)
            ;
          }
          else {
            // Otherwise use fallback javascript animation
            $module
              .fadeIn(settings.duration, settings.easing, module.set.active)
            ;
          }
          module.debug('Triggering dimmer');
          $.proxy(settings.onShow, element)();
        },

        // ### Show Dimmer
        // Keep as a separate method to allow programmatic access via
        //    $('.modal').modal('show dimmer');
        showDimmer: function() {
          module.debug('Showing modal');
          $dimmable.dimmer('show');
        },

        // ### Hide
        // Determine whether to hide dimmer, modal, or both
        hide: function() {
          // Only attach close events if modal is allowed to close
          if(settings.closable) {
            $dimmer
              .off('click' + eventNamespace)
            ;
          }
          // Only hide dimmer once
          if( $dimmable.dimmer('is active') ) {
            $dimmable.dimmer('hide');
          }
          // Only hide modal once
          if( module.is.active() ) {
            module.hideModal();
            $.proxy(settings.onHide, element)();
          }
          else {
            module.debug('Cannot hide modal, modal is not visible');
          }
        },

        // ### Hide Dimmer
        // Hide dimmer from page
        hideDimmer: function() {
          module.debug('Hiding dimmer');
          $dimmable.dimmer('hide');
        },

        // ### Hide Modal
        // Hide modal from page
        hideModal: function() {
          module.debug('Hiding modal');
          module.remove.keyboardShortcuts();
          if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
            $module
              .transition(settings.transition + ' out', settings.duration, function() {
                module.remove.active();
                module.restore.focus();
              })
            ;
          }
          else {
            $module
              .fadeOut(settings.duration, settings.easing, function() {
                module.remove.active();
                module.restore.focus();
              })
            ;
          }
        },

        // ### Hide All
        // Make sure all other modals are hidden before showing a new one
        hideAll: function() {
          $otherModals
            .filter(':visible')
            .modal('hide')
          ;
        },

        // ### Add Keyboard Shorcuts
        // Add keyboard shortcut events to page
        add: {
          keyboardShortcuts: function() {
            module.verbose('Adding keyboard shortcuts');
            $document
              .on('keyup' + eventNamespace, module.event.keyboard)
            ;
          }
        },

        save: {
          // ### Save Focus
          // Save current focused element on modal show
          focus: function() {
            $focusedElement = $(document.activeElement).blur();
          }
        },

        restore: {
          // ### Restore Focus
          // Restore focus to previous element after modal is closed
          focus: function() {
            if($focusedElement && $focusedElement.size() > 0) {
              $focusedElement.focus();
            }
          }
        },

        // ### Remove
        // Utilities for removing and adding classes related to state
        remove: {
          active: function() {
            $module.removeClass(className.active);
          },
          keyboardShortcuts: function() {
            module.verbose('Removing keyboard shortcuts');
            $document
              .off('keyup' + eventNamespace)
            ;
          },
          scrolling: function() {
            $dimmable.removeClass(className.scrolling);
            $module.removeClass(className.scrolling);
          }
        },

        // ### Cache Sizes
        // Cache context and modal size to avoid recalculation
        cacheSizes: function() {
          module.cache = {
            height        : $module.outerHeight() + settings.offset,
            contextHeight : (settings.context == 'body')
              ? $(window).height()
              : $dimmable.height()
          };
          module.debug('Caching modal and container sizes', module.cache);
        },

        // ### Can Fit
        // Determine whether modal's cached size is smaller than context
        can: {
          fit: function() {
            return (module.cache.height < module.cache.contextHeight);
          }
        },

        // ### Is Active
        // Whether current element is active
        is: {
          active: function() {
            return $module.hasClass(className.active);
          }
        },

        set: {
          // ### Set Active
          active: function() {
            // Add escape key to close
            module.add.keyboardShortcuts();
            // Save reference to current focused element
            module.save.focus();
            // Set to scrolling or fixed
            module.set.type();
            // Add active class
            $module
              .addClass(className.active)
            ;
            // Add close events
            if(settings.closable) {
              $dimmer
                .on('click' + eventNamespace, module.event.click)
              ;
            }
          },
          // ### Set Scrolling
          // Add scrolling classes
          scrolling: function() {
            $dimmable.addClass(className.scrolling);
            $module.addClass(className.scrolling);
          },
          // ### Set Type
          // Set type to fixed or scrolling
          type: function() {
            if(module.can.fit()) {
              module.verbose('Modal fits on screen');
              module.remove.scrolling();
            }
            else {
              module.verbose('Modal cannot fit on screen setting to scrolling');
              module.set.scrolling();
            }
          },
          // ### Set Position
          // Position modal in center of page
          position: function() {
            module.verbose('Centering modal on page', module.cache, module.cache.height / 2);
            if(module.can.fit()) {
              // If fixed position center vertically
              $module
                .css({
                  top: '',
                  marginTop: -(module.cache.height / 2)
                })
              ;
            }
            else {
              // If modal is not fixed position place element 1em below current scrolled position in page
              $module
                .css({
                  marginTop : '1em',
                  top       : $document.scrollTop()
                })
              ;
            }
          }
        },

        // ### Settings
        // Used to modify or read setting(s) after initializing
        setting: function(name, value) {
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
        // ### Internal
        // Used to modify or read methods from module
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


        // ### Debug
        // Debug pushes arguments to the console formatted as a debug statement
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

        // ### Verbose
        // Calling verbose internally allows for additional data to be logged which can assist in debugging
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

        // ### Error
        // Error allows for the module to report named error messages, it may be useful to modify this to push error messages to the user. Error messages are defined in the modules settings object.
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },

        // ### Performance
        // This is called on each debug statement and logs the time since the last debug statement.
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
                'Element'        : element,
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
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

        // ### Invoke
        // Invoke is used to match internal functions to string lookups.
        // `$('.foo').example('invoke', 'set text', 'Foo')`
        // Method lookups are lazy, looking for many variations of a search string
        // For example 'set text', will look for both `setText : function(){}`, `set: { text: function(){} }`
        // Invoke attempts to preserve the 'this' chaining unless a value is returned.
        // If multiple values are returned an array of values matching up to the length of the selector is returned
        invoke: function(query, passedArguments, context) {
          var
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && instance !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( instance[value] ) && (depth != maxDepth) ) {
                instance = instance[value];
              }
              else if( $.isPlainObject( instance[camelCaseValue] ) && (depth != maxDepth) ) {
                instance = instance[camelCaseValue];
              }
              else if( instance[value] !== undefined ) {
                found = instance[value];
                return false;
              }
              else if( instance[camelCaseValue] !== undefined ) {
                found = instance[camelCaseValue];
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
          // ### Invocation response
          // If a user passes in multiple elements invoke will be called for each element and the value will be returned in an array
          // For example ``$('.things').example('has text')`` with two elements might return ``[true, false]`` and for one element ``true``
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

      // ## Method Invocation

      // This is where the actual action occurs.
      //     $('.foo').module('set text', 'Ho hum');
      // If you call a module with a string parameter you are most likely trying to invoke a function
      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      // if no method call is required we simply initialize the plugin, destroying it if it exists already
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  // ### Chaining
  // Return either jQuery chain or the returned value from invoke
  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;

};

// ## Settings
// These are the default configuration settings for any element initialized without parameters
$.fn.modal.settings = {

  // Name for debug logs
  name        : 'Modal',
  // Namespace for events and metadata
  namespace   : 'modal',

  // Whether to include all logging
  verbose     : true,
  // Whether to include important logs
  debug       : true,
  // Whether to show performance traces
  performance : true,

  // Whether modal is able to be closed by a user
  closable    : true,

  // Context which modal will be centered in
  context     : 'body',

  // Animation duration
  duration    : 500,
  // Animation easing
  easing      : 'easeOutExpo',

  // Vertical offset of modal
  offset      : 0,

  // Transition to use for animation
  transition  : 'scale',

  // Callback when modal shows
  onShow      : function(){},
  // Callback when modal hides
  onHide      : function(){},
  // Callback when modal approve action is called
  onApprove   : function(){ return true },
  // Callback when modal deny action is called
  onDeny      : function(){ return true },

  // List of selectors used to match behavior to DOM elements
  selector    : {
    close    : '.close, .actions .button',
    approve  : '.actions .positive, .actions .approve',
    deny     : '.actions .negative, .actions .cancel'
  },

  // List of error messages displayable to console
  error : {
    dimmer : 'UI Dimmer, a required component is not included in this page',
    method : 'The method you called is not defined.'
  },

  // List of class names used to represent element state
  className : {
    active    : 'active',
    scrolling : 'scrolling'
  },
};


})( jQuery, window , document );