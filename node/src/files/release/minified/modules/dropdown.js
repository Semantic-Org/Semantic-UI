/*  ******************************
   Semantic dropdown: Dropdown
   Author: Jack Lukic
   Notes: First Commit May 25, 2013

******************************  */

;(function ( $, window, document, undefined ) {

$.fn.dropdown = function(parameters) {
  var
    $allDropdowns = $(this),
    $document     = $(document),

    settings        = ( $.isPlainObject(parameters) )
      ? $.extend(true, {}, $.fn.dropdown.settings, parameters)
      : $.fn.dropdown.settings,

    className         = settings.className,
    metadata          = settings.metadata,
    namespace         = settings.namespace,
    selector          = settings.selector,
    error             = settings.error,

    eventNamespace    = '.' + namespace,
    dropdownNamespace = 'module-' + namespace,
    dropdownSelector  = $allDropdowns.selector || '',

    time              = new Date().getTime(),
    performance       = [],

    query             = arguments[0],
    methodInvoked     = (typeof query == 'string'),
    queryArguments    = [].slice.call(arguments, 1),
    invokedResponse
  ;

  $allDropdowns
    .each(function() {
      var
        $dropdown     = $(this),
        $item         = $dropdown.find(selector.item),
        $text         = $dropdown.find(selector.text),
        $input        = $dropdown.find(selector.input),

        $menu         = $dropdown.children(selector.menu),

        isTouchDevice = ('ontouchstart' in document.documentElement),

        element       = this,
        instance      = $dropdown.data(dropdownNamespace),
        dropdown
      ;

      dropdown      = {

        initialize: function() {
          dropdown.debug('Initializing dropdown', settings);
          if(isTouchDevice) {
            $dropdown
              .on('touchstart' + eventNamespace, dropdown.event.test.toggle)
            ;
          }
          else if(settings.on == 'click') {
            $dropdown
              .on('click' + eventNamespace, dropdown.event.test.toggle)
            ;
          }
          else if(settings.on == 'hover') {
            $dropdown
              .on('mouseenter' + eventNamespace, dropdown.delay.show)
              .on('mouseleave' + eventNamespace, dropdown.delay.hide)
            ;
          }
          else {
            $dropdown
              .on(settings.on + eventNamespace, dropdown.toggle)
            ;
          }
          if(settings.action == 'form') {
            dropdown.set.selected();
          }
          $item
            .on('mouseenter' + eventNamespace, dropdown.event.item.mouseenter)
            .on('mouseleave' + eventNamespace, dropdown.event.item.mouseleave)
            .on(dropdown.get.selectEvent() + eventNamespace, dropdown.event.item.click)
          ;
          dropdown.instantiate();
        },

        instantiate: function() {
          dropdown.verbose('Storing instance of dropdown', dropdown);
          $dropdown
            .data(dropdownNamespace, dropdown)
          ;
        },

        destroy: function() {
          dropdown.verbose('Destroying previous dropdown for', $dropdown);
          $item
            .off(eventNamespace)
          ;
          $dropdown
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
              dropdown.determine.intent(event, dropdown.toggle);
              event.stopImmediatePropagation();
            },
            hide: function(event) {
              dropdown.determine.intent(event, dropdown.hide);
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
                clearTimeout(dropdown.itemTimer);
                dropdown.itemTimer = setTimeout(function() {
                  dropdown.animate.hide(false, $otherMenus);
                  dropdown.verbose('Showing sub-menu', $currentMenu);
                  dropdown.animate.show(false,  $currentMenu);
                }, settings.delay.show * 2);
              }
            },

            mouseleave: function(event) {
              var
                $currentMenu = $(this).find(selector.menu)
              ;
              if($currentMenu.size() > 0) {
                clearTimeout(dropdown.itemTimer);
                dropdown.itemTimer = setTimeout(function() {
                  dropdown.verbose('Hiding sub-menu', $currentMenu);
                  dropdown.animate.hide(false,  $currentMenu);
                }, settings.delay.hide);
              }
            },

            click: function (event) {
              var
                $choice = $(this),
                text    = $choice.data(metadata.text)  || $choice.text(),
                value   = $choice.data(metadata.value) || text
              ;
              if( $choice.find(selector.menu).size() === 0 ) {
                dropdown.verbose('Adding active state to selected item');
                $item
                  .removeClass(className.active)
                ;
                $choice
                  .addClass(className.active)
                ;
                dropdown.determine.selectAction(text, value);
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
            dropdown.verbose('Determining action', settings.action);
            if( $.isFunction( dropdown[settings.action] ) ) {
              dropdown.verbose('Triggering preset action', settings.action);
              dropdown[ settings.action ](text, value);
            }
            else if( $.isFunction(settings.action) ) {
              dropdown.verbose('Triggering user action', settings.action);
              settings.action(text, value);
            }
            else {
              dropdown.error(error.action);
            }
          },
          intent: function(event, callback) {
            dropdown.debug('Determining whether event occurred in dropdown', event.target);
            callback = callback || function(){};
            if( $(event.target).closest($menu).size() === 0 ) {
              dropdown.verbose('Triggering event', callback);
              callback();
            }
            else {
              dropdown.verbose('Event occurred in dropdown, canceling callback');
            }
          }
        },

        bind: {
          intent: function() {
            dropdown.verbose('Binding hide intent event to document');
            $document
              .on(dropdown.get.selectEvent(), dropdown.event.test.hide)
            ;
          }
        },

        unbind: {
          intent: function() {
            dropdown.verbose('Removing hide intent event from document');
            $document
              .off(dropdown.get.selectEvent())
            ;
          }
        },

        nothing: function() {},

        changeText: function(text, value) {
          dropdown.set.text(text);
          dropdown.hide();
        },

        updateForm: function(text, value) {
          dropdown.set.text(text);
          dropdown.set.value(value);
          dropdown.hide();
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
            dropdown.debug('Changing text', text, $text);
            $text.removeClass(className.placeholder);
            $text.text(text);
          },
          value: function(value) {
            dropdown.debug('Adding selected value to hidden input', value, $input);
            $input.val(value);
          },
          active: function() {
            $dropdown.addClass(className.active);
          },
          visible: function() {
            $dropdown.addClass(className.visible);
          },
          selected: function(value) {
            var
              $selectedItem = dropdown.get.item(value),
              selectedText
            ;
            if($selectedItem) {
              dropdown.debug('Setting selected menu item to', $selectedItem);
              selectedText = $selectedItem.data(metadata.text) || $selectedItem.text();
              $item
                .removeClass(className.active)
              ;
              $selectedItem
                .addClass(className.active)
              ;
              dropdown.set.text(selectedText);
            }
          }
        },

        remove: {
          active: function() {
            $dropdown.removeClass(className.active);
          },
          visible: function() {
            $dropdown.removeClass(className.visible);
          }
        },

        is: {
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
            return (isTouchDevice || settings.on == 'click');
          },
          show: function() {
            return !$dropdown.hasClass(className.disabled);
          }
        },

        animate: {
          show: function(callback, $subMenu) {
            var
              $currentMenu = $subMenu || $menu
            ;
            callback = callback || function(){};
            if( dropdown.is.hidden($currentMenu) ) {
              dropdown.verbose('Doing menu show animation', $currentMenu);
              if(settings.transition == 'none') {
                callback();
              }
              else if($.fn.transition !== undefined) {
                $currentMenu.transition(settings.transition + ' in', settings.duration, callback);
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
                    }, settings.duration, 'easeOutQuad', dropdown.event.resetStyle)
                    .end()
                  .slideDown(100, 'easeOutQuad', function() {
                    $.proxy(dropdown.event.resetStyle, this)();
                    callback();
                  })
                ;
              }
              else if(settings.transition == 'fade') {
                $currentMenu
                  .hide()
                  .clearQueue()
                  .fadeIn(settings.duration, function() {
                    $.proxy(dropdown.event.resetStyle, this)();
                    callback();
                  })
                ;
              }
              else {
                dropdown.error(error.transition);
              }
            }
          },
          hide: function(callback, $subMenu) {
            var
              $currentMenu = $subMenu || $menu
            ;
            callback = callback || function(){};
            if(dropdown.is.visible($currentMenu) ) {
              dropdown.verbose('Doing menu hide animation', $currentMenu);
              if($.fn.transition !== undefined) {
                $currentMenu.transition(settings.transition + ' out', settings.duration, callback);
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
                    }, 100, 'easeOutQuad', dropdown.event.resetStyle)
                    .end()
                  .delay(50)
                  .slideUp(100, 'easeOutQuad', function() {
                    $.proxy(dropdown.event.resetStyle, this)();
                    callback();
                  })
                ;
              }
              else if(settings.transition == 'fade') {
                $currentMenu
                  .show()
                  .clearQueue()
                  .fadeOut(150, function() {
                    $.proxy(dropdown.event.resetStyle, this)();
                    callback();
                  })
                ;
              }
              else {
                dropdown.error(error.transition);
              }
            }
          }
        },

        show: function() {
          dropdown.debug('Checking if dropdown can show');
          if( !dropdown.is.visible() ) {
            dropdown.hideOthers();
            dropdown.set.active();
            dropdown.animate.show(dropdown.set.visible);
            if( dropdown.can.click() ) {
              dropdown.bind.intent();
            }
            $.proxy(settings.onShow, element)();
          }
        },

        hide: function() {
          if( !dropdown.is.hidden() ) {
            dropdown.debug('Hiding dropdown');
            if( dropdown.can.click() ) {
              dropdown.unbind.intent();
            }
            dropdown.remove.active();
            dropdown.animate.hide(dropdown.remove.visible);
            $.proxy(settings.onHide, element)();
          }
        },

        delay: {
          show: function() {
            dropdown.verbose('Delaying show event to ensure user intent');
            clearTimeout(dropdown.timer);
            dropdown.timer = setTimeout(dropdown.show, settings.delay.show);
          },
          hide: function() {
            dropdown.verbose('Delaying hide event to ensure user intent');
            clearTimeout(dropdown.timer);
            dropdown.timer = setTimeout(dropdown.hide, settings.delay.hide);
          }
        },

        hideOthers: function() {
          dropdown.verbose('Finding other dropdowns to hide');
          $allDropdowns
            .not($dropdown)
              .has(selector.menu + ':visible')
              .dropdown('hide')
          ;
        },

        toggle: function() {
          dropdown.verbose('Toggling menu visibility');
          if( dropdown.is.hidden() ) {
            dropdown.show();
          }
          else {
            dropdown.hide();
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
              $.extend(true, dropdown, name);
            }
            else {
              dropdown[name] = value;
            }
          }
          else {
            return dropdown[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              dropdown.performance.log(arguments);
            }
            else {
              dropdown.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              dropdown.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              dropdown.performance.log(arguments);
            }
            else {
              dropdown.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              dropdown.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          dropdown.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          dropdown.error.apply(console, arguments);
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
            clearTimeout(dropdown.performance.timer);
            dropdown.performance.timer = setTimeout(dropdown.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(dropdown.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(dropdownSelector) {
              title += ' \'' + dropdownSelector + '\'';
            }
            title += ' ' + '(' + $allDropdowns.size() + ')';
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
                dropdown.error(error.method);
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
          dropdown.initialize();
        }
        invokedResponse = dropdown.invoke(query);
      }
      else {
        if(instance !== undefined) {
          dropdown.destroy();
        }
        dropdown.initialize();
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