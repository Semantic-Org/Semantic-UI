/*  ******************************
  Accordion
  Author: Jack Lukic
  Notes: First Commit July 19, 2012

  Simple accordion design
******************************  */

;(function ($, window, document, undefined) {

$.fn.accordion = function(parameters) {
  var
    $allModules     = $(this),
    
    settings        = ( $.isPlainObject(parameters) )
      ? $.extend(true, {}, $.fn.accordion.settings, parameters)
      : $.fn.accordion.settings,

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
        $module   = $(this),
        $title    = $module.find(settings.selector.title),
        $icon     = $module.find(settings.selector.icon),
        $content  = $module.find(settings.selector.content),

        element       = this,
        instance      = $module.data(moduleNamespace),
        
        className     = settings.className,
        namespace     = settings.namespace,
        
        errors        = settings.errors,
        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing accordion with bound events', $module);
          // initializing
          $title
            .on('click' + eventNamespace, module.event.click)
          ;
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.debug('Destroying previous accordion for', $module);
          $module
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        event: {

          click: function() {
            var
              $activeTitle  = $(this),
              activeIndex   = $title.index($activeTitle),
              contentIsOpen = $activeTitle.hasClass(className.active)
            ;
            module.verbose('Accordion title clicked', $activeTitle);
            if(contentIsOpen) {
              if(settings.collapsible) {
                module.close(activeIndex);
              }
              else {
                module.debug('Cannot close accordion content collapsing is disabled');
              }
            }
            else {
              module.open(activeIndex);
            }
          },

          resetStyle: function() {
            $(this)
              .removeAttr('style')
              .children()
                .removeAttr('style')
            ;
          }

        },

        open: function(index) {
          var
            $activeTitle     = $title.eq(index),
            $activeContent   = $activeTitle.next($content),
            $previousTitle   = $title.filter('.' + className.active),
            $previousContent = $previousTitle.next($title),
            contentIsOpen    =  ($previousTitle.size() > 0)
          ;
          if( !$activeContent.is(':animated') ) {
            module.debug('Opening accordion content', $activeTitle);
            if(settings.exclusive && contentIsOpen) {
              $previousTitle
                .removeClass(className.active)
              ;
              $previousContent
                .stop()
                .children()
                  .animate({
                    opacity: 0
                  }, settings.speed, module.event.resetStyle)
                  .end()
                .slideUp(settings.speed , settings.easing, function() {
                  $previousContent
                    .removeClass(className.active)
                    .removeAttr('style')
                    .children()
                      .removeAttr('style')
                  ;
                })
              ;
            }
            $activeTitle
              .addClass(className.active)
            ;
            $activeContent
              .stop()
              .children()
                .removeAttr('style')
                .end()
              .slideDown(settings.speed, settings.easing, function() {
                $activeContent
                  .addClass(className.active)
                  .removeAttr('style')
                ;
                $.proxy(settings.onOpen, $activeContent)();
                $.proxy(settings.onChange, $activeContent)();
              })
            ;
          }
        },

        close: function(index) {
          var
            $activeTitle   = $title.eq(index),
            $activeContent = $activeTitle.next($content)
          ;
          module.debug('Closing accordion content', $activeTitle);
          $activeTitle
            .removeClass(className.active)
          ;
          $activeContent
            .removeClass(className.active)
            .show()
            .stop()
            .children()
              .animate({
                opacity: 0
              }, settings.speed, module.event.resetStyle)
              .end()
            .slideUp(settings.speed, settings.easing, function(){
              $activeContent
                .removeAttr('style')
              ;
              $.proxy(settings.onClose, $activeContent)();
              $.proxy(settings.onChange, $activeContent)();
            })
          ;
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
              previousTime  = time || currentTime,
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

$.fn.accordion.settings = {
  moduleName  : 'Accordion',

  debug       : true,
  verbose     : true,
  performance : true,
  
  exclusive   : true,
  collapsible : true,
  
  onOpen      : function(){},
  onClose     : function(){},
  onChange    : function(){},

  errors: {
    method    : 'The method you called is not defined'
  },

  className   : {
    active    : 'active',
    hover     : 'hover'
  },

  selector    : {
    title     : '.title',
    icon      : '.icon',
    content   : '.content'
  },

  speed       : 500,
  easing      : 'easeInOutQuint'

};

})( jQuery, window , document );
