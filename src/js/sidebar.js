/*  ******************************
   Semantic Module: Dropdown
   Author: Jack Lukic
   Notes: First Commit May 25, 2013

******************************  */

;(function ( $, window, document, undefined ) {

$.fn.sidebar = function(parameters) {
  var
    $allModules     = $(this),

    settings        = ( $.isPlainObject(parameters) )
      ? $.extend(true, {}, $.fn.sidebar.settings, parameters)
      : $.fn.sidebar.settings,

    selector        = settings.selector,
    className       = settings.className,
    namespace       = settings.namespace,
    error           = settings.error,

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
        $module  = $(this),

        $body    = $('body'),
        $head    = $('head'),
        $style   = $('style[title=' + namespace + ']'),

        element  = this,
        instance = $module.data(moduleNamespace),
        module
      ;

      module      = {

        initialize: function() {
          module.debug('Initializing sidebar', $module);
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
          module.verbose('Destroying previous module for', $module);
          $module
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        refresh: function() {
          module.verbose('Refreshing selector cache');
          $style  = $('style[title=' + namespace + ']');
        },

        attach: {

          events: function(selector, event) {
            var
              $toggle = $(selector)
            ;
            event = $.isFunction(module[event])
              ? module[event]
              : module.toggle
            ;
            if($toggle.size() > 0) {
              module.debug('Attaching sidebar events to element', selector, event);
              $toggle
                .off(eventNamespace)
                .on('click' + eventNamespace, event)
              ;
            }
            else {
              module.error(error.notFound);
            }
          }

        },

        show: function() {
          module.debug('Showing sidebar');
          if(module.is.closed()) {
            if(!settings.overlay) {
              module.pushPage();
            }
            module.set.active();
          }
          else {
            module.debug('Sidebar is already visible');
          }
        },

        hide: function() {
          if(module.is.open()) {
            if(!settings.overlay) {
              module.pullPage();
              module.remove.pushed();
            }
            module.remove.active();
          }
        },

        toggle: function() {
          if(module.is.closed()) {
            module.show();
          }
          else {
            module.hide();
          }
        },

        pushPage: function() {
          var
            direction = module.get.direction(),
            distance  = (module.is.vertical())
              ? $module.outerHeight()
              : $module.outerWidth()
          ;
          if(settings.useCSS) {
            module.debug('Using CSS to animate body');
            module.add.bodyCSS(direction, distance);
            module.set.pushed();
          }
          else {
            module.animatePage(direction, distance, module.set.pushed);
          }
        },

        pullPage: function() {
          var
            direction = module.get.direction()
          ;
          if(settings.useCSS) {
            module.debug('Resetting body position css');
            module.remove.bodyCSS();
          }
          else {
            module.debug('Resetting body position using javascript');
            module.animatePage(direction, 0);
          }
          module.remove.pushed();
        },

        animatePage: function(direction, distance) {
          var
            animateSettings = {}
          ;
          animateSettings['padding-' + direction] = distance;
          module.debug('Using javascript to animate body', animateSettings);
          $body
            .animate(animateSettings, settings.duration, module.set.pushed)
          ;
        },

        add: {
          bodyCSS: function(direction, distance) {
            var
              style
            ;
            if(direction !== className.bottom) {
              style = ''
                + '<style title="' + namespace + '">'
                + 'body.pushed {'
                + '  margin-' + direction + ': ' + distance + 'px !important;'
                + '}'
                + '</style>'
              ;
            }
            $head.append(style);
            module.debug('Adding body css to head', $style);
          }
        },

        remove: {
          bodyCSS: function() {
            module.debug('Removing body css styles', $style);
            module.refresh();
            $style.remove();
          },
          active: function() {
            $module.removeClass(className.active);
          },
          pushed: function() {
            module.verbose('Removing body push state', module.get.direction());
            $body
              .removeClass(className[ module.get.direction() ])
              .removeClass(className.pushed)
            ;
          }
        },

        set: {
          active: function() {
            $module.addClass(className.active);
          },
          pushed: function() {
            module.verbose('Adding body push state', module.get.direction());
            $body
              .addClass(className[ module.get.direction() ])
              .addClass(className.pushed)
            ;
          }
        },

        get: {
          direction: function() {
            if($module.hasClass(className.top)) {
              return className.top;
            }
            else if($module.hasClass(className.right)) {
              return className.right;
            }
            else if($module.hasClass(className.bottom)) {
              return className.bottom;
            }
            else {
              return className.left;
            }
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
          }
        },

        is: {
          open: function() {
            return $module.is(':animated') || $module.hasClass(className.active);
          },
          closed: function() {
            return !module.is.open();
          },
          vertical: function() {
            return $module.hasClass(className.top);
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

$.fn.sidebar.settings = {

  name   : 'Sidebar',
  namespace    : 'sidebar',

  verbose      : true,
  debug        : true,
  performance  : true,

  useCSS       : true,
  overlay      : false,
  duration     : 300,

  side         : 'left',

  onChange     : function(){},
  onShow       : function(){},
  onHide       : function(){},

  className: {
    active : 'active',
    pushed : 'pushed',
    top    : 'top',
    left   : 'left',
    right  : 'right',
    bottom : 'bottom'
  },

  error   : {
    method   : 'The method you called is not defined.',
    notFound : 'There were no elements that matched the specified selector'
  }

};

})( jQuery, window , document );