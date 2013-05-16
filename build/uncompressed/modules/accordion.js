/*  ******************************
  Accordion
  Author: Jack Lukic
  Notes: First Commit July 19, 2012

  Simple accordion design
******************************  */

;(function ($, window, document, undefined) {

  $.fn.accordion = function(parameters) {
    var
      settings = $.extend(true, {}, $.fn.accordion.settings, parameters),
      // hoist arguments
      moduleArguments = arguments || false
    ;
    $(this)
      .each(function() {

        var
          $module   = $(this),
          $title    = $module.find(settings.selector.title),
          $icon     = $module.find(settings.selector.icon),
          $content  = $module.find(settings.selector.content),
          
          instance  = $module.data('module'),
          className = settings.className,
          module
        ;

        module = {

          initialize: function() {
            // initializing
            $title
              .on('click', module.change)
            ;
            $module
              .data('module', module)
            ;
          },
            
          change: function() {
            var
              $activeTitle   = $(this),
              $activeContent = $activeTitle.next($content),
              contentIsOpen  = $activeTitle.hasClass(className.active)
            ;
            if(contentIsOpen) {
              if(settings.collapsible) {
                $.proxy(module.close, $activeTitle)();
              }
            }
            else {
              $.proxy(module.open, $activeTitle)();
            }
          },

          open: function() {
            var
              $activeTitle    = $(this),
              $activeContent  = $activeTitle.next($content),
              $currentTitle   = $title.filter('.' + className.active),
              $currentContent = $currentTitle.next($title)
            ;
            if(settings.exclusive && $currentTitle.size() > 0) {

              $currentTitle
                .removeClass('active')
              ;
              $currentContent
                .stop()
                .slideUp(settings.speed , settings.easing, function() {
                  $(this)
                    .removeClass('active')
                    .removeAttr('style')
                  ;
                })
              ;
            }
            $activeTitle
              .addClass(className.active)
            ;
            $activeContent
              .hide()
              .addClass(className.active)
              .stop()
              .slideDown(settings.speed, settings.easing, function() {
                $(this)
                  .removeAttr('style')
                ;
              })
            ;
          },

          close: function() {
            var
              $activeTitle   = $(this),
              $activeContent = $activeTitle.next($content)
            ;
            $activeTitle
              .removeClass(className.active)
            ;
            $activeContent
              .removeClass(className.active)
              .show()
              .stop()
              .slideUp(settings.speed, settings.easing, function(){
                $(this)
                  .removeAttr('style')
                ;
              })
            ;
          },

          debug: function(message) {
            if(settings.debug) {
              console.info(settings.moduleName + ': ' + message);
            }
          },
          error: function(errorMessage) {
            console.warn(settings.moduleName + ': ' + errorMessage);
          },
          invoke: function(methodName, context, methodArguments) {
            var
              method
            ;
            methodArguments = methodArguments || Array.prototype.slice.call( arguments, 2 );
            if(typeof methodName == 'string' && instance !== undefined) {
              methodName = methodName.split('.');
              $.each(methodName, function(index, name) {
                if( $.isPlainObject( instance[name] ) ) {
                  instance = instance[name];
                  return true;
                }
                else if( $.isFunction( instance[name] ) ) {
                  method = instance[name];
                  return true;
                }
                module.error(settings.errors.method);
                return false;
              });
            }
            if ( $.isFunction( method ) ) {
              return method.apply(context, methodArguments);
            }
            // return retrieved variable or chain
            return method;
          }

        };

        // calling a method
        if(instance !== undefined && moduleArguments) {
          // simpler than invoke realizing to invoke itself (and losing scope due prototype.call()
          if(moduleArguments[0] == 'invoke') {
            moduleArguments = Array.prototype.slice.call( moduleArguments, 1 );
          }
          return module.invoke(moduleArguments[0], this, Array.prototype.slice.call( moduleArguments, 1 ) );
        }
        // initializing
        module.initialize();

      })
    ;
    return this;
  };

  $.fn.accordion.settings = {
    moduleName  : 'Accordion',
    debug       : false,
    
    exclusive   : true,
    collapsible : true,

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
