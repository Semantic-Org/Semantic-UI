/*
 * # Semantic - Progress
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

"use strict";

$.fn.progress = function(parameters) {
  var
    $allModules    = $(this),

    moduleSelector = $allModules.selector || '',

    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),

    returnedValue
  ;

  $allModules
    .each(function() {
      var
        settings          = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.progress.settings, parameters)
          : $.extend({}, $.fn.progress.settings),

        className       = settings.className,
        metadata        = settings.metadata,
        namespace       = settings.namespace,
        selector        = settings.selector,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        $module         = $(this),
        $bar            = $(this).find(selector.bar),
        $progress       = $(this).find(selector.progress),
        $label          = $(this).find(selector.label),

        element         = this,
        instance        = $module.data(moduleNamespace),

        animating = false,
        transitionEnd,
        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing progress bar', settings);

          transitionEnd = module.get.transitionEnd();

          module.read.metadata();
          module.set.duration();
          module.set.initials();
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of progress', module);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },
        destroy: function() {
          module.verbose('Destroying previous progress for', $module);
          clearInterval(instance.interval);
          module.remove.state();
          $module.removeData(moduleNamespace);
          instance = undefined;
        },

        reset: function() {
          module.set.percent(0);
        },

        complete: function() {
          if(module.percent === undefined || module.percent < 100) {
            module.set.percent(100);
          }
        },

        read: {
          metadata: function() {
            if( $module.data(metadata.percent) ) {
              module.verbose('Current percent value set from metadata');
              module.percent = $module.data(metadata.percent);
            }
            if( $module.data(metadata.total) ) {
              module.verbose('Total value set from metadata');
              module.total = $module.data(metadata.total);
            }
            if( $module.data(metadata.value) ) {
              module.verbose('Current value set from metadata');
              module.value = $module.data(metadata.value);
            }
          },
          currentValue: function() {
            return (module.value !== undefined)
              ? module.value
              : false
            ;
          }
        },

        increment: function(incrementValue) {
          var
            total          = module.total || false,
            edgeValue,
            startValue,
            newValue
          ;
          if(total) {
            startValue     = module.value || 0;
            incrementValue = incrementValue || 1;
            newValue       = startValue + incrementValue;
            edgeValue      = module.total;
            module.debug('Incrementing value by', incrementValue, startValue, edgeValue);
            if(newValue > edgeValue ) {
              module.debug('Value cannot increment above total', edgeValue);
              newValue = edgeValue;
            }
            module.set.progress(newValue);
          }
          else {
            startValue     = module.percent || 0;
            incrementValue = incrementValue || module.get.randomValue();
            newValue       = startValue + incrementValue;
            edgeValue      = 100;
            module.debug('Incrementing percentage by', incrementValue, startValue);
            if(newValue > edgeValue ) {
              module.debug('Value cannot increment above 100 percent');
              newValue = edgeValue;
            }
            module.set.progress(newValue);
          }
        },
        decrement: function(decrementValue) {
          var
            total     = module.total || false,
            edgeValue = 0,
            startValue,
            newValue
          ;
          if(total) {
            startValue     =  module.value   || 0;
            decrementValue =  decrementValue || 1;
            newValue       =  startValue - decrementValue;
            module.debug('Decrementing value by', decrementValue, startValue);
          }
          else {
            startValue     =  module.percent || 0;
            decrementValue =  decrementValue || module.get.randomValue();
            newValue       =  startValue - decrementValue;
            module.debug('Decrementing percentage by', decrementValue, startValue);
          }

          if(newValue < edgeValue) {
            module.debug('Value cannot decrement below 0');
            newValue = 0;
          }
          module.set.progress(newValue);
        },

        get: {
          text: function(templateText) {
            var
              value   = module.value                || 0,
              total   = module.total                || 0,
              percent = (module.is.visible() && animating)
                ? module.get.displayPercent()
                : module.percent || 0,
              left = (module.total > 0)
                ? (total - value)
                : (100 - percent)
            ;
            templateText = templateText || '';
            templateText = templateText
              .replace('{value}', value)
              .replace('{total}', total)
              .replace('{left}', left)
              .replace('{percent}', percent)
            ;
            module.debug('Adding variables to progress bar text', templateText);
            return templateText;
          },
          randomValue: function() {
            module.debug('Generating random increment percentage');
            return Math.floor((Math.random() * settings.random.max) + settings.random.min);
          },

          transitionEnd: function() {
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
          },

          // gets current displayed percentage (if animating values this is the intermediary value)
          displayPercent: function() {
            var
              barWidth       = $bar.width(),
              totalWidth     = $module.width(),
              minDisplay     = parseInt($bar.css('min-width'), 10),
              displayPercent = (barWidth > minDisplay)
                ? (barWidth / totalWidth * 100)
                : module.percent
            ;
            if(settings.precision === 0) {
              return Math.round(displayPercent);
            }
            return Math.round(displayPercent * (10 * settings.precision) / (10 * settings.precision) );
          },

          percent: function() {
            return module.percent || 0;
          },
          value: function() {
            return module.value || false;
          },
          total: function() {
            return module.total || false;
          }
        },

        is: {
          success: function() {
            return $module.hasClass(className.success);
          },
          warning: function() {
            return $module.hasClass(className.warning);
          },
          error: function() {
            return $module.hasClass(className.error);
          },
          active: function() {
            return $module.hasClass(className.active);
          },
          visible: function() {
            return $module.is(':visible');
          }
        },

        remove: {
          state: function() {
            module.verbose('Removing stored state');
            delete module.total;
            delete module.percent;
            delete module.value;
          },
          active: function() {
            module.verbose('Removing active state');
            $module.removeClass(className.active);
          },
          success: function() {
            module.verbose('Removing success state');
            $module.removeClass(className.success);
          },
          warning: function() {
            module.verbose('Removing warning state');
            $module.removeClass(className.warning);
          },
          error: function() {
            module.verbose('Removing error state');
            $module.removeClass(className.error);
          }
        },

        set: {
          barWidth: function(value) {
            if(value > 100) {
              module.error(error.tooHigh, value);
            }
            else if (value < 0) {
              module.error(error.tooLow, value);
            }
            else {
              $bar
                .css('width', value + '%')
              ;
              $module
                .attr('data-percent', parseInt(value, 10))
              ;
            }
          },
          duration: function(duration) {
            duration = duration || settings.duration;
            duration = (typeof duration == 'number')
              ? duration + 'ms'
              : duration
            ;
            module.verbose('Setting progress bar transition duration', duration);
            $bar
              .css({
                '-webkit-transition-duration': duration,
                '-moz-transition-duration': duration,
                '-ms-transition-duration': duration,
                '-o-transition-duration': duration,
                'transition-duration':  duration
              })
            ;
          },
          initials: function() {
            if(settings.total !== false) {
              module.verbose('Current total set in settings', settings.total);
              module.total = settings.total;
            }
            if(settings.value !== false) {
              module.verbose('Current value set in settings', settings.value);
              module.value = settings.value;
            }
            if(settings.percent !== false) {
              module.verbose('Current percent set in settings', settings.percent);
              module.percent = settings.percent;
            }
            if(module.percent !== undefined) {
              module.set.percent(module.percent);
            }
            else if(module.value !== undefined) {
              module.set.progress(module.value);
            }
          },
          percent: function(percent) {
            percent = (typeof percent == 'string')
              ? +(percent.replace('%', ''))
              : percent
            ;
            if(percent > 0 && percent < 1) {
              module.verbose('Module percentage passed as decimal, converting');
              percent = percent * 100;
            }
            // round percentage
            if(settings.precision === 0) {
              percent = Math.round(percent);
            }
            else {
              percent = Math.round(percent * (10 * settings.precision) / (10 * settings.precision) );
            }
            module.percent = percent;
            if(module.total) {
              module.value = Math.round( (percent / 100) * module.total);
            }
            else if(settings.limitValues) {
              module.value = (module.value > 100)
                ? 100
                : (module.value < 0)
                  ? 0
                  : module.value
              ;
            }
            module.set.barWidth(percent);
            if( module.is.visible() ) {
              module.set.labelInterval();
            }
            module.set.labels();
            settings.onChange.call(element, percent, module.value, module.total);
          },
          labelInterval: function() {
            var
              animationCallback = function() {
                module.verbose('Bar finished animating, removing continuous label updates');
                clearInterval(module.interval);
                animating = false;
                module.set.labels();
              }
            ;
            clearInterval(module.interval);
            $bar.one(transitionEnd + eventNamespace, animationCallback);
            module.timer = setTimeout(animationCallback, settings.duration + 100);
            animating = true;
            module.interval = setInterval(module.set.labels, settings.framerate);
          },
          labels: function() {
            module.verbose('Setting both bar progress and outer label text');
            module.set.barLabel();
            module.set.state();
          },
          label: function(text) {
            text = text || '';
            if(text) {
              text = module.get.text(text);
              module.debug('Setting label to text', text);
              $label.text(text);
            }
          },
          state: function(percent) {
            percent = (percent !== undefined)
              ? percent
              : module.percent
            ;
            if(percent === 100) {
              if(settings.autoSuccess && !(module.is.warning() || module.is.error())) {
                module.set.success();
                module.debug('Automatically triggering success at 100%');
              }
              else {
                module.verbose('Reached 100% removing active state');
                module.remove.active();
              }
            }
            else if(percent > 0) {
              module.verbose('Adjusting active progress bar label', percent);
              module.set.active();
            }
            else {
              module.remove.active();
              module.set.label(settings.text.active);
            }
          },
          barLabel: function(text) {
            if(text !== undefined) {
              $progress.text( module.get.text(text) );
            }
            else if(settings.label == 'ratio' && module.total) {
              module.debug('Adding ratio to bar label');
              $progress.text( module.get.text(settings.text.ratio) );
            }
            else if(settings.label == 'percent') {
              module.debug('Adding percentage to bar label');
              $progress.text( module.get.text(settings.text.percent) );
            }
          },
          active: function(text) {
            text = text || settings.text.active;
            module.debug('Setting active state');
            if(settings.showActivity && !module.is.active() ) {
              $module.addClass(className.active);
            }
            module.remove.warning();
            module.remove.error();
            module.remove.success();
            if(text) {
              module.set.label(text);
            }
            settings.onActive.call(element, module.value, module.total);
          },
          success : function(text) {
            text = text || settings.text.success;
            module.debug('Setting success state');
            $module.addClass(className.success);
            module.remove.active();
            module.remove.warning();
            module.remove.error();
            module.complete();
            if(text) {
              module.set.label(text);
            }
            settings.onSuccess.call(element, module.total);
          },
          warning : function(text) {
            text = text || settings.text.warning;
            module.debug('Setting warning state');
            $module.addClass(className.warning);
            module.remove.active();
            module.remove.success();
            module.remove.error();
            module.complete();
            if(text) {
              module.set.label(text);
            }
            settings.onWarning.call(element, module.value, module.total);
          },
          error : function(text) {
            text = text || settings.text.error;
            module.debug('Setting error state');
            $module.addClass(className.error);
            module.remove.active();
            module.remove.success();
            module.remove.warning();
            module.complete();
            if(text) {
              module.set.label(text);
            }
            settings.onError.call(element, module.value, module.total);
          },
          total: function(totalValue) {
            module.total = totalValue;
          },
          progress: function(value) {
            var
              numericValue = (typeof value === 'string')
                ? (value.replace(/[^\d.]/g, '') !== '')
                  ? +(value.replace(/[^\d.]/g, ''))
                  : false
                : value,
              percentComplete
            ;
            if(numericValue === false) {
              module.error(error.nonNumeric, value);
            }
            if(module.total) {
              module.value    = numericValue;
              percentComplete = (numericValue / module.total) * 100;
              module.debug('Calculating percent complete from total', percentComplete);
              module.set.percent( percentComplete );
            }
            else {
              percentComplete = numericValue;
              module.debug('Setting value to exact percentage value', percentComplete);
              module.set.percent( percentComplete );
            }
          }
        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
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
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
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
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
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
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
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
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                module.error(error.method, query);
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
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
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

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.progress.settings = {

  name         : 'Progress',
  namespace    : 'progress',

  debug        : false,
  verbose      : true,
  performance  : true,

  random       : {
    min : 2,
    max : 5
  },

  duration     : 300,

  autoSuccess  : true,
  showActivity : true,
  limitValues  : true,

  label        : 'percent',
  precision    : 1,
  framerate    : (1000 / 30), /// 30 fps

  percent      : false,
  total        : false,
  value        : false,

  onChange     : function(percent, value, total){},
  onSuccess    : function(total){},
  onActive     : function(value, total){},
  onError      : function(value, total){},
  onWarning    : function(value, total){},

  error    : {
    method     : 'The method you called is not defined.',
    nonNumeric : 'Progress value is non numeric',
    tooHigh    : 'Value specified is above 100%',
    tooLow     : 'Value specified is below 0%'
  },

  regExp: {
    variable: /\{\$*[A-z0-9]+\}/g
  },

  metadata: {
    percent : 'percent',
    total   : 'total',
    value   : 'value'
  },

  selector : {
    bar      : '> .bar',
    label    : '> .label',
    progress : '.bar > .progress'
  },

  text : {
    active  : false,
    error   : false,
    success : false,
    warning : false,
    percent : '{percent}%',
    ratio   : '{value} of {total}'
  },

  className : {
    active  : 'active',
    error   : 'error',
    success : 'success',
    warning : 'warning'
  }

};


})( jQuery, window , document );