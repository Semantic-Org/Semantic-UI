/*  ******************************
  Star Review
  Author: Jack Lukic
  Notes: First Commit Sep 04, 2012

  Simple rating module
******************************  */

;(function ($, window, document, undefined) {

  $.fn.starReview = function(parameters) {
    var
      settings = $.extend(true, {}, $.fn.starReview.settings, parameters),
      // hoist arguments
      moduleArguments = arguments || false
    ;
    $(this)
      .each(function() {
        var
          $module        = $(this),
          $star          = $module.find(settings.selector.star),
          
          className      = settings.className,
          namespace      = settings.namespace,
          instance       = $module.data('module'),
          module
        ;

        module = {

          settings: settings,

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
                .bind('mouseenter.' + namespace, module.event.mouseenter)
                .bind('mouseleave.' + namespace, module.event.mouseleave)
                .bind('click.' + namespace, module.event.click)
              ;
            }
            $module
              .addClass(className.initialize)
              .data('module', module)
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

          // handle error logging
          error: function(errorMessage) {
            console.warn(settings.moduleName + ': ' + errorMessage);
          },

          // allows for dot notation method calls
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
            return ( $.isFunction( method ) )
              ? method.apply(context, methodArguments)
              : false
            ;
          }

        };

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

  $.fn.starReview.settings = {
    
    moduleName     : 'Star',
    namespace      : 'star',
    
    rateable       : true,
    onRate         : function(){},
    
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
