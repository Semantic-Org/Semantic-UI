/*
 * # Semantic - Modal
 * http://github.com/jlukic/semantic-ui/
 *
 *
 * Copyright 2013 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

$.fn.modal = function(parameters) {
  var
    $allModules    = $(this),
    $document      = $(document),

    settings        = ( $.isPlainObject(parameters) )
      ? $.extend(true, {}, $.fn.modal.settings, parameters)
      : $.fn.modal.settings,

    selector        = settings.selector,
    className       = settings.className,
    namespace       = settings.namespace,
    error           = settings.error,

    eventNamespace  = '.' + namespace,
    moduleNamespace = 'module-' + namespace,
    moduleSelector  = $allModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    invokedResponse
  ;

  $allModules
    .each(function() {
      var
        $module      = $(this),
        $context     = $(settings.context),
        $otherModals = $allModules.not($module),
        $closeButton = $module.find(selector.closeButton),

        $dimmer,

        element      = this,
        instance     = $module.data(moduleNamespace),
        module
      ;

      module  = {

        initialize: function() {
          module.verbose('Attaching events');
          $closeButton
            .on('click', module.event.close)
          ;
          module.cache.sizes();

          module.verbose('Creating dimmer');
          $context
            .dimmer({
              closable: settings.closable,
              duration: settings.duration,
              onShow: function() {
                module.add.keyboardShortcuts();
                $.proxy(settings.onShow, this)();
              },
              onHide: function() {
                if($module.is(':visible')) {
                  $context.off('.dimmer');
                  module.hide();
                  $.proxy(settings.onHide, this)();
                }
                module.remove.keyboardShortcuts();
              }
            })
          ;
          $dimmer = $context.children(selector.dimmer);
          if( $module.parent()[0] !== $dimmer[0] ) {
            module.debug('Moving element inside dimmer', $context);
            $module = $module
              .detach()
              .appendTo($dimmer)
            ;
          }
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
            .off(eventNamespace)
          ;
        },

        event: {
          close: function() {
            module.verbose('Close button pressed');
            $context.dimmer('hide');
          },
          keyboard: function(event) {
            var
              keyCode   = event.which,
              escapeKey = 27
            ;
            if(keyCode == escapeKey) {
              module.debug('Escape key pressed hiding modal');
              $context.dimmer('hide');
              event.preventDefault();
            }
          },
          resize: function() {
            module.cache.sizes();
            if( $module.is(':visible') ) {
              module.set.type();
              module.set.position();
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

        show: function() {
          module.debug('Showing modal');
          module.set.type();
          module.set.position();
          module.hideAll();
          if(settings.transition && $.fn.transition !== undefined) {
            $module
              .transition(settings.transition + ' in', settings.duration, module.set.active)
            ;
          }
          else {
            $module
              .fadeIn(settings.duration, settings.easing, module.set.active)
            ;
          }
          module.debug('Triggering dimmer');
          $context.dimmer('show');
        },

        hide: function() {
          module.debug('Hiding modal');
          // remove keyboard detection
          $document
            .off('keyup.' + namespace)
          ;
          if(settings.transition && $.fn.transition !== undefined) {
            $module
              .transition(settings.transition + ' out', settings.duration, function() {
                module.remove.active();
              })
            ;
          }
          else {
            $module
              .fadeOut(settings.duration, settings.easing, module.remove.active)
            ;
          }
        },

        hideAll: function() {
          $otherModals
            .filter(':visible')
            .modal('hide')
          ;
        },

        add: {
          keyboardShortcuts: function() {
            module.verbose('Adding keyboard shortcuts');
            $document
              .on('keyup' + eventNamespace, module.event.keyboard)
            ;
          }
        },

        remove: {
          active: function() {
            $module.removeClass(className.active);
          },
          keyboardShortcuts: function() {
            module.verbose('Removing keyboard shortcuts');
            $document
              .off('keyup' + eventNamespace)
            ;
          }
        },

        cache: {
          sizes: function() {
            module.cache = {
              height        : $module.outerHeight() + settings.offset,
              contextHeight : (settings.context == 'body')
                ? $(window).height()
                : $context.height()
            };
            module.debug('Caching modal and container sizes', module.cache);
          }
        },

        can: {
          fit: function() {
            return (module.cache.height < module.cache.contextHeight);
          }
        },

        is: {
          active: function() {
            return $module.hasClass(className.active);
          }
        },

        set: {
          active: function() {
            $module.addClass(className.active);
          },
          type: function() {
            if(module.can.fit()) {
              module.verbose('Modal fits on screen');
              $module.removeClass(className.scrolling);
            }
            else {
              module.verbose('Modal cannot fit on screen setting to scrolling');
              $module.addClass(className.scrolling);
            }
          },
          position: function() {
            module.verbose('Centering modal on page', module.cache.height / 2);
            if(module.can.fit()) {
              $module
                .css({
                  marginTop: -(module.cache.height / 2)
                })
              ;
            }
            else {
              $module
                .css({
                  top: $context.prop('scrollTop')
                })
              ;
            }
          }
        },

        setting: function(name, value) {
          if(value !== undefined) {
            if( $.isPlainObject(name) ) {
              $.extend(true, settings, name);
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
          if(value !== undefined) {
            if( $.isPlainObject(name) ) {
              $.extend(true, module, name);
            }
            else {
              module[name] = value;
            }
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
                module.error(error.method);
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
          if($.isArray(invokedResponse)) {
            invokedResponse.push(response);
          }
          else if(typeof invokedResponse == 'string') {
            invokedResponse = [invokedResponse, response];
          }
          else if(response !== undefined) {
            invokedResponse = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        invokedResponse = module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (invokedResponse !== undefined)
    ? invokedResponse
    : this
  ;
};

$.fn.modal.settings = {

  name        : 'Modal',
  namespace   : 'modal',
  verbose     : true,
  debug       : true,
  performance : true,

  offset      : 0,
  transition  : 'scale',
  duration    : 500,
  easing      : 'easeOutExpo',

  closable    : true,
  context     : 'body',

  onShow      : function(){},
  onHide      : function(){},

  selector    : {
    closeButton : '.close, .actions .button',
    dimmer: '.ui.dimmer'
  },
  error : {
    method : 'The method you called is not defined.'
  },
  className : {
    active    : 'active',
    scrolling : 'scrolling'
  },
};


})( jQuery, window , document );