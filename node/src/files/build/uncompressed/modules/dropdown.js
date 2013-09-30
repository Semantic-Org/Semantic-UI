/*
 * # Semantic - Dropdown
 * http://github.com/jlukic/semantic-ui/
 *
 *
 * Copyright 2013 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

$.fn.dropdown = function(parameters) {
  var
    $allModules = $(this),
    $document   = $(document),

    settings    = ( $.isPlainObject(parameters) )
      ? $.extend(true, {}, $.fn.dropdown.settings, parameters)
      : $.fn.dropdown.settings,

    className         = settings.className,
    metadata          = settings.metadata,
    namespace         = settings.namespace,
    selector          = settings.selector,
    error             = settings.error,

    eventNamespace    = '.' + namespace,
    dropdownNamespace = 'module-' + namespace,
    dropdownSelector  = $allModules.selector || '',

    time              = new Date().getTime(),
    performance       = [],

    query             = arguments[0],
    methodInvoked     = (typeof query == 'string'),
    queryArguments    = [].slice.call(arguments, 1),
    invokedResponse
  ;

  $allModules
    .each(function() {
      var
        $module       = $(this),
        $item         = $module.find(selector.item),
        $text         = $module.find(selector.text),
        $input        = $module.find(selector.input),

        $menu         = $module.children(selector.menu),

        isTouchDevice = ('ontouchstart' in document.documentElement),

        element       = this,
        instance      = $module.data(dropdownNamespace),
        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing dropdown', settings);
          if(isTouchDevice) {
            $module
              .on('touchstart' + eventNamespace, module.event.test.toggle)
            ;
          }
          else if(settings.on == 'click') {
            $module
              .on('click' + eventNamespace, module.event.test.toggle)
            ;
          }
          else if(settings.on == 'hover') {
            $module
              .on('mouseenter' + eventNamespace, module.delay.show)
              .on('mouseleave' + eventNamespace, module.delay.hide)
            ;
          }
          else {
            $module
              .on(settings.on + eventNamespace, module.toggle)
            ;
          }
          if(settings.action == 'updateForm') {
            module.set.selected();
          }
          $item
            .on('mouseenter' + eventNamespace, module.event.item.mouseenter)
            .on('mouseleave' + eventNamespace, module.event.item.mouseleave)
            .on(module.get.selectEvent() + eventNamespace, module.event.item.click)
          ;
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of dropdown', module);
          $module
            .data(dropdownNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous dropdown for', $module);
          $item
            .off(eventNamespace)
          ;
          $module
            .off(eventNamespace)
            .removeData(dropdownNamespace)
          ;
        },

        event: {

          stopPropagation: function(event) {
            event.stopPropagation();
          },

          test: {
            toggle: function(event) {
              module.determine.intent(event, module.toggle);
              event.stopImmediatePropagation();
            },
            hide: function(event) {
              module.determine.intent(event, module.hide);
              event.stopPropagation();
            }
          },

          item: {

            mouseenter: function(event) {
              var
                $currentMenu = $(this).find(selector.menu),
                $otherMenus  = $(this).siblings(selector.item).children(selector.menu)
              ;
              if( $currentMenu.size() > 0 ) {
                clearTimeout(module.itemTimer);
                module.itemTimer = setTimeout(function() {
                  module.animate.hide(false, $otherMenus);
                  module.verbose('Showing sub-menu', $currentMenu);
                  module.animate.show(false,  $currentMenu);
                }, settings.delay.show * 2);
              }
            },

            mouseleave: function(event) {
              var
                $currentMenu = $(this).find(selector.menu)
              ;
              if($currentMenu.size() > 0) {
                clearTimeout(module.itemTimer);
                module.itemTimer = setTimeout(function() {
                  module.verbose('Hiding sub-menu', $currentMenu);
                  module.animate.hide(false,  $currentMenu);
                }, settings.delay.hide);
              }
            },

            click: function (event) {
              var
                $choice = $(this),
                text    = $choice.data(metadata.text)  || $choice.text(),
                value   = $choice.data(metadata.value) || text.toLowerCase()
              ;
              if( $choice.find(selector.menu).size() === 0 ) {
                module.verbose('Adding active state to selected item');
                $item
                  .removeClass(className.active)
                ;
                $choice
                  .addClass(className.active)
                ;
                module.determine.selectAction(text, value);
                $.proxy(settings.onChange, element)(value, text);
                event.stopPropagation();
              }
            }

          },

          resetStyle: function() {
            $(this).removeAttr('style');
          }

        },

        determine: {
          selectAction: function(text, value) {
            module.verbose('Determining action', settings.action);
            if( $.isFunction( module[settings.action] ) ) {
              module.verbose('Triggering preset action', settings.action);
              module[ settings.action ](text, value);
            }
            else if( $.isFunction(settings.action) ) {
              module.verbose('Triggering user action', settings.action);
              settings.action(text, value);
            }
            else {
              module.error(error.action);
            }
          },
          intent: function(event, callback) {
            module.debug('Determining whether event occurred in dropdown', event.target);
            callback = callback || function(){};
            if( $(event.target).closest($menu).size() === 0 ) {
              module.verbose('Triggering event', callback);
              callback();
            }
            else {
              module.verbose('Event occurred in dropdown, canceling callback');
            }
          }
        },

        bind: {
          intent: function() {
            module.verbose('Binding hide intent event to document');
            $document
              .on(module.get.selectEvent(), module.event.test.hide)
            ;
          }
        },

        unbind: {
          intent: function() {
            module.verbose('Removing hide intent event from document');
            $document
              .off(module.get.selectEvent())
            ;
          }
        },

        nothing: function() {},

        changeText: function(text, value) {
          module.set.text(text);
          module.hide();
        },

        updateForm: function(text, value) {
          module.set.text(text);
          module.set.value(value);
          module.hide();
        },

        get: {
          selectEvent: function() {
            return (isTouchDevice)
              ? 'touchstart'
              : 'click'
            ;
          },
          text: function() {
            return $text.text();
          },
          value: function() {
            return $input.val();
          },
          item: function(value) {
            var
              $selectedItem
            ;
            value = value || $input.val();
            $item
              .each(function() {
                if( $(this).data(metadata.value) == value ) {
                  $selectedItem = $(this);
                }
              })
            ;
            return $selectedItem || false;
          }
        },

        set: {
          text: function(text) {
            module.debug('Changing text', text, $text);
            $text.removeClass(className.placeholder);
            $text.text(text);
          },
          value: function(value) {
            module.debug('Adding selected value to hidden input', value, $input);
            $input.val(value);
          },
          active: function() {
            $module.addClass(className.active);
          },
          visible: function() {
            $module.addClass(className.visible);
          },
          selected: function(value) {
            var
              $selectedItem = module.get.item(value),
              selectedText
            ;
            if($selectedItem) {
              module.debug('Setting selected menu item to', $selectedItem);
              selectedText = $selectedItem.data(metadata.text) || $selectedItem.text();
              $item
                .removeClass(className.active)
              ;
              $selectedItem
                .addClass(className.active)
              ;
              module.set.text(selectedText);
            }
          }
        },

        remove: {
          active: function() {
            $module.removeClass(className.active);
          },
          visible: function() {
            $module.removeClass(className.visible);
          }
        },

        is: {
          visible: function($subMenu) {
            return ($subMenu)
              ? $subMenu.is(':animated, :visible')
              : $menu.is(':animated, :visible')
            ;
          },
          hidden: function($subMenu) {
            return ($subMenu)
              ? $subMenu.is(':not(:animated, :visible)')
              : $menu.is(':not(:animated, :visible)')
            ;
          }
        },

        can: {
          click: function() {
            return (isTouchDevice || settings.on == 'click');
          },
          show: function() {
            return !$module.hasClass(className.disabled);
          }
        },

        animate: {
          show: function(callback, $subMenu) {
            var
              $currentMenu = $subMenu || $menu
            ;
            callback = callback || function(){};
            if( module.is.hidden($currentMenu) ) {
              module.verbose('Doing menu show animation', $currentMenu);
              if(settings.transition == 'none') {
                callback();
              }
              else if($.fn.transition !== undefined) {
                $currentMenu.transition({
                  animation : settings.transition + ' in',
                  duration  : settings.duration,
                  complete  : callback,
                  queue     : false
                });
              }
              else if(settings.transition == 'slide down') {
                $currentMenu
                  .hide()
                  .clearQueue()
                  .children()
                    .clearQueue()
                    .css('opacity', 0)
                    .delay(50)
                    .animate({
                      opacity : 1
                    }, settings.duration, 'easeOutQuad', module.event.resetStyle)
                    .end()
                  .slideDown(100, 'easeOutQuad', function() {
                    $.proxy(module.event.resetStyle, this)();
                    callback();
                  })
                ;
              }
              else if(settings.transition == 'fade') {
                $currentMenu
                  .hide()
                  .clearQueue()
                  .fadeIn(settings.duration, function() {
                    $.proxy(module.event.resetStyle, this)();
                    callback();
                  })
                ;
              }
              else {
                module.error(error.transition);
              }
            }
          },
          hide: function(callback, $subMenu) {
            var
              $currentMenu = $subMenu || $menu
            ;
            callback = callback || function(){};
            if(module.is.visible($currentMenu) ) {
              module.verbose('Doing menu hide animation', $currentMenu);
              if($.fn.transition !== undefined) {
                $currentMenu.transition({
                  animation : settings.transition + ' out',
                  duration  : settings.duration,
                  complete  : callback,
                  queue     : false
                });
              }
              else if(settings.transition == 'none') {
                callback();
              }
              else if(settings.transition == 'slide down') {
                $currentMenu
                  .show()
                  .clearQueue()
                  .children()
                    .clearQueue()
                    .css('opacity', 1)
                    .animate({
                      opacity : 0
                    }, 100, 'easeOutQuad', module.event.resetStyle)
                    .end()
                  .delay(50)
                  .slideUp(100, 'easeOutQuad', function() {
                    $.proxy(module.event.resetStyle, this)();
                    callback();
                  })
                ;
              }
              else if(settings.transition == 'fade') {
                $currentMenu
                  .show()
                  .clearQueue()
                  .fadeOut(150, function() {
                    $.proxy(module.event.resetStyle, this)();
                    callback();
                  })
                ;
              }
              else {
                module.error(error.transition);
              }
            }
          }
        },

        show: function() {
          module.debug('Checking if dropdown can show');
          if( module.is.hidden() ) {
            module.hideOthers();
            module.set.active();
            module.animate.show(module.set.visible);
            if( module.can.click() ) {
              module.bind.intent();
            }
            $.proxy(settings.onShow, element)();
          }
        },

        hide: function() {
          if( module.is.visible() ) {
            module.debug('Hiding dropdown');
            if( module.can.click() ) {
              module.unbind.intent();
            }
            module.remove.active();
            module.animate.hide(module.remove.visible);
            $.proxy(settings.onHide, element)();
          }
        },

        delay: {
          show: function() {
            module.verbose('Delaying show event to ensure user intent');
            clearTimeout(module.timer);
            module.timer = setTimeout(module.show, settings.delay.show);
          },
          hide: function() {
            module.verbose('Delaying hide event to ensure user intent');
            clearTimeout(module.timer);
            module.timer = setTimeout(module.hide, settings.delay.hide);
          }
        },

        hideOthers: function() {
          module.verbose('Finding other dropdowns to hide');
          $allModules
            .not($module)
              .has(selector.menu + ':visible')
              .dropdown('hide')
          ;
        },

        toggle: function() {
          module.verbose('Toggling menu visibility');
          if( module.is.hidden() ) {
            module.show();
          }
          else {
            module.hide();
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
            if(dropdownSelector) {
              title += ' \'' + dropdownSelector + '\'';
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
            found
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && instance !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              if( $.isPlainObject( instance[value] ) && (depth != maxDepth) ) {
                instance = instance[value];
              }
              else if( instance[value] !== undefined ) {
                found = instance[value];
              }
              else {
                module.error(error.method);
              }
            });
          }
          if ( $.isFunction( found ) ) {
            return found.apply(context, passedArguments);
          }
          return found || false;
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

  return (invokedResponse)
    ? invokedResponse
    : this
  ;
};

$.fn.dropdown.settings = {

  name        : 'Dropdown',
  namespace   : 'dropdown',

  verbose     : true,
  debug       : true,
  performance : true,

  on          : 'click',
  action      : 'hide',

  delay: {
    show: 200,
    hide: 300
  },

  transition : 'slide down',
  duration   : 250,

  onChange : function(){},
  onShow   : function(){},
  onHide   : function(){},

  error   : {
    action    : 'You called a dropdown action that was not defined',
    method    : 'The method you called is not defined.',
    transition : 'The requested transition was not found'
  },

  metadata: {
    text  : 'text',
    value : 'value'
  },

  selector : {
    menu  : '.menu',
    item  : '.menu > .item',
    text  : '> .text',
    input : '> input[type="hidden"]'
  },

  className : {
    active      : 'active',
    placeholder : 'default',
    disabled    : 'disabled',
    visible     : 'visible'
  }

};

})( jQuery, window , document );