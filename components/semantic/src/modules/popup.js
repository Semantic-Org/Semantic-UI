/*  ******************************
  Tooltip / Popup
  Author: Jack Lukic
  Notes: First Commit Sep 07, 2012
******************************  */

;(function ($, window, document, undefined) {

  $.fn.popup = function(parameters) {
    var
      settings        = $.extend(true, {}, $.fn.popup.settings, parameters),
      // make arguments available
      moduleArguments = arguments || false,
      invokedResponse
    ;
    $(this)
      .each(function() {
        var
          $module        = $(this),
          $window        = $(window),
          $offsetParent  = $module.offsetParent(),
          $popup         = (settings.inline)
            ? $module.next(settings.selector.popup)
            : $window.children(settings.selector.popup).last(),

          timer,
          recursionDepth = 0,

          instance       = $module.data('module-' + settings.namespace),
          methodInvoked  = (instance !== undefined && typeof parameters == 'string'),

          selector       = settings.selector,
          className      = settings.className,
          errors         = settings.errors,
          metadata       = settings.metadata,
          namespace      = settings.namespace,
          module
        ;

        module = {

          // binds events
          initialize: function() {
            if(settings.event == 'hover') {
              $module
                .on('mouseenter.' + namespace, module.event.mouseenter)
                .on('mouseleave.' + namespace, module.event.mouseleave)
              ;
            }
            else {
              $module
                .on(settings.event + '.' + namespace, module.event[settings.event])
              ;
            }
            $window
              .on('resize.' + namespace, module.event.resize)
            ;
            $module
              .data('module-' + namespace, module)
            ;
          },

          refresh: function() {
            $popup        = (settings.inline)
              ? $module.next(selector.popup)
              : $window.children(selector.popup).last()
            ;
            $offsetParent = $module.offsetParent();
          },

          destroy: function() {
            module.debug('Destroying existing popups');
            $module
              .off('.' + namespace)
            ;
            $popup
              .remove()
            ;
          },

          event: {
            mouseenter:  function(event) {
              var element = this;
              timer = setTimeout(function() {
                $.proxy(module.toggle, element)();
                if( $(element).hasClass(className.active) ) {
                  event.stopPropagation();
                }
              }, settings.delay);
            },
            mouseleave:  function(event) {
              clearTimeout(timer);
              if( $module.is(':visible') ) {
                module.hide();
              }
            },
            click: function(event) {
              $.proxy(module.toggle, this)();
              if( $(this).hasClass(className.active) ) {
                event.stopPropagation();
              }
            },
            resize: function() {
              if( $popup.is(':visible') ) {
                module.position();
              }
            }
          },

          // generates popup html from metadata
          create: function() {
            module.debug('Creating pop-up content');
            var
              html    = $module.data(metadata.html)    || settings.html,
              title   = $module.data(metadata.title)   || settings.title,
              content = $module.data(metadata.content) || $module.attr('title') || settings.content
            ;
            if(html || content || title) {
              if(!html) {
                html = settings.template({
                  title   : title,
                  content : content
                });
              }
              $popup = $('<div/>')
                .addClass(className.popup)
                .html(html)
              ;
              if(settings.inline) {
                $popup
                  .insertAfter($module)
                ;
              }
              else {
                $popup
                  .appendTo( $('body') )
                ;
              }
            }
            else {
              module.error(errors.content);
            }
          },

          remove: function() {
            $popup
              .remove()
            ;
          },

          get: {
            offstagePosition: function() {
              var
                boundary  = {
                  top    : $(window).scrollTop(),
                  bottom : $(window).scrollTop() + $(window).height(),
                  left   : 0,
                  right  : $(window).width()
                },
                popup     = {
                  width    : $popup.outerWidth(),
                  height   : $popup.outerHeight(),
                  position : $popup.offset()
                },
                offstage  = {},
                offstagePositions = []
              ;
              if(popup.position) {
                offstage = {
                  top    : (popup.position.top < boundary.top),
                  bottom : (popup.position.top + popup.height > boundary.bottom),
                  right  : (popup.position.left + popup.width > boundary.right),
                  left   : (popup.position.left < boundary.left)
                };
              }
              // return only boundaries that have been surpassed
              $.each(offstage, function(direction, isOffstage) {
                if(isOffstage) {
                  offstagePositions.push(direction);
                }
              });
              return (offstagePositions.length > 0)
                ? offstagePositions.join(' ')
                : false
              ;
            },
            nextPosition: function(position) {
              switch(position) {
                case 'top left':
                  position = 'bottom left';
                break;
                case 'bottom left':
                  position = 'top right';
                break;
                case 'top right':
                  position = 'bottom right';
                break;
                case 'bottom right':
                  position = 'top center';
                break;
                case 'top center':
                  position = 'bottom center';
                break;
                case 'bottom center':
                  position = 'right center';
                break;
                case 'right center':
                  position = 'left center';
                break;
                case 'left center':
                  position = 'top center';
                break;
              }
              return position;
            }
          },

          // determines popup state
          toggle: function() {
            $module = $(this);
            module.debug('Toggling pop-up');
            // refresh state of module
            module.refresh();
            if($popup.size() === 0) {
              module.create();
            }
            if( !$module.hasClass(className.active) ) {
              if( module.position() ) {
                module.show();
              }
            }
            else {
              module.hide();
            }
          },

          position: function(position, arrowOffset) {
            var
              windowWidth  = $(window).width(),
              windowHeight = $(window).height(),
              width        = $module.outerWidth(),
              height       = $module.outerHeight(),
              popupWidth   = $popup.outerWidth(),
              popupHeight  = $popup.outerHeight(),

              offset       = (settings.inline)
                ? $module.position()
                : $module.offset(),
              parentWidth  = (settings.inline)
                ? $offsetParent.outerWidth()
                : $window.outerWidth(),
              parentHeight = (settings.inline)
                ? $offsetParent.outerHeight()
                : $window.outerHeight(),

              positioning,
              offstagePosition
            ;
            position    = position    || $module.data(metadata.position)    || settings.position;
            arrowOffset = arrowOffset || $module.data(metadata.arrowOffset) || settings.arrowOffset;
            module.debug('Calculating offset for position', position);
            switch(position) {
              case 'top left':
                positioning = {
                  top    : 'auto',
                  bottom :  parentHeight - offset.top + settings.distanceAway,
                  left   : offset.left + arrowOffset
                };
              break;
              case 'top center':
                positioning = {
                  bottom :  parentHeight - offset.top + settings.distanceAway,
                  left   : offset.left + (width / 2) - (popupWidth / 2) + arrowOffset,
                  top    : 'auto',
                  right  : 'auto'
                };
              break;
              case 'top right':
                positioning = {
                  bottom :  parentHeight - offset.top + settings.distanceAway,
                  right  :  parentWidth - offset.left - width - arrowOffset,
                  top    : 'auto',
                  left   : 'auto'
                };
              break;
              case 'left center':
                positioning = {
                  top    :  offset.top + (height / 2) - (popupHeight / 2),
                  right  : parentWidth - offset.left + settings.distanceAway - arrowOffset,
                  left   : 'auto',
                  bottom : 'auto'
                };
              break;
              case 'right center':
                positioning = {
                  top    :  offset.top + (height / 2) - (popupHeight / 2),
                  left   : offset.left + width + settings.distanceAway + arrowOffset,
                  bottom : 'auto',
                  right  : 'auto'
                };
              break;
              case 'bottom left':
                positioning = {
                  top    :  offset.top + height + settings.distanceAway,
                  left   : offset.left + arrowOffset,
                  bottom : 'auto',
                  right  : 'auto'
                };
              break;
              case 'bottom center':
                positioning = {
                  top    :  offset.top + height + settings.distanceAway,
                  left   : offset.left + (width / 2) - (popupWidth / 2) + arrowOffset,
                  bottom : 'auto',
                  right  : 'auto'
                };
              break;
              case 'bottom right':
                positioning = {
                  top    :  offset.top + height + settings.distanceAway,
                  right  : parentWidth - offset.left - width - arrowOffset,
                  left   : 'auto',
                  bottom : 'auto'
                };
              break;
            }
            // true width on popup, avoid rounding error
            $.extend(positioning, {
              width: $popup.width() + 1
            });
            // tentatively place on stage
            $popup
              .removeAttr('style')
              .removeClass('top right bottom left center')
              .css(positioning)
              .addClass(position)
              .addClass(className.loading)
            ;
            // check if is offstage
            offstagePosition = module.get.offstagePosition();
            // recursively find new positioning
            if(offstagePosition) {
              module.debug('Element is outside boundaries ', offstagePosition);
              if(recursionDepth < settings.maxRecursion) {
                position = module.get.nextPosition(position);
                recursionDepth++;
                module.debug('Trying new position: ', position);
                return module.position(position);
              }
              else {
                module.error(errors.recursion);
                recursionDepth = 0;
                return false;
              }
            }
            else {
              module.debug('Position is on stage', position);
              recursionDepth = 0;
              return true;
            }
          },

          show: function() {
            module.debug('Showing pop-up');
            $(selector.popup)
              .filter(':visible')
                .stop()
                .fadeOut(200)
                .prev($module)
                  .removeClass(className.active)
            ;
            $module
              .addClass(className.active)
            ;
            $popup
              .removeClass(className.loading)
            ;
            if(settings.animation == 'pop' && $.fn.popIn !== undefined) {
              $popup
                .stop()
                .popIn(settings.duration, settings.easing)
              ;
            }
            else {
              $popup
                .stop()
                .fadeIn(settings.duration, settings.easing)
              ;
            }
            if(settings.event == 'click' && settings.clicktoClose) {
              module.debug('Binding popup close event');
              $(document)
                .on('click.' + namespace, module.gracefully.hide)
              ;
            }
            $.proxy(settings.onShow, $popup)();
          },

          hide: function() {
            $module
              .removeClass(className.active)
            ;
            if($popup.is(':visible') ) {
              module.debug('Hiding pop-up');
              if(settings.animation == 'pop' && $.fn.popOut !== undefined) {
                $popup
                  .stop()
                  .popOut(settings.duration, settings.easing, function() {
                    $popup.hide();
                  })
                ;
              }
              else {
                $popup
                  .stop()
                  .fadeOut(settings.duration, settings.easing)
                ;
              }
            }
            if(settings.event == 'click' && settings.clicktoClose) {
              $(document)
                .off('click.' + namespace)
              ;
            }
            $.proxy(settings.onHide, $popup)();
            if(!settings.inline) {
              module.remove();
            }
          },

          gracefully: {
            hide: function(event) {
              // don't close on clicks inside popup
              if( $(event.target).closest(selector.popup).size() === 0) {
                module.hide();
              }
            }
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
          invokedResponse = module.invoke(moduleArguments[0], this, Array.prototype.slice.call( moduleArguments, 1 ) );
        }
        // otherwise initialize
        else {
          if(instance) {
            module.destroy();
          }
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

  $.fn.popup.settings = {

    moduleName     : 'Pop-up Module',
    debug          : true,
    namespace      : 'popup',

    onShow         : function(){},
    onHide         : function(){},

    content        : false,
    html           : false,
    title          : false,

    position       : 'top center',
    delay          : 0,
    inline         : true,

    duration       : 250,
    easing         : 'easeOutQuint',
    animation      : 'pop',

    errors: {
      content   : 'Warning: Your popup has no content specified',
      method    : 'The method you called is not defined.',
      recursion : 'Popup attempted to reposition element to fit, but could not find an adequate position.'
    },

    distanceAway : 2,
    arrowOffset  : 0,

    maxRecursion :  10,

    event        : 'hover',
    clicktoClose : true,

    metadata: {
      content     : 'content',
      html        : 'html',
      title       : 'title',
      position    : 'position',
      arrowOffset : 'arrowOffset'
    },

    className   : {
      popup       : 'ui popup',
      active      : 'active',
      loading     : 'loading'
    },

    selector    : {
      popup    : '.ui.popup'
    },

    template: function(text) {
      var html = '';
      if(typeof text !== undefined) {
        if(typeof text.title !== undefined && text.title) {
          html += '<h2>' + text.title + '</h2>';
        }
        if(typeof text.content !== undefined && text.content) {
          html += '<div class="content">' + text.content + '</div>';
        }
      }
      return html;
    }

  };

})( jQuery, window , document );