/*
 * # Semantic - Dropdown
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

$.fn.dropdown = function(parameters) {
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
          ? $.extend(true, {}, $.fn.dropdown.settings, parameters)
          : $.extend({}, $.fn.dropdown.settings),

        className       = settings.className,
        metadata        = settings.metadata,
        namespace       = settings.namespace,
        selector        = settings.selector,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        $module         = $(this),
        $text           = $module.find(selector.text),
        $search         = $module.find(selector.search),
        $input          = $module.find(selector.input),

        $combo = ($module.prev().find(selector.text).size() > 0)
          ? $module.prev().find(selector.text)
          : $module.prev(),

        $menu           = $module.children(selector.menu),
        $item           = $menu.find(selector.item),

        activated       = false,
        itemActivated   = false,

        element         = this,
        instance        = $module.data(moduleNamespace),
        observer,
        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing dropdown', settings);
          module.setup.layout();
          module.save.defaults();
          module.set.selected();

          if(hasTouch) {
            module.bind.touchEvents();
          }
          module.bind.mouseEvents();
          module.bind.keyboardEvents();

          module.observeChanges();
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
          module.remove.tabbable();
          $module
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        observeChanges: function() {
          if('MutationObserver' in window) {
            observer = new MutationObserver(function(mutations) {
              module.debug('DOM tree modified, updating selector cache');
              module.refresh();
            });
            observer.observe(element, {
              childList : true,
              subtree   : true
            });
            module.debug('Setting up mutation observer', observer);
          }
        },

        setup: {

          layout: function() {
            if( $module.is('select') ) {
              module.setup.select();
            }
            if( module.is.search() && !module.is.searchable() ) {
              $search = $('<input />')
                .addClass(className.search)
                .insertBefore($text)
              ;
            }
            if(settings.allowTab) {
              module.set.tabbable();
            }
          },
          select: function() {
            var
              selectValues = module.get.selectValues()
            ;
            module.debug('Dropdown initialized on a select', selectValues);
            // see if select exists inside a dropdown
            $input = $module;
            if($input.parents(selector.dropdown).size() > 0) {
              module.debug('Creating dropdown menu only from template');
              $module = $input.closest(selector.dropdown);
              if($module.find('.' + className.dropdown).size() === 0) {
                $('<div />')
                  .addClass(className.menu)
                  .html( settings.templates.menu( selectValues ))
                  .appendTo($module)
                ;
              }
            }
            else {
              module.debug('Creating entire dropdown from template');
              $module = $('<div />')
                .attr('class', $input.attr('class') )
                .addClass(className.selection)
                .addClass(className.dropdown)
                .html( settings.templates.dropdown(selectValues) )
                .insertBefore($input)
              ;
              $input
                .removeAttr('class')
                .prependTo($module)
              ;
            }
            module.refresh();
          }
        },

        refresh: function() {
          $text   = $module.find(selector.text);
          $search = $module.find(selector.search);
          $input  = $module.find(selector.input);
          $menu   = $module.children(selector.menu);
          $item   = $menu.find(selector.item);
        },

        toggle: function() {
          module.verbose('Toggling menu visibility');
          if( !module.is.active() ) {
            module.show();
          }
          else {
            module.hide();
          }
        },

        show: function() {
          module.debug('Checking if dropdown can show');
          if( !module.is.active() ) {
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
          if( module.is.active() ) {
            module.debug('Hiding dropdown');
            module.animate.hide(function() {
              module.remove.visible();
            });
            $.proxy(settings.onHide, element)();
          }
        },

        hideOthers: function() {
          module.verbose('Finding other dropdowns to hide');
          $allModules
            .not($module)
              .has(selector.menu + ':visible:not(.' + className.animating + ')')
                .dropdown('hide')
          ;
        },

        hideSubMenus: function() {
          var
            $subMenus = $menu.find(selector.menu)
          ;
          $subMenus.transition('hide');
        },

        bind: {
          keyboardEvents: function() {
            module.debug('Binding keyboard events');
            $module
              .on('keydown' + eventNamespace, module.event.keydown)
            ;
            if( module.is.searchable() ) {
              $module
                .on(module.get.inputEvent(), selector.search, module.event.input)
              ;
            }
          },
          touchEvents: function() {
            module.debug('Touch device detected binding additional touch events');
            if( module.is.searchSelection() ) {
              // do nothing special yet
            }
            else {
              $module
                .on('touchstart' + eventNamespace, module.event.test.toggle)
              ;
            }
            $menu
              .on('touchstart' + eventNamespace, selector.item, module.event.item.mouseenter)
            ;
          },
          mouseEvents: function() {
            module.verbose('Mouse detected binding mouse events');
            if( module.is.searchSelection() ) {
              $module
                .on('mousedown' + eventNamespace, selector.menu, module.event.menu.activate)
                .on('mouseup'   + eventNamespace, selector.menu, module.event.menu.deactivate)
                .on('focus'     + eventNamespace, selector.search, module.event.searchFocus)
                .on('click'     + eventNamespace, selector.search, module.show)
                .on('blur'      + eventNamespace, selector.search, module.event.searchBlur)
              ;
            }
            else {
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
              $module
                .on('mousedown' + eventNamespace, module.event.mousedown)
                .on('mouseup'   + eventNamespace, module.event.mouseup)
                .on('focus'     + eventNamespace, module.event.focus)
                .on('blur'      + eventNamespace, module.event.blur)
              ;
            }
            $menu
              .on('mouseenter' + eventNamespace, selector.item, module.event.item.mouseenter)
              .on('mouseleave' + eventNamespace, selector.item, module.event.item.mouseleave)
              .on('click'      + eventNamespace, selector.item, module.event.item.click)
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

        filter: function(searchTerm) {
          var
            $results       = $(),
            exactRegExp    = new RegExp('(?:\s|^)' + searchTerm, 'i'),
            fullTextRegExp = new RegExp(searchTerm, 'i'),
            allItemsFiltered,
            $filteredItems
          ;
          $item
            .each(function(){
              var
                $choice = $(this),
                text    = ( $choice.data(metadata.text) !== undefined )
                  ? $choice.data(metadata.text)
                  : (settings.preserveHTML)
                    ? $choice.html()
                    : $choice.text(),
                value   = ( $choice.data(metadata.value) !== undefined)
                  ? $choice.data(metadata.value)
                  : (typeof text === 'string')
                      ? text.toLowerCase()
                      : text
              ;
              if( exactRegExp.test( text ) || exactRegExp.test( value ) ) {
                $results = $results.add($choice);
              }
              else if(settings.fullTextSearch) {
                if( fullTextRegExp.test( text ) || fullTextRegExp.test( value ) ) {
                  $results = $results.add($choice);
                }
              }
            })
          ;
          $filteredItems   = $item.not($results);
          allItemsFiltered = ($filteredItems.size() == $item.size());

          module.remove.filteredItem();
          module.remove.selectedItem();
          $filteredItems
            .addClass(className.filtered)
          ;
          $item
            .not('.' + className.filtered)
              .eq(0)
              .addClass(className.selected)
          ;
          if(allItemsFiltered) {
            module.hide();
          }
        },

        focusSearch: function() {
          if( module.is.search() ) {
            $search
              .focus()
            ;
          }
        },

        event: {
          // prevents focus callback from occuring on mousedown
          mousedown: function() {
            activated = true;
          },
          mouseup: function() {
            activated = false;
          },
          focus: function() {
            if(!activated && module.is.hidden()) {
              module.show();
            }
          },
          blur: function(event) {
            if(!activated) {
              module.hide();
            }
          },
          searchFocus: function() {
            activated = true;
            module.show();
          },
          searchBlur: function(event) {
            if(!itemActivated) {
              module.hide();
            }
          },
          input: function(event) {
            var
              query = $search.val()
            ;
            if(module.is.searchSelection()) {
              if( module.can.show() ) {
                module.show();
              }
              module.set.filtered();
            }
            module.filter(query);
          },
          keydown: function(event) {
            var
              $selectedItem = $item.not(className.filtered).filter('.' + className.selected).eq(0),
              $visibleItems = $item.not('.' + className.filtered),
              pressedKey    = event.which,
              keys          = {
                enter     : 13,
                escape    : 27,
                upArrow   : 38,
                downArrow : 40
              },
              selectedClass   = className.selected,
              currentIndex    = $visibleItems.index( $selectedItem ),
              hasSelectedItem = ($selectedItem.size() > 0),
              $nextItem,
              newIndex
            ;
            // default to activated choice if no selection present
            if(!hasSelectedItem) {
              $selectedItem   = $item.filter('.' + className.active).eq(0);
              hasSelectedItem = ($selectedItem.size() > 0);
            }
            // close shortcuts
            if(pressedKey == keys.escape) {
              module.verbose('Escape key pressed, closing dropdown');
              module.hide();
            }
            // result shortcuts
            if(module.is.visible()) {
              if(pressedKey == keys.enter && hasSelectedItem) {
                module.verbose('Enter key pressed, choosing selected item');
                $.proxy(module.event.item.click, $selectedItem)(event);
                event.preventDefault();
                return false;
              }
              else if(pressedKey == keys.upArrow) {
                if(!hasSelectedItem) {
                  $nextItem = $visibleItems.eq(0);
                }
                else {
                  $nextItem = $selectedItem.prevAll(selector.item + ':not(.' + className.filtered + ')').eq(0);
                }
                if(currentIndex !== 0) {
                  module.verbose('Up key pressed, changing active item');
                  $item
                    .removeClass(selectedClass)
                  ;
                  $nextItem
                    .addClass(selectedClass)
                  ;
                  module.set.scrollPosition($nextItem);
                }
                event.preventDefault();
              }
              else if(pressedKey == keys.downArrow) {
                if(!hasSelectedItem) {
                  $nextItem = $visibleItems.eq(0);
                }
                else {
                  $nextItem = $selectedItem.nextAll(selector.item + ':not(.' + className.filtered + ')').eq(0);
                }
                if(currentIndex + 1 < $visibleItems.size() ) {
                  module.verbose('Down key pressed, changing active item');
                  $item
                    .removeClass(selectedClass)
                  ;
                  $nextItem
                    .addClass(selectedClass)
                  ;
                  module.set.scrollPosition($nextItem);
                }
                event.preventDefault();
              }
            }
            else {
              if(pressedKey == keys.enter) {
                module.show();
              }
            }
          },
          test: {
            toggle: function(event) {
              if( module.determine.eventInMenu(event, module.toggle) ) {
                event.preventDefault();
              }
            },
            touch: function(event) {
              module.determine.eventInMenu(event, function() {
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
              module.determine.eventInModule(event, module.hide);
            }
          },

          menu: {
            activate: function() {
              itemActivated = true;
            },
            deactivate: function() {
              itemActivated = false;
            }
          },
          item: {
            mouseenter: function(event) {
              var
                $currentMenu = $(this).children(selector.menu),
                $otherMenus  = $(this).siblings(selector.item).children(selector.menu)
              ;
              if( $currentMenu.size() > 0 ) {
                clearTimeout(module.itemTimer);
                module.itemTimer = setTimeout(function() {
                  $.each($otherMenus, function() {
                    module.animate.hide(false, $(this));
                  });
                  module.verbose('Showing sub-menu', $currentMenu);
                  module.animate.show(false,  $currentMenu);
                }, settings.delay.show);
                event.preventDefault();
              }
            },

            mouseleave: function(event) {
              var
                $currentMenu = $(this).children(selector.menu)
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
                  : (settings.preserveHTML)
                    ? $choice.html()
                    : $choice.text(),
                value   = ( $choice.data(metadata.value) !== undefined)
                  ? $choice.data(metadata.value)
                  : (typeof text === 'string')
                      ? text.toLowerCase()
                      : text,
                callback = function() {
                  module.remove.searchTerm();
                  module.remove.filteredItem();
                  module.determine.selectAction(text, value);
                },
                openingSubMenu = ($choice.find(selector.menu).size() > 0)
              ;
              if( !openingSubMenu ) {
                callback();
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
          eventInModule: function(event, callback) {
            callback = callback || function(){};
            if( $(event.target).closest($module).size() === 0 ) {
              module.verbose('Triggering event', callback);
              callback();
              return true;
            }
            else {
              module.verbose('Event occurred in dropdown, canceling callback');
              return false;
            }
          },
          eventInMenu: function(event, callback) {
            callback = callback || function(){};
            if( $(event.target).closest($menu).size() === 0 ) {
              module.verbose('Triggering event', callback);
              callback();
              return true;
            }
            else {
              module.verbose('Event occurred in dropdown menu, canceling callback');
              return false;
            }
          }
        },

        action: {

          nothing: function() {},

          hide: function() {
            module.hide();
          },

          select: function(text, value) {
            value = (value !== undefined)
              ? value
              : text
            ;
            module.set.selected(value);
            module.set.value(value);
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

          combo: function(text, value) {
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
          inputEvent: function() {
            var
              input = $search[0]
            ;
            if(input) {
              return (input.oninput !== undefined)
                ? 'input'
                : (input.onpropertychange !== undefined)
                  ? 'propertychange'
                  : 'keyup'
              ;
            }
            return false;
          },
          selectValues: function() {
            var
              select = {
                values : {}
              }
            ;
            $module
              .find('option')
                .each(function() {
                  var
                    name  = $(this).html(),
                    value = ( $(this).attr('value') !== undefined )
                      ? $(this).attr('value')
                      : name
                  ;
                  if(value === '') {
                    select.placeholder = name;
                  }
                  else {
                    select.values[value] = name;
                  }
                })
            ;
            module.debug('Retrieved values from select', select);
            return select;
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
            strict = (value === '' || value === 0)
              ? true
              : strict || false
            ;
            if(value !== undefined) {
              $item
                .each(function() {
                  var
                    $choice       = $(this),
                    optionText    = ( $choice.data(metadata.text) !== undefined )
                      ? $choice.data(metadata.text)
                      : (settings.preserveHTML)
                        ? $choice.html()
                        : $choice.text(),
                    optionValue   = ( $choice.data(metadata.value) !== undefined )
                      ? $choice.data(metadata.value)
                      : (typeof optionText === 'string')
                        ? optionText.toLowerCase()
                        : optionText
                  ;
                  if(strict) {
                    module.verbose('Ambiguous dropdown value using strict type check', $choice, value);
                    if( optionValue === value ) {
                      $selectedItem = $(this);
                    }
                    else if( !$selectedItem && optionText === value ) {
                      $selectedItem = $(this);
                    }
                  }
                  else {
                    if( optionValue == value ) {
                      module.verbose('Found select item by value', optionValue, value);
                      $selectedItem = $(this);
                    }
                    else if( !$selectedItem && optionText == value ) {
                      module.verbose('Found select item by text', optionText, value);
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
          filtered: function() {
            $text.addClass(className.filtered);
          },
          tabbable: function() {
            if( module.is.searchable() ) {
              module.debug('Searchable dropdown initialized');
              $search
                .val('')
                .attr('tabindex', 0)
              ;
              $menu
                .attr('tabindex', '-1')
              ;
            }
            else {
              module.debug('Simple selection dropdown initialized');
              if(!$module.attr('tabindex') ) {
                $module
                  .attr('tabindex', 0)
                ;
                $menu
                  .attr('tabindex', '-1')
                ;
              }
            }
          },
          scrollPosition: function($item) {
            var
              $item         = $item || module.get.item(),
              hasActive     = ($item && $item.size() > 0),
              edgeTolerance = 5,
              offset,
              itemHeight,
              itemOffset,
              menuOffset,
              menuScroll,
              menuHeight,
              abovePage,
              belowPage
            ;
            if($item && hasActive) {
              menuHeight = $menu.height();
              itemHeight = $item.height();
              menuScroll = $menu.scrollTop();
              menuOffset = $menu.offset().top;
              itemOffset = $item.offset().top;
              offset     = menuScroll - menuOffset + itemOffset;
              belowPage  = menuScroll + menuHeight < (offset + edgeTolerance);
              abovePage  = ((offset - edgeTolerance) < menuScroll);
              if(abovePage || belowPage) {
                module.debug('Scrolling to active item');
                $menu
                  .scrollTop(offset)
                ;
              }
            }
          },
          text: function(text) {
            if(settings.action == 'combo') {
              module.debug('Changing combo button text', text, $combo);
              if(settings.preserveHTML) {
                $combo.html(text);
              }
              else {
                $combo.text(text);
              }
            }
            else if(settings.action !== 'select') {
              module.debug('Changing text', text, $text);
              $text
                .removeClass(className.filtered)
                .removeClass(className.placeholder)
              ;
              if(settings.preserveHTML) {
                $text.html(text);
              }
              else {
                $text.text(text);
              }
            }
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
            $module
              .addClass(className.active)
            ;
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
                : (settings.preserveHTML)
                  ? $selectedItem.html()
                  : $selectedItem.text()
              ;
              module.remove.activeItem();
              module.remove.selectedItem();
              $selectedItem
                .addClass(className.active)
                .addClass(className.selected)
              ;
              module.set.text(selectedText);
              $.proxy(settings.onChange, element)(value, selectedText, $selectedItem);
            }
          }
        },

        remove: {
          active: function() {
            $module.removeClass(className.active);
          },
          visible: function() {
            $module.removeClass(className.visible);
          },
          activeItem: function() {
            $item.removeClass(className.active);
          },
          filteredItem: function() {
            $item.removeClass(className.filtered);
          },
          searchTerm: function() {
            $search.val('');
          },
          selectedItem: function() {
            $item.removeClass(className.selected);
          },
          tabbable: function() {
            if( module.is.searchable() ) {
              module.debug('Searchable dropdown initialized');
              $search
                .attr('tabindex', '-1')
              ;
              $menu
                .attr('tabindex', '-1')
              ;
            }
            else {
              module.debug('Simple selection dropdown initialized');
              $module
                .attr('tabindex', '-1')
              ;
              $menu
                .attr('tabindex', '-1')
              ;
            }
          }
        },

        is: {
          search: function() {
            return $module.hasClass(className.search);
          },
          searchable: function() {
            return ($search.size() > 0);
          },
          searchSelection: function() {
            return ( module.is.searchable() && $search.parent().is($module) );
          },
          selection: function() {
            return $module.hasClass(className.selection);
          },
          animating: function($subMenu) {
            return ($subMenu)
              ? $subMenu.is(':animated') || $subMenu.transition && $subMenu.transition('is animating')
              : $menu.is(':animated') || $menu.transition && $menu.transition('is animating')
            ;
          },
          active: function() {
            return $module.hasClass(className.active);
          },
          visible: function($subMenu) {
            return ($subMenu)
              ? $subMenu.is(':visible')
              : $menu.is(':visible')
            ;
          },
          hidden: function($subMenu) {
            return ($subMenu)
              ? $subMenu.is(':hidden')
              : $menu.is(':hidden')
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
              $currentMenu = $subMenu || $menu,
              start = ($subMenu)
                ? function() {}
                : function() {
                  module.hideSubMenus();
                  module.hideOthers();
                  module.set.active();
                  module.set.scrollPosition();
                }
            ;
            callback = callback || function(){};
            module.verbose('Doing menu show animation', $currentMenu);
            if( module.is.hidden($currentMenu) || module.is.animating($currentMenu) ) {
              if(settings.transition == 'none') {
                $.proxy(callback, element)();
              }
              else if($.fn.transition !== undefined && $module.transition('is supported')) {
                $currentMenu
                  .transition({
                    animation  : settings.transition + ' in',
                    debug      : settings.debug,
                    verbose    : settings.verbose,
                    duration   : settings.duration,
                    queue      : true,
                    onStart    : start,
                    onComplete : function() {
                      $.proxy(callback, element)();
                    }
                  })
                ;
              }
              else if(settings.transition == 'slide down') {
                start();
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
                    $.proxy(callback, element)();
                  })
                ;
              }
              else if(settings.transition == 'fade') {
                start();
                $currentMenu
                  .hide()
                  .clearQueue()
                  .fadeIn(settings.duration, function() {
                    $.proxy(module.event.resetStyle, this)();
                    $.proxy(callback, element)();
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
              $currentMenu = $subMenu || $menu,
              duration = ($subMenu)
                ? (settings.duration * 0.9)
                : settings.duration,
              start = ($subMenu)
                ? function() {}
                : function() {
                  if( module.can.click() ) {
                    module.unbind.intent();
                  }
                  module.focusSearch();
                  module.remove.active();
                }
            ;
            callback = callback || function(){};
            if( module.is.visible($currentMenu) || module.is.animating($currentMenu) ) {
              module.verbose('Doing menu hide animation', $currentMenu);

              if(settings.transition == 'none') {
                $.proxy(callback, element)();
              }
              else if($.fn.transition !== undefined && $module.transition('is supported')) {
                $currentMenu
                  .transition({
                    animation  : settings.transition + ' out',
                    duration   : settings.duration,
                    debug      : settings.debug,
                    verbose    : settings.verbose,
                    queue      : true,
                    onStart    : start,
                    onComplete : function() {
                      $.proxy(callback, element)();
                    }
                  })
                ;
              }
              else if(settings.transition == 'slide down') {
                start();
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
                    $.proxy(callback, element)();
                  })
                ;
              }
              else if(settings.transition == 'fade') {
                start();
                $currentMenu
                  .show()
                  .clearQueue()
                  .fadeOut(150, function() {
                    $.proxy(module.event.resetStyle, this)();
                    $.proxy(callback, element)();
                  })
                ;
              }
              else {
                module.error(error.transition);
              }
            }
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

$.fn.dropdown.settings = {

  debug          : false,
  verbose        : true,
  performance    : true,

  on             : 'click',
  action         : 'activate',

  allowTab       : true,
  fullTextSearch : true,
  preserveHTML   : true,

  delay          : {
    show  : 200,
    hide  : 300,
    touch : 50
  },

  transition : 'slide down',
  duration   : 250,

  /* Callbacks */

  onChange   : function(value, text){},
  onShow     : function(){},
  onHide     : function(){},

  /* Component */

  name           : 'Dropdown',
  namespace      : 'dropdown',

  error   : {
    action     : 'You called a dropdown action that was not defined',
    method     : 'The method you called is not defined.',
    transition : 'The requested transition was not found'
  },

  metadata: {
    defaultText  : 'defaultText',
    defaultValue : 'defaultValue',
    text         : 'text',
    value        : 'value'
  },

  selector : {
    dropdown : '.ui.dropdown',
    text     : '> .text:not(.icon)',
    input    : '> input[type="hidden"], > select',
    search   : '> input.search, .menu > .search > input, .menu > input.search',
    menu     : '.menu',
    item     : '.item'
  },

  className : {
    active      : 'active',
    animating   : 'animating',
    disabled    : 'disabled',
    dropdown    : 'ui dropdown',
    filtered    : 'filtered',
    menu        : 'menu',
    placeholder : 'default',
    search      : 'search',
    selected    : 'selected',
    selection   : 'selection',
    visible     : 'visible'
  }

};

/* Templates */
$.fn.dropdown.settings.templates = {
  menu: function(select) {
    var
      placeholder = select.placeholder || false,
      values      = select.values || {},
      html        = ''
    ;
    $.each(select.values, function(value, name) {
      html += '<div class="item" data-value="' + value + '">' + name + '</div>';
    });
    return html;
  },
  dropdown: function(select) {
    var
      placeholder = select.placeholder || false,
      values      = select.values || {},
      html        = ''
    ;
    html +=  '<i class="dropdown icon"></i>';
    if(select.placeholder) {
      html += '<div class="default text">' + placeholder + '</div>';
    }
    else {
      html += '<div class="text"></div>';
    }
    html += '<div class="menu">';
    $.each(select.values, function(value, name) {
      html += '<div class="item" data-value="' + value + '">' + name + '</div>';
    });
    html += '</div>';
    return html;
  }
};


/* Dependencies */
$.extend( $.easing, {
  easeOutQuad: function (x, t, b, c, d) {
    return -c *(t/=d)*(t-2) + b;
  },
});


})( jQuery, window , document );