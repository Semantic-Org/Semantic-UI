/*  ******************************
  Modal
  Author: Jack Lukic
  Notes: First Commit May 14, 2012

  Manages modal state and
  stage dimming

******************************  */

;(function ( $, window, document, undefined ) {

$.fn.modal = function(parameters) {
  var
    $allModals     = $(this),
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
    moduleSelector  = $allModals.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    invokedResponse
  ;

  $allModals
    .each(function() {
      var
        $modal       = $(this),
        $context     = $(settings.context),
        $otherModals = $allModals.not($modal),
        $closeButton = $modal.find(selector.closeButton),

        $dimmer,

        element      = this,
        instance     = $modal.data(moduleNamespace),
        modal
      ;

      modal  = {

        initialize: function() {
          modal.verbose('Attaching events');
          $closeButton
            .on('click', modal.event.close)
          ;
          modal.cache.sizes();

          modal.verbose('Creating dimmer');
          $context
            .dimmer({
              closable: settings.closable,
              duration: settings.duration,
              onShow: function() {
                modal.add.keyboardShortcuts();
                $.proxy(settings.onShow, this)();
              },
              onHide: function() {
                if($modal.is(':visible')) {
                  $context.off('.dimmer');
                  modal.hide();
                  $.proxy(settings.onHide, this)();
                }
                modal.remove.keyboardShortcuts();
              }
            })
          ;
          $dimmer = $context.children(selector.dimmer);
          if( $modal.parent()[0] !== $dimmer[0] ) {
            modal.debug('Moving element inside dimmer', $context);
            $modal = $modal
              .detach()
              .appendTo($dimmer)
            ;
          }
          modal.instantiate();
        },

        instantiate: function() {
          modal.verbose('Storing instance of modal');
          instance = modal;
          $modal
            .data(moduleNamespace, instance)
          ;
        },

        destroy: function() {
          modal.verbose('Destroying previous modal');
          $modal
            .off(eventNamespace)
          ;
        },

        event: {
          close: function() {
            modal.verbose('Close button pressed');
            $context.dimmer('hide');
          },
          keyboard: function(event) {
            var
              keyCode   = event.which,
              escapeKey = 27
            ;
            if(keyCode == escapeKey) {
              modal.debug('Escape key pressed hiding modal');
              $context.dimmer('hide');
              event.preventDefault();
            }
          },
          resize: function() {
            modal.cache.sizes();
            if( $modal.is(':visible') ) {
              modal.set.type();
              modal.set.position();
            }
          }
        },

        toggle: function() {
          if( modal.is.active() ) {
            modal.hide();
          }
          else {
            modal.show();
          }
        },

        show: function() {
          modal.debug('Showing modal');
          modal.set.type();
          modal.set.position();
          modal.hideAll();
          if(settings.transition && $.fn.transition !== undefined) {
            $modal
              .transition(settings.transition + ' in', settings.duration, modal.set.active)
            ;
          }
          else {
            $modal
              .fadeIn(settings.duration, settings.easing, modal.set.active)
            ;
          }
          modal.debug('Triggering dimmer');
          $context.dimmer('show');
        },

        hide: function() {
          modal.debug('Hiding modal');
          // remove keyboard detection
          $document
            .off('keyup.' + namespace)
          ;
          if(settings.transition && $.fn.transition !== undefined) {
            $modal
              .transition(settings.transition + ' out', settings.duration, modal.remove.active)
            ;
          }
          else {
            $modal
              .fadeOut(settings.duration, settings.easing, modal.remove.active)
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
            modal.verbose('Adding keyboard shortcuts');
            $document
              .on('keyup' + eventNamespace, modal.event.keyboard)
            ;
          }
        },

        remove: {
          active: function() {
            $modal.removeClass(className.active);
          },
          keyboardShortcuts: function() {
            modal.verbose('Removing keyboard shortcuts');
            $document
              .off('keyup' + eventNamespace)
            ;
          }
        },

        cache: {
          sizes: function() {
            modal.cache = {
              height        : $modal.outerHeight() + settings.offset,
              contextHeight : (settings.context == 'body')
                ? $(window).height()
                : $context.height()
            };
            console.log($modal);
            modal.debug('Caching modal and container sizes', modal.cache);
          }
        },

        can: {
          fit: function() {
            return (modal.cache.height < modal.cache.contextHeight);
          }
        },

        is: {
          active: function() {
            return $modal.hasClass(className.active);
          }
        },

        set: {
          active: function() {
            $modal.addClass('active');
          },
          type: function() {
            if(modal.can.fit()) {
              modal.verbose('Modal fits on screen');
              $modal.removeClass(className.scrolling);
            }
            else {
              modal.verbose('Modal cannot fit on screen setting to scrolling');
              $modal.addClass(className.scrolling);
            }
          },
          position: function() {
            modal.verbose('Centering modal on page', modal.cache.height / 2);
            if(modal.can.fit()) {
              $modal
                .css({
                  marginTop: -(modal.cache.height / 2)
                })
              ;
            }
            else {
              $modal
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
              $.extend(true, modal, name);
            }
            else {
              modal[name] = value;
            }
          }
          else {
            return modal[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              modal.performance.log(arguments);
            }
            else {
              modal.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              modal.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              modal.performance.log(arguments);
            }
            else {
              modal.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              modal.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          modal.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          modal.error.apply(console, arguments);
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
            clearTimeout(modal.performance.timer);
            modal.performance.timer = setTimeout(modal.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(modal.performance.timer);
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
                modal.error(error.method);
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
          modal.initialize();
        }
        invokedResponse = modal.invoke(query);
      }
      else {
        if(instance !== undefined) {
          modal.destroy();
        }
        modal.initialize();
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
    scrolling : 'scrolling'
  },
};


})( jQuery, window , document );