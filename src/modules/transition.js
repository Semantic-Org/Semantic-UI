/*  ******************************
  Semantic Module: Shape
  Author: Jack Lukic
  Notes: First Commit March 25, 2013

  An experimental plugin for manipulating 3D transitions on a 2D plane

******************************  */

;(function ( $, window, document, undefined ) {

$.fn.transition = function(parameters) {
  var
    $allModules     = $(this),
    
    settings        = $.extend(true, {}, $.fn.transition.settings, parameters),
    
    // define namespaces for modules
    eventNamespace  = '.' + settings.namespace,
    moduleNamespace = 'module-' + settings.namespace,
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
        // selector cache
        $module  = $(this),
        
        // standard module
        element  = this,
        instance = $module.data(moduleNamespace),
        
        // internal aliases
        errors   = settings.error,
        
        module
      ;

      module = {

        initialize: function() {
          instance = module;
          $module
            .data(moduleNamespace, instance)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module for', element);
          $module
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
        },

        repaint: function(fakeAssignment) {
          module.verbose('Forcing repaint event');
          fakeAssignment = element.offsetWidth;
        },

        get: {

          settings: function(animation, duration, easing, complete) {
            // single settings object
            if($.isObject(animation) === undefined) {
              return animation;
            }
            // duration is actually settings object
            else if(typeof duration == 'object') {
              settings = $.extend({} , settings, duration);
            }
            // easing is actually complete callback
            else if(typeof easing == 'function') {
              settings = $.extend({} , settings, {
                duration: duration,
                complete: easing
              });
            }
            // easing is actually settings
            else if(typeof easing == 'object') {
              settings = $.extend(true, {} , settings, {duration: duration}, easing);
            }
            //
            else {
              settings = $.extend({} , settings, {
                duration : duration,
                easing   : easing,
                complete : complete
              });
            }
            return settings;
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
            return false;
          }

        },

        can: {
          transition: function(transition) {
            var
              $fake = $('<div />')
            ;
            $fake.addClass(transition);
            return $fake.css('transitionDuration') !== '0s';
          }
        },

        is: {
          animating: function() {
            return module.animating;
          }
        },

        animate: function(settings) {
          module.verbose('Converting arguments into settings object', arguments);
          settings = module.get.settings(arguments);

          module.animating = true;
          if( !module.can.transition() ) {
            module.error(errors.noAnimation);
            return false;
          }
          module.debug('Beginning animation');
          $(this)
            .one( module.get.transitionEvent(), function() {
              module.reset(settings.transition);
            })
          ;
        },

        reset: function (transition) {
          $(this)
            .removeClass(transition)
          ;
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
          module.error = Function.prototype.bind.call(console.error, console, settings.moduleName + ':');
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
            searchInstance = instance,
            maxDepth,
            found
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && searchInstance !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              if( $.isPlainObject( searchInstance[value] ) && (depth != maxDepth) ) {
                searchInstance = searchInstance[value];
                return true;
              }
              else if( searchInstance[value] !== undefined ) {
                found = searchInstance[value];
                return true;
              }
              module.error(error.method);
              return false;
            });
          }
          if ( $.isFunction( found ) ) {
            instance.verbose('Executing invoked function', found);
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

$.fn.transition.settings = {

  // module info
  moduleName : 'Shape Module',
  
  // debug content outputted to console
  debug      : false,
  
  // verbose debug output
  verbose    : false,

  // performance data output
  performance: false,

  // event namespace
  namespace  : 'transition',

  // callback occurs on side change
  beforeChange : function() {},
  onChange     : function() {},

  // use css animation (currently only true is supported)
  useCSS     : true,

  // animation duration (useful only with future js animations)
  duration   : 1000,
  easing     : 'easeInOutQuad',

  // possible errors
  error: {
    noAnimation : 'There is no css animation matching the one you specified.',
    method      : 'The method you called is not defined'
  },

  // selectors used
  selector    : {
    sides : '.sides',
    side  : '.side'
  }

};


})( jQuery, window , document );
