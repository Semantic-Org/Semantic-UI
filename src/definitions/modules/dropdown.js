/*!
 * # Semantic UI - Dropdown
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributors
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
        templates       = settings.templates,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        $module         = $(this),
        $text           = $module.find(selector.text),
        $search         = $module.find(selector.search),
        $input          = $module.find(selector.input),
        $icon           = $module.find(selector.icon),

        $combo = ($module.prev().find(selector.text).length > 0)
          ? $module.prev().find(selector.text)
          : $module.prev(),

        $menu           = $module.children(selector.menu),
        $item           = $menu.find(selector.item),

        activated       = false,
        itemActivated   = false,
        element         = this,
        instance        = $module.data(moduleNamespace),

        elementNamespace,
        id,
        selectObserver,
        menuObserver,
        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing dropdown', settings);

          if( module.is.alreadySetup() ) {
            module.setup.reference();
          }
          else {
            module.setup.layout();

            module.save.defaults();
            module.set.selected();

            module.create.id();

            if(hasTouch) {
              module.bind.touchEvents();
            }
            module.bind.mouseEvents();
            module.bind.keyboardEvents();

            module.observeChanges();
            module.instantiate();
          }
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
          $menu
            .off(eventNamespace)
          ;
          $document
            .off(elementNamespace)
          ;
          if(selectObserver) {
            selectObserver.disconnect();
          }
          if(menuObserver) {
            menuObserver.disconnect();
          }
        },

        observeChanges: function() {
          if('MutationObserver' in window) {
            selectObserver = new MutationObserver(function(mutations) {
              module.debug('<select> modified, recreating menu');
              module.setup.select();
            });
            menuObserver = new MutationObserver(function(mutations) {
              module.debug('Menu modified, updating selector cache');
              module.refresh();
            });
            if(module.has.input()) {
              selectObserver.observe($input[0], {
                childList : true,
                subtree   : true
              });
            }
            if(module.has.menu()) {
              menuObserver.observe($menu[0], {
                childList : true,
                subtree   : true
              });
            }
            module.debug('Setting up mutation observer', selectObserver, menuObserver);
          }
        },

        create: {
          id: function() {
            id = (Math.random().toString(16) + '000000000').substr(2, 8);
            elementNamespace = '.' + id;
            module.verbose('Creating unique id for element', id);
          }
        },

        search: function() {
          var
            query
          ;
          query = $search.val();

          module.verbose('Searching for query', query);
          module.filter(query);
          if(module.is.searchSelection() && module.can.show() ) {
            module.show();
          }
        },

        setup: {
          layout: function() {
            if( $module.is('select') ) {
              module.setup.select();
            }
            if( module.is.search() && !module.has.search() ) {
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
              selectValues  = module.get.selectValues()
            ;
            module.debug('Dropdown initialized on a select', selectValues);
            if( $module.is('select') ) {
              $input = $module;
            }
            // see if select is placed correctly already
            if($input.parent(selector.dropdown).length > 0) {
              module.debug('UI dropdown already exists. Creating dropdown menu only');
              $module = $input.closest(selector.dropdown);
              $menu   = $module.children(selector.menu);
              if($menu.length === 0) {
                $menu = $('<div />')
                  .addClass(className.menu)
                  .appendTo($module)
                ;
              }
              $menu.html( templates.menu( selectValues ));
            }
            else {
              module.debug('Creating entire dropdown from select');
              $module = $('<div />')
                .attr('class', $input.attr('class') )
                .addClass(className.selection)
                .addClass(className.dropdown)
                .html( templates.dropdown(selectValues) )
                .insertBefore($input)
              ;
              $input
                .removeAttr('class')
                .detach()
                .prependTo($module)
              ;
            }
            if($input.is('[multiple]')) {
              module.set.multiple();
            }
            module.refresh();
          },
          reference: function() {
            var
              index = $allModules.index($module),
              $firstModules,
              $lastModules
            ;
            module.debug('Dropdown behavior was called on select, replacing with closest dropdown');
            // replace module reference
            $module = $module.parent(selector.dropdown);
            module.refresh();
            // adjust all modules
            $firstModules = $allModules.slice(0, index);
            $lastModules  = $allModules.slice(index + 1);
            $allModules   = $firstModules.add($module).add($lastModules);
            // invoke method in context of current instance
            if(methodInvoked) {
              instance = module;
              module.invoke(query);
            }
          }
        },

        refresh: function() {
          module.verbose('Refreshing selector cache');
          $text   = $module.find(selector.text);
          $search = $module.find(selector.search);
          $input  = $module.find(selector.input);
          $icon   = $module.find(selector.icon);
          $combo  = ($module.prev().find(selector.text).length > 0)
            ? $module.prev().find(selector.text)
            : $module.prev()
          ;
          $menu    = $module.children(selector.menu);
          $item    = $menu.find(selector.item);
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

        show: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          if( module.is.searchSelection() && module.is.allFiltered() ) {
            return;
          }
          if( module.can.show() && !module.is.active() ) {
            module.debug('Showing dropdown');
            if(module.is.multiple() && module.is.searchSelection()) {
              module.filterActive();
            }
            module.animate.show(function() {
              if( module.can.click() ) {
                module.bind.intent();
              }
              module.set.visible();
              callback.call(element);
            });
            settings.onShow.call(element);
          }
        },

        hide: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          if( module.is.active() ) {
            module.debug('Hiding dropdown');
            module.animate.hide(function() {
              module.remove.visible();
              callback.call(element);
            });
            settings.onHide.call(element);
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
            $subMenus = $menu.children(selector.item).find(selector.menu)
          ;
          $subMenus.transition('hide');
        },

        bind: {
          keyboardEvents: function() {
            module.debug('Binding keyboard events');
            $module
              .on('keydown' + eventNamespace, module.event.keydown)
            ;
            if( module.has.search() ) {
              $module
                .on(module.get.inputEvent() + eventNamespace, selector.search, module.event.input)
              ;
            }
            if( module.is.multiple() ) {
              $document
                .on('keydown' + elementNamespace, module.event.document.keydown)
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
            if(module.is.multiple()) {
              $module
                .on('click'   + eventNamespace, selector.label, module.event.label.click)
                .on('click'   + eventNamespace, selector.remove, module.event.remove.click)
              ;
            }
            if( module.is.searchSelection() ) {
              $module
                .on('mousedown' + eventNamespace, selector.menu,   module.event.menu.mousedown)
                .on('mouseup'   + eventNamespace, selector.menu,   module.event.menu.mouseup)
                .on('click'     + eventNamespace, selector.search, module.show)
                .on('focus'     + eventNamespace, selector.search, module.event.search.focus)
                .on('blur'      + eventNamespace, selector.search, module.event.search.blur)
                .on('click'     + eventNamespace, selector.text,   module.event.text.focus)
              ;
              if(module.is.multiple()) {
                $module
                  .on('click'   + eventNamespace, module.event.click)
                ;
              }
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
                .on('touchstart' + elementNamespace, module.event.test.touch)
                .on('touchmove'  + elementNamespace, module.event.test.touch)
              ;
            }
            $document
              .on('click' + elementNamespace, module.event.test.hide)
            ;
          }
        },

        unbind: {
          intent: function() {
            module.verbose('Removing hide intent event from document');
            if(hasTouch) {
              $document
                .off('touchstart' + elementNamespace)
                .off('touchmove' + elementNamespace)
              ;
            }
            $document
              .off('click' + elementNamespace)
            ;
          }
        },

        filter: function(searchTerm) {
          var
            $results       = $(),
            escapedTerm    = module.escape.regExp(searchTerm),
            exactRegExp    = new RegExp('^' + escapedTerm, 'igm'),
            fullTextRegExp = new RegExp(escapedTerm, 'ig'),
            allItemsFiltered
          ;
          module.verbose('Searching for matching values');
          $item
            .each(function(){
              var
                $choice = $(this),
                text,
                value
              ;
              if(settings.match == 'both' || settings.match == 'text') {
                text = String(module.get.choiceText($choice, false));

                if(text.match(exactRegExp)) {
                  $results = $results.add($choice);
                  return true;
                }
                else if(settings.fullTextSearch && text.match(fullTextRegExp)) {
                  $results = $results.add($choice);
                  return true;
                }
              }
              if(settings.match == 'both' || settings.match == 'value') {
                console.log('here');
                value = String(module.get.choiceValue($choice, text));

                if(value.match(exactRegExp)) {
                  $results = $results.add($choice);
                  return true;
                }
                else if(settings.fullTextSearch && value.match(fullTextRegExp)) {
                  $results = $results.add($choice);
                  return true;
                }
              }
            })
          ;

          module.debug('Setting filter', searchTerm);
          module.remove.filteredItem();
          $item
            .not($results)
            .addClass(className.filtered)
          ;
          if(module.is.multiple()) {
            module.filterActive();
          }
          module.verbose('Selecting first non-filtered element');
          module.remove.selectedItem();
          $item
            .not('.' + className.filtered)
              .eq(0)
              .addClass(className.selected)
          ;
          if( module.is.allFiltered() ) {
            module.debug('All items filtered, hiding dropdown', searchTerm);
            if(module.is.searchSelection()) {
              module.hide();
            }
            settings.onNoResults.call(element, searchTerm);
          }
        },

        filterActive: function() {
          if(settings.filterActive) {
            $item.filter('.' + className.active)
              .addClass(className.filtered)
            ;
          }
        },

        focusSearch: function() {
          if( module.is.search() && !module.is.focusedOnSearch() ) {
            $search[0].focus();
          }
        },

        forceSelection: function() {
          var
            $currentlySelected = $item.not(className.filtered).filter('.' + className.selected).eq(0),
            $activeItem        = $item.filter('.' + className.active).eq(0),
            $selectedItem      = ($currentlySelected.length > 0)
              ? $currentlySelected
              : $activeItem,
            hasSelected = ($selectedItem.size() > 0)
          ;
          if(hasSelected) {
            module.debug('Forcing partial selection to selected item', $selectedItem);
            module.event.item.click.call($selectedItem);
            module.remove.filteredItem();
          }
          else {
            module.hide();
          }
        },

        event: {
          focus: function() {
            if(settings.showOnFocus && !activated && module.is.hidden()) {
              module.show();
            }
          },
          click: function(event) {
            var
              $target = $(event.target)
            ;
            // focus search
            if(($target.is($module) || $target.is($icon)) && !module.is.focusedOnSearch()) {
              $search.focus();
            }
          },
          blur: function(event) {
            var
              pageLostFocus = (document.activeElement === this)
            ;
            if(!activated && !pageLostFocus) {
              module.remove.activeLabel();
              module.hide();
            }
          },
          // prevents focus callback from occuring on mousedown
          mousedown: function() {
            activated = true;
          },
          mouseup: function() {
            activated = false;
          },
          search: {
            focus: function() {
              activated = true;
              if(settings.showOnFocus) {
                module.show();
              }
            },
            blur: function(event) {
              var
                pageLostFocus = (document.activeElement === this)
              ;
              if(!itemActivated && !pageLostFocus) {
                if(module.is.multiple()) {
                  module.remove.activeLabel();
                }
                else if(settings.forceSelection) {
                  module.forceSelection();
                }
                else {
                  module.hide();
                }
              }
            }
          },
          text: {
            focus: function(event) {
              activated = true;
              $search.focus();
            }
          },
          input: function(event) {
            if(module.is.multiple() || module.is.searchSelection()) {
              module.set.filtered();
            }
            clearTimeout(module.timer);
            module.timer = setTimeout(module.search, settings.delay.search);
          },
          label: {
            click: function(event) {
              var
                $label        = $(this),
                $labels       = $module.find(selector.label),
                $activeLabels = $labels.filter('.' + className.active),
                $nextActive   = $label.nextAll('.' + className.active),
                $prevActive   = $label.prevAll('.' + className.active),
                $range = ($nextActive.length > 0)
                  ? $label.nextUntil($nextActive).add($activeLabels).add($label)
                  : $label.prevUntil($prevActive).add($activeLabels).add($label)
                ;
              ;
              if(event.shiftKey) {
                $activeLabels.removeClass(className.active);
                $range.addClass(className.active);
              }
              else if(event.ctrlKey) {
                $label.toggleClass(className.active);
              }
              else {
                $activeLabels.removeClass(className.active);
                $label.addClass(className.active);
              }
              settings.onLabelSelect.apply(this, $labels.filter('.' + className.active));
            }
          },
          remove: {
            click: function() {
              var
                $label = $(this).parent()
              ;
              if( $label.hasClass(className.active) ) {
                // remove all selected labels
                module.remove.labels();
              }
              else {
                // remove this label only
                module.remove.labels( $label );
              }
            }
          },
          test: {
            toggle: function(event) {
              var
                toggleBehavior = (module.is.multiple())
                  ? module.show
                  : module.toggle
                ;
              if( module.determine.eventOnElement(event, toggleBehavior) ) {
                event.preventDefault();
              }
            },
            touch: function(event) {
              module.determine.eventOnElement(event, function() {
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
            mousedown: function() {
              itemActivated = true;
            },
            mouseup: function() {
              itemActivated = false;
            }
          },
          item: {
            mouseenter: function(event) {
              var
                $subMenu    = $(this).children(selector.menu),
                $otherMenus = $(this).siblings(selector.item).children(selector.menu)
              ;
              if( $subMenu.length > 0 ) {
                clearTimeout(module.itemTimer);
                module.itemTimer = setTimeout(function() {
                  module.verbose('Showing sub-menu', $subMenu);
                  $.each($otherMenus, function() {
                    module.animate.hide(false, $(this));
                  });
                  module.animate.show(false,  $subMenu);
                }, settings.delay.show);
                event.preventDefault();
              }
            },
            mouseleave: function(event) {
              var
                $subMenu = $(this).children(selector.menu)
              ;
              if($subMenu.length > 0) {
                clearTimeout(module.itemTimer);
                module.itemTimer = setTimeout(function() {
                  module.verbose('Hiding sub-menu', $subMenu);
                  module.animate.hide(false,  $subMenu);
                }, settings.delay.hide);
              }
            },
            click: function (event) {
              var
                $choice  = $(this),
                $target  = (event)
                  ? $(event.target)
                  : $(''),
                $subMenu = $choice.find(selector.menu),
                text     = module.get.choiceText($choice),
                value    = module.get.choiceValue($choice, text),
                hasSubMenu     = ($subMenu.length > 0),
                isBubbledEvent = ($subMenu.find($target).length > 0)
              ;
              if(!isBubbledEvent && (!hasSubMenu || settings.allowCategorySelection)) {
                module.remove.searchTerm();
                module.determine.selectAction.call(this, text, value);
              }
            }
          },

          document: {
            // label selection should occur even when element has no focus
            keydown: function(event) {
              var
                pressedKey    = event.which,
                keys          = module.get.shortcutKeys(),
                isShortcutKey = module.is.inObject(pressedKey, keys)
              ;
              if(isShortcutKey) {
                var
                  $label            = $module.find(selector.label),
                  $activeLabel      = $label.filter('.' + className.active),
                  activeValue       = $activeLabel.data('value'),
                  labelIndex        = $label.index($activeLabel),
                  labelCount        = $label.length,
                  hasActiveLabel    = ($activeLabel.length > 0),
                  isFirstLabel      = (labelIndex == 0),
                  isLastLabel       = (labelIndex + 1 == labelCount),
                  isFocusedOnSearch = module.is.focusedOnSearch(),
                  isFocused         = module.is.focused(),
                  caretAtStart      = (isFocusedOnSearch && module.get.caretPosition() == 0)
                ;
                if(isFocusedOnSearch && (pressedKey == keys.delimiter)) {
                  // tokenize on comma
                  if(module.is.visible()) {
                    module.verbose('Delimiter key pressed. Tokenizing');
                    module.event.item.click.call($selectedItem, event);
                    event.preventDefault();
                  }
                }
                else if(pressedKey == keys.leftArrow) {
                  // activate previous label
                  if((isFocused || caretAtStart) && !hasActiveLabel) {
                    module.verbose('Selecting previous label');
                    $label.last().addClass(className.active);
                  }
                  else if(hasActiveLabel && !isFirstLabel) {
                    if(!event.shiftKey) {
                      module.verbose('Selecting previous label');
                      $label.removeClass(className.active)
                    }
                    else {
                      module.verbose('Adding previous label to selection');
                    }
                    $activeLabel.prev()
                      .addClass(className.active)
                      .end()
                    ;
                    event.preventDefault();
                  }
                }
                else if(pressedKey == keys.rightArrow) {
                  // activate first label
                  if(isFocused && !hasActiveLabel) {
                    $label.last().addClass(className.active);
                  }
                  // activate next label
                  if(hasActiveLabel) {
                    if(!event.shiftKey) {
                      module.verbose('Selecting next label');
                      $label.removeClass(className.active)
                    }
                    else {
                      module.verbose('Adding next label to selection');
                    }
                    $activeLabel.next()
                      .addClass(className.active)
                      .end()
                    ;
                    event.preventDefault();
                  }
                }
                else if(pressedKey == keys.deleteKey || pressedKey == keys.backspace) {
                  if(hasActiveLabel) {
                    module.verbose('Removing active labels');
                    $activeLabel.last().next().addClass(className.active);
                    module.remove.labels($activeLabel);
                  }
                  else if(caretAtStart && !hasActiveLabel && pressedKey == keys.backspace) {
                    module.verbose('Removing last label on input backspace');
                    $activeLabel = $label.last().addClass(className.active);
                    activeValue  = $activeLabel.data('value');
                    module.remove.selected(activeValue);
                  }
                }
                else {
                  $activeLabel.removeClass(className.active);
                }
              }
            }
          },

          keydown: function(event) {
            var
              pressedKey    = event.which,
              keys          = module.get.shortcutKeys(),
              isShortcutKey = module.is.inObject(pressedKey, keys)
            ;
            if(isShortcutKey) {
              var
                $currentlySelected = $item.not(className.filtered).filter('.' + className.selected).eq(0),
                $activeItem        = $menu.children('.' + className.active).eq(0),
                $selectedItem      = ($currentlySelected.length > 0)
                  ? $currentlySelected
                  : $activeItem,
                $visibleItems = ($selectedItem.length > 0)
                  ? $selectedItem.siblings(':not(.' + className.filtered +')').andSelf()
                  : $menu.children(':not(.' + className.filtered +')'),
                $subMenu        = $selectedItem.children(selector.menu),
                $parentMenu     = $selectedItem.closest(selector.menu),
                inVisibleMenu   = ($parentMenu.hasClass(className.visible) || $parentMenu.hasClass(className.animating)),
                hasSubMenu      = ($subMenu.length> 0),
                hasSelectedItem = ($selectedItem.length > 0),
                $nextItem,
                isSubMenuItem,
                newIndex
              ;

              // visible menu keyboard shortcuts
              if( module.is.visible() ) {

                // enter (select or open sub-menu)
                if(pressedKey == keys.enter && hasSelectedItem) {
                  if(hasSubMenu && !settings.allowCategorySelection) {
                    module.verbose('Pressed enter on unselectable category, opening sub menu');
                    pressedKey = keys.rightArrow;
                  }
                  else {
                    module.verbose('Enter key pressed, choosing selected item');
                    module.event.item.click.call($selectedItem, event);
                    event.stopImmediatePropagation();
                  }
                }

                // left arrow (hide sub-menu)
                if(pressedKey == keys.leftArrow) {

                  isSubMenuItem = ($parentMenu[0] !== $menu[0]);

                  if(isSubMenuItem) {
                    module.verbose('Left key pressed, closing sub-menu');
                    module.animate.hide(false,  $parentMenu);
                    $selectedItem
                      .removeClass(className.selected)
                    ;
                    $parentMenu
                      .closest(selector.item)
                        .addClass(className.selected)
                    ;
                    event.preventDefault();
                  }
                }

                // right arrow (show sub-menu)
                if(pressedKey == keys.rightArrow) {
                  if(hasSubMenu) {
                    module.verbose('Right key pressed, opening sub-menu');
                    module.animate.show(false,  $subMenu);
                    $selectedItem
                      .removeClass(className.selected)
                    ;
                    $subMenu
                      .find(selector.item).eq(0)
                        .addClass(className.selected)
                    ;
                    event.preventDefault();
                  }
                }

                // up arrow (traverse menu up)
                if(pressedKey == keys.upArrow) {
                  $nextItem = (hasSelectedItem && inVisibleMenu)
                    ? $selectedItem.prevAll(selector.item + ':not(.' + className.filtered + ')').eq(0)
                    : $item.eq(0)
                  ;
                  if($visibleItems.index( $nextItem ) < 0) {
                    module.verbose('Up key pressed but reached top of current menu');
                    event.preventDefault();
                    return;
                  }
                  else {
                    module.verbose('Up key pressed, changing active item');
                    $selectedItem
                      .removeClass(className.selected)
                    ;
                    $nextItem
                      .addClass(className.selected)
                    ;
                    module.set.scrollPosition($nextItem);
                  }
                  event.preventDefault();
                }

                // down arrow (traverse menu down)
                if(pressedKey == keys.downArrow) {
                  $nextItem = (hasSelectedItem && inVisibleMenu)
                    ? $nextItem = $selectedItem.nextAll(selector.item + ':not(.' + className.filtered + ')').eq(0)
                    : $item.eq(0)
                  ;
                  if($nextItem.length === 0) {
                    module.verbose('Down key pressed but reached bottom of current menu');
                    event.preventDefault();
                    return;
                  }
                  else {
                    module.verbose('Down key pressed, changing active item');
                    $item
                      .removeClass(className.selected)
                    ;
                    $nextItem
                      .addClass(className.selected)
                    ;
                    module.set.scrollPosition($nextItem);
                  }
                  event.preventDefault();
                }

                // escape (close menu)
                if(pressedKey == keys.escape) {
                  module.verbose('Escape key pressed, closing dropdown');
                  module.hide();
                }

              }
              else {
                // enter (open menu)
                if(pressedKey == keys.enter) {
                  module.verbose('Enter key pressed, showing dropdown');
                  module.show();
                }
                // down arrow (open menu)
                if(pressedKey == keys.downArrow) {
                  module.verbose('Down key pressed, showing dropdown');
                  module.show();
                }
              }
            }
          }
        },

        determine: {
          selectAction: function(text, value) {
            module.verbose('Determining action', settings.action);
            if( $.isFunction( module.action[settings.action] ) ) {
              module.verbose('Triggering preset action', settings.action, text, value);
              module.action[ settings.action ].call(this, text, value);
            }
            else if( $.isFunction(settings.action) ) {
              module.verbose('Triggering user action', settings.action, text, value);
              settings.action.call(this, text, value);
            }
            else {
              module.error(error.action, settings.action);
            }
          },
          eventInModule: function(event, callback) {
            callback = $.isFunction(callback)
              ? callback
              : function(){}
            ;
            if( $(event.target).closest($module).length === 0 ) {
              module.verbose('Triggering event', callback);
              callback();
              return true;
            }
            else {
              module.verbose('Event occurred in dropdown, canceling callback');
              return false;
            }
          },
          eventOnElement: function(event, callback) {
            var
              $target = $(event.target)
            ;
            callback = $.isFunction(callback)
              ? callback
              : function(){}
            ;
            if($target.closest($menu).length == 0) {
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

          activate: function(text, value) {
            value = (value !== undefined)
              ? value
              : text
            ;
            module.set.selected(value, $(this));
            if(module.is.multiple() && !module.is.allFiltered()) {
              return;
            }
            else {
              module.hide(function() {
                module.remove.filteredItem();
              });
            }
          },

          select: function(text, value) {
            // mimics action.activate but does not select text
            module.action.activate.call(this);
          },

          combo: function(text, value) {
            value = (value !== undefined)
              ? value
              : text
            ;
            module.set.selected(value, $(this));
            module.hide(function() {
              module.remove.filteredItem();
            });
          },

          hide: function() {
            module.hide(function() {
              module.remove.filteredItem();
            });
          }

        },

        get: {
          id: function() {
            return id;
          },
          text: function() {
            return $text.text();
          },
          uniqueArray: function(array) {
            return $.grep(array, function (value, index) {
                return $.inArray(value, array) === index;
            });
          },
          caretPosition: function() {
            var
              input = $search.get(0),
              range,
              rangeLength
            ;
            if ('selectionStart' in input) {
              return input.selectionStart;
            }
            else if (document.selection) {
              input.focus();
              range       = document.selection.createRange();
              rangeLength = range.text.length;
              range.moveStart('character', -input.value.length);
              return range.text.length - rangeLength;
            }
          },
          shortcutKeys: function() {
            return {
              backspace  : 8,
              delimiter  : 188, // comma
              deleteKey  : 46,
              enter      : 13,
              escape     : 27,
              leftArrow  : 37,
              upArrow    : 38,
              rightArrow : 39,
              downArrow  : 40
            };
          },
          value: function() {
            return ($input.length > 0)
              ? $input.val()
              : $module.data(metadata.value)
            ;
          },
          values: function() {
            var
              value = module.get.value()
            ;
            if(value == '') {
              return '';
            }
            return (!$input.is('select') && module.is.multiple())
              ? value.split(settings.delimiter)
              : value
            ;
          },
          choiceText: function($choice, preserveHTML) {
            preserveHTML = (preserveHTML !== undefined)
              ? preserveHTML
              : settings.preserveHTML
            ;
            if($choice) {
              if($choice.find(selector.menu).length > 0) {
                module.verbose('Retreiving text of element with sub-menu');
                $choice = $choice.clone();
                $choice.find(selector.menu).remove();
                $choice.find(selector.menuIcon).remove();
              }
              return ($choice.data(metadata.text) !== undefined)
                ? $choice.data(metadata.text)
                : (preserveHTML)
                  ? $choice.html().trim()
                  : $choice.text().trim()
              ;
            }
          },
          choiceValue: function($choice, choiceText) {
            choiceText = choiceText || module.get.choiceText($choice);
            if(!$choice) {
              return false;
            }
            return ($choice.data(metadata.value) !== undefined)
              ? $choice.data(metadata.value)
              : (typeof choiceText === 'string')
                ? choiceText.toLowerCase().trim()
                : choiceText
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
              select = {}
            ;
            select.values = (settings.sortSelect)
              ? {} // properties will be sorted in object when re-accessed
              : [] // properties will keep original order in array
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
                  if(value === '' && settings.placeholder !== false) {
                    select.placeholder = name;
                  }
                  else {
                    if(settings.sortSelect) {
                      select.values[value] = {
                        name  : name,
                        value : value
                      };
                    }
                    else {
                      select.values.push({
                        name: name,
                        value: value
                      });
                    }
                  }
                })
            ;
            if(typeof settings.placeholder !== 'boolean') {
              module.debug('Setting placeholder value to', settings.placeholder);
              select.placeholder = settings.placeholder;
            }
            if(settings.sortSelect) {
              module.debug('Retrieved and sorted values from select', select);
            }
            else {
              module.debug('Retreived values from select', select);
            }
            return select;
          },
          activeItem: function() {
            return $item.filter('.'  + className.active);
          },
          item: function(value, strict) {
            var
              $selectedItem = false,
              isMultiple
            ;
            value = (value !== undefined)
              ? value
              : ( module.get.values() !== undefined)
                ? module.get.values()
                : module.get.text()
            ;
            isMultiple = (module.is.multiple() && $.isArray(value));
            strict     = (value === '' || value === 0)
              ? true
              : strict || false
            ;
            if(value !== undefined) {
              $item
                .each(function() {
                  var
                    $choice       = $(this),
                    optionText    = module.get.choiceText($choice),
                    optionValue   = module.get.choiceValue($choice, optionText)
                  ;
                  if(isMultiple) {
                    if($.inArray(optionValue, value) !== -1 || $.inArray(optionText, value) !== -1) {
                      $selectedItem = ($selectedItem)
                        ? $selectedItem.add($choice)
                        : $choice
                      ;
                    }
                  }
                  else if(strict) {
                    module.verbose('Ambiguous dropdown value using strict type check', $choice, value);
                    if( optionValue === value || optionText === value) {
                      $selectedItem = $choice;
                      return true;
                    }
                  }
                  else {
                    if( optionValue == value || optionText == value) {
                      module.verbose('Found select item by value', optionValue, value);
                      $selectedItem = $choice;
                      return true;
                    }
                  }
                })
              ;
            }
            return $selectedItem;
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
            $text.addClass(className.placeholder);
          },
          defaultValue: function() {
            var
              defaultValue = $module.data(metadata.defaultValue)
            ;
            if(defaultValue !== undefined) {
              module.debug('Restoring default value', defaultValue);
              if(defaultValue.length) {
                module.set.selected(defaultValue);
              }
              else {
                module.remove.activeItem();
                module.remove.selectedItem();
              }
            }
          }
        },

        save: {
          defaults: function() {
            module.save.defaultText();
            module.save.placeholderText();
            module.save.defaultValue();
          },
          defaultValue: function() {
            $module.data(metadata.defaultValue, module.get.value());
          },
          defaultText: function() {
            $module.data(metadata.defaultText, $text.text() );
          },
          placeholderText: function() {
            if($text.hasClass(className.placeholder)) {
              $module.data(metadata.placeholderText, $text.text());
            }
          }
        },

        clear: function() {
          module.set.placeholderText();
          module.clearValue();
          module.remove.activeItem();
          module.remove.selectedItem();
        },

        clearValue: function() {
          module.set.value('');
        },

        set: {
          filtered: function() {
            var
              isMultiple       = module.is.multiple(),
              isSearch         = module.is.searchSelection(),
              isSearchMultiple = (isMultiple && isSearch),
              searchValue      = (isSearch)
                ? $search.val()
                : '',
              hasSearchValue   = (typeof searchValue === 'string' && searchValue.length > 0),
              searchWidth      = (searchValue.length * settings.glyphWidth) + 'em',
              valueIsSet       = $input.val() != ''
            ;
            if(isMultiple && hasSearchValue) {
              module.verbose('Adjusting input width', searchWidth, settings.glyphWidth)
              $search.css('width', searchWidth);
            }
            if(hasSearchValue || (isSearchMultiple && valueIsSet)) {
              module.verbose('Hiding placeholder text');
              $text.addClass(className.filtered);
            }
            else if(!isMultiple || (isSearchMultiple && !valueIsSet)) {
              module.verbose('Showing placeholder text');
              $text.removeClass(className.filtered);
            }
          },
          placeholderText: function(text) {
            module.debug('Restoring placeholder text');
            text = text || $module.data(metadata.placeholderText);
            module.set.text(placeholderText);
            $text.addClass(className.placeholder);
          },
          tabbable: function() {
            if( module.has.search() ) {
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
          scrollPosition: function($item, forceScroll) {
            var
              edgeTolerance = 5,
              hasActive,
              offset,
              itemHeight,
              itemOffset,
              menuOffset,
              menuScroll,
              menuHeight,
              abovePage,
              belowPage
            ;

            $item       = $item || module.get.activeItem();
            hasActive   = ($item && $item.length > 0);
            forceScroll = (forceScroll !== undefined)
              ? forceScroll
              : false
            ;
            if($item && hasActive) {
              if(!$menu.hasClass(className.visible)) {
                $menu.addClass(className.loading);
              }
              menuHeight = $menu.height();
              itemHeight = $item.height();
              menuScroll = $menu.scrollTop();
              menuOffset = $menu.offset().top;
              itemOffset = $item.offset().top;
              offset     = menuScroll - menuOffset + itemOffset;
              belowPage  = menuScroll + menuHeight < (offset + edgeTolerance);
              abovePage  = ((offset - edgeTolerance) < menuScroll);
              module.debug('Scrolling to active item', offset);
              if(abovePage || belowPage || forceScroll) {
                $menu
                  .scrollTop(offset)
                  .removeClass(className.loading)
                ;
              }
            }
          },
          text: function(text) {
            if(settings.action !== 'select') {
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
            else if(settings.action == 'combo') {
              module.debug('Changing combo button text', text, $combo);
              if(settings.preserveHTML) {
                $combo.html(text);
              }
              else {
                $combo.text(text);
              }
            }
          },
          value: function(value, text, $selected) {
            var
              hasInput     = ($input.length > 0),
              currentValue = module.get.values()
            ;
            if($input.length > 0) {

              if( module.is.multiple() ) {

                // extend currently selected values
                value = [value];
                if($.isArray(currentValue)) {
                  value = currentValue.concat(value);
                  value = module.get.uniqueArray(value);
                }

                // set values
                if( $input.is('select') ) {
                  module.debug('Setting multiple <select> values', value, $input);
                }
                else {
                  value = value.join(settings.delimiter);
                  module.debug('Setting hidden input to delimited values', value, $input);
                }
              }
              if(value == currentValue) {
                module.verbose('Skipping value update already same value', value, currentValue);
                return;
              }
              module.debug('Updating input value', value, currentValue);
              $input
                .val(value)
                .trigger('change')
              ;
              settings.onChange.call(element, value, text, $selected);

            }
            else {
              module.verbose('Storing value in metadata', value, $input);
              if(value !== currentValue) {
                $module.data(metadata.value, value);
                settings.onChange.call(element, value, text, $selected);
              }
            }
          },
          active: function() {
            $module
              .addClass(className.active)
            ;
          },
          multiple: function() {
            $module.addClass(className.multiple);
          },
          visible: function() {
            $module.addClass(className.visible);
          },
          selected: function(value, $selectedItem) {
            var
              isMultiple    = module.is.multiple(),
              selectedText,
              selectedValue
            ;
            $selectedItem = $selectedItem || module.get.item(value);

            if($selectedItem) {
              module.debug('Setting selected menu item to', $selectedItem);
              if(!module.is.multiple()) {
                module.remove.activeItem();
              }
              module.remove.selectedItem();
              $selectedItem
                .each(function() {
                  var
                    $selected     = $(this),
                    shouldAnimate = (isMultiple && $selectedItem.length == 1)
                  ;
                  selectedText  = module.get.choiceText($selected);
                  selectedValue = module.get.choiceValue($selected, selectedText);
                  if(isMultiple) {
                    if(!$selected.hasClass(className.active)) {
                      module.add.label(selectedValue, selectedText, shouldAnimate);
                      module.set.value(selectedValue, selectedText, $selected);
                      $selected.addClass(className.active);
                      module.filterActive();
                    }
                    else {
                      module.remove.selected(selectedValue);
                    }
                  }
                  else {
                    module.set.value(selectedValue, selectedText, $selected);
                    module.set.text(selectedText);
                    $selected
                      .addClass(className.active)
                      .addClass(className.selected)
                    ;
                  }
                })
              ;
            }
          }
        },

        add: {
          label: function(value, text, shouldAnimate) {
            var
              $label = $('<a />')
                .addClass(className.label)
                .attr('data-value', value)
                .html(templates.label(value, text)),
              $next  = module.is.searchSelection()
                ? $search
                : $text
            ;
            if(settings.label.variation) {
              $label.addClass(settings.label.variation);
            }
            if(shouldAnimate == true) {
              module.debug('Animating in label', $label);
              $label
                .addClass(className.hidden)
                .insertBefore($next)
                .transition(settings.label.transition, settings.label.duration)
              ;
            }
            else {
              module.debug('Adding selection label', $label);
              $label
                .insertBefore($next)
              ;
            }
          }
        },

        remove: {
          active: function() {
            $module.removeClass(className.active);
          },
          activeLabel: function() {
            $module.find(selector.label).removeClass(className.active);
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
            module.verbose('Cleared search term');
            $search.val('');
          },
          selected: function(value) {
            var
              $selectedItem = module.get.item(value),
              $option,
              values        = $input.val(),
              selectedValue = module.get.choiceValue($selectedItem)
            ;
            if($selectedItem) {
              if( $input.is('select') ) {
                $input
                  .find('option[value="' + selectedValue + '"]')
                  .prop('selected', false)
                ;
              }
              else {
                values = module.remove.delimitedValue(selectedValue, values);
                $input
                  .val(values)
                  .trigger('change')
                ;
              }
              if(module.is.multiple()) {
                module.remove.label(selectedValue);
              }
              $selectedItem
                .removeClass(className.filtered)
                .removeClass(className.selected)
                .removeClass(className.active)
              ;
            }
          },
          selectedItem: function() {
            $item.removeClass(className.selected);
          },
          delimitedValue: function(removedValue, values) {
            if(typeof values != 'string') {
              return false;
            }
            values = values.split(settings.delimiter);
            values = $.grep(values, function(value){
              return (removedValue != value);
            });
            values = values.join(settings.delimiter);
            module.verbose('Removed value from delimited string', removedValue, values);
            return values;
          },
          label: function(value) {
            var
              $labels       = $module.find(selector.label),
              $removedLabel = $labels.filter('[data-value="' + value +'"]'),
              labelCount    = $labels.length,
              isLastLabel   = ($labels.index($removedLabel) + 1 == labelCount),
              isOnlyLabel   = (labelCount == 1),
              shouldAnimate = (isOnlyLabel || isLastLabel)
            ;
            if(shouldAnimate) {
              module.verbose('Animating and removing label', $removedLabel);
              $removedLabel
                .transition(settings.label.transition, settings.label.duration, function() {
                  $removedLabel.remove();
                })
              ;
            }
            else {
              module.verbose('Removing label', $removedLabel);
              $removedLabel.remove();
            }
          },
          labels: function($activeLabels) {
            $activeLabels = $activeLabels || $module.find(selector.label).filter('.' + className.active);
            module.verbose('Removing active labels', $activeLabels);
            $activeLabels
              .each(function(){
                module.remove.selected($(this).data('value'));
              })
            ;
          },
          tabbable: function() {
            if( module.has.search() ) {
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

        has: {
          search: function() {
            return ($search.length > 0);
          },
          input: function() {
            return ($input.length > 0);
          },
          menu: function() {
            return ($menu.length > 0);
          }
        },

        is: {
          active: function() {
            return $module.hasClass(className.active);
          },
          alreadySetup: function() {
            return ($module.is('select') && $module.parent(selector.dropdown).length > 0);
          },
          animating: function($subMenu) {
            return ($subMenu)
              ? $subMenu.transition && $subMenu.transition('is animating')
              : $menu.transition    && $menu.transition('is animating')
            ;
          },
          focused: function() {
            return (document.activeElement === $module[0]);
          },
          focusedOnSearch: function() {
            return (document.activeElement === $search[0]);
          },
          allFiltered: function() {
            return ($item.filter('.' + className.filtered).length === $item.length);
          },
          hidden: function($subMenu) {
            return ($subMenu)
              ? $subMenu.is(':hidden')
              : $menu.is(':hidden')
            ;
          },
          inObject: function(needle, object) {
            var
              found = false
            ;
            $.each(object, function(index, property) {
              if(property == needle) {
                found = true;
                return true;
              }
            });
            return found;
          },
          multiple: function() {
            return $module.hasClass(className.multiple);
          },
          selectMutation: function(mutations) {
            var
              selectChanged = false
            ;
            $.each(mutations, function(index, mutation) {
              if(mutation.target && $(mutation.target).is('select')) {
                selectChanged = true;
                return true;
              }
            });
            return selectChanged;
          },
          search: function() {
            return $module.hasClass(className.search);
          },
          searchSelection: function() {
            return ( module.has.search() && $search.closest(selector.menu).length == 0 );
          },
          selection: function() {
            return $module.hasClass(className.selection);
          },
          upward: function() {
            return $module.hasClass(className.upward);
          },
          visible: function($subMenu) {
            return ($subMenu)
              ? $subMenu.is(':visible')
              : $menu.is(':visible')
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
                }
            ;
            callback = $.isFunction(callback)
              ? callback
              : function(){}
            ;
            if(!module.is.multiple()) {
              module.set.scrollPosition(module.get.activeItem(), true);
            }
            module.verbose('Doing menu show animation', $currentMenu);
            if( module.is.hidden($currentMenu) || module.is.animating($currentMenu) ) {

              if(settings.transition == 'auto') {
                settings.transition = module.is.upward()
                  ? 'slide up'
                  : 'slide down'
                ;
                module.verbose('Automatically determining animation based on animation direction', settings.transition);
              }
              if(settings.transition == 'none') {
                console.log(settings.transition);
                start();
                $currentMenu.transition('show');
                callback.call(element);
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
                      callback.call(element);
                    }
                  })
                ;
              }
              else {
                module.error(error.noTransition, settings.transition);
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
            callback = $.isFunction(callback)
              ? callback
              : function(){}
            ;
            if( module.is.visible($currentMenu) || module.is.animating($currentMenu) ) {
              module.verbose('Doing menu hide animation', $currentMenu);

              if(settings.transition == 'auto') {
                settings.transition = module.is.upward()
                  ? 'slide up'
                  : 'slide down'
                ;
              }

              if(settings.transition == 'none') {
                start();
                $currentMenu.transition('hide');
                callback.call(element);
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
                      callback.call(element);
                    }
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

        escape: {
          regExp: function(text) {
            text =  String(text);
            return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
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
            module.performance.timer = setTimeout(module.performance.display, 500);
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
          instance.invoke('destroy');
        }
        module.initialize();
      }
    })
  ;
  return (returnedValue !== undefined)
    ? returnedValue
    : $allModules
  ;
};

$.fn.dropdown.settings = {

  debug          : false,
  verbose        : false,
  performance    : true,

  // what event should show menu
  on             : 'click',

  // action on item selection
  action         : 'activate',

  // add tabindex to element
  allowTab       : true,

  // show menu on focus
  showOnFocus    : true,

  // search anywhere in value
  fullTextSearch : false,

  // whether to convert blank <select> values to placeholder text
  placeholder: 'auto',

  // preserve html when selecting value
  preserveHTML   : true,

  // sort selection on init
  sortSelect     : false,

  // what to match against with search selection (both, text, or label)
  match: 'both',

  // allow elements with sub-menus to be selected
  allowCategorySelection : false,

  // delay before event
  delay : {
    hide   : 300,
    show   : 200,
    search : 50,
    touch  : 50
  },

  // force a value selection on search selection
  forceSelection : true,

  // menu transiton
  transition     : 'auto',
  duration       : 250,

  // widest glyph width in em (W is 1.0714 em) used to calculate multiselect input width
  glyphWidth     : 1.0714,

  // whether multiple select should allow user added values
  allowAdditions : true,

  // multi select delimiting key
  delimiter      : ',',

  // label settings on multi-select
  label: {
    transition : 'horizontal flip',
    duration   : 250,
    variation  : false
  },

  // whether multiple selects should filter active selections from menu
  filterActive : true,

  /* Callbacks */
  onLabelSelect : function($selectedLabels){},
  onNoResults   : function(searchTerm){},
  onChange      : function(value, text, $selected){},
  onShow        : function(){},
  onHide        : function(){},

  /* Component */
  name           : 'Dropdown',
  namespace      : 'dropdown',

  error   : {
    action       : 'You called a dropdown action that was not defined',
    alreadySetup : 'Once a select has been initialized behaviors must be called on the created ui dropdown',
    method       : 'The method you called is not defined.',
    noTransition : 'This module requires ui transitions <https://github.com/Semantic-Org/UI-Transition>'
  },

  metadata: {
    defaultText     : 'defaultText',
    defaultValue    : 'defaultValue',
    placeholderText : 'placeholderText',
    text            : 'text',
    value           : 'value'
  },

  selector : {
    dropdown : '.ui.dropdown',
    icon     : '> .dropdown.icon',
    input    : '> input[type="hidden"], > select',
    item     : '.item',
    label    : '> .label',
    remove   : '> .label > .delete.icon',
    menu     : '.menu',
    menuIcon : '.dropdown.icon',
    search   : 'input.search, .menu > .search > input',
    text     : '> .text:not(.icon)'
  },

  className : {
    active      : 'active',
    animating   : 'animating',
    disabled    : 'disabled',
    dropdown    : 'ui dropdown',
    filtered    : 'filtered',
    hidden      : 'hidden transition',
    label       : 'ui label',
    loading     : 'loading',
    menu        : 'menu',
    multiple    : 'multiple',
    placeholder : 'default',
    search      : 'search',
    selected    : 'selected',
    selection   : 'selection',
    upward      : 'upward',
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
    $.each(select.values, function(index, option) {
      html += '<div class="item" data-value="' + option.value + '">' + option.name + '</div>';
    });
    return html;
  },
  label: function(value, text) {
    return text + '<i class="delete icon"></i>';
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
    $.each(select.values, function(index, option) {
      html += '<div class="item" data-value="' + option.value + '">' + option.name + '</div>';
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
