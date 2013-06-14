/*  ******************************
  Module
  State
  Change text based on state context
  Hover/Pressed/Active/Inactive
  Author: Jack Lukic
  Last revision: May 2012

  State text module is used to apply text to a given node
  depending on the elements "state"

  State is either defined as "active" or "inactive" depending
  on the returned value of a test function

  Usage:

  $button
    .state({
      states: {
        active: true
      },
      text: {
        inactive: 'Follow',
        active  : 'Following',
        enable  : 'Add',
        disable : 'Remove'
      }
    })
  ;

  "Follow", turns to "Add" on hover, then "Following" on active
  and finally "Remove" on active hover

  This plugin works in correlation to API module and will, by default,
  use deffered object accept/reject to determine state.

******************************  */

;(function ( $, window, document, undefined ) {

$.fn.state = function(parameters) {
  var

    $allModules     = $(this),
    
    // make available in scope
    selector        = $allModules.selector || '',
    query           = arguments[0],
    passedArguments = [].slice.call(arguments, 1),

    // set up performance tracking
    time            = new Date().getTime(),
    performance     = [],

    invokedResponse
  ;
  $allModules
    .each(function() {
      var
        $module       = $(this),
        
        settings      = $.extend(true, {}, $.fn.state.settings, parameters),
        
        element       = this,
        instance      = $module.data('module-' + settings.namespace),
        methodInvoked = (typeof query == 'string'),
        
        // shortcuts
        namespace     = settings.namespace,
        metadata      = settings.metadata,
        className     = settings.className,
        states        = settings.states,
        text          = settings.text,

        module
      ;
      module = {

        initialize: function() {
          module.verbose('Initializing module', element);

          // allow module to guess desired state based on element
          if(settings.automatic) {
            module.add.defaults();
          }

          // bind events with delegated events
          if(settings.context && selector !== '') {
            if( module.allows('hover') ) {
              $(element, settings.context)
                .on(selector, 'mouseenter.' + namespace, module.hover.enable)
                .on(selector, 'mouseleave.' + namespace, module.hover.disable)
              ;
            }
            if( module.allows('pressed') ) {
              $(element, settings.context)
                .on(selector, 'mousedown.' + namespace, module.pressed.enable)
                .on(selector, 'mouseup.'   + namespace, module.pressed.disable)
              ;
            }
            if( module.allows('focus') ) {
              $(element, settings.context)
                .on(selector, 'focus.' + namespace, module.focus.enable)
                .on(selector, 'blur.'  + namespace, module.focus.disable)
              ;
            }
            $(settings.context)
              .on(selector, 'mouseenter.' + namespace, module.text.change)
              .on(selector, 'mouseleave.'  + namespace, module.text.reset)
              .on(selector, 'click.'     + namespace, module.toggle)
            ;

          }
          else {
            if( module.allows('hover') ) {
              $module
                .on('mouseenter.' + namespace, module.hover.enable)
                .on('mouseleave.' + namespace, module.hover.disable)
              ;
            }
            if( module.allows('pressed') ) {
              $module
                .on('mousedown.' + namespace, module.pressed.enable)
                .on('mouseup.'   + namespace, module.pressed.disable)
              ;
            }
            if( module.allows('focus') ) {
              $module
                .on('focus.' + namespace, module.focus.enable)
                .on('blur.'  + namespace, module.focus.disable)
              ;
            }
            $module
              .on('mouseenter.' + namespace, module.text.change)
              .on('mouseleave.'  + namespace, module.text.reset)
              .on('click.'     + namespace, module.toggle)
            ;
          }
          $module
            .data('module-' + namespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module', element);
          $module
            .off('.' + namespace)
          ;
        },

        refresh: function() {
          module.verbose('Refreshing selector cache', element);
          $module = $(element);
        },

        add: {
          defaults: function() {
            var
              userStates = parameters && $.isPlainObject(parameters.states)
                ? parameters.states
                : {}
            ;
            $.each(settings.defaults, function(type, typeStates) {
              if( module.is[type] !== undefined && module.is[type]() ) {
                module.verbose('Adding default states', type, element);
                $.extend(settings.states, typeStates, userStates);
              }
            });
          }
        },

        is: {

          active: function() {
            return $module.hasClass(className.active);
          },
          loading: function() {
            return $module.hasClass(className.loading);
          },
          inactive: function() {
            return !( $module.hasClass(className.active) );
          },

          enabled: function() {
            return !( $module.is(settings.filter.active) );
          },
          disabled: function() {
            return ( $module.is(settings.filter.active) );
          },
          textEnabled: function() {
            return !( $module.is(settings.filter.text) );
          },

          // definitions for automatic type detection
          button: function() {
            return $module.is('.button:not(a, .submit)');
          },
          input: function() {
            return $module.is('input');
          }
        },

        allows: function(state) {
          return states[state] || false;
        },
        enable: function(state) {
          if(module.allows(state)) {
            $module.addClass( className[state] );
          }
        },
        disable: function(state) {
          if(module.allows(state)) {
            $module.removeClass( className[state] );
          }
        },
        textFor: function(state) {
          return text[state] || false;
        },

        focus : {
          enable: function() {
            $module.addClass(className.focus);
          },
          disable: function() {
            $module.removeClass(className.focus);
          }
        },

        hover : {
          enable: function() {
            $module.addClass(className.hover);
          },
          disable: function() {
            $module.removeClass(className.hover);
          }
        },

        pressed : {
          enable: function() {
            $module
              .addClass(className.pressed)
              .one('mouseleave', module.pressed.disable)
            ;
          },
          disable: function() {
            $module.removeClass(className.pressed);
          }
        },

        // determines method for state activation
        toggle: function() {
          var
            apiRequest = $module.data(metadata.promise)
          ;
          if( module.allows('active') && module.is.enabled() ) {
            module.refresh();
            if(apiRequest !== undefined) {
              module.listenTo(apiRequest);
            }
            else {
              module.change();
            }
          }
        },

        listenTo: function(apiRequest) {
          module.debug('API request detected, waiting for state signal', apiRequest);
          if(apiRequest) {
            if(text.loading) {
              module.text.update(text.loading);
            }
            $.when(apiRequest)
              .then(function() {
                if(apiRequest.state() == 'resolved') {
                  module.debug('API request succeeded');
                  settings.activateTest   = function(){ return true; };
                  settings.deactivateTest = function(){ return true; };
                }
                else {
                  module.debug('API request failed');
                  settings.activateTest   = function(){ return false; };
                  settings.deactivateTest = function(){ return false; };
                }
                module.change();
              })
            ;
          }
          // xhr exists but set to false, beforeSend killed the xhr
          else {
            settings.activateTest   = function(){ return false; };
            settings.deactivateTest = function(){ return false; };
          }
        },

        // checks whether active/inactive state can be given
        change: function() {
          module.debug('Determining state change direction');
          // inactive to active change
          if( module.is.inactive() ) {
            module.activate();
          }
          else {
            module.deactivate();
          }
          if(settings.sync) {
            module.sync();
          }
          $.proxy(settings.onChange, $module)();
        },

        activate: function() {
          if( $.proxy(settings.activateTest, element)() ) {
            module.debug('Setting state to active');
            $module
              .addClass(className.active)
            ;
            module.text.update(text.active);
            $.proxy(settings.onActivate, $module)();
          }
        },

        deactivate: function() {
          if($.proxy(settings.deactivateTest, element)() ) {
            module.debug('Setting state to inactive');
            $module
              .removeClass(className.active)
            ;
            module.text.update(text.inactive);
            $.proxy(settings.onDeactivate, $module)();
          }
        },

        sync: function() {
          module.verbose('Syncing other buttons to current state');
          if( module.is.active() ) {
            $allModules
              .not($module)
                .state('activate');
          }
          else {
            $allModules
              .not($module)
                .state('deactivate')
            ;
          }
        },

        text: {

          // finds text node to update
          get: function() {
            return (settings.selector.text)
              ? $module.find(settings.selector.text).text()
              : $module.html()
            ;
          },

          flash: function(text, duration) {
            var
              previousText = module.text.get()
            ;
            text     = text     || settings.text.flash;
            duration = duration || settings.flashDuration;
            module.text.update(text);
            setTimeout(function(){
              module.text.update(previousText);
            }, duration);
          },

          change: function() {
            module.verbose('Checking if text should be changed');
            if( module.is.textEnabled() ) {
              if( module.is.active() ) {
                if(text.hover) {
                  module.verbose('Changing text to hover text', text.hover);
                  module.text.update(text.hover);
                }
                else if(text.disable) {
                  module.verbose('Changing text to disable text', text.disable);
                  module.text.update(text.disable);
                }
              }
              else {
                if(text.hover) {
                  module.verbose('Changing text to hover text', text.disable);
                  module.text.update(text.hover);
                }
                else if(text.enable){
                  module.verbose('Changing text to enable text', text.disable);
                  module.text.update(text.enable);
                }
              }
            }
          },

          // on mouseout sets text to previous value
          reset : function() {
            var
              activeText   = text.active   || $module.data(metadata.storedText),
              inactiveText = text.inactive || $module.data(metadata.storedText)
            ;
            if( module.is.textEnabled() ) {
              if( module.is.active() && activeText) {
                module.verbose('Resetting active text', activeText);
                module.text.update(activeText);
              }
              else if(inactiveText) {
                module.verbose('Resetting inactive text', activeText);
                module.text.update(inactiveText);
              }
            }
          },

          update: function(text) {
            var
              currentText = module.text.get()
            ;
            if(text && text !== currentText) {
              module.debug('Updating text', text);
              if(settings.selector.text) {
                $module
                  .data(metadata.storedText, text)
                  .find(settings.selector.text)
                    .text(text)
                ;
              }
              else {
                $module
                  .data(metadata.storedText, text)
                  .html(text)
                ;
              }
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
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              executionTime = currentTime - time;
              time          = currentTime;
              performance.push({ 
                'Name'           : message, 
                'Execution Time' : executionTime
              });
              clearTimeout(module.performance.timer);
              module.performance.timer = setTimeout(module.performance.display, 100);
            }
          },
          display: function() {
            var
              title   = settings.moduleName + ' Performance (' + selector + ')',
              caption = settings.moduleName + ': ' + selector + '(' + $allModules.size() + ' elements)'
            ;
            if(console.group !== undefined && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ':' + data['Execution Time']);
                });
              }
              console.groupEnd();
              performance = [];
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            module.performance.log(arguments[0]);
            module.verbose = Function.prototype.bind.call(console.info, console, settings.moduleName + ':');
          }
        },
        debug: function() {
          if(settings.debug) {
            module.performance.log(arguments[0]);
            module.debug = Function.prototype.bind.call(console.info, console, settings.moduleName + ':');
          }
        },
        error: function() {
          if(console.log !== undefined) {
            module.error = Function.prototype.bind.call(console.log, console, settings.moduleName + ':');
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
        invokedResponse = module.invoke(query, this, passedArguments);
      }
      // otherwise initialize
      else {
        if(instance !== undefined) {
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

$.fn.state.settings = {

  // module info
  moduleName : 'State Module',

  // debug output
  debug      : true,

  // verbose debug output
  verbose    : false,

  // namespace for events
  namespace  : 'state',

  // debug data includes performance
  performance: true,

  // callback occurs on state change
  onChange     : function() {},
  onActivate   : function() {},
  onDeactivate : function() {},

  // state test functions
  activateTest   : function() { return true; },
  deactivateTest : function() { return true; },

  // whether to automatically map default states
  automatic     : true,

  // activate / deactivate changes all elements instantiated at same time
  sync          : false,
  
  // default flash text duration, used for temporarily changing text of an element
  flashDuration : 3000,

  // selector filter
  filter     : {
    text   : '.loading, .disabled',
    active : '.disabled'
  },

  context    : false,
  // errors
  errors: {
    method : 'The method you called is not defined.'
  },

  // metadata
  metadata: {
    promise    : 'promise',
    storedText : 'stored-text'
  },

  // change class on state
  className: {
    focus   : 'focus',
    hover   : 'hover',
    pressed : 'down',
    active  : 'active',
    loading : 'loading'
  },

  selector: {
    // selector for text node
    text: false
  },

  defaults : {
    input: {
      hover   : true,
      focus   : true,
      pressed : true,
      loading : false,
      active  : false
    },
    button: {
      hover   : true,
      focus   : false,
      pressed : true,
      active  : false,
      loading : true
    }
  },

  states     : {
    flash   : false,
    hover   : true,
    focus   : true,
    pressed : true,
    loading : false,
    active  : false
  },

  text     : {
    flash    : false,
    hover    : false,
    active   : false,
    inactive : false,
    loading  : false,
    enable   : false,
    disable  : false
  }

};



})( jQuery, window , document );
