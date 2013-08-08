/*  ******************************
  Star Review
  Author: Jack Lukic
  Notes: First Commit Sep 04, 2012

  Simple rating module
******************************  */

;(function ($, window, document, undefined) {

$.fn.starReview = function(parameters) {
  var
    $allModules     = $(this),
    moduleSelector  = $allModules.selector || '',
    
    settings        = $.extend(true, {}, $.fn.starReview.settings, parameters),
    
    namespace       = settings.namespace,
    className       = settings.className,
    selector        = settings.selector,
    error           = settings.error,
    
    eventNamespace  = '.' + namespace,
    moduleNamespace = 'module-' + namespace,
    
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
        $module  = $(this),
        $star    = $module.find(selector.star),
        
        element  = this,
        instance = $module.data(moduleNamespace),
        module
      ;

      module = {

        initialize: function() {
          if(settings.rateable) {
            // expandable with states
            if($.fn.state !== undefined) {
              $module
                .state()
              ;
              $star
                .state()
              ;
            }
            $star
              .bind('mouseenter' + eventNamespace, module.event.mouseenter)
              .bind('mouseleave' + eventNamespace, module.event.mouseleave)
              .bind('click' + eventNamespace, module.event.click)
            ;
          }
          $module
            .addClass(className.initialize)
          ;
          module.instantiate();
        },

        instantiate: function() {
          $module
            .data(moduleNamespace, module)
          ;
        },

        setRating: function(rating) {
          var
            $activeStar = $star.eq(rating - 1)
          ;
          $module
            .removeClass(className.hover)
          ;
          $star
            .removeClass(className.hover)
          ;
          $activeStar
            .nextAll()
              .removeClass(className.active)
          ;
          $activeStar
            .addClass(className.active)
              .prevAll()
              .addClass(className.active)
          ;
          $.proxy(settings.onRate, $module)();
        },

        event: {
          mouseenter: function() {
            var
              $activeStar = $(this)
            ;
            $activeStar
              .nextAll()
                .removeClass(className.hover)
            ;
            $module
              .addClass(className.hover)
            ;
            $activeStar
              .addClass(className.hover)
                .prevAll()
                .addClass(className.hover)
            ;
          },
          mouseleave: function() {
            $star
              .removeClass(className.hover)
            ;
          },
          click: function() {
            var
              $activeStar = $(this)
            ;
            module.setRating( $star.index($activeStar) + 1);
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
              module.verbose = Function.prototype.bind.call(console.info, console, settings.moduleName + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.moduleName + ':');
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

  return (invokedResponse !== undefined)
    ? invokedResponse
    : this
  ;
};

$.fn.starReview.settings = {
  
  moduleName     : 'Star',
  namespace      : 'star',
  
  rateable       : true,
  onRate         : function(){},

  error: {
    method     : 'The method you called is not defined'
  },
  
  className : {
    initialize : 'initialize',
    loading    : 'loading',
    active     : 'active',
    hover      : 'hover',
    down       : 'down'
  },

  selector  : {
    star : 'i'
  }

};

})( jQuery, window , document );
