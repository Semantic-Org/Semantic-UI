/*  ******************************
  Semantic Module: Checkbox
  Author: Jack Lukic
  Notes: First Commit MAy 25, 2013

  Simple plug-in which maintains the state for ui dropdown

******************************  */

;(function ( $, window, document, undefined ) {

$.fn.dropdown = function(parameters) {
  var
    $allModules     = $(this),
    $document       = $(document),
    
    settings        = ( $.isPlainObject(parameters) )
      ? $.extend(true, {}, $.fn.dropdown.settings, parameters)
      : $.fn.dropdown.settings,
        
    className       = settings.className,
    metadata        = settings.metadata,
    namespace       = settings.namespace,
    animation       = settings.animation,
    selector        = settings.selector,
    errors          = settings.errors,
    
    eventNamespace  = '.' + namespace,
    moduleNamespace = 'module-' + namespace,
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
        $module       = $(this),
        $menu         = $(this).find(selector.menu),
        $item         = $(this).find(selector.item),
        $text         = $(this).find(selector.text),
        $input        = $(this).find(selector.input),
        
        isTouchDevice = ('ontouchstart' in document.documentElement),
        
        element       = this,
        instance      = $module.data(moduleNamespace),
        module
      ;

      module      = {

        initialize: function() {
          module.debug('Initializing dropdown with bound events', $module);
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
          if(settings.action == 'form') {
            module.set.selected();
          }
          $item
            .on(module.get.selectEvent() + eventNamespace, module.event.item.click)
          ;
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module for', $module);
          $module
            .off(namespace)
            .removeData(moduleNamespace)
          ;
        },

        event: {

          stopPropagation: function(event) {
            event.stopPropagation();
          },

          test: {
            toggle: function(event) {
              module.intent.test(event, module.toggle);
              event.stopPropagation();
            },
            hide: function(event) {
              module.intent.test(event, module.hide);
              event.stopPropagation();
            }
          },

          item: {

            click: function (event) {
              var
                $choice = $(this),
                text    = $choice.data(metadata.text)  || $choice.text(),
                value   = $choice.data(metadata.value) || text
              ;
              module.verbose('Adding active state to selected item');
              $item
                .removeClass(className.active)
              ;
              $choice
                .addClass(className.active)
              ;
              module.action.determine(text, value);
              $.proxy(settings.onChange, $module.get())(value, text);
              event.stopPropagation();
            }

          },

          resetStyle: function() {
            $(this).removeAttr('style');
          }

        },

        intent: {

          test: function(event, callback) {
            module.debug('Determining whether event occurred in dropdown', event.target);
            callback = callback || function(){};
            if( $(event.target).closest($menu).size() === 0 ) {
              module.verbose('Triggering event', callback);
              callback();
            }
            else {
              module.verbose('Event occurred in dropdown, canceling callback');
            }
          },

          bind: function() {
            module.verbose('Binding hide intent event to document');
            $document
              .on(module.get.selectEvent(), module.event.test.hide)
            ;
          },

          unbind: function() {
            module.verbose('Removing hide intent event from document');
            $document
              .off(module.get.selectEvent())
            ;
          }

        },

        action: {

          determine: function(text, value) {
            if( $.isFunction( module.action[settings.action] ) ) {
              module.verbose('Triggering preset action', settings.action);
              module.action[ settings.action ](text, value);
            }
            else if( $.isFunction(settings.action) ) {
              module.verbose('Triggering user action', settings.action);
              settings.action(text, value);
            }
            else {
              module.error(errors.action);
            }
          },

          none: function() {},

          hide: function() {
            module.hide();
          },

          changeText: function(text, value) {
            module.set.text(text);
            module.hide();
          },

          form: function(text, value) {
            module.set.text(text);
            module.set.value(value);
            module.hide();
          }

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

        is: {
          visible: function() {
            return $menu.is(':visible');
          },
          hidden: function() {
            return $menu.is(':not(:visible)');
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
          show: function() {
            module.verbose('Doing menu showing animation');
            if(animation.show == 'none') {
              $menu
                .show()
              ;
            }
            else if(animation.show == 'fade') {
              $menu
                .hide()
                .clearQueue()
                .fadeIn(150, module.event.resetStyle)
              ;
            }
            else if(animation.show == 'slide') {
              $menu
                .hide()
                .clearQueue()
                .children()
                  .clearQueue()
                  .css('opacity', 0)
                  .delay(50)
                  .animate({
                    opacity : 1
                  }, 200, 'easeOutQuad', module.event.resetStyle)
                  .end()
                .slideDown(100, 'easeOutQuad', module.event.resetStyle)
              ;
            }
            else {
              module.error(errors.animation);
            }
          },
          hide: function() {
            module.verbose('Doing menu hiding animation');
            if(animation.hide == 'none') {
              $menu
                .hide()
              ;
            }
            else if(animation.hide == 'fade') {
              $menu
                .show()
                .clearQueue()
                .fadeOut(150, module.event.resetStyle)
              ;
            }
            else if(animation.hide == 'slide') {
              $menu
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
                .slideUp(100, 'easeOutQuad', module.event.resetStyle)
              ;
            }
            else {
              module.error(errors.animation);
            }
          }
        },

        show: function() {
          module.debug('Checking if dropdown can show');
          if( !module.is.visible() ) {
            module.hideOthers();
            $module
              .addClass(className.visible)
            ;
            module.animate.show();
            if( module.can.click() ) {
              module.intent.bind();
            }
            $.proxy(settings.onShow, $module.get() )();
          }
        },

        hide: function() {
          if( !module.is.hidden() ) {
            module.debug('Hiding dropdown');
            $module
              .removeClass(className.visible)
            ;
            if( module.can.click() ) {
              module.intent.unbind();
            }
            module.animate.hide();
            $.proxy(settings.onHide, $module.get() )();
          }
        },

        delay: {
          show: function() {
            module.verbose('Delaying show event to ensure user intent');
            clearTimeout(module.graceTimer);
            module.graceTimer = setTimeout(module.show, settings.delay.show);
          },
          hide: function() {
            module.verbose('Delaying hide event to ensure user intent');
            clearTimeout(module.graceTimer);
            module.graceTimer = setTimeout(module.hide, settings.delay.hide);
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
              module.debug = Function.prototype.bind.call(console.info, console, settings.moduleName + ':');
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.moduleName + ':');
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.log, console, settings.moduleName + ':');
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
              title = settings.moduleName + ':',
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
                module.error(errors.method);
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
        invokedResponse = module.invoke(query);
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

  moduleName  : 'Dropdown',
  namespace   : 'dropdown',
  
  verbose     : true,
  debug       : true,
  performance : true,
  
  on          : 'click',
  action      : 'hide',

  delay: {
    show: 50,
    hide: 300
  },
  
  animation   : {
    show: 'slide',
    hide: 'slide'
  },
  
  onChange : function(){},
  onShow   : function(){},
  onHide   : function(){},
  
  errors   : {
    action    : 'You called a dropdown action that was not defined',
    method    : 'The method you called is not defined.',
    animation : 'The requested animation was not found'
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