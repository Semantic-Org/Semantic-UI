/*  *******************************************************************************************

  Shape - A 3D Animation Plugin
  Version 0.1
  (built using Semantic module spec)

  Author        : Jack Lukic
  Last revision : April 2013

*********************************************************************************************  */

;(function ( $, window, document, undefined ) {

$.fn.shape = function(parameters) {
  var
    $allModules     = $(this),

    settings        = $.extend(true, {}, $.fn.shape.settings, parameters),
    // make arguments available
    query           = arguments[0],
    passedArguments = [].slice.call(arguments, 1),
    invokedResponse
  ;
  $allModules
    .each(function() {
      var
        // selector cache
        $module       = $(this),
        $shape        = $module.find(settings.selector.shape),
        $side         = $module.find(settings.selector.side),
        
        $activeSide,
        $nextSide,
        
        selector      = $module.selector || '',
        element       = this,
        instance      = $module.data('module-' + settings.namespace),
        methodInvoked = (typeof query == 'string'),
        
        // private
        endTransition = 'transitionend msTransitionEnd oTransitionEnd',
        
        // internal aliases
        namespace     = settings.namespace,
        error         = settings.error,
        className     = settings.className,

        module
      ;

      module = {

        initialize: function() {
          module.verbose('Initializing module for', element);
          module.set.defaultSide();
          $module
            .data('module-' + namespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module for', element);
          $module
            .off('.' + namespace)
          ;
        },

        refresh: function() {
          module.verbose('Refreshing selector cache for', element);
          $module = $(element);
          $shape  = $(this).find(settings.selector.shape);
          $side   = $(this).find(settings.selector.side);
        },

        repaint: function() {
          module.verbose('Forcing repaint event');
          var 
            fakeAssignment = $shape.get(0).offsetWidth
          ;
        },

        animate: function(propertyObject, callback) {
          if( $module.hasClass(className.animating) ) {
            module.debug('Animation in progress, queing animation');
            $shape
              .one(endTransition, function() {
                console.verbose('Executing queued animation');
                module.animate(propertyObject, callback);
              })
            ;
          }
          else {
            module.verbose('Animating box with properties', propertyObject);
            callback = callback || function() {
                module.reset();
                module.set.active();
                $.proxy(settings.onChange, $nextSide)();
            };
            if(settings.useCSS || 1) {
              module.verbose('Using CSS transitions to animate');
              $module
                .addClass(className.animating)
              ;
              module.set.stageSize();
              module.repaint();
              $module
                .addClass(className.css)
              ;
              $activeSide
                .addClass(className.hidden)
              ;
              $shape
                .css(propertyObject)
                .one(endTransition, callback)
              ;
            }
            else {
              // not yet supported until .animate() is extended to allow RotateX/Y
              module.verbose('Using javascript to animate');
              $module
                .addClass(className.animating)
                .removeClass(className.css)
              ;
              module.set.stageSize();
              module.repaint();
              $activeSide
                .animate({
                  opacity: 0
                }, settings.duration, settings.easing)
              ;
              $shape
                .animate(propertyObject, settings.duration, settings.easing, callback)
              ;
            }
          }
        },

        reset: function() {
          module.verbose('Animating states reset');
          $module
            .removeClass(className.css)
            .removeClass(className.animating)
            .removeAttr('style')
          ;
          $shape
            .removeAttr('style')
          ;
          $side
            .removeAttr('style')
            .removeClass(className.hidden)
          ;
          $nextSide
            .removeClass(className.animating)
            .removeAttr('style')
          ;
        },

        get: {

          nextSide: function() {
            return ( $activeSide.next(settings.selector.side).size() > 0 )
              ? $activeSide.next(settings.selector.side)
              : $module.find(settings.selector.side).first()
            ;
          }

        },

        set: {

          defaultSide: function() {
            $activeSide = $module.find('.' + settings.className.active);
            $nextSide   = ( $activeSide.next(settings.selector.side).size() > 0 )
              ? $activeSide.next(settings.selector.side)
              : $module.find(settings.selector.side).first()
            ;
            module.verbose('Active side set to', $activeSide);
            module.verbose('Next side set to', $nextSide);
          },

          stageSize: function() {
            var
              stage = {
                width  : $nextSide.outerWidth(),
                height : $nextSide.outerHeight()
              }
            ;
            module.verbose('Resizing stage to fit new content', stage);
            $module
              .css({
                width  : stage.width,
                height : stage.height
              })
            ;
          },

          nextSide: function(selector) {
            $nextSide = $module.find(selector);
            if($nextSide.size() === 0) {
              module.error(error.side);
            }
            module.verbose('Next side manually set to', $nextSide);
          },

          active: function() {
            module.verbose('Setting new side to active', $nextSide);
            $side
              .removeClass(className.active)
            ;
            $nextSide
              .addClass(className.active)
            ;
            module.set.defaultSide();
          }
        },

        flip: {

          up: function() {
            module.debug('Flipping up', $nextSide);
            module.stage.above();
            module.animate( module.getTransform.up() );
          },

          down: function() {
            module.debug('Flipping down', $nextSide);
            module.stage.below();
            module.animate( module.getTransform.down() );
          },

          left: function() {
            module.debug('Flipping left', $nextSide);
            module.stage.left();
            module.animate(module.getTransform.left() );
          },

          right: function() {
            module.debug('Flipping right', $nextSide);
            module.stage.right();
            module.animate(module.getTransform.right() );
          },

          over: function() {
            module.debug('Flipping over', $nextSide);
            module.stage.behind();
            module.animate(module.getTransform.behind() );
          }

        },

        getTransform: {

          up: function() {
            var
              translate = {
                y: -(($activeSide.outerHeight() - $nextSide.outerHeight()) / 2),
                z: -($activeSide.outerHeight() / 2)
              }
            ;
            return {
              transform: 'translateY(' + translate.y + 'px) translateZ('+ translate.z + 'px) rotateX(-90deg)'
            };
          },

          down: function() {
            var
              translate = {
                y: -(($activeSide.outerHeight() - $nextSide.outerHeight()) / 2),
                z: -($activeSide.outerHeight() / 2)
              }
            ;
            return {
              transform: 'translateY(' + translate.y + 'px) translateZ('+ translate.z + 'px) rotateX(90deg)'
            };
          },

          left: function() {
            var
              translate = {
                x : -(($activeSide.outerWidth() - $nextSide.outerWidth()) / 2),
                z : -($activeSide.outerWidth() / 2)
              }
            ;
            return {
              transform: 'translateX(' + translate.x + 'px) translateZ(' + translate.z + 'px) rotateY(90deg)'
            };
          },

          right: function() {
            var
              translate = {
                x : -(($activeSide.outerWidth() - $nextSide.outerWidth()) / 2),
                z : -($activeSide.outerWidth() / 2)
              }
            ;
            return {
              transform: 'translateX(' + translate.x + 'px) translateZ(' + translate.z + 'px) rotateY(-90deg)'
            };
          },

          behind: function() {
            var
              translate = {
                x : -(($activeSide.outerWidth() - $nextSide.outerWidth()) / 2)
              }
            ;
            return {
              transform: 'translateX(' + translate.x + 'px) rotateY(180deg)'
            };
          }

        },

        stage: {
          
          above: function() {
            var
              box = {
                origin : (($activeSide.outerHeight() - $nextSide.outerHeight()) / 2),
                depth  : {
                  active : ($nextSide.outerHeight() / 2),
                  next   : ($activeSide.outerHeight() / 2)
                }
              }
            ;
            module.verbose('Setting the initial animation position as above', $nextSide, box);
            $activeSide
              .css({
                'transform' : 'rotateY(0deg) translateZ(' + box.depth.active + 'px)'
              })
            ;
            $nextSide
              .addClass(className.animating)
              .css({
                'display'   : 'block',
                'top'       : box.origin + 'px',
                'transform' : 'rotateX(90deg) translateZ(' + box.depth.next + 'px)'
              })
            ;
          },

          below: function() {
            var
              box = {
                origin : (($activeSide.outerHeight() - $nextSide.outerHeight()) / 2),
                depth  : {
                  active : ($nextSide.outerHeight() / 2),
                  next   : ($activeSide.outerHeight() / 2)
                }
              }
            ;
            module.verbose('Setting the initial animation position as below', $nextSide, box);
            $activeSide
              .css({
                'transform' : 'rotateY(0deg) translateZ(' + box.depth.active + 'px)'
              })
            ;
            $nextSide
              .addClass(className.animating)
              .css({
                'display'   : 'block',
                'top'       : box.origin + 'px',
                'transform' : 'rotateX(-90deg) translateZ(' + box.depth.next + 'px)'
              })
            ;
          },

          left: function() {
            var
              box = {
                origin : ( ( $activeSide.outerWidth() - $nextSide.outerWidth() ) / 2),
                depth  : {
                  active : ($nextSide.outerWidth() / 2),
                  next   : ($activeSide.outerWidth() / 2)
                }
              }
            ;
            module.verbose('Setting the initial animation position as left', $nextSide, box);
            $activeSide
              .css({
                'transform' : 'rotateY(0deg) translateZ(' + box.depth.active + 'px)'
              })
            ;
            $nextSide
              .addClass(className.animating)
              .css({
                'display'   : 'block',
                'left'      : box.origin + 'px',
                'transform' : 'rotateY(-90deg) translateZ(' + box.depth.next + 'px)'
              })
            ;
          },

          right: function() {
            var
              box = {
                origin : ( ( $activeSide.outerWidth() - $nextSide.outerWidth() ) / 2),
                depth  : {
                  active : ($nextSide.outerWidth() / 2),
                  next   : ($activeSide.outerWidth() / 2)
                }
              }
            ;
            module.verbose('Setting the initial animation position as left', $nextSide, box);
            $activeSide
              .css({
                'transform' : 'rotateY(0deg) translateZ(' + box.depth.active + 'px)'
              })
            ;
            $nextSide
              .addClass(className.animating)
              .css({
                'display'   : 'block',
                'left'      : box.origin + 'px',
                'transform' : 'rotateY(90deg) translateZ(' + box.depth.next + 'px)'
              })
            ;
          },

          behind: function() {
            var
              box = {
                origin : ( ( $activeSide.outerWidth() - $nextSide.outerWidth() ) / 2),
                depth  : {
                  active : ($nextSide.outerWidth() / 2),
                  next   : ($activeSide.outerWidth() / 2)
                }
              }
            ;
            module.verbose('Setting the initial animation position as behind', $nextSide, box);
            $activeSide
              .css({
                'transform' : 'rotateY(0deg)'
              })
            ;
            $nextSide
              .addClass(className.animating)
              .css({
                'display'   : 'block',
                'left'      : box.origin + 'px',
                'transform' : 'rotateY(-180deg)'
              })
            ;
          }
        },

        /* standard module */
        setting: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value === undefined) {
            return settings[name];
          }
          else {
            settings[name] = value;
          }
        },

        verbose: function() {
          if(settings.verbose) {
            module.debug.apply(this, arguments);
          }
        },

        debug: function() {
          var
            output    = [],
            message   = settings.moduleName + ': ' + arguments[0],
            variables = [].slice.call( arguments, 1 ),
            log       = console.info || console.log || function(){}
          ;
          log = Function.prototype.bind.call(log, console);
          if(settings.debug) {
            output.push(message);
            log.apply(console, output.concat(variables) );
          }
        },

        error: function() {
          var
            output       = [],
            errorMessage = settings.moduleName + ': ' + arguments[0],
            variables    = [].slice.call( arguments, 1 ),
            log          = console.warn || console.log || function(){}
          ;
          log = Function.prototype.bind.call(log, console);
          if(settings.debug) {
            output.push(errorMessage);
            output.concat(variables);
            log.apply(console, output.concat(variables) );
          }
        },

        invoke: function(query, context, passedArguments) {
          var
            maxDepth,
            found
          ;
          passedArguments = passedArguments || [].slice.call( arguments, 2 );
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
              module.error(settings.errors.method);
              return false;
            });
          }
          if ( $.isFunction( found ) ) {
            return found.apply(context, passedArguments);
          }
          // return retrieved variable or chain
          return found;
        }
      };

      // check for invoking internal method
      if(methodInvoked) {
        invokedResponse = module.invoke(query, this, passedArguments);
      }
      // otherwise initialize
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      } 
    })
  ;
  // chain or return queried method
  return (invokedResponse !== undefined)
    ? invokedResponse
    : this
  ;
};

$.fn.shape.settings = {

  // module info
  moduleName : 'Shape Module',
  
  // debug content outputted to console
  debug      : true,
  
  // verbose debug output
  verbose    : true,

  // event namespace
  namespace  : 'shape',

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
    side   : 'You tried to switch to a side that does not exist.',
    method : 'The method you called is not defined'
  },

  // classnames used
  className   : {
    css       : 'css',
    animating : 'animating',
    hidden    : 'hidden',
    active    : 'active'
  },

  // selectors used
  selector    : {
    shape : '.shape',
    side  : '.side'
  }

};


})( jQuery, window , document );
