/*  ******************************
  Semantic Module: Carousel
  Author: Jack Lukic
  Notes: First Commit May 28, 2013

  A carousel alternates between
  several pieces of content in sequence.

******************************  */

;(function ( $, window, document, undefined ) {

$.fn.carousel = function(parameters) {
  var
    $allModules     = $(this),

    settings        = $.extend(true, {}, $.fn.carousel.settings, parameters),

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
        $module     = $(this),
        $arrows     = $(settings.selector.arrows),
        $leftArrow  = $(settings.selector.leftArrow),
        $rightArrow = $(settings.selector.rightArrow),
        $content    = $(settings.selector.content),
        $navigation = $(settings.selector.navigation),
        $navItem    = $(settings.selector.navItem),

        selector    = $module.selector || '',
        element     = this,
        instance    = $module.data('module-' + settings.namespace),

        className   = settings.className,
        namespace   = settings.namespace,
        errors      = settings.errors,
        module
      ;

      module      = {

        initialize: function() {
          module.openingAnimation();
          module.marquee.autoAdvance();
          $leftArrow
            .on('click', module.marquee.left)
          ;
          $rightArrow
            .on('click', module.marquee.right)
          ;
          $navItem
            .on('click', module.marquee.change)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module for', $module);
          $module
            .off(eventNamespace)
          ;
        },

        left: function() {
          var
            $activeContent = $content.filter('.' + className.active),
            currentIndex   = $content.index($activeContent),
            imageCount     = $content.size(),
            newIndex       = (currentIndex - 1 != -1)
              ? (currentIndex - 1)
              : (imageCount - 1)
          ;
          $navItem
            .eq(newIndex)
              .trigger('click')
          ;
        },

        right: function() {
          var
            $activeContent = $content.filter('.' + className.active),
            currentIndex   = $content.index($activeContent),
            imageCount     = $content.size(),
            newIndex       = (currentIndex + 1 != imageCount)
              ? (currentIndex + 1)
              : 0
          ;
          $navItem
            .eq(newIndex)
              .trigger('click')
          ;
        },

        change: function() {
          var
            $selected      = $(this),
            selectedIndex  = $navItem.index($selected),
            $selectedImage = $content.eq(selectedIndex)
          ;
          module.marquee.autoAdvance();
          $selected
            .addClass('active')
            .siblings()
              .removeClass('active')
          ;
          $selectedImage
            .addClass('active animated fadeIn')
            .siblings('.' + className.active)
              .removeClass('animated fadeIn scaleIn')
              .animate({
                opacity: 0
              }, 500, function(){
                $(this)
                  .removeClass('active')
                  .removeAttr('style')
                ;
              })
          ;
        },

        autoAdvance: function() {
          clearInterval(module.timer);
          module.timer = setInterval(module.marquee.right, settings.duration);
        },

        setting: function(name, value) {
          if(value !== undefined) {
            if( $.isPlainObject(name) ) {
              module.verbose('Modifying settings object', name, value);
              $.extend(true, settings, name);
            }
            else {
              module.verbose('Modifying setting', name, value);
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
              module.verbose('Modifying internal property', name, value);
              $.extend(true, module, name);
            }
            else {
              module.verbose('Changing internal method to', value);
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
                'Arguments'      : message[1] || 'None',
                'Execution Time' : executionTime
              });
              clearTimeout(module.performance.timer);
              module.performance.timer = setTimeout(module.performance.display, 100);
            }
          },
          display: function() {
            var
              title              = settings.moduleName,
              caption            = settings.moduleName + ': ' + moduleSelector + '(' + $allModules.size() + ' elements)',
              totalExecutionTime = 0
            ;
            if(moduleSelector) {
              title += ' Performance (' + moduleSelector + ')';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                $.each(performance, function(index, data) {
                  totalExecutionTime += data['Execution Time'];
                });
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  totalExecutionTime += data['Execution Time'];
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.log('Total Execution Time:', totalExecutionTime +'ms');
              console.groupEnd();
              performance = [];
              time        = false;
            }
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

$.fn.carousel.settings = {

  name  : 'Carousel',
  namespace   : 'carousel',

  verbose     : true,
  debug       : true,
  performance : true,

  // delegated event context
  duration: 5000,

  errors     : {
    method   : 'The method you called is not defined.'
  },

  selector : {
    arrows     : '.arrow',
    leftArrow  : '.left.arrow',
    rightArrow : '.right.arrow',
    content    : '.content',
    navigation : '.navigation',
    navItem    : '.navigation .icon'
  },

  className : {
    active : 'active'
  }

};

})( jQuery, window , document );
