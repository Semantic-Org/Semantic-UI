/*  ******************************
  Semantic Module: Shape
  Author: Jack Lukic
  Notes: First Commit March 25, 2013

  An experimental plugin for manipulating 3D shapes on a 2D plane

******************************  */

;(function ( $, window, document, undefined ) {

$.fn.shape = function(parameters) {
  var
    $allModules     = $(this),
    
    settings        = $.extend(true, {}, $.fn.shape.settings, parameters),
    
    // define namespaces for modules
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
        // selector cache
        $module       = $(this),
        $sides        = $module.find(settings.selector.sides),
        $side         = $module.find(settings.selector.side),
        
        // private variables
        $activeSide,
        $nextSide,
        endTransition = 'transitionend msTransitionEnd oTransitionEnd',
        
        // standard module
        element       = this,
        instance      = $module.data(moduleNamespace),

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
          instance = module;
          $module
            .data(moduleNamespace, instance)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module for', element);
          $module
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
        },

        refresh: function() {
          module.verbose('Refreshing selector cache for', element);
          $module = $(element);
          $sides  = $(this).find(settings.selector.shape);
          $side   = $(this).find(settings.selector.side);
        },

        repaint: function() {
          module.verbose('Forcing repaint event');
          var 
            shape          = $sides.get(0) || document.createElement('div'),
            fakeAssignment = shape.offsetWidth
          ;
        },

        animate: function(propertyObject, callback) {
          module.verbose('Animating box with properties', propertyObject);
          callback = callback || function(event) {
              module.reset();
              module.set.active();
              $.proxy(settings.onChange, $nextSide)();
              event.stopImmediatePropagation();
          };
          if(settings.useCSS) {
            module.verbose('Starting CSS animation');
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
            $sides
              .css(propertyObject)
              .one(endTransition, callback)
            ;
          }
          else {
            // not yet supported until .animate() is extended to allow RotateX/Y
            module.verbose('Starting javascript animation');
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
            $sides
              .animate(propertyObject, settings.duration, settings.easing, callback)
            ;
          }
        },

        queue: function(method) {
          module.debug('Queueing animation of', method);
          $sides
            .one(endTransition, function() {
              module.debug('Executing queued animation');
              $module.shape(method);
            })
          ;
        },

        reset: function() {
          module.verbose('Animating states reset');
          $module
            .removeClass(className.css)
            .removeClass(className.animating)
            .removeAttr('style')
          ;
          $sides
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

        is: {

          animating: function() {
            return $module.hasClass(className.animating);
          }

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
            if( !module.is.animating() ) {
              module.stage.above();
              module.animate( module.getTransform.up() );
            }
            else {
              module.queue('flip.up');
            }
          },

          down: function() {
            module.debug('Flipping down', $nextSide);
            if( !module.is.animating() ) {
              module.stage.below();
              module.animate( module.getTransform.down() );
            }
            else {
              module.queue('flip.down');
            }
          },

          left: function() {
            module.debug('Flipping left', $nextSide);
            if( !module.is.animating() ) {
              module.stage.left();
              module.animate(module.getTransform.left() );
            }
            else {
              module.queue('flip.left');
            }
          },

          right: function() {
            module.debug('Flipping right', $nextSide);
            if( !module.is.animating() ) {
              module.stage.right();
              module.animate(module.getTransform.right() );
            }
            else {
              module.queue('flip.right');
            }
          },

          over: function() {
            module.debug('Flipping over', $nextSide);
            if( !module.is.animating() ) {
              module.stage.behind();
              module.animate(module.getTransform.behind() );
            }
            else {
              module.queue('flip.over');
            }
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
            module.verbose('Executing invoked function', found);
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

$.fn.shape.settings = {

  // module info
  moduleName : 'Shape Module',
  
  // debug content outputted to console
  debug      : true,
  
  // verbose debug output
  verbose    : true,

  // performance data output
  performance: true,

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
    sides : '.sides',
    side  : '.side'
  }

};


})( jQuery, window , document );
