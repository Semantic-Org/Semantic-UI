/*
 * # Semantic - Dropdown
 * http://github.com/jlukic/semantic-ui/
 *
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
;(function ( $, window, document, undefined ) {

module.exports = function(parameters) {
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
        settings          = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, module.exports.settings, parameters)
          : $.extend({}, module.exports.settings),

        className       = settings.className,
        metadata        = settings.metadata,
        namespace       = settings.namespace,
        selector        = settings.selector,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        $module         = $(this),
        $item           = $module.find(selector.item),
        $text           = $module.find(selector.text),
        $input          = $module.find(selector.input),

        $menu           = $module.children(selector.menu),


        element         = this,
        instance        = $module.data(moduleNamespace),
        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing dropdown', settings);

          module.save.defaults();
          module.set.selected();

          if(hasTouch) {
            module.bind.touchEvents();
          }
          module.bind.mouseEvents();
          module.bind.keyboardEvents();
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of dropdown', module);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous dropdown for', $module);
          $item
            .off(eventNamespace)
          ;
          $module
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        bind: {
          keyboardEvents: function() {
            module.debug('Binding keyboard events');
            $module
              .on('keydown' + eventNamespace, module.handleKeyboard)
            ;
            $module
              .on('focus' + eventNamespace, module.show)
            ;
          },
          touchEvents: function() {
            module.debug('Touch device detected binding touch events');
            $module
              .on('touchstart' + eventNamespace, module.event.test.toggle)
            ;
            $item
              .on('touchstart' + eventNamespace, module.event.item.mouseenter)
              .on('touchstart' + eventNamespace, module.event.item.click)
            ;
          },
          mouseEvents: function() {
            module.verbose('Mouse detected binding mouse events');
            if(settings.on == 'click') {
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
            $item
              .on('mouseenter' + eventNamespace, module.event.item.mouseenter)
              .on('mouseleave' + eventNamespace, module.event.item.mouseleave)
              .on('click'      + eventNamespace, module.event.item.click)
            ;
          },
          intent: function() {
            module.verbose('Binding hide intent event to document');
            if(hasTouch) {
              $document
                .on('touchstart' + eventNamespace, module.event.test.touch)
                .on('touchmove'  + eventNamespace, module.event.test.touch)
              ;
            }
            $document
              .on('click' + eventNamespace, module.event.test.hide)
            ;
          }
        },

        unbind: {
          intent: function() {
            module.verbose('Removing hide intent event from document');
            if(hasTouch) {
              $document
                .off('touchstart' + eventNamespace)
                .off('touchmove' + eventNamespace)
              ;
            }
            $document
              .off('click' + eventNamespace)
            ;
          }
        },

        handleKeyboard: function(event) {
          var
            $selectedItem = $item.filter('.' + className.selected),
            pressedKey    = event.which,
            keys          = {
              enter     : 13,
              escape    : 27,
              upArrow   : 38,
              downArrow : 40
            },
            selectedClass   = className.selected,
            currentIndex    = $item.index( $selectedItem ),
            hasSelectedItem = ($selectedItem.size() > 0),
            resultSize      = $item.size(),
            newIndex
          ;
          // close shortcuts
          if(pressedKey == keys.escape) {
            module.verbose('Escape key pressed, closing dropdown');
            module.hide();
          }
          // result shortcuts
          if(module.is.visible()) {
            if(pressedKey == keys.enter && hasSelectedItem) {
              module.verbose('Enter key pressed, choosing selected item');
              $.proxy(module.event.item.click, $item.filter('.' + selectedClass) )(event);
              event.preventDefault();
              return false;
            }
            else if(pressedKey == keys.upArrow) {
              module.verbose('Up key pressed, changing active item');
              newIndex = (currentIndex - 1 < 0)
                ? currentIndex
                : currentIndex - 1
              ;
              $item
                .removeClass(selectedClass)
                .eq(newIndex)
                  .addClass(selectedClass)
              ;
              event.preventDefault();
            }
            else if(pressedKey == keys.downArrow) {
              module.verbose('Down key pressed, changing active item');
              newIndex = (currentIndex + 1 >= resultSize)
                ? currentIndex
                : currentIndex + 1
              ;
              $item
                .removeClass(selectedClass)
                .eq(newIndex)
                  .addClass(selectedClass)
              ;
              event.preventDefault();
            }
          }
          else {
            if(pressedKey == keys.enter) {
              module.show();
            }
          }
        },

        event: {
          test: {
            toggle: function(event) {
              if( module.determine.intent(event, module.toggle) ) {
                event.preventDefault();
              }
            },
            touch: function(event) {
              module.determine.intent(event, function() {
                if(event.type == 'touchstart') {
                  module.timer = setTimeout(module.hide, settings.delay.touch);
                }
                else if(event.type == 'touchmove') {
                  clearTimeout(module.timer);
                }
              });
              event.stopPropagation();
            },
            hide: function(event) {
              module.determine.intent(event, module.hide);
            }
          },

          item: {

            mouseenter: function(event) {
              var
                $currentMenu = $(this).find(selector.submenu),
                $otherMenus  = $(this).siblings(selector.item).children(selector.menu)
              ;
              if($currentMenu.length > 0  || $otherMenus.length > 0) {
                clearTimeout(module.itemTimer);
                  module.itemTimer = setTimeout(function() {
                  if($otherMenus.length > 0) {
                    module.animate.hide(false, $otherMenus.filter(':visible'));
                  }
                  if($currentMenu.length > 0) {
                    module.verbose('Showing sub-menu', $currentMenu);
                    module.animate.show(false, $currentMenu);
                  }
                }, settings.delay.show * 2);
                event.preventDefault();
                event.stopPropagation();
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
                text    = ( $choice.data(metadata.text) !== undefined )
                  ? $choice.data(metadata.text)
                  : $choice.text(),
                value   = ( $choice.data(metadata.value) !== undefined)
                  ? $choice.data(metadata.value)
                  : (typeof text === 'string')
                      ? text.toLowerCase()
                      : text,
                callback = function() {
                  module.determine.selectAction(text, value);
                  $.proxy(settings.onChange, element)(value, text);
                }
              ;
              if( $choice.find(selector.menu).size() === 0 ) {
                if(event.type == 'touchstart') {
                  $choice.one('click', callback);
                }
                else {
                  callback();
                }
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
            if( $.isFunction( module.action[settings.action] ) ) {
              module.verbose('Triggering preset action', settings.action, text, value);
              module.action[ settings.action ](text, value);
            }
            else if( $.isFunction(settings.action) ) {
              module.verbose('Triggering user action', settings.action, text, value);
              settings.action(text, value);
            }
            else {
              module.error(error.action, settings.action);
            }
          },
          intent: function(event, callback) {
            module.debug('Determining whether event occurred in dropdown', event.target);
            callback = callback || function(){};
            if( $(event.target).closest($menu).size() === 0 ) {
              module.verbose('Triggering event', callback);
              callback();
              return true;
            }
            else {
              module.verbose('Event occurred in dropdown, canceling callback');
              return false;
            }
          }
        },

        action: {

          nothing: function() {},

          hide: function() {
            module.hide();
          },

          activate: function(text, value) {
            value = (value !== undefined)
              ? value
              : text
            ;
            module.set.selected(value);
            module.set.value(value);
            module.hide();
          },

          /* Deprecated */
          auto: function(text, value) {
            value = (value !== undefined)
              ? value
              : text
            ;
            module.set.selected(value);
            module.set.value(value);
            module.hide();
          },

          /* Deprecated */
          changeText: function(text, value) {
            value = (value !== undefined)
              ? value
              : text
            ;
            module.set.selected(value);
            module.hide();
          },

          /* Deprecated */
          updateForm: function(text, value) {
            value = (value !== undefined)
              ? value
              : text
            ;
            module.set.selected(value);
            module.set.value(value);
            module.hide();
          }

        },

        get: {
          text: function() {
            return $text.text();
          },
          value: function() {
            return ($input.size() > 0)
              ? $input.val()
              : $module.data(metadata.value)
            ;
          },
          item: function(value, strict) {
            var
              $selectedItem = false
            ;
            value = (value !== undefined)
              ? value
              : ( module.get.value() !== undefined)
                ? module.get.value()
                : module.get.text()
            ;
            if(strict === undefined && value === '') {
              module.debug('Ambiguous dropdown value using strict type check', value);
              strict = true;
            }
            else {
              strict = strict || false;
            }
            if(value !== undefined) {
              $item
                .each(function() {
                  var
                    $choice       = $(this),
                    optionText    = ( $choice.data(metadata.text) !== undefined )
                      ? $choice.data(metadata.text)
                      : $choice.text(),
                    optionValue   = ( $choice.data(metadata.value) !== undefined )
                      ? $choice.data(metadata.value)
                      : (typeof optionText === 'string')
                        ? optionText.toLowerCase()
                        : optionText
                  ;
                  if(strict) {
                    if( optionValue === value ) {
                      $selectedItem = $(this);
                    }
                    else if( !$selectedItem && optionText === value ) {
                      $selectedItem = $(this);
                    }
                  }
                  else {
                    if( optionValue == value ) {
                      $selectedItem = $(this);
                    }
                    else if( !$selectedItem && optionText == value ) {
                      $selectedItem = $(this);
                    }
                  }
                })
              ;
            }
            else {
              value = module.get.text();
            }
            return $selectedItem || false;
          }
        },

        restore: {
          defaults: function() {
            module.restore.defaultText();
            module.restore.defaultValue();
          },
          defaultText: function() {
            var
              defaultText = $module.data(metadata.defaultText)
            ;
            module.debug('Restoring default text', defaultText);
            module.set.text(defaultText);
          },
          defaultValue: function() {
            var
              defaultValue = $module.data(metadata.defaultValue)
            ;
            if(defaultValue !== undefined) {
              module.debug('Restoring default value', defaultValue);
              module.set.selected(defaultValue);
              module.set.value(defaultValue);
            }
          }
        },

        save: {
          defaults: function() {
            module.save.defaultText();
            module.save.defaultValue();
          },
          defaultValue: function() {
            $module.data(metadata.defaultValue, module.get.value() );
          },
          defaultText: function() {
            $module.data(metadata.defaultText, $text.text() );
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
            if($input.size() > 0) {
              $input
                .val(value)
                .trigger('change')
              ;
            }
            else {
              $module.data(metadata.value, value);
            }
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
              selectedText = ($selectedItem.data(metadata.text) !== undefined)
                ? $selectedItem.data(metadata.text)
                : $selectedItem.text()
              ;
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
          selection: function() {
            return $module.hasClass(className.selection);
          },
          animated: function($subMenu) {
            return ($subMenu)
              ? $subMenu.is(':animated') || $subMenu.transition && $subMenu.transition('is animating')
              : $menu.is(':animated') || $menu.transition && $menu.transition('is animating')
            ;
          },
          visible: function($subMenu) {
            return ($subMenu)
              ? $subMenu.is(':visible')
              : $menu.is(':visible')
            ;
          },
          hidden: function($subMenu) {
            return ($subMenu)
              ? $subMenu.is(':not(:visible)')
              : $menu.is(':not(:visible)')
            ;
          }
        },

        can: {
          click: function() {
            return (hasTouch || settings.on == 'click');
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
              else if(module.exports !== undefined && $module.transition('is supported')) {
                $currentMenu
                  .transition({
                    animation : settings.transition + ' in',
                    duration  : settings.duration,
                    complete  : callback,
                    queue     : false
                  })
                ;
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
                module.error(error.transition, settings.transition);
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
              if(module.exports !== undefined && $module.transition('is supported')) {
                $currentMenu
                  .transition({
                    animation : settings.transition + ' out',
                    duration  : settings.duration,
                    complete  : callback,
                    queue     : false
                  })
                ;
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
            module.animate.show(function() {
              if( module.can.click() ) {
                module.bind.intent();
              }
              module.set.visible();
            });
            $.proxy(settings.onShow, element)();
          }
        },

        hide: function() {
          if( !module.is.animated() && module.is.visible() ) {
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

  name        : 'Dropdown',
  namespace   : 'dropdown',

  debug       : false,
  verbose     : true,
  performance : true,

  on          : 'click',
  action      : 'activate',

  delay: {
    show  : 200,
    hide  : 300,
    touch : 50
  },

  transition : 'slide down',
  duration   : 250,

  onChange : function(value, text){},
  onShow   : function(){},
  onHide   : function(){},

  error   : {
    action    : 'You called a dropdown action that was not defined',
    method    : 'The method you called is not defined.',
    transition : 'The requested transition was not found'
  },

  metadata: {
    defaultText  : 'defaultText',
    defaultValue : 'defaultValue',
    text         : 'text',
    value        : 'value'
  },

  selector : {
    menu    : '.menu',
    submenu : '> .menu',
    item    : '.menu > .item',
    text    : '> .text',
    input   : '> input[type="hidden"]'
  },

  className : {
    active      : 'active',
    placeholder : 'default',
    disabled    : 'disabled',
    visible     : 'visible',
    selected    : 'selected',
    selection   : 'selection'
  }

};

// Adds easing
$.extend( $.easing, {
  easeOutQuad: function (x, t, b, c, d) {
    return -c *(t/=d)*(t-2) + b;
  }
});


})( require("jquery"), window , document );
