/*!
 * # Semantic UI 1.11.4 - Popup
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

"use strict";

$.fn.popup = function(parameters) {
  var
    $allModules    = $(this),
    $document      = $(document),

    moduleSelector = $allModules.selector || '',

    hasTouch       = ('ontouchstart' in document.documentElement),
    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),

    returnedValue
  ;
  $allModules
    .each(function() {
      var
        settings        = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.popup.settings, parameters)
          : $.extend({}, $.fn.popup.settings),

        selector           = settings.selector,
        className          = settings.className,
        error              = settings.error,
        metadata           = settings.metadata,
        namespace          = settings.namespace,

        eventNamespace     = '.' + settings.namespace,
        moduleNamespace    = 'module-' + namespace,

        $module            = $(this),
        $context           = $(settings.context),
        $target            = (settings.target)
          ? $(settings.target)
          : $module,

        $window            = $(window),
        $body              = $('body'),
        $popup,
        $offsetParent,

        searchDepth        = 0,
        triedPositions     = false,

        element            = this,
        instance           = $module.data(moduleNamespace),

        elementNamespace,
        id,
        module
      ;

      module = {

        // binds events
        initialize: function() {
          module.debug('Initializing', $module);
          module.createID();
          module.bind.events();
          if( !module.exists() && settings.preserve) {
            module.create();
          }
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance', module);
          instance = module;
          $module
            .data(moduleNamespace, instance)
          ;
        },

        refresh: function() {
          if(settings.popup) {
            $popup = $(settings.popup).eq(0);
          }
          else {
            if(settings.inline) {
              $popup = $target.next(selector.popup).eq(0);
            }
          }
          if(settings.popup) {
            $popup.addClass(className.loading);
            $offsetParent = module.get.offsetParent();
            $popup.removeClass(className.loading);
            if(settings.movePopup && module.has.popup() && module.get.offsetParent($popup)[0] !== $offsetParent[0]) {
              module.debug('Moving popup to the same offset parent as activating element');
              $popup
                .detach()
                .appendTo($offsetParent)
              ;
            }
          }
          else {
            $offsetParent = (settings.inline)
              ? module.get.offsetParent($target)
              : module.has.popup()
                ? module.get.offsetParent($popup)
                : $body
            ;
          }
          if( $offsetParent.is('html') ) {
            module.debug('Setting page as offset parent');
            $offsetParent = $body;
          }
        },

        reposition: function() {
          module.refresh();
          module.set.position();
        },

        destroy: function() {
          module.debug('Destroying previous module');
          // remove element only if was created dynamically
          if($popup && !settings.preserve) {
            module.removePopup();
          }
          // clear all timeouts
          clearTimeout(module.hideTimer);
          clearTimeout(module.showTimer);
          // remove events
          $window.off(elementNamespace);
          $module
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        event: {
          start:  function(event) {
            var
              delay = ($.isPlainObject(settings.delay))
                ? settings.delay.show
                : settings.delay
            ;
            clearTimeout(module.hideTimer);
            module.showTimer = setTimeout(function() {
              if(module.is.hidden() && !( module.is.active() && module.is.dropdown()) ) {
                module.show();
              }
            }, delay);
          },
          end:  function() {
            var
              delay = ($.isPlainObject(settings.delay))
                ? settings.delay.hide
                : settings.delay
            ;
            clearTimeout(module.showTimer);
            module.hideTimer = setTimeout(function() {
              if(module.is.visible() ) {
                module.hide();
              }
            }, delay);
          },
          resize: function() {
            if( module.is.visible() ) {
              module.set.position();
            }
          }
        },

        // generates popup html from metadata
        create: function() {
          var
            html      = $module.data(metadata.html)      || settings.html,
            variation = $module.data(metadata.variation) || settings.variation,
            title     = $module.data(metadata.title)     || settings.title,
            content   = $module.data(metadata.content)   || $module.attr('title') || settings.content
          ;
          if(html || content || title) {
            module.debug('Creating pop-up html');
            if(!html) {
              html = settings.templates.popup({
                title   : title,
                content : content
              });
            }
            $popup = $('<div/>')
              .addClass(className.popup)
              .addClass(variation)
              .data(metadata.activator, $module)
              .html(html)
            ;
            if(variation) {
              $popup
                .addClass(variation)
              ;
            }
            if(settings.inline) {
              module.verbose('Inserting popup element inline', $popup);
              $popup
                .insertAfter($module)
              ;
            }
            else {
              module.verbose('Appending popup element to body', $popup);
              $popup
                .appendTo( $context )
              ;
            }
            module.refresh();
            if(settings.hoverable) {
              module.bind.popup();
            }
            settings.onCreate.call($popup, element);
          }
          else if($target.next(selector.popup).length !== 0) {
            module.verbose('Pre-existing popup found');
            settings.inline = true;
            settings.popup  = $target.next(selector.popup).data(metadata.activator, $module);
            module.refresh();
            if(settings.hoverable) {
              module.bind.popup();
            }
          }
          else if(settings.popup) {
            settings.popup.data(metadata.activator, $module);
            module.verbose('Used popup specified in settings');
            module.refresh();
            if(settings.hoverable) {
              module.bind.popup();
            }
          }
          else {
            module.debug('No content specified skipping display', element);
          }
        },

        createID: function() {
          id = (Math.random().toString(16) + '000000000').substr(2,8);
          elementNamespace = '.' + id;
          module.verbose('Creating unique id for element', id);
        },

        // determines popup state
        toggle: function() {
          module.debug('Toggling pop-up');
          if( module.is.hidden() ) {
            module.debug('Popup is hidden, showing pop-up');
            module.unbind.close();
            module.show();
          }
          else {
            module.debug('Popup is visible, hiding pop-up');
            module.hide();
          }
        },

        show: function(callback) {
          callback = $.isFunction(callback) ? callback : function(){};
          module.debug('Showing pop-up', settings.transition);
          if( !module.exists() ) {
            module.create();
          }
          else if(!settings.preserve && !settings.popup) {
            module.refresh();
          }
          if( $popup && module.set.position() ) {
            module.save.conditions();
            if(settings.exclusive) {
              module.hideAll();
            }
            module.animate.show(callback);
          }
        },


        hide: function(callback) {
          callback = $.isFunction(callback) ? callback : function(){};
          module.remove.visible();
          module.unbind.close();
          if( module.is.visible() ) {
            module.restore.conditions();
            module.animate.hide(callback);
          }
        },

        hideAll: function() {
          $(selector.popup)
            .filter('.' + className.visible)
            .each(function() {
              $(this)
                .data(metadata.activator)
                .popup('hide')
              ;
            })
          ;
        },

        hideGracefully: function(event) {
          // don't close on clicks inside popup
          if(event && $(event.target).closest(selector.popup).length === 0) {
            module.debug('Click occurred outside popup hiding popup');
            module.hide();
          }
          else {
            module.debug('Click was inside popup, keeping popup open');
          }
        },

        exists: function() {
          if(!$popup) {
            return false;
          }
          if(settings.inline || settings.popup) {
            return ( module.has.popup() );
          }
          else {
            return ( $popup.closest($context).length >= 1 )
              ? true
              : false
            ;
          }
        },

        removePopup: function() {
          module.debug('Removing popup', $popup);
          if( module.has.popup() && !settings.popup) {
            $popup.remove();
            $popup = undefined;
          }
          settings.onRemove.call($popup, element);
        },

        save: {
          conditions: function() {
            module.cache = {
              title: $module.attr('title')
            };
            if (module.cache.title) {
              $module.removeAttr('title');
            }
            module.verbose('Saving original attributes', module.cache.title);
          }
        },
        restore: {
          conditions: function() {
            if(module.cache && module.cache.title) {
              $module.attr('title', module.cache.title);
              module.verbose('Restoring original attributes', module.cache.title);
            }
            return true;
          }
        },
        animate: {
          show: function(callback) {
            callback = $.isFunction(callback) ? callback : function(){};
            if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
              module.set.visible();
              $popup
                .transition({
                  animation  : settings.transition + ' in',
                  queue      : false,
                  debug      : settings.debug,
                  verbose    : settings.verbose,
                  duration   : settings.duration,
                  onComplete : function() {
                    module.bind.close();
                    callback.call($popup, element);
                    settings.onVisible.call($popup, element);
                  }
                })
              ;
            }
            else {
              module.set.visible();
              $popup
                .stop()
                .fadeIn(settings.duration, settings.easing, function() {
                  module.bind.close();
                  callback.call($popup, element);
                  settings.onVisible.call($popup, element);
                })
              ;
            }
            settings.onShow.call($popup, element);
          },
          hide: function(callback) {
            callback = $.isFunction(callback) ? callback : function(){};
            module.debug('Hiding pop-up');
            if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
              $popup
                .transition({
                  animation  : settings.transition + ' out',
                  queue      : false,
                  duration   : settings.duration,
                  debug      : settings.debug,
                  verbose    : settings.verbose,
                  onComplete : function() {
                    module.reset();
                    callback.call($popup, element);
                    settings.onHidden.call($popup, element);
                  }
                })
              ;
            }
            else {
              $popup
                .stop()
                .fadeOut(settings.duration, settings.easing, function() {
                  module.reset();
                  callback.call($popup, element);
                  settings.onHidden.call($popup, element);
                })
              ;
            }
            settings.onHide.call($popup, element);
          }
        },

        get: {
          id: function() {
            return id;
          },
          startEvent: function() {
            if(settings.on == 'hover') {
              return (hasTouch)
                ? 'touchstart mouseenter'
                : 'mouseenter'
              ;
            }
            else if(settings.on == 'focus') {
              return 'focus';
            }
            return false;
          },
          scrollEvent: function() {
            return (hasTouch)
              ? 'touchmove scroll'
              : 'scroll'
            ;
          },
          endEvent: function() {
            if(settings.on == 'hover') {
              return 'mouseleave';
            }
            else if(settings.on == 'focus') {
              return 'blur';
            }
            return false;
          },
          offsetParent: function($target) {
            var
              element = ($target !== undefined)
                ? $target[0]
                : $module[0],
              parentNode = element.parentNode,
              $node    = $(parentNode)
            ;
            if(parentNode) {
              var
                is2D     = ($node.css('transform') === 'none'),
                isStatic = ($node.css('position') === 'static'),
                isHTML   = $node.is('html')
              ;
              while(parentNode && !isHTML && isStatic && is2D) {
                parentNode = parentNode.parentNode;
                $node    = $(parentNode);
                is2D     = ($node.css('transform') === 'none');
                isStatic = ($node.css('position') === 'static');
                isHTML   = $node.is('html');
              }
            }
            return ($node && $node.length > 0)
              ? $node
              : $()
            ;
          },
          offstagePosition: function(position) {
            var
              boundary  = {
                top    : $(window).scrollTop(),
                bottom : $(window).scrollTop() + $(window).height(),
                left   : 0,
                right  : $(window).width()
              },
              popup     = {
                width  : $popup.width(),
                height : $popup.height(),
                offset : $popup.offset()
              },
              offstage  = {},
              offstagePositions = []
            ;
            position = position || false;
            if(popup.offset && position) {
              module.verbose('Checking if outside viewable area', popup.offset);
              offstage = {
                top    : (popup.offset.top < boundary.top),
                bottom : (popup.offset.top + popup.height > boundary.bottom),
                right  : (popup.offset.left + popup.width > boundary.right),
                left   : (popup.offset.left < boundary.left)
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
          positions: function() {
            return {
              'top left'      : false,
              'top center'    : false,
              'top right'     : false,
              'bottom left'   : false,
              'bottom center' : false,
              'bottom right'  : false,
              'left center'   : false,
              'right center'  : false
            };
          },
          nextPosition: function(position) {
            var
              positions          = position.split(' '),
              verticalPosition   = positions[0],
              horizontalPosition = positions[1],
              opposite = {
                top    : 'bottom',
                bottom : 'top',
                left   : 'right',
                right  : 'left'
              },
              adjacent = {
                left   : 'center',
                center : 'right',
                right  : 'left'
              },
              backup = {
                'top left'      : 'top center',
                'top center'    : 'top right',
                'top right'     : 'right center',
                'right center'  : 'bottom right',
                'bottom right'  : 'bottom center',
                'bottom center' : 'bottom left',
                'bottom left'   : 'left center',
                'left center'   : 'top left'
              },
              adjacentsAvailable = (verticalPosition == 'top' || verticalPosition == 'bottom'),
              oppositeTried = false,
              adjacentTried = false,
              nextPosition  = false
            ;
            if(!triedPositions) {
              module.verbose('All available positions available');
              triedPositions = module.get.positions();
            }

            module.debug('Recording last position tried', position);
            triedPositions[position] = true;

            if(settings.prefer === 'opposite') {
              nextPosition  = [opposite[verticalPosition], horizontalPosition];
              nextPosition  = nextPosition.join(' ');
              oppositeTried = (triedPositions[nextPosition] === true);
              module.debug('Trying opposite strategy', nextPosition);
            }
            if((settings.prefer === 'adjacent') && adjacentsAvailable ) {
              nextPosition  = [verticalPosition, adjacent[horizontalPosition]];
              nextPosition  = nextPosition.join(' ');
              adjacentTried = (triedPositions[nextPosition] === true);
              module.debug('Trying adjacent strategy', nextPosition);
            }
            if(adjacentTried || oppositeTried) {
              module.debug('Using backup position', nextPosition);
              nextPosition = backup[position];
            }
            return nextPosition;
          }
        },

        set: {
          position: function(position, arrowOffset) {
            var
              windowWidth   = $(window).width(),
              windowHeight  = $(window).height(),

              targetWidth   = $target.outerWidth(),
              targetHeight  = $target.outerHeight(),

              popupWidth    = $popup.outerWidth(),
              popupHeight   = $popup.outerHeight(),

              parentWidth   = $offsetParent.outerWidth(),
              parentHeight  = $offsetParent.outerHeight(),

              distanceAway  = settings.distanceAway,

              targetElement = $target[0],

              marginTop     = (settings.inline)
                ? parseInt( window.getComputedStyle(targetElement).getPropertyValue('margin-top'), 10)
                : 0,
              marginLeft    = (settings.inline)
                ? parseInt( window.getComputedStyle(targetElement).getPropertyValue(module.is.rtl() ? 'margin-right' : 'margin-left'), 10)
                : 0,

              target        = (settings.inline || settings.popup)
                ? $target.position()
                : $target.offset(),

              computedPosition,
              positioning,
              offstagePosition
            ;
            position    = position    || $module.data(metadata.position)    || settings.position;
            arrowOffset = arrowOffset || $module.data(metadata.offset)      || settings.offset;

            if(searchDepth == settings.maxSearchDepth && settings.lastResort) {
              module.debug('Using last resort position to display', settings.lastResort);
              position = settings.lastResort;
            }

            if(settings.inline) {
              module.debug('Adding targets margin to calculation');
              if(position == 'left center' || position == 'right center') {
                arrowOffset  += marginTop;
                distanceAway += -marginLeft;
              }
              else if (position == 'top left' || position == 'top center' || position == 'top right') {
                arrowOffset  += marginLeft;
                distanceAway -= marginTop;
              }
              else {
                arrowOffset  += marginLeft;
                distanceAway += marginTop;
              }
            }
            module.debug('Calculating popup positioning', position);

            computedPosition = position;
            if (module.is.rtl()) {
              computedPosition = computedPosition.replace(/left|right/g, function (match) {
                return (match == 'left')
                  ? 'right'
                  : 'left'
                ;
              });
              module.debug('RTL: Popup positioning updated', computedPosition);
            }
            switch (computedPosition) {
              case 'top left':
                positioning = {
                  top    : 'auto',
                  bottom : parentHeight - target.top + distanceAway,
                  left   : target.left + arrowOffset,
                  right  : 'auto'
                };
              break;
              case 'top center':
                positioning = {
                  bottom : parentHeight - target.top + distanceAway,
                  left   : target.left + (targetWidth / 2) - (popupWidth / 2) + arrowOffset,
                  top    : 'auto',
                  right  : 'auto'
                };
              break;
              case 'top right':
                positioning = {
                  bottom :  parentHeight - target.top + distanceAway,
                  right  :  parentWidth - target.left - targetWidth - arrowOffset,
                  top    : 'auto',
                  left   : 'auto'
                };
              break;
              case 'left center':
                positioning = {
                  top    : target.top + (targetHeight / 2) - (popupHeight / 2) + arrowOffset,
                  right  : parentWidth - target.left + distanceAway,
                  left   : 'auto',
                  bottom : 'auto'
                };
              break;
              case 'right center':
                positioning = {
                  top    : target.top + (targetHeight / 2) - (popupHeight / 2) + arrowOffset,
                  left   : target.left + targetWidth + distanceAway,
                  bottom : 'auto',
                  right  : 'auto'
                };
              break;
              case 'bottom left':
                positioning = {
                  top    : target.top + targetHeight + distanceAway,
                  left   : target.left + arrowOffset,
                  bottom : 'auto',
                  right  : 'auto'
                };
              break;
              case 'bottom center':
                positioning = {
                  top    : target.top + targetHeight + distanceAway,
                  left   : target.left + (targetWidth / 2) - (popupWidth / 2) + arrowOffset,
                  bottom : 'auto',
                  right  : 'auto'
                };
              break;
              case 'bottom right':
                positioning = {
                  top    : target.top + targetHeight + distanceAway,
                  right  : parentWidth - target.left  - targetWidth - arrowOffset,
                  left   : 'auto',
                  bottom : 'auto'
                };
              break;
            }
            if(positioning === undefined) {
              module.error(error.invalidPosition, position);
            }

            module.debug('Calculated popup positioning values', positioning);

            // tentatively place on stage
            $popup
              .css(positioning)
              .removeClass(className.position)
              .addClass(position)
              .addClass(className.loading)
            ;
            // check if is offstage
            offstagePosition = module.get.offstagePosition(position);

            // recursively find new positioning
            if(offstagePosition) {
              module.debug('Popup cant fit into viewport', offstagePosition);
              if(searchDepth < settings.maxSearchDepth) {
                searchDepth++;
                position = module.get.nextPosition(position);
                module.debug('Trying new position', position);
                return ($popup)
                  ? module.set.position(position)
                  : false
                ;
              }
              else if(!settings.lastResort) {
                module.debug('Popup could not find a position in view', $popup);
                module.error(error.cannotPlace, element);
                module.remove.attempts();
                module.remove.loading();
                module.reset();
                return false;
              }
            }

            module.debug('Position is on stage', position);
            module.remove.attempts();
            module.set.fluidWidth();
            module.remove.loading();
            return true;
          },

          fluidWidth: function() {
            if( settings.setFluidWidth && $popup.hasClass(className.fluid) ) {
              $popup.css('width', $offsetParent.width());
            }
          },

          visible: function() {
            $module.addClass(className.visible);
          }
        },

        remove: {
          loading: function() {
            $popup.removeClass(className.loading);
          },
          visible: function() {
            $module.removeClass(className.visible);
          },
          attempts: function() {
            module.verbose('Resetting all searched positions');
            searchDepth    = 0;
            triedPositions = false;
          }
        },

        bind: {
          events: function() {
            module.debug('Binding popup events to module');
            if(settings.on == 'click') {
              $module
                .on('click' + eventNamespace, module.toggle)
              ;
            }
            else if( module.get.startEvent() ) {
              $module
                .on(module.get.startEvent() + eventNamespace, module.event.start)
                .on(module.get.endEvent() + eventNamespace, module.event.end)
              ;
            }
            if(settings.target) {
              module.debug('Target set to element', $target);
            }
            $window.on('resize' + elementNamespace, module.event.resize);
          },
          popup: function() {
            module.verbose('Allowing hover events on popup to prevent closing');
            if( $popup && module.has.popup() ) {
              $popup
                .on('mouseenter' + eventNamespace, module.event.start)
                .on('mouseleave' + eventNamespace, module.event.end)
              ;
            }
          },
          close:function() {
            if(settings.hideOnScroll === true || settings.hideOnScroll == 'auto' && settings.on != 'click') {
              $document
                .one(module.get.scrollEvent() + elementNamespace, module.hideGracefully)
              ;
              $context
                .one(module.get.scrollEvent() + elementNamespace, module.hideGracefully)
              ;
            }
            if(settings.on == 'click' && settings.closable) {
              module.verbose('Binding popup close event to document');
              $document
                .on('click' + elementNamespace, function(event) {
                  module.verbose('Pop-up clickaway intent detected');
                  module.hideGracefully.call(element, event);
                })
              ;
            }
          }
        },

        unbind: {
          close: function() {
            if(settings.hideOnScroll === true || settings.hideOnScroll == 'auto' && settings.on != 'click') {
              $document
                .off('scroll' + elementNamespace, module.hide)
              ;
              $context
                .off('scroll' + elementNamespace, module.hide)
              ;
            }
            if(settings.on == 'click' && settings.closable) {
              module.verbose('Removing close event from document');
              $document
                .off('click' + elementNamespace)
              ;
            }
          }
        },

        has: {
          popup: function() {
            return ($popup && $popup.length > 0);
          }
        },

        is: {
          active: function() {
            return $module.hasClass(className.active);
          },
          animating: function() {
            return ( $popup && $popup.is(':animated') || $popup.hasClass(className.animating) );
          },
          visible: function() {
            return $popup && $popup.is(':visible');
          },
          dropdown: function() {
            return $module.hasClass(className.dropdown);
          },
          hidden: function() {
            return !module.is.visible();
          },
          rtl: function () {
            return $module.css('direction') == 'rtl';
          }
        },

        reset: function() {
          module.remove.visible();
          if(settings.preserve) {
            if($.fn.transition !== undefined) {
              $popup
                .transition('remove transition')
              ;
            }
          }
          else {
            module.removePopup();
          }
        },

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
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
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
          instance.invoke('destroy');
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

$.fn.popup.settings = {

  name         : 'Popup',

  debug        : false,
  verbose      : true,
  performance  : true,
  namespace    : 'popup',

  onCreate     : function(){},
  onRemove     : function(){},

  onShow       : function(){},
  onVisible    : function(){},
  onHide       : function(){},
  onHidden     : function(){},

  variation    : '',
  content      : false,
  html         : false,
  title        : false,

  on           : 'hover',
  closable     : true,
  hideOnScroll : 'auto',
  exclusive    : true,

  context      : 'body',

  position     : 'top left',
  prefer       : 'opposite',
  lastResort   : false,

  delay        : {
    show : 30,
    hide : 0
  },

  setFluidWidth  : true,
  movePopup      : true,

  target         : false,
  popup          : false,
  inline         : false,
  preserve       : false,
  hoverable      : false,

  duration       : 200,
  easing         : 'easeOutQuint',
  transition     : 'scale',

  distanceAway   : 0,
  offset         : 0,
  maxSearchDepth : 20,

  error: {
    invalidPosition : 'The position you specified is not a valid position',
    cannotPlace     : 'No visible position could be found for the popup',
    method          : 'The method you called is not defined.'
  },

  metadata: {
    activator : 'activator',
    content   : 'content',
    html      : 'html',
    offset    : 'offset',
    position  : 'position',
    title     : 'title',
    variation : 'variation'
  },

  className   : {
    active    : 'active',
    animating : 'animating',
    dropdown  : 'dropdown',
    fluid     : 'fluid',
    loading   : 'loading',
    popup     : 'ui popup',
    position  : 'top left center bottom right',
    visible   : 'visible'
  },

  selector    : {
    popup    : '.ui.popup'
  },

  templates: {
    escape: function(string) {
      var
        badChars     = /[&<>"'`]/g,
        shouldEscape = /[&<>"'`]/,
        escape       = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#x27;",
          "`": "&#x60;"
        },
        escapedChar  = function(chr) {
          return escape[chr];
        }
      ;
      if(shouldEscape.test(string)) {
        return string.replace(badChars, escapedChar);
      }
      return string;
    },
    popup: function(text) {
      var
        html   = '',
        escape = $.fn.popup.settings.templates.escape
      ;
      if(typeof text !== undefined) {
        if(typeof text.title !== undefined && text.title) {
          text.title = escape(text.title);
          html += '<div class="header">' + text.title + '</div>';
        }
        if(typeof text.content !== undefined && text.content) {
          text.content = escape(text.content);
          html += '<div class="content">' + text.content + '</div>';
        }
      }
      return html;
    }
  }

};

// Adds easing
$.extend( $.easing, {
  easeOutQuad: function (x, t, b, c, d) {
    return -c *(t/=d)*(t-2) + b;
  }
});


})( jQuery, window , document );
