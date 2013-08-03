/*  ******************************
  Semantic Module: Transition
  Author: Jack Lukic
  Notes: First Commit March 25, 2013

  A module for controlling css animations

******************************  */

;(function ( $, window, document, undefined ) {

$.fn.transition = function() {
  var
    $allModules     = $(this),
    moduleSelector  = $allModules.selector || '',
    
    time            = new Date().getTime(),
    performance     = [],
    
    moduleArguments = arguments,
    query           = moduleArguments[0],
    queryArguments  = [].slice.call(arguments, 1),
    methodInvoked   = (typeof query == 'string'),

    requestAnimationFrame = window.requestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.msRequestAnimationFrame
      || function(callback) { setTimeout(callback, 0); },

    invokedResponse
  ;
  $allModules
    .each(function() {
      var
        $module  = $(this),
        element  = this,

        // set at run time
        settings,
        instance,

        error,
        className,
        metadata,
        transitionEnd,

        namespace,
        moduleNamespace,
        module
      ;

      module = {

        initialize: function() {
          // get settings
          settings        = module.get.settings.apply(element, moduleArguments);
          module.verbose('Converted arguments into settings object', settings);

          // set shortcuts
          error           = settings.error;
          className       = settings.className;
          namespace       = settings.namespace;
          metadata        = settings.metadata;
          moduleNamespace = 'module-' + namespace;

          transitionEnd   = module.get.transitionEvent();

          instance = $module.data(moduleNamespace);

          if(instance === undefined) {
            module.instantiate();
          }
          if(methodInvoked) {
            invokedResponse = module.invoke(query);
          }
          // no internal method was found matching query or query not made
          if(!methodInvoked || invokedResponse === false) {
            module.animate();
          }
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, instance)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module for', element);
          $module
            .removeData(moduleNamespace)
          ;
        },

        repaint: function(fakeAssignment) {
          module.verbose('Forcing repaint event');
          fakeAssignment = element.offsetWidth;
        },

        set: {

          animating: function() {
            $module.addClass(className.animating);
          },

          loop: function() {
            $module
              .addClass(className.loop)
            ;
          },

          duration: function(duration) {
            duration = duration || settings.duration;
            module.verbose('Setting animation duration', duration);
            $module
              .css({
                '-webkit-animation-duration': duration,
                '-moz-animation-duration': duration,
                '-ms-animation-duration': duration,
                '-o-animation-duration': duration,
                'animation-duration': duration
              })
            ;
          }
        },

        remove: {

          animating: function() {
            $module.removeClass(className.animating);
          }

        },

        get: {

          settings: function(animation, duration, complete) {
            // single settings object
            if($.isPlainObject(animation) === undefined) {
              return $.extend(true, {}, $.fn.transition.settings, animation);
            }
            // all arguments provided
            else if(typeof complete == 'function') {
              return $.extend(true, {}, $.fn.transition.settings, {
                animation : animation,
                complete  : complete,
                duration  : duration
              });
            }
            // only duration provided
            else if(typeof duration == 'string') {
              return $.extend(true, {}, $.fn.transition.settings, {
                animation : animation,
                duration  : duration
              });
            }
            // duration is actually settings object
            else if(typeof duration == 'object') {
              return $.extend(true, {}, $.fn.transition.settings, duration, {
                animation : animation
              });
            }
            // duration is actually callback
            else if(typeof duration == 'function') {
              return $.extend(true, {}, $.fn.transition.settings, {
                animation : animation,
                complete  : duration
              });
            }
            // only animation provided
            else {
              return $.extend(true, {}, $.fn.transition.settings, {
                animation : animation
              });
            }
            return $.fn.transition.settings;
          },

          transitionEvent: function() {
            var
              element     = document.createElement('element'),
              animations  = {
                'animation'       :'animationend',
                'OAnimation'      :'oAnimationEnd',
                'MozAnimation'    :'mozAnimationEnd',
                'WebkitAnimation' :'webkitAnimationEnd'
              },
              animation
            ;
            for(animation in animations){
              if( element.style[animation] !== undefined ){
                module.verbose('Determining animation end event', animations[animation]);
                return animations[animation];
              }
            }
            return false;
          }

        },

        can: {
          animate: function(animation) {
            var
              $fake = $('<div />')
            ;
            animation = animation || settings.animation;
            $fake
              .addClass(className.transition)
              .addClass(animation)
            ;
            return $fake.css('animationName') !== 'none';
          }
        },

        is: {
          animating: function() {
            return $module.hasClass(className.animating);
          }
        },

        hide: function() {
          module.verbose('Hiding element');
          $module
            .addClass(className.transition)
            .addClass(className.hidden)
          ;
        },
        show: function() {
          module.verbose('Showing element');
          $module
            .removeClass(className.hidden)
          ;
        },

        start: function() {
          module.verbose('Starting animation');
          $module.removeClass(className.disabled);
        },

        stop: function() {
          module.debug('Stopping animation');
          $module.addClass(className.disabled);
        },

        toggle: function() {
          module.debug('Toggling play status');
          $module.toggleClass(className.disabled);
        },

        animate: function(overrideSettings) {
          settings = overrideSettings || settings;
          if(!module.can.animate()) {
            module.error(error.noAnimation, settings.animation);
            return false;
          }
          if(module.is.animating()) {
            module.queue(settings.animation);
            return false;
          }
          module.set.duration();
          module.show();
          module.originalClass = $module.attr('class');
          module.repaint();
          module.set.animating();
          $module
            .addClass(className.transition)
            .addClass(settings.animation)
            .one(transitionEnd, module.complete)
          ;
          module.debug('Beginning animation', settings.animation, $module.attr('class'));
        },

        queue: function(animation) {
          module.debug('Queueing animation of', animation);
          $module
            .one(transitionEnd, function() {
              module.animate.apply(this, settings);
            })
          ;
        },

        reset: function() {
          module.verbose('Resetting original class', module.originalClass);
          $module
            .removeAttr('style')
            .attr('class', module.originalClass)
          ;
        },

        complete: function () {
          module.verbose('CSS animation complete', settings.animation);
          if($module.hasClass(className.outward)) {
            module.reset();
            module.hide();
          }
          else if($module.hasClass(className.inward)) {
            module.reset();
            module.show();
          }
          else {
            module.reset();
          }
          module.remove.animating();
          module.repaint();
          settings.complete();
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
      module.initialize();
    })
  ;
  return (invokedResponse)
    ? invokedResponse
    : this
  ;
};

$.fn.transition.settings = {

  // module info
  moduleName   : 'Transition',
  
  // debug content outputted to console
  debug        : true,
  
  // verbose debug output
  verbose      : true,
  
  // performance data output
  performance  : true,
  
  // event namespace
  namespace    : 'transition',
  
  // animation complete event
  complete     : function() {},
  
  // animation duration (useful only with future js animations)
  animation    : 'fade in',
  duration     : '1s',
  
  className    : {
    animating  : 'animating',
    disabled   : 'disabled',
    hidden     : 'hidden',
    inward     : 'in',
    looping    : 'looping',
    outward    : 'out',
    transition : 'ui transition'
  },

  // possible errors
  error: {
    noAnimation : 'There is no css animation matching the one you specified.',
    method      : 'The method you called is not defined'
  }

};


})( jQuery, window , document );
