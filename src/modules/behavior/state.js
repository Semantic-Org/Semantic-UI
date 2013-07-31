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
    settings        = $.extend(true, {}, $.fn.state.settings, parameters),
    
    moduleSelector  = $allModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    eventNamespace  = '.' + settings.namespace,
    moduleNamespace = settings.namespace + '-module', 
    
    // shortcuts
    errors        = settings.errors,
    metadata      = settings.metadata,
    className     = settings.className,
    states        = settings.states,
    text          = settings.text,

    invokedResponse
  ;
  $allModules
    .each(function() {
      var
        $module       = $(this),
        
        element       = this,
        instance      = $module.data(moduleNamespace),

        module
      ;
      module = {

        initialize: function() {
          module.verbose('Initializing module');

          // allow module to guess desired state based on element
          if(settings.automatic) {
            module.add.defaults();
          }

          // bind events with delegated events
          if(settings.context && moduleSelector !== '') {
            if( module.allows('hover') ) {
              $(element, settings.context)
                .on(moduleSelector, 'mouseenter' + eventNamespace, module.hover.enable)
                .on(moduleSelector, 'mouseleave' + eventNamespace, module.hover.disable)
              ;
            }
            if( module.allows('pressed') ) {
              $(element, settings.context)
                .on(moduleSelector, 'mousedown' + eventNamespace, module.pressed.enable)
                .on(moduleSelector, 'mouseup'   + eventNamespace, module.pressed.disable)
              ;
            }
            if( module.allows('focus') ) {
              $(element, settings.context)
                .on(moduleSelector, 'focus' + eventNamespace, module.focus.enable)
                .on(moduleSelector, 'blur'  + eventNamespace, module.focus.disable)
              ;
            }
            $(settings.context)
              .on(moduleSelector, 'mouseenter' + eventNamespace, module.text.change)
              .on(moduleSelector, 'mouseleave'  + eventNamespace, module.text.reset)
              .on(moduleSelector, 'click'     + eventNamespace, module.toggle)
            ;

          }
          else {
            if( module.allows('hover') ) {
              $module
                .on('mouseenter' + eventNamespace, module.hover.enable)
                .on('mouseleave' + eventNamespace, module.hover.disable)
              ;
            }
            if( module.allows('pressed') ) {
              $module
                .on('mousedown' + eventNamespace, module.pressed.enable)
                .on('mouseup'   + eventNamespace, module.pressed.disable)
              ;
            }
            if( module.allows('focus') ) {
              $module
                .on('focus' + eventNamespace, module.focus.enable)
                .on('blur'  + eventNamespace, module.focus.disable)
              ;
            }
            $module
              .on('mouseenter' + eventNamespace, module.text.change)
              .on('mouseleave'  + eventNamespace, module.text.reset)
              .on('click'     + eventNamespace, module.toggle)
            ;
          }
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
          module.verbose('Destroying previous module', instance);
          $module
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        refresh: function() {
          module.verbose('Refreshing selector cache');
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

        allow: function(state) {
          module.debug('Now allowing state', state);
          states[state] = true;
        },
        disallow: function(state) {
          module.debug('No longer allowing', state);
          states[state] = false;
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
          $.proxy(settings.onChange, element)();
        },

        activate: function() {
          if( $.proxy(settings.activateTest, element)() ) {
            module.debug('Setting state to active');
            $module
              .addClass(className.active)
            ;
            module.text.update(text.active);
          }
          $.proxy(settings.onActivate, element)();
        },

        deactivate: function() {
          if($.proxy(settings.deactivateTest, element)() ) {
            module.debug('Setting state to inactive');
            $module
              .removeClass(className.active)
            ;
            module.text.update(text.inactive);
          }
          $.proxy(settings.onDeactivate, element)();
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
            module.debug('Flashing text message', text, duration);
            text     = text     || settings.text.flash;
            duration = duration || settings.flashDuration;
            module.text.update(text);
            setTimeout(function(){
              module.text.update(previousText);
            }, duration);
          },

          change: function() {
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
                  module.verbose('Changing text to enable text', text.enable);
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
            else {
              module.debug('Text is already sane, ignoring update', text);
            }
          }
        },
        setting: function(name, value) {
          module.debug('Changing setting', name, value);
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
          module.debug('Changing internal', name, value);
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
            time        = false;
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
                return true;
              }
              else if( instance[value] !== undefined ) {
                found = instance[value];
                return true;
              }
              module.error(errors.method);
              return false;
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

$.fn.state.settings = {

  // module info
  moduleName : 'State',

  // debug output
  debug      : true,

  // verbose debug output
  verbose    : true,

  // namespace for events
  namespace  : 'state',

  // debug data includes performance
  performance: true,

  // callback occurs on state change
  onActivate   : function() {},
  onDeactivate : function() {},
  onChange     : function() {},

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
    enable   : false,
    disable  : false
  }

};



})( jQuery, window , document );
