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
            module.set.active();
            if(!settings.overlay) {
              module.add.bodyCSS();
              module.set.pushed();
            }
          }
          else {
            module.debug('Sidebar is already visible');
          }
        },

        hide: function() {
          if(module.is.open()) {
            module.remove.active();
            if(!settings.overlay) {
              module.remove.bodyCSS();
              module.remove.pushed();
            }
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

        add: {
          bodyCSS: function() {
            var
              style      = '',
              moduleSize = 0,
              direction  = module.get.direction()
            ;
            if(module.is.vertical()) {
              moduleSize = $module.outerHeight();
              style = ''
                + '<style type="text/css" title="' + namespace + '">'
                + 'body.pushed {'
                + '  padding-top: ' + moduleSize + ' !important;'
                + '}'
                + '</style>'
              ;
            }
            else {
              moduleSize = $module.outerWidth();
              style = ''
                + '<style type="text/css" title="' + namespace + '">'
                + 'body.pushed {'
                + '  padding-' + direction + ': ' + moduleSize + 'px !important;'
                + '}'
                + '</style>'
              ;
            }
            $head.append(style);
            module.refresh();
            module.debug('Adding body css to head', $style);
            $style[0].disabled = false;
          }
        },

        remove: {
          bodyCSS: function() {
            module.debug('Removing body css styles', $style);
            $style.remove();
          },
          active: function() {
            $module.removeClass(className.active);
          },
          pushed: function() {
            $body.removeClass(className.pushed);
          }
        },

        set: {
          active: function() {
            $module.addClass(className.active);
          },
          pushed: function() {
            $body.addClass(className.pushed);
          }
        },

        get: {
          direction: function() {
            if($module.hasClass('top')) {
              return 'top';
            }
            else if($module.hasClass('right')) {
              return 'right';
            }
            else if($module.hasClass('bottom')) {
              return 'bottom';
            }
            else {
              return 'left';
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

  moduleName  : 'Sidebar',
  namespace   : 'sidebar',

  verbose     : true,
  debug       : true,
  performance : true,

  overlay     : false,

  side        : 'left',
  duration    : 500,

  onChange    : function(){},
  onShow      : function(){},
  onHide      : function(){},

  className: {
    active : 'active',
    pushed : 'pushed',
    top    : 'top'
  },

  error   : {
    method   : 'The method you called is not defined.',
    notFound : 'There were no elements that matched the specified selector'
  }

};

})( jQuery, window , document );