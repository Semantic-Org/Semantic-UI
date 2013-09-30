/*
 * # Semantic - Popup
 * http://github.com/jlukic/semantic-ui/
 *
 *
 * Copyright 2013 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

$.fn.popup = function(parameters) {
  var
    $allModules     = $(this),

    settings        = ( $.isPlainObject(parameters) )
      ? $.extend(true, {}, $.fn.popup.settings, parameters)
      : $.fn.popup.settings,

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
        $module         = $(this),

        $window         = $(window),
        $offsetParent   = $module.offsetParent(),
        $popup          = (settings.inline)
          ? $module.next(settings.selector.popup)
          : $window.children(settings.selector.popup).last(),

        searchDepth     = 0,

        eventNamespace  = '.' + settings.namespace,
        moduleNamespace = settings.namespace + '-module',

        selector        = settings.selector,
        className       = settings.className,
        error           = settings.error,
        metadata        = settings.metadata,
        namespace       = settings.namespace,

        element         = this,
        instance        = $module.data(moduleNamespace),
        module
      ;

      module = {

        // binds events
        initialize: function() {
          module.debug('Initializing module', $module);
          if(settings.on == 'hover') {
            $module
              .on('mouseenter' + eventNamespace, module.event.mouseenter)
              .on('mouseleave' + eventNamespace, module.event.mouseleave)
            ;
          }
          else {
            $module
              .on(settings.on + '' + eventNamespace, module.event[settings.on])
            ;
          }
          $window
            .on('resize' + eventNamespace, module.event.resize)
          ;
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, instance)
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
          module.debug('Destroying previous module');
          $module
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        event: {
          mouseenter:  function(event) {
            var element = this;
            module.timer = setTimeout(function() {
              $.proxy(module.toggle, element)();
              if( $(element).hasClass(className.visible) ) {
                event.stopPropagation();
              }
            }, settings.delay);
          },
          mouseleave:  function() {
            clearTimeout(module.timer);
            if( $module.is(':visible') ) {
              module.hide();
            }
          },
          click: function(event) {
            $.proxy(module.toggle, this)();
            if( $(this).hasClass(className.visible) ) {
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
          module.debug('Creating pop-up html');
          var
            html      = $module.data(metadata.html)      || settings.html,
            variation = $module.data(metadata.variation) || settings.variation,
            title     = $module.data(metadata.title)     || settings.title,
            content   = $module.data(metadata.content)   || $module.attr('title') || settings.content
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
              .addClass(variation)
              .html(html)
            ;
            if(settings.inline) {
              module.verbose('Inserting popup element inline');
              $popup
                .insertAfter($module)
              ;
            }
            else {
              module.verbose('Appending popup element to body');
              $popup
                .appendTo( $('body') )
              ;
            }
            $.proxy(settings.onInit, $popup)();
          }
          else {
            module.error(error.content);
          }
        },

        remove: function() {
          module.debug('Removing popup');
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
                width    : $popup.width(),
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
          if( !$module.hasClass(className.visible) ) {
            module.hideAll();
            module.show();
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
            popupWidth   = $popup.width(),
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
            if(searchDepth < settings.maxSearchDepth) {
              position = module.get.nextPosition(position);
              searchDepth++;
              module.debug('Trying new position: ', position);
              return module.position(position);
            }
            else {
              module.error(error.recursion);
              searchDepth = 0;
              return false;
            }
          }
          else {
            module.debug('Position is on stage', position);
            searchDepth = 0;
            return true;
          }
        },

        show: function() {
          module.debug('Showing pop-up', settings.transition);
          if($popup.size() === 0) {
            module.create();
          }
          module.position();
          $module
            .addClass(className.visible)
          ;
          $popup
            .removeClass(className.loading)
          ;
          if(settings.transition && $.fn.transition !== undefined) {
            $popup
              .transition(settings.transition + ' in', settings.duration)
            ;
          }
          else {
            $popup
              .stop()
              .fadeIn(settings.duration, settings.easing)
            ;
          }
          if(settings.on == 'click' && settings.clicktoClose) {
            module.debug('Binding popup close event');
            $(document)
              .on('click.' + namespace, module.gracefully.hide)
            ;
          }
          $.proxy(settings.onShow, $popup)();
        },

        hideAll: function() {
          $(selector.popup)
            .filter(':visible')
              .popup('hide')
          ;
        },

        hide: function() {
          $module
            .removeClass(className.visible)
          ;
          if($popup.is(':visible') ) {
            module.debug('Hiding pop-up');
            if(settings.transition && $.fn.transition !== undefined) {
              $popup
                .transition(settings.transition + ' out', settings.duration)
              ;
            }
            else {
              $popup
                .stop()
                .fadeOut(settings.duration, settings.easing)
              ;
            }
          }
          if(settings.on == 'click' && settings.clicktoClose) {
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

  return (invokedResponse !== undefined)
    ? invokedResponse
    : this
  ;
};

$.fn.popup.settings = {

  name           : 'Popup',
  debug          : true,
  verbose        : true,
  performance    : true,
  namespace      : 'popup',

  onInit         : function(){},
  onShow         : function(){},
  onHide         : function(){},

  variation      : '',
  content        : false,
  html           : false,
  title          : false,

  on             : 'hover',
  clicktoClose   : true,

  position       : 'top center',
  delay          : 150,
  inline         : true,

  duration       : 150,
  easing         : 'easeOutQuint',
  transition     : 'scale',

  distanceAway   : 0,
  arrowOffset    : 0,
  maxSearchDepth : 10,

  error: {
    content   : 'Your popup has no content specified',
    method    : 'The method you called is not defined.',
    recursion : 'Popup attempted to reposition element to fit, but could not find an adequate position.'
  },

  metadata: {
    arrowOffset : 'arrowOffset',
    content     : 'content',
    html        : 'html',
    position    : 'position',
    title       : 'title',
    variation   : 'variation'
  },

  className   : {
    popup       : 'ui popup',
    visible     : 'visible',
    loading     : 'loading'
  },

  selector    : {
    popup    : '.ui.popup'
  },

  template: function(text) {
    var html = '';
    if(typeof text !== undefined) {
      if(typeof text.title !== undefined && text.title) {
        html += '<div class="header">' + text.title + '</div class="header">';
      }
      if(typeof text.content !== undefined && text.content) {
        html += '<div class="content">' + text.content + '</div>';
      }
    }
    return html;
  }

};

})( jQuery, window , document );
