/*
 * # Semantic - Modal
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2013 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

module.exports = function(parameters) {
  var
    $allModules = $(this),
    $window     = $(window),
    $document   = $(document),
    $body       = $('body'),

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
        settings    = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, module.exports.settings, parameters)
          : $.extend({}, module.exports.settings),

        selector        = settings.selector,
        className       = settings.className,
        namespace       = settings.namespace,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,
        moduleSelector  = $allModules.selector || '',

        $module      = $(this),
        $context     = $(settings.context),
        $close       = $module.find(selector.close),

        $allModals,
        $otherModals,
        $focusedElement,
        $dimmable,
        $dimmer,

        element      = this,
        instance     = $module.data(moduleNamespace),
        module
      ;

      module  = {

        initialize: function() {
          module.verbose('Initializing dimmer', $context);

          if(module.exports === undefined) {
            module.error(error.dimmer);
            return;
          }
          $dimmable = $context
            .dimmer({
              closable : false,
              useCSS   : true,
              duration : {
                show     : settings.duration * 0.9,
                hide     : settings.duration * 1.1
              }
            })
          ;

          if(settings.detachable) {
            $dimmable.dimmer('add content', $module);
          }

          $dimmer = $dimmable
            .dimmer('get dimmer')
          ;

          module.refreshSelectors();

          module.verbose('Attaching close events', $close);
          $close
            .on('click' + eventNamespace, module.event.close)
          ;
          $window
            .on('resize' + eventNamespace, module.event.resize)
          ;
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of modal');
          instance = module;
          $module
            .data(moduleNamespace, instance)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous modal');
          $module
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
          $close
            .off(eventNamespace)
          ;
          $context
            .dimmer('destroy')
          ;
        },

        refresh: function() {
          module.remove.scrolling();
          module.cacheSizes();
          module.set.screenHeight();
          module.set.type();
          module.set.position();
        },

        refreshSelectors: function() {
          $otherModals = $module.siblings(selector.modal);
          $allModals   = $otherModals.add($module);
        },

        attachEvents: function(selector, event) {
          var
            $toggle = $(selector)
          ;
          event = $.isFunction(module[event])
            ? module[event]
            : module.toggle
          ;
          if($toggle.size() > 0) {
            module.debug('Attaching modal events to element', selector, event);
            $toggle
              .off(eventNamespace)
              .on('click' + eventNamespace, event)
            ;
          }
          else {
            module.error(error.notFound);
          }
        },

        event: {
          close: function() {
            module.verbose('Closing element pressed');
            if( $(this).is(selector.approve) ) {
              if($.proxy(settings.onApprove, element)() !== false) {
                module.hide();
              }
              else {
                module.verbose('Approve callback returned false cancelling hide');
              }
            }
            else if( $(this).is(selector.deny) ) {
              if($.proxy(settings.onDeny, element)() !== false) {
                module.hide();
              }
              else {
                module.verbose('Deny callback returned false cancelling hide');
              }
            }
            else {
              module.hide();
            }
          },
          click: function(event) {
            if( $(event.target).closest(selector.modal).size() === 0 ) {
              module.debug('Dimmer clicked, hiding all modals');
              if(settings.allowMultiple) {
                module.hide();
              }
              else {
                module.hideAll();
              }
              event.stopImmediatePropagation();
            }
          },
          debounce: function(method, delay) {
            clearTimeout(module.timer);
            module.timer = setTimeout(method, delay);
          },
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
          resize: function() {
            if( $dimmable.dimmer('is active') ) {
              requestAnimationFrame(module.refresh);
            }
          }
        },

        toggle: function() {
          if( module.is.active() ) {
            module.hide();
          }
          else {
            module.show();
          }
        },

        show: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          module.showDimmer();
          module.showModal(callback);
        },

        onlyVisible: function() {
          module.refreshSelectors();
          return module.is.active() && $otherModals.filter(':visible').size() === 0;
        },

        othersVisible: function() {
          module.refreshSelectors();
          return $otherModals.filter(':visible').size() > 0;
        },

        showModal: function(callback) {
          if(module.is.active()) {
            module.debug('Modal is already visible');
            return;
          }

          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;

          module.save.focus();
          module.add.keyboardShortcuts();

          if(module.cache === undefined) {
            module.cacheSizes();
          }
          module.set.position();
          module.set.screenHeight();
          module.set.type();

          if(module.othersVisible()  && !settings.allowMultiple) {
            module.debug('Other modals visible, queueing show animation');
            module.hideOthers(module.showModal);
          }
          else {
            $.proxy(settings.onShow, element)();

            var transitionCallback = function() {
              module.set.active();
              $.proxy(settings.onVisible, element)();
              callback();
            };

            if(settings.transition && module.exports !== undefined && $module.transition('is supported')) {
              module.debug('Showing modal with css animations');
              $module
                .transition(settings.transition + ' in', settings.duration, transitionCallback)
              ;
            }
            else {
              module.debug('Showing modal with javascript');
              $module
                .fadeIn(settings.duration, settings.easing, transitionCallback)
              ;
            }
          }
        },

        showDimmer: function() {
          if( !$dimmable.dimmer('is active') ) {
            module.debug('Showing dimmer');
            $dimmable.dimmer('show');
          }
          else {
            module.debug('Dimmer is already visible');
          }
        },

        hide: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          module.refreshSelectors();
          if(module.onlyVisible()) {
            module.hideDimmer();
          }
          module.hideModal(callback);
        },

        hideDimmer: function() {
          if( !module.is.active() ) {
            module.debug('Dimmer is already hidden');
            return;
          }
          module.debug('Hiding dimmer');
          if(settings.closable) {
            $dimmer
              .off('click' + eventNamespace)
            ;
          }
          $dimmable.dimmer('hide', function() {
            if(settings.transition && module.exports !== undefined && $module.transition('is supported')) {
              $module
                .transition('reset')
              ;
              module.remove.screenHeight();
            }
            module.remove.active();
          });
        },

        hideModal: function(callback) {
          if(!module.is.active()) {
            module.debug('Modal is already hidden');
            return;
          }

          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;

          module.restore.focus();
          module.remove.keyboardShortcuts();

          $.proxy(settings.onHide, element)();

          var transitionCallback = function() {
            module.remove.active();
            $.proxy(settings.onHidden, element)();
            callback();
          };

          if(settings.transition && module.exports !== undefined && $module.transition('is supported')) {
            module.debug('Hiding modal with css animations');
            $module
              .transition(settings.transition + ' out', settings.duration, transitionCallback)
            ;
          }
          else {
            module.debug('Hiding modal with javascript');
            $module
              .fadeOut(settings.duration, settings.easing, transitionCallback)
            ;
          }
        },

        hideAll: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          if( $module.is(':visible') || module.othersVisible() ) {
            module.debug('Hiding all visible modals');
            module.hideDimmer();
            $allModals
              .filter(':visible')
                .modal('hide modal', callback)
            ;
          }
        },

        hideOthers: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          if( module.othersVisible() ) {
            module.debug('Hiding other modals');
            $otherModals
              .filter(':visible')
                .modal('hide modal', callback)
            ;
          }
        },

        add: {
          keyboardShortcuts: function() {
            module.verbose('Adding keyboard shortcuts');
            $document
              .on('keyup' + eventNamespace, module.event.keyboard)
            ;
          }
        },

        save: {
          focus: function() {
            $focusedElement = $(document.activeElement).blur();
          }
        },

        restore: {
          focus: function() {
            if($focusedElement && $focusedElement.size() > 0) {
              $focusedElement.focus();
            }
          }
        },

        remove: {
          active: function() {
            $module.removeClass(className.active);
          },
          screenHeight: function() {
            if(module.cache.height > module.cache.pageHeight) {
              module.debug('Removing page height');
              $body
                .css('height', '')
              ;
            }
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

        cacheSizes: function() {
          module.cache = {
            pageHeight    : $body.outerHeight(),
            height        : $module.outerHeight() + settings.offset,
            contextHeight : (settings.context == 'body')
              ? $(window).height()
              : $dimmable.height()
          };
          module.debug('Caching modal and container sizes', module.cache);
        },

        can: {
          fit: function() {
            return (module.cache.height < module.cache.contextHeight);
          }
        },

        is: {
          active: function() {
            return $module.hasClass(className.active);
          },
          modernBrowser: function() {
            // appName for IE11 reports 'Netscape' can no longer use
            return !(window.ActiveXObject || "ActiveXObject" in window);
          }
        },

        set: {
          screenHeight: function() {
            if(module.cache.height > module.cache.pageHeight) {
              module.debug('Modal is taller than page content, resizing page height');
              $body
                .css('height', module.cache.height + settings.padding)
              ;
            }
          },
          active: function() {
            $module.addClass(className.active);

            if(settings.closable) {
              $dimmer
                .off('click' + eventNamespace)
                .on('click' + eventNamespace, module.event.click)
              ;
            }

            if(settings.autofocus) {
                var $inputs    = $module.find(':input:visible');
                var $autofocus = $inputs.filter('[autofocus]');
                var $input     = $autofocus.length ? $autofocus : $inputs;

                $input.first().focus();
            }
          },
          scrolling: function() {
            $dimmable.addClass(className.scrolling);
            $module.addClass(className.scrolling);
          },
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
          position: function() {
            module.verbose('Centering modal on page', module.cache);
            if(module.can.fit()) {
              $module
                .css({
                  top: '',
                  marginTop: -(module.cache.height / 2)
                })
              ;
            }
            else {
              $module
                .css({
                  marginTop : '1em',
                  top       : $document.scrollTop()
                })
              ;
            }
          }
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

module.exports.settings = {

  name          : 'Modal',
  namespace     : 'modal',

  debug         : false,
  verbose       : true,
  performance   : true,

  allowMultiple : true,
  detachable    : true,
  closable      : true,
  autofocus     : true,
  context       : 'body',

  duration      : 500,
  easing        : 'easeOutQuad',
  offset        : 0,
  transition    : 'scale',

  padding       : 30,

  onShow        : function(){},
  onHide        : function(){},

  onVisible     : function(){},
  onHidden      : function(){},

  onApprove     : function(){ return true; },
  onDeny        : function(){ return true; },

  selector    : {
    close    : '.close, .actions .button',
    approve  : '.actions .positive, .actions .approve, .actions .ok',
    deny     : '.actions .negative, .actions .deny, .actions .cancel',
    modal    : '.ui.modal'
  },
  error : {
    dimmer    : 'UI Dimmer, a required component is not included in this page',
    method    : 'The method you called is not defined.'
  },
  className : {
    active    : 'active',
    scrolling : 'scrolling'
  }
};

// Adds easing
$.extend( $.easing, {
  easeOutQuad: function (x, t, b, c, d) {
    return -c *(t/=d)*(t-2) + b;
  }
});

})( require("jquery"), window , document );
