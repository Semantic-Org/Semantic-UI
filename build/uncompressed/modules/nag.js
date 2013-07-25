/*  ******************************
  Nag
  Author: Jack Lukic
  Notes: First Commit July 19, 2012

  Simple fixed position nag
******************************  */

;(function ($, window, document, undefined) {

  $.fn.nag = function(parameters) {
    var
      settings = $.extend(true, {}, $.fn.nag.settings, parameters),
      // hoist arguments
      moduleArguments = arguments || false
    ;
    $(this)
      .each(function() {
        var
          $module   = $(this),
          $close    = $module.find(settings.selector.close),

          $context  = $(settings.context),

          instance  = $module.data('module'),
          className = settings.className,

          moduleOffset,
          moduleHeight,

          contextWidth,
          contextHeight,
          contextOffset,

          yOffset,
          yPosition,

          timer,
          module,

          requestAnimationFrame = window.requestAnimationFrame
            || window.mozRequestAnimationFrame
            || window.webkitRequestAnimationFrame
            || window.msRequestAnimationFrame
            || function(callback) { setTimeout(callback, 0); }
        ;
        module = {

          initialize: function() {
            // calculate module offset once
            moduleOffset  = $module.offset();
            moduleHeight  = $module.outerHeight();
            contextWidth  = $context.outerWidth();
            contextHeight = $context.outerHeight();
            contextOffset = $context.offset();

            $module
              .data('module', module)
            ;
            $close
              .on('click', module.dismiss)
            ;
            // lets avoid javascript if we dont need to reposition
            if(settings.context == window && settings.position == 'fixed') {
              $module
                .addClass(className.fixed)
              ;
            }
            if(settings.sticky) {
              // retrigger on scroll for absolute
              if(settings.position == 'absolute') {
                $context
                  .on('scroll resize', module.event.scroll)
                ;
              }
              // fixed is always relative to window
              else {
                $(window)
                  .on('scroll resize', module.event.scroll)
                ;
              }
              // fire once to position on init
              $.proxy(module.event.scroll, this)();
            }

            if(settings.displayTime > 0) {
              setTimeout(module.hide, settings.displayTime);
            }
            if(module.should.show()) {
              if( !$module.is(':visible') ) {
                module.show();
              }
            }
            else {
              module.hide();
            }
          },

          refresh: function() {
            moduleOffset  = $module.offset();
            moduleHeight  = $module.outerHeight();
            contextWidth  = $context.outerWidth();
            contextHeight = $context.outerHeight();
            contextOffset = $context.offset();
          },

          show: function() {
            if(settings.animation.show == 'fade') {
              $module
                .fadeIn(settings.duration, settings.easing)
              ;
            }
            else {
              $module
                .slideDown(settings.duration, settings.easing)
              ;
            }
          },
          
          hide: function() {
            if(settings.animation.show == 'fade') {
              $module
                .fadeIn(settings.duration, settings.easing)
              ;
            }
            else {
              $module
                .slideUp(settings.duration, settings.easing)
              ;
            }
          },

          onHide: function() {
            $module.remove();
            if (settings.onHide) {
              settings.onHide();
            }
          },

          stick: function() {
            module.refresh();

            if(settings.position == 'fixed') {
              var
                windowScroll = $(window).prop('pageYOffset') || $(window).scrollTop(),
                fixedOffset = ( $module.hasClass(className.bottom) )
                  ? contextOffset.top + (contextHeight - moduleHeight) - windowScroll
                  : contextOffset.top - windowScroll
              ;
              $module
                .css({
                  position : 'fixed',
                  top      : fixedOffset,
                  left     : contextOffset.left,
                  width    : contextWidth - settings.scrollBarWidth
                })
              ;
            }
            else {
              $module
                .css({
                  top : yPosition
                })
              ;
            }
          },
          unStick: function() {
            $module
              .css({
                top : ''
              })
            ;
          },
          dismiss: function(event) {
            if(settings.storageMethod) {
              module.storage.set(settings.storedKey, settings.storedValue);
            }
            module.hide();
            event.stopImmediatePropagation();
            event.preventDefault();
          },

          should: {
            show: function() {
              if( !settings.persist && module.storage.get(settings.storedKey) == settings.storedValue) {
                return false;
              }
              return true;
            },
            stick: function() {
              yOffset   = $context.prop('pageYOffset') || $context.scrollTop();
              yPosition = ( $module.hasClass(className.bottom) )
                ? (contextHeight - $module.outerHeight() ) + yOffset
                : yOffset
              ;
              // absolute position calculated when y offset met
              if(yPosition > moduleOffset.top) {
                return true;
              }
              else if(settings.position == 'fixed') {
                return true;
              }
              return false;
            }
          },

          storage: {

            set: function(key, value) {
              if(settings.storageMethod == 'local' && window.store !== undefined) {
                window.store.set(key, value);
              }
              // store by cookie
              else if($.cookie !== undefined) {
                $.cookie(key, value);
              }
              else {
                module.error(settings.errors.noStorage);
              }
            },
            get: function(key) {
              if(settings.storageMethod == 'local' && window.store !== undefined) {
                return window.store.get(key);
              }
              // get by cookie
              else if($.cookie !== undefined) {
                return $.cookie(key);
              }
              else {
                module.error(settings.errors.noStorage);
              }
            }

          },

          event: {
            scroll: function() {
              if(timer !== undefined) {
                clearTimeout(timer);
              }
              timer = setTimeout(function() {
                if(module.should.stick() ) {
                  requestAnimationFrame(module.stick);
                }
                else {
                  module.unStick();
                }
              }, settings.lag);
            }
          },

          error: function(error) {
            console.log('Nag Module:' + error);
          },

          // allows for dot notation method calls
          invoke: function(methodName, context, methodArguments) {
            var
              method
            ;
            methodArguments = methodArguments || Array.prototype.slice.call( arguments, 2 );
            if(typeof methodName == 'string' && instance !== undefined) {
              methodName = methodName.split('.');
              $.each(methodName, function(index, name) {
                if( $.isPlainObject( instance[name] ) ) {
                  instance = instance[name];
                  return true;
                }
                else if( $.isFunction( instance[name] ) ) {
                  method = instance[name];
                  return true;
                }
                module.error(settings.errors.method);
                return false;
              });
            }
            if ( $.isFunction( method ) ) {
              return method.apply(context, methodArguments);
            }
            // return retrieved variable or chain
            return method;
          }

        };

        if(instance !== undefined && moduleArguments) {
          if(moduleArguments[0] == 'invoke') {
            moduleArguments = Array.prototype.slice.call( moduleArguments, 1 );
          }
          return module.invoke(moduleArguments[0], this, Array.prototype.slice.call( moduleArguments, 1 ) );
        }
        module.initialize();

      })
    ;
    return this;
  };

  $.fn.nag.settings = {

    // allows cookie to be overriden
    persist        : false,

    // set to zero to manually dismiss, otherwise hides on its own
    displayTime    : 0,

    animation   : {
      show: 'slide',
      hide: 'slide'
    },

    // method of stickyness
    position       : 'fixed',
    scrollBarWidth : 18,

    // type of storage to use
    storageMethod  : 'cookie',

    // value to store in dismissed localstorage/cookie
    storedKey      : 'nag',
    storedValue    : 'dismiss',

    // need to calculate stickyness on scroll
    sticky         : false,

    // how often to check scroll event
    lag            : 0,

    // context for scroll event
    context        : window,

    errors: {
      noStorage  : 'Neither $.cookie or store is defined. A storage solution is required for storing state'
    },

    className     : {
      bottom      : 'bottom',
      fixed       : 'fixed'
    },

    selector      : {
      close: '.icon.close'
    },

    speed         : 500,
    easing        : 'easeOutQuad',

    onHide: function() {}

  };

})( jQuery, window , document );
