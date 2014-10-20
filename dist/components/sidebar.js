/*
 * # Semantic - Sidebar
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

"use strict";

$.fn.sidebar = function(parameters) {
  var
    $allModules    = $(this),
    $head          = $('head'),

    moduleSelector = $allModules.selector || '',

    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),

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
        settings        = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.sidebar.settings, parameters)
          : $.extend({}, $.fn.sidebar.settings),

        selector        = settings.selector,
        className       = settings.className,
        namespace       = settings.namespace,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        $module         = $(this),
        $context        = $(settings.context),
        $style          = $('style[title=' + namespace + ']'),

        $sidebars       = $context.children(selector.sidebar),
        $pusher         = $context.children(selector.pusher),
        $page           = $pusher.children(selector.page),
        $fixed          = $pusher.find(selector.fixed),

        element         = this,
        instance        = $module.data(moduleNamespace),

        currentScroll,
        transitionEnd,

        module
      ;

      module      = {

        initialize: function() {
          module.debug('Initializing sidebar', $module);

          transitionEnd = module.get.transitionEvent();

          // cache on initialize
          if( module.is.legacy() ) {
            settings.useLegacy = true;
          }

          module.setup.context();

          // avoid locking rendering to change layout if included in onReady
          requestAnimationFrame(module.setup.layout);

          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module for', $module);
          $module
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        event: {
          clickaway: function(event) {
            if( $module.find(event.target).size() === 0 && $(event.target).filter($module).size() === 0 ) {
              module.verbose('User clicked on dimmed page');
              module.hide();
            }
          },
          scroll: function(event) {
            if( $module.find(event.target).size() === 0 && $(event.target).filter($module).size() === 0 ) {
              event.preventDefault();
            }
          }
        },

        bind: {
          clickaway: function() {
            if(settings.scrollLock) {
              $(window)
                .on('DOMMouseScroll' + eventNamespace, module.event.scroll)
              ;
            }
            $context
              .on('click' + eventNamespace, module.event.clickaway)
              .on('touchend' + eventNamespace, module.event.clickaway)
            ;
          }
        },
        unbind: {
          clickaway: function() {
            $context
              .off(eventNamespace)
            ;
            if(settings.scrollLock) {
              $(window).off('DOMMouseScroll' + eventNamespace);
            }
          }
        },

        refresh: function() {
          module.verbose('Refreshing selector cache');
          $context  = $(settings.context);
          $style    = $('style[title=' + namespace + ']');
          $sidebars = $context.children(selector.sidebar);
          $pusher   = $context.children(selector.pusher);
          $page     = $pusher.children(selector.page);
          $fixed    = $pusher.find(selector.fixed);
        },

        repaint: function() {
          module.verbose('Forcing repaint event');
          var fakeAssignment = $context[0].offsetWidth;
        },

        setup: {
          layout: function() {
            if( $context.find(selector.pusher).size() === 0 ) {
              module.debug('Adding wrapper element for sidebar');
              $pusher = $('<div class="pusher" />');
              $page   = $('<div class="page" />');
              $pusher.append($page);
              $context
                .children()
                  .not(selector.omitted)
                  .not($sidebars)
                  .wrapAll($pusher)
              ;
            }
            if($module.prevAll($page)[0] !== $page[0]) {
              module.debug('Moved sidebar to correct parent element');
              $module.detach().prependTo($context);
            }
            module.refresh();
          },
          context: function() {
            module.verbose('Adding pusshable class to wrapper');
            $context.addClass(className.pushable);
          }
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
            module.debug('Attaching sidebar events to element', selector, event);
            $toggle
              .on('click' + eventNamespace, event)
            ;
          }
          else {
            module.error(error.notFound, selector);
          }
        },

        show: function(callback) {
          var
            animateMethod = (settings.useLegacy)
              ? module.legacyPushPage
              : module.pushPage
          ;
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          if(module.is.closed() || module.is.outward()) {
            if(settings.overlay)  {
              module.error(error.overlay);
              settings.transition = 'overlay';
            }
            if(settings.transition !== 'overlay') {
              module.hideAll();
            }
            animateMethod(function() {
              $.proxy(callback, element)();
              $.proxy(settings.onShow, element)();
            });
            $.proxy(settings.onChange, element)();
            $.proxy(settings.onVisible, element)();
          }
          else {
            module.debug('Sidebar is already visible');
          }
        },

        hide: function(callback) {
          var
            animateMethod = (settings.useLegacy)
              ? module.legacyPullPage
              : module.pullPage
          ;
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          if(module.is.visible() || module.is.inward()) {
            module.debug('Hiding sidebar', callback);
            animateMethod(function() {
              $.proxy(callback, element)();
              $.proxy(settings.onHidden, element)();
            });
            $.proxy(settings.onChange, element)();
            $.proxy(settings.onHide, element)();
          }
        },

        hideAll: function() {
          var
            $visibleSidebars = $sidebars.find('.' + className.visible)
          ;
          $visibleSidebars
            .sidebar('hide')
          ;
        },

        toggle: function() {
          module.verbose('Determining toggled direction');
          if(module.is.closed() || module.is.outward()) {
            module.show();
          }
          else {
            module.hide();
          }
        },

        pushPage: function(callback) {
          var
            transition = module.get.transition(),
            $transition = (transition == 'safe')
              ? $context
              : (transition == 'overlay')
                ? $module
                : $pusher,
            animate
          ;
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          animate = function() {
            module.remove.outward();
            module.set.visible();
            module.set.transition();
            module.set.direction();
            requestAnimationFrame(function() {
              module.set.inward();
              module.set.pushed();
            });
          };
          $transition
            .off(transitionEnd + eventNamespace)
            .on(transitionEnd + eventNamespace, function(event) {
              if( event.target == $transition[0] ) {
                $transition.off(transitionEnd + eventNamespace);
                module.remove.inward();
                module.bind.clickaway();
                module.set.active();
                $.proxy(callback, element)();
              }
            })
          ;
          module.verbose('Adding context push state', $context);
          if(transition === 'overlay') {
            requestAnimationFrame(animate);
          }
          else {
            if(settings.transition == 'scale down' || module.is.mobile()) {
              $module.scrollTop(0);
              currentScroll = $(window).scrollTop();
              window.scrollTo(0, 0);
            }
            module.remove.allVisible();
            requestAnimationFrame(animate);
          }
        },

        pullPage: function(callback) {
          var
            transition = module.get.transition(),
            $transition = (transition == 'safe')
              ? $context
              : (transition == 'overlay')
                ? $module
                : $pusher
          ;
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          module.verbose('Removing context push state', module.get.direction());
          module.unbind.clickaway();

          $transition
            .off(transitionEnd + eventNamespace)
            .on(transitionEnd + eventNamespace, function(event) {
              if( event.target == $transition[0] ) {
                $transition.off(transitionEnd + eventNamespace);
                module.remove.transition();
                module.remove.direction();
                module.remove.outward();
                module.remove.visible();
                if(transition == 'scale down' || (settings.returnScroll && transition !== 'overlay' && module.is.mobile()) ) {
                  window.scrollTo(0, currentScroll);
                }
                $.proxy(callback, element)();
              }
            })
          ;
          requestAnimationFrame(function() {
            module.remove.inward();
            module.set.outward();
            module.remove.active();
            module.remove.pushed();
          });
        },

        legacyPushPage: function(callback) {
          var
            distance   = $module.width(),
            direction  = module.get.direction(),
            properties = {}
          ;
          distance  = distance || $module.width();
          callback  = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          properties[direction] = distance;
          module.debug('Using javascript to push context', properties);
          module.set.visible();
          module.set.transition();
          module.set.direction();
          module.set.inward();
          module.set.pushed();
          $context
            .animate(properties, settings.duration, settings.easing, function() {
              module.remove.inward();
              module.bind.clickaway();
              module.set.active();
              $.proxy(callback, module)();
            })
          ;
        },
        legacyPullPage: function(callback) {
          var
            distance   = 0,
            direction  = module.get.direction(),
            properties = {}
          ;
          distance  = distance || $module.width();
          callback  = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          properties[direction] = '0px';
          module.debug('Using javascript to pull context', properties);
          module.unbind.clickaway();
          module.set.outward();
          module.remove.active();
          module.remove.pushed();
          $context
            .animate(properties, settings.duration, settings.easing, function() {
              module.remove.transition();
              module.remove.direction();
              module.remove.outward();
              module.remove.visible();
              $.proxy(callback, module)();
            })
          ;
        },

        set: {
          active: function() {
            $context.addClass(className.active);
          },
          direction: function(direction) {
            direction = direction || module.get.direction();
            $context.addClass(className[direction]);
          },
          visible: function() {
            $module.addClass(className.visible);
          },
          transition: function(transition) {
            transition = transition || module.get.transition();
            $context.addClass(transition);
          },
          inward: function() {
            $context.addClass(className.inward);
          },
          outward: function() {
            $context.addClass(className.outward);
          },
          pushed: function() {
            if(settings.dimPage) {
              $page.addClass(className.dimmed);
            }
            $context.addClass(className.pushed);
          }
        },
        remove: {
          active: function() {
            $context.removeClass(className.active);
          },
          visible: function() {
            $module.removeClass(className.visible);
          },
          allVisible: function() {
            if($sidebars.hasClass(className.visible)) {
              module.debug('Other sidebars visible, hiding');
              $sidebars.removeClass(className.visible);
            }
          },
          transition: function(transition) {
            transition = transition || module.get.transition();
            $context.removeClass(transition);
          },
          pushed: function() {
            if(settings.dimPage) {
              $page.removeClass(className.dimmed);
            }
            $context.removeClass(className.pushed);
          },
          inward: function() {
            $context.removeClass(className.inward);
          },
          outward: function() {
            $context.removeClass(className.outward);
          },
          direction: function(direction) {
            direction = direction || module.get.direction();
            $context.removeClass(className[direction]);
          }
        },

        get: {
          direction: function() {
            if($module.hasClass(className.top)) {
              return className.top;
            }
            else if($module.hasClass(className.right)) {
              return className.right;
            }
            else if($module.hasClass(className.bottom)) {
              return className.bottom;
            }
            return className.left;
          },
          transition: function() {
            var
              direction = module.get.direction(),
              transition
            ;
            return ( module.is.mobile() )
              ? (settings.mobileTransition == 'auto')
                ? settings.defaultTransition.mobile[direction]
                : settings.mobileTransition
              : (settings.transition == 'auto')
                ? settings.defaultTransition.computer[direction]
                : settings.transition
            ;
          },
          transitionEvent: function() {
            var
              element     = document.createElement('element'),
              transitions = {
                'transition'       :'transitionend',
                'OTransition'      :'oTransitionEnd',
                'MozTransition'    :'transitionend',
                'WebkitTransition' :'webkitTransitionEnd'
              },
              transition
            ;
            for(transition in transitions){
              if( element.style[transition] !== undefined ){
                return transitions[transition];
              }
            }
          }
        },

        is: {
          legacy: function() {
            var
              element    = document.createElement('div'),
              transforms = {
                'webkitTransform' :'-webkit-transform',
                'OTransform'      :'-o-transform',
                'msTransform'     :'-ms-transform',
                'MozTransform'    :'-moz-transform',
                'transform'       :'transform'
              },
              has3D
            ;

            // Add it to the body to get the computed style.
            document.body.insertBefore(element, null);
            for (var transform in transforms) {
              if (element.style[transform] !== undefined) {
                element.style[transform] = "translate3d(1px,1px,1px)";
                has3D = window.getComputedStyle(element).getPropertyValue(transforms[transform]);
              }
            }
            document.body.removeChild(element);
            return !(has3D !== undefined && has3D.length > 0 && has3D !== 'none');
          },
          mobile: function() {
            var
              userAgent    = navigator.userAgent,
              mobileRegExp = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/,
              isMobile     = mobileRegExp.test(userAgent)
            ;
            if(isMobile) {
              module.verbose('Browser was found to be mobile', userAgent);
              return true;
            }
            else {
              module.verbose('Browser is not mobile, using regular transition', userAgent);
              return false;
            }
          },
          closed: function() {
            return !module.is.visible();
          },
          visible: function() {
            return $module.hasClass(className.visible);
          },
          vertical: function() {
            return $module.hasClass(className.top);
          },
          inward: function() {
            return $context.hasClass(className.inward);
          },
          outward: function() {
            return $context.hasClass(className.outward);
          },
          animating: function() {
            return module.is.inward() || module.is.outward();
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
      }
    ;

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
  });

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.sidebar.settings = {

  name              : 'Sidebar',
  namespace         : 'sidebar',

  debug             : false,
  verbose           : false,
  performance       : false,

  workaround        : false,
  transition        : 'auto',
  mobileTransition  : 'auto',

  defaultTransition : {
    computer: {
      left   : 'uncover',
      right  : 'uncover',
      top    : 'overlay',
      bottom : 'overlay'
    },
    mobile: {
      left   : 'uncover',
      right  : 'uncover',
      top    : 'overlay',
      bottom : 'overlay'
    }
  },

  context           : 'body',
  exclusive         : true,

  dimPage           : true,
  scrollLock        : false,
  returnScroll      : true,

  useLegacy         : false,
  duration          : 500,
  easing            : 'easeInOutQuint',

  onChange          : function(){},
  onShow            : function(){},
  onHide            : function(){},

  onHidden          : function(){},
  onVisible         : function(){},

  className         : {
    active   : 'active',
    bottom   : 'bottom',
    dimmed   : 'dimmed',
    inward   : 'show',
    left     : 'left',
    outward  : 'hide',
    pushable : 'pushable',
    pushed   : 'pushed',
    right    : 'right',
    top      : 'top',
    visible  : 'visible'
  },

  selector: {
    fixed   : '.ui.fixed',
    omitted : 'script, link, style, .ui.modal, .ui.dimmer, .ui.nag, .ui.fixed',
    page    : '.page',
    pusher  : '.pusher',
    sidebar : '.ui.sidebar'
  },

  error   : {
    method   : 'The method you called is not defined.',
    overlay  : 'The overlay setting is no longer supported, use animation: overlay',
    notFound : 'There were no elements that matched the specified selector'
  }

};

// Adds easing
$.extend( $.easing, {
  easeInOutQuint: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
    return c/2*((t-=2)*t*t*t*t + 2) + b;
  }
});


})( jQuery, window , document );
