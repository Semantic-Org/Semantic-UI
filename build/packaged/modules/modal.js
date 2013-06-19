/*  ******************************
  Modal
  Author: Jack Lukic
  Notes: First Commit May 14, 2012

  Manages modal state and
  stage dimming

******************************  */

;(function ( $, window, document, undefined ) {

  $.dimScreen = function(parameters) {
    var
      // if parameter is string it is callback function
      settings       = (typeof parameters == 'function')
        ? $.extend({}, $.fn.modal.settings, { dim: parameters })
        : $.extend({}, $.fn.modal.settings, parameters),

      $context       = $(settings.context),
      $dimmer        = $context.children(settings.selector.dimmer),
      dimmerExists   = ($dimmer.size() > 0),
      currentOpacity = $dimmer.css('opacity')
    ;
    if(!dimmerExists) {
      $dimmer = $('<div/>')
        .attr('id','dimmer')
        .html('<div class="content"></div>')
      ;
      $context
        .append($dimmer)
      ;
    }
    if(currentOpacity != settings.opacity) {
      $dimmer
        .one('click', function() {
          settings.unDim();
          $.unDimScreen();
        })
      ;
      if(settings.duration === 0) {
        $dimmer
          .css({
            visibility : 'visible'
          })
          .find('.content')
            .css({
              opacity    : settings.opacity,
              visibility : 'visible'
            })
        ;
        settings.dim();
      }
      else {
        $dimmer
          .css({
            visibility : 'visible'
          })
          .find('.content')
            .css({
              opacity    : 0,
              visibility : 'visible'
            })
            .fadeTo(settings.duration, settings.opacity, settings.dim)
        ;
      }
    }
    return this;
  };
  $.unDimScreen = function(parameters) {
    var
      settings     = (typeof parameters == 'function')
        ? $.extend({}, $.fn.modal.settings, { unDim: parameters })
        : $.extend({}, $.fn.modal.settings, parameters),

      $context     = $(settings.context),
      $dimmer      = $context.children(settings.selector.dimmer),
      dimmerExists = ($dimmer.size() > 0)
    ;
    if(dimmerExists) {
      // callback before unDim
      settings.unDim();
      if(settings.duration === 0) {
        $dimmer
          .css({
            visibility: 'hidden'
          })
          .remove()
        ;
      }
      else {
        $dimmer
          .find('.content')
            .fadeTo(settings.duration, 0, function(){
              $dimmer.remove();
            })
        ;
      }
    }
    return this;
  };

  $.fn.modal = function(parameters) {
    var
      settings        = $.extend(true, {}, $.fn.modal.settings, parameters),
      // make arguments available
      query           = arguments[0],
      passedArguments = [].slice.call(arguments, 1),
      invokedResponse
    ;

    $(this)
      .each(function() {
        var
          $modal       = $(this),

          $closeButton = $modal.find(settings.selector.closeButton),
          $dimmer      = $(settings.context).find(settings.selector.dimmer),
          $modals      = $(settings.context).children(settings.selector.modal),
          $otherModals = $modals.not($modal),

          instance      = $modal.data('module-' + settings.namespace),
          methodInvoked = (typeof query == 'string'),
          
          className    = settings.className,
          namespace    = settings.namespace,
          
          module
        ;

        module  = {

          initialize: function() {
            // attach events
            $modal
              .on('modalShow.' + namespace, module.show)
              .on('modalHide.' + namespace, module.hide)
              .data('module-' + namespace, module)
            ;
          },

          show: function() {
            var
              modalHeight   = $modal.outerHeight(),
              windowHeight  = $(window).height(),

              cantFit       = (modalHeight > windowHeight),
              modalType = (cantFit)
                ? 'absolute'
                : 'fixed',
              topCentering,
              offsetTop,
              finalPosition,
              startPosition
            ;
            $modal
              .addClass(modalType)
            ;
            topCentering  = (cantFit)
              ? '0'
              : '50%'
            ;
            offsetTop     = (cantFit)
              ? (windowHeight / 8)
              : -( (modalHeight  - settings.closeSpacing) / 2)
            ;
            finalPosition = ($modal.css('position') == 'absolute')
              ? offsetTop + $(window).prop('pageYOffset')
              : offsetTop
            ;
            startPosition = finalPosition + settings.animationOffset;
            // set top margin as offset
            if($.fn.popIn !== undefined) {
              $modal
                .css({
                  display   : 'block',
                  opacity   : 0,
                  top: topCentering,
                  marginTop : finalPosition + 'px'
                })
                .popIn()
              ;
            }
            else {
              $modal
                .css({
                  display   : 'block',
                  opacity   : 0,
                  top: topCentering,
                  marginTop : startPosition + 'px'
                })
                .animate({
                  opacity   : 1,
                  marginTop : finalPosition + 'px'
                }, (settings.duration + 300), settings.easing)
              ;
            }
            if( $otherModals.is(':visible') ) {
              $otherModals
                .filter(':visible')
                  .hide()
              ;
            }
            $.dimScreen({
              context  : settings.context,
              duration : 0,
              dim      : function() {
                $(document)
                  .on('keyup.' + namespace, function(event) {
                    var
                      keyCode   = event.which,
                      escapeKey = 27
                    ;
                    switch(keyCode) {
                      case escapeKey:
                        $modal.modal('hide');
                        event.preventDefault();
                        break;
                    }
                  })
                ;
                $closeButton
                  .one('click', function() {
                    $modal.modal('hide');
                  })
                ;
                settings.dim();
              },
              unDim: function() {
                $modal.modal('hide');
                $closeButton.unbind('click');
              }
            });
          },

          hide: function() {
            // remove keyboard detection
            $(document)
              .off('keyup.' + namespace)
            ;
            $.unDimScreen({
              duration: 0,
              unDim: function() {
                $modal
                  .popOut(200)
                ;
                settings.unDim();
              }
            });
          },
          /* standard module */
          setting: function(name, value) {
            if(value === undefined) {
              return settings[name];
            }
            settings[name] = value;
          },
          debug: function() {
            var
              output    = [],
              message   = settings.moduleName + ': ' + arguments[0],
              variables = [].slice.call( arguments, 1 ),
              log       = console.info || console.log || function(){}
            ;
            if(settings.debug) {
              output.push(message);
              log.apply(console, output.concat(variables) );
            }
          },
          error: function() {
            var
              output       = [],
              errorMessage = settings.moduleName + ': ' + arguments[0],
              variables    = [].slice.call( arguments, 1 ),
              log          = console.warn || console.log || function(){}
            ;
            if(settings.debug) {
              output.push(errorMessage);
              output.concat(variables);
              log.apply(console, output.concat(variables) );
            }
          },
          invoke: function(query, context, passedArguments) {
            var
              maxDepth,
              found
            ;
            passedArguments = passedArguments || [].slice.call( arguments, 2 );
            if(typeof query == 'string' && instance !== undefined) {
              query    = query.split('.');
              maxDepth = query.length - 1;
              $.each(query, function(depth, value) {
                if( $.isPlainObject( instance[value] ) && (depth != maxDepth) ) {
                  instance = instance[value];
                  return true;
                }
                else if( instance[value] !== undefined ) {
                  found = instance[value];
                  return true;
                }
                module.error(settings.errors.method);
                return false;
              });
            }
            if ( $.isFunction( found ) ) {
              return found.apply(context, passedArguments);
            }
            // return retrieved variable or chain
            return found;
          }
        };

        // check for invoking internal method
        if(methodInvoked) {
          invokedResponse = module.invoke(query, this, passedArguments);
        }
        // otherwise initialize
        else {
          module.initialize();
        }
      })
    ;
    // chain or return queried method
    return (invokedResponse !== undefined)
      ? invokedResponse
      : this
    ;
  };

  $.fn.modal.settings = {

    moduleName      : 'Modal',
    debug           : false,
    namespace       : 'modal',

    errors: {
      method     : 'The method you called is not defined'
    },

    dim             : function(){},
    unDim           : function(){},
    hide            : function(){},
    show            : function(){},
    
    context         : 'body',
    opacity         : 0.8,
    
    closeSpacing    : 25,
    animationOffset : 15,
    
    duration        : 400,
    easing          : 'easeOutExpo',
    
    selector        : {
      dimmer      : '#dimmer',
      modal       : '.modal',
      closeButton : '.close'
    }
  };


})( jQuery, window , document );