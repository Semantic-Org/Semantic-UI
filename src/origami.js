/*  ******************************
  Module
  Origami
  Author: Jack Lukic
  Created: Mar 28, 2013
  Last revision: Mar 2013

  Creates a cube which can be rotated

  Usage:

  $origami
    .origami()
  ;

  $origami
    .origami('flip.up')
  ;

******************************  */

;(function ( $, window, document, undefined ) {

$.fn.origami = function(parameters) {
  var
    $allModules     = $(this),

    settings        = $.extend(true, {}, $.fn.origami.settings, parameters),
    // make arguments available
    query           = arguments[0],
    passedArguments = [].slice.call(arguments, 1),
    invokedResponse
  ;
  $allModules
    .each(function() {
      var
        // selector cache
        $module            = $(this),
        $box               = $module.find(settings.selector.box),
        $side              = $module.find(settings.selector.side),

        $activeSide,
        $nextSide,

        // private variables
        selector           = $module.selector || '',
        element            = this,
        instance           = $module.data('module-' + settings.namespace),
        methodInvoked      = (typeof query == 'string'),

        endTransition      = 'transitionend msTransitionEnd oTransitionEnd',

        // shortcuts
        namespace          = settings.namespace,
        metadata           = settings.metadata,
        className          = settings.className,

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
          $box    = $(this).find(settings.selector.box);
          $side   = $(this).find(settings.selector.side);
        },

        repaint: function() {
          var 
            fakeAssignment = $module.get(0).offsetWidth
          ;
        },

        animate: function(propertyObject) {
          module.verbose('Animating box with properties', propertyObject);
          var
            callback = function() {
              module.reset();
              module.set.active();
            }
          ;
          if(settings.useCSS) {
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
            $box
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
            $box
              .animate(propertyObject, settings.duration, settings.easing, callback)
            ;
          }
        },

        reset: function() {
          module.verbose('Animating states reset');
          $module
            .removeClass(className.css)
            .removeClass(className.animating)
            .removeAttr('style')
          ;
          $box
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
            $module
              .css({
                width  : $nextSide.outerWidth(),
                height : $nextSide.outerHeight()
              })
            ;
          },

          nextSide: function(selector) {
            $nextSide = $module.find(selector);
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
          }
        },

        flip: {
          up: function() {
            module.debug('Flipping up', $nextSide);
            module.stage.above();
            module.animate( module.getTransform.up(), element);
          },
          down: function() {
            module.debug('Flipping down', $nextSide);
            module.stage.below();
            module.animate( module.getTransform.down(), element);
          },
          left: function() {
            module.debug('Flipping left', $nextSide);
            module.stage.left();
            module.animate(module.getTransform.left(), element);

          },
          right: function() {
            module.debug('Flipping right', $nextSide);
            module.stage.right();
            module.animate(module.getTransform.right(), element);
          }
        },

        /* standard module */
        setting: function(name, value) {
          if(value === undefined) {
            return settings[name];
          }
          settings[name] = value;
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

$.fn.origami.settings = {

  // module info
  moduleName : 'Origami Module',

  // debug output
  debug      : true,
  // verbose debug output
  verbose    : true,

  namespace  : 'origami',

  // callback occurs on side change
  onChange   : function() {},

  useCSS     : true,
  duration   : 1000,
  easing     : 'easeInOutQuad',

  errors: {
    api        : 'You tried to switch to a side that does not exist.',
    method     : 'The method you called is not defined'
  },

  metadata : {

  },

  className   : {
    css       : 'css',
    animating : 'animating',
    hidden    : 'hidden',
    active    : 'active'
  },

  selector    : {
    box  : '.box',
    side : '.side'
  }

};



})( jQuery, window , document );
