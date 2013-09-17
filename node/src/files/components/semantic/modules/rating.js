/*  ******************************
  Star Review
  Author: Jack Lukic
  Notes: First Commit Sep 04, 2012

  Simple rating module
******************************  */

;(function ($, window, document, undefined) {

$.fn.rating = function(parameters) {
  var
    $allModules     = $(this),
    moduleSelector  = $allModules.selector || '',

    settings        = $.extend(true, {}, $.fn.rating.settings, parameters),

    namespace       = settings.namespace,
    className       = settings.className,
    metadata        = settings.metadata,
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
        $icon    = $module.find(selector.icon),

        element  = this,
        instance = $module.data(moduleNamespace),
        module
      ;

      module = {

        initialize: function() {
          module.verbose('Initializing rating module');
          if(settings.interactive) {
            $icon
              .bind('mouseenter' + eventNamespace, module.event.mouseenter)
              .bind('mouseleave' + eventNamespace, module.event.mouseleave)
              .bind('click' + eventNamespace, module.event.click)
            ;
          }
          if(settings.initialRating) {
            module.debug('Setting initial rating');
            module.setRating(settings.initialRating);
          }
          if( $module.data(metadata.rating) ) {
            module.debug('Rating found in metadata');
            module.setRating( $module.data(metadata.rating) );
          }
          $module
            .addClass(className.active)
          ;
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Instantiating module', settings);
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          $module
            .removeData(moduleNamespace)
          ;
          $icon
            .off(eventNamespace)
          ;
        },

        setRating: function(rating) {
          var
            $activeIcon = $icon.eq(rating - 1)
          ;
          module.verbose('Setting current rating to', rating);
          $module
            .removeClass(className.hover)
          ;
          $icon
            .removeClass(className.hover)
          ;
          $activeIcon
            .nextAll()
              .removeClass(className.active)
          ;
          $activeIcon
            .addClass(className.active)
              .prevAll()
              .addClass(className.active)
          ;
          $.proxy(settings.onRate, element)();
        },

        event: {
          mouseenter: function() {
            var
              $activeIcon = $(this)
            ;
            $activeIcon
              .nextAll()
                .removeClass(className.hover)
            ;
            $module
              .addClass(className.hover)
            ;
            $activeIcon
              .addClass(className.hover)
                .prevAll()
                .addClass(className.hover)
            ;
          },
          mouseleave: function() {
            $module
              .removeClass(className.hover)
            ;
            $icon
              .removeClass(className.hover)
            ;
          },
          click: function() {
            var
              $activeIcon = $(this)
            ;
            module.setRating( $icon.index($activeIcon) + 1);
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
            if($allModules.size() > 1) {
              title += ' ' + '(' + $allModules.size() + ')';
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
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && instance !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( instance[value] ) && (depth != maxDepth) ) {
                instance = instance[value];
              }
              else if( $.isPlainObject( instance[camelCaseValue] ) && (depth != maxDepth) ) {
                instance = instance[camelCaseValue];
              }
              else if( instance[value] !== undefined ) {
                found = instance[value];
                return false;
              }
              else if( instance[camelCaseValue] !== undefined ) {
                found = instance[camelCaseValue];
                return false;
              }
              else {
                module.error(error.method);
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
          if($.isArray(invokedResponse)) {
            invokedResponse.push(response);
          }
          else if(typeof invokedResponse == 'string') {
            invokedResponse = [invokedResponse, response];
          }
          else if(response !== undefined) {
            invokedResponse = response;
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

  return (invokedResponse !== undefined)
    ? invokedResponse
    : this
  ;
};

$.fn.rating.settings = {

  name          : 'Rating',
  namespace     : 'rating',

  verbose     : true,
  debug       : true,
  performance : true,

  initialRating : 0,
  interactive   : true,
  onRate        : function(){},

  error       : {
    method : 'The method you called is not defined'
  },

  metadata: {
    rating: 'rating'
  },

  className : {
    active  : 'active',
    hover   : 'hover',
    loading : 'loading'
  },

  selector  : {
    icon : '.icon'
  }

};

})( jQuery, window , document );
