 /*
 * # Semantic UI
 * https://github.com/Semantic-Org/Semantic-UI
 * http://www.semantic-ui.com/
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
/*
 * # Semantic - Accordion
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

"use strict";

$.fn.accordion = function(parameters) {
  var
    $allModules     = $(this),

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    requestAnimationFrame = window.requestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.msRequestAnimationFrame
      || function(callback) { setTimeout(callback, 0); },

    returnedValue
  ;
  $allModules
    .each(function() {
      var
        settings        = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.accordion.settings, parameters)
          : $.extend({}, $.fn.accordion.settings),

        className       = settings.className,
        namespace       = settings.namespace,
        selector        = settings.selector,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,
        moduleSelector  = $allModules.selector || '',

        $module  = $(this),
        $title   = $module.find(selector.title),
        $content = $module.find(selector.content),

        element  = this,
        instance = $module.data(moduleNamespace),
        observer,
        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing accordion with bound events', $module);
          $module
            .on('click' + eventNamespace, selector.title, module.event.click)
          ;
          module.observeChanges();
          module.instantiate();
        },

        instantiate: function() {
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.debug('Destroying previous accordion for', $module);
          $module
            .removeData(moduleNamespace)
          ;
          $title
            .off(eventNamespace)
          ;
        },

        refresh: function() {
          $title   = $module.find(selector.title);
          $content = $module.find(selector.content);
        },

        observeChanges: function() {
          if('MutationObserver' in window) {
            observer = new MutationObserver(function(mutations) {
              module.debug('DOM tree modified, updating selector cache');
              module.refresh();
            });
            observer.observe(element, {
              childList : true,
              subtree   : true
            });
            module.debug('Setting up mutation observer', observer);
          }
        },


        event: {
          click: function() {
            $.proxy(module.toggle, this)();
          }
        },

        toggle: function(query) {
          var
            $activeTitle = (query !== undefined)
              ? (typeof query === 'number')
                ? $title.eq(query)
                : $(query)
              : $(this),
            $activeContent = $activeTitle.next($content),
            contentIsOpen  = $activeContent.is(':visible')
          ;
          module.debug('Toggling visibility of content', $activeTitle);
          if(contentIsOpen) {
            if(settings.collapsible) {
              $.proxy(module.close, $activeTitle)();
            }
            else {
              module.debug('Cannot close accordion content collapsing is disabled');
            }
          }
          else {
            $.proxy(module.open, $activeTitle)();
          }
        },

        open: function(query) {
          var
            $activeTitle = (query !== undefined)
              ? (typeof query === 'number')
                ? $title.eq(query)
                : $(query)
              : $(this),
            $activeContent     = $activeTitle.next($content),
            currentlyAnimating = $activeContent.is(':animated'),
            currentlyActive    = $activeContent.hasClass(className.active)
          ;
          if(!currentlyAnimating && !currentlyActive) {
            module.debug('Opening accordion content', $activeTitle);
            if(settings.exclusive) {
              $.proxy(module.closeOthers, $activeTitle)();
            }
            $activeTitle
              .addClass(className.active)
            ;
            $activeContent
              .stop()
              .children()
                .stop()
                .animate({
                  opacity: 1
                }, settings.duration, module.reset.display)
                .end()
              .slideDown(settings.duration, settings.easing, function() {
                $activeContent
                  .addClass(className.active)
                ;
                $.proxy(module.reset.display, this)();
                $.proxy(settings.onOpen, this)();
                $.proxy(settings.onChange, this)();
              })
            ;
          }
        },

        close: function(query) {
          var
            $activeTitle = (query !== undefined)
              ? (typeof query === 'number')
                ? $title.eq(query)
                : $(query)
              : $(this),
            $activeContent = $activeTitle.next($content),
            isActive       = $activeContent.hasClass(className.active)
          ;
          if(isActive) {
            module.debug('Closing accordion content', $activeContent);
            $activeTitle
              .removeClass(className.active)
            ;
            $activeContent
              .removeClass(className.active)
              .show()
              .stop()
              .children()
                .stop()
                .animate({
                  opacity: 0
                }, settings.duration, module.reset.opacity)
                .end()
              .slideUp(settings.duration, settings.easing, function() {
                $.proxy(module.reset.display, this)();
                $.proxy(settings.onClose, this)();
                $.proxy(settings.onChange, this)();
              })
            ;
          }
        },

        closeOthers: function(index) {
          var
            $activeTitle = (index !== undefined)
              ? $title.eq(index)
              : $(this),
            $parentTitles    = $activeTitle.parents(selector.content).prev(selector.title),
            $activeAccordion = $activeTitle.closest(selector.accordion),
            activeSelector   = selector.title + '.' + className.active + ':visible',
            activeContent    = selector.content + '.' + className.active + ':visible',
            $openTitles,
            $nestedTitles,
            $openContents
          ;
          if(settings.closeNested) {
            $openTitles   = $activeAccordion.find(activeSelector).not($parentTitles);
            $openContents = $openTitles.next($content);
          }
          else {
            $openTitles   = $activeAccordion.find(activeSelector).not($parentTitles);
            $nestedTitles = $activeAccordion.find(activeContent).find(activeSelector).not($parentTitles);
            $openTitles = $openTitles.not($nestedTitles);
            $openContents = $openTitles.next($content);
          }
          if( ($openTitles.size() > 0) ) {
            module.debug('Exclusive enabled, closing other content', $openTitles);
            $openTitles
              .removeClass(className.active)
            ;
            $openContents
              .stop()
              .children()
                .stop()
                .animate({
                  opacity: 0
                }, settings.duration, module.resetOpacity)
                .end()
              .slideUp(settings.duration , settings.easing, function() {
                $(this).removeClass(className.active);
                $.proxy(module.reset.display, this)();
              })
            ;
          }
        },

        reset: {

          display: function() {
            module.verbose('Removing inline display from element', this);
            $(this).css('display', '');
            if( $(this).attr('style') === '') {
              $(this)
                .attr('style', '')
                .removeAttr('style')
              ;
            }
          },

          opacity: function() {
            module.verbose('Removing inline opacity from element', this);
            $(this).css('opacity', '');
            if( $(this).attr('style') === '') {
              $(this)
                .attr('style', '')
                .removeAttr('style')
              ;
            }
          },

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

$.fn.accordion.settings = {

  name        : 'Accordion',
  namespace   : 'accordion',

  debug       : false,
  verbose     : true,
  performance : true,

  exclusive   : true,
  collapsible : true,
  closeNested : false,

  duration    : 500,
  easing      : 'easeInOutQuint',

  onOpen      : function(){},
  onClose     : function(){},
  onChange    : function(){},

  error: {
    method    : 'The method you called is not defined'
  },

  className   : {
    active : 'active'
  },

  selector    : {
    accordion : '.accordion',
    title     : '.title',
    content   : '.content'
  }

};

// Adds easing
$.extend( $.easing, {
  easeInOutQuint: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
    return c/2*((t-=2)*t*t*t*t + 2) + b;
  }
});

})( jQuery, window , document );


/*
 * # Semantic - API
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

$.api = $.fn.api = function(parameters) {

  var
    // use window context if none specified
    $allModules     = $.isFunction(this)
        ? $(window)
        : $(this),
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
          ? $.extend(true, {}, $.fn.api.settings, parameters)
          : $.extend({}, $.fn.api.settings),

        // internal aliases
        namespace       = settings.namespace,
        metadata        = settings.metadata,
        selector        = settings.selector,
        error           = settings.error,
        className       = settings.className,

        // define namespaces for modules
        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        // element that creates request
        $module         = $(this),
        $form           = $module.closest(selector.form),

        // context used for state
        $context        = (settings.stateContext)
          ? $(settings.stateContext)
          : $module,

        // request details
        ajaxSettings,
        requestSettings,
        url,
        data,

        // standard module
        element         = this,
        context         = $context.get(),
        instance        = $module.data(moduleNamespace),
        module
      ;

      module = {

        initialize: function() {
          var
            triggerEvent = module.get.event()
          ;
          // bind events
          if(!methodInvoked) {
            if( triggerEvent ) {
              module.debug('Attaching API events to element', triggerEvent);
              $module
                .on(triggerEvent + eventNamespace, module.event.trigger)
              ;
            }
            else {
              module.query();
            }
          }
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
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

        query: function() {

          if(module.is.disabled()) {
            module.debug('Element is disabled API request aborted');
            return;
          }
          // determine if an api event already occurred
          if(module.is.loading() && settings.throttle === 0 ) {
            module.debug('Cancelling request, previous request is still pending');
            return;
          }

          // pass element metadata to url (value, text)
          if(settings.defaultData) {
            $.extend(true, settings.urlData, module.get.defaultData());
          }

          // Add form content
          if(settings.serializeForm !== false || $context.is('form')) {
            if(settings.serializeForm == 'json') {
              $.extend(true, settings.data, module.get.formData());
            }
            else {
              settings.data = module.get.formData();
            }
          }

          // call beforesend and get any settings changes
          requestSettings = module.get.settings();

          // check if beforesend cancelled request
          if(requestSettings === false) {
            module.error(error.beforeSend);
            return;
          }

          if(settings.url) {
            // override with url if specified
            module.debug('Using specified url', url);
            url = module.add.urlData( settings.url );
          }
          else {
            // otherwise find url from api endpoints
            url = module.add.urlData( module.get.templateURL() );
            module.debug('Added URL Data to url', url);
          }

          // exit conditions reached, missing url parameters
          if( !url ) {
            if($module.is('form')) {
              module.debug('No url or action specified, defaulting to form action');
              url = $module.attr('action');
            }
            else {
              module.error(error.missingURL, settings.action);
              return;
            }
          }

          // add loading state
          module.set.loading();

          // look for jQuery ajax parameters in settings
          ajaxSettings = $.extend(true, {}, settings, {
            type       : settings.method || settings.type,
            data       : data,
            url        : settings.base + url,
            beforeSend : settings.beforeXHR,
            success    : function() {},
            failure    : function() {},
            complete   : function() {}
          });

          module.verbose('Creating AJAX request with settings', ajaxSettings);

          if( !module.is.loading() ) {
            module.request = module.create.request();
            module.xhr = module.create.xhr();
          }
          else {
            // throttle additional requests
            module.timer = setTimeout(function() {
              module.request = module.create.request();
              module.xhr = module.create.xhr();
            }, settings.throttle);
          }

        },


        is: {
          disabled: function() {
            return ($module.filter(settings.filter).size() > 0);
          },
          loading: function() {
            return (module.request && module.request.state() == 'pending');
          }
        },

        was: {
          succesful: function() {
            return (module.request && module.request.state() == 'resolved');
          },
          failure: function() {
            return (module.request && module.request.state() == 'rejected');
          },
          complete: function() {
            return (module.request && (module.request.state() == 'resolved' || module.request.state() == 'rejected') );
          }
        },

        add: {
          urlData: function(url, urlData) {
            var
              requiredVariables,
              optionalVariables
            ;
            if(url) {
              requiredVariables = url.match(settings.regExp.required);
              optionalVariables = url.match(settings.regExp.optional);
              urlData           = urlData || settings.urlData;
              if(requiredVariables) {
                module.debug('Looking for required URL variables', requiredVariables);
                $.each(requiredVariables, function(index, templatedString) {
                  var
                    // allow legacy {$var} style
                    variable = (templatedString.indexOf('$') !== -1)
                      ? templatedString.substr(2, templatedString.length - 3)
                      : templatedString.substr(1, templatedString.length - 2),
                    value   = ($.isPlainObject(urlData) && urlData[variable] !== undefined)
                      ? urlData[variable]
                      : ($module.data(variable) !== undefined)
                        ? $module.data(variable)
                        : ($context.data(variable) !== undefined)
                          ? $context.data(variable)
                          : urlData[variable]
                  ;
                  // remove value
                  if(value === undefined) {
                    module.error(error.requiredParameter, variable, url);
                    url = false;
                    return false;
                  }
                  else {
                    module.verbose('Found required variable', variable, value);
                    url = url.replace(templatedString, value);
                  }
                });
              }
              if(optionalVariables) {
                module.debug('Looking for optional URL variables', requiredVariables);
                $.each(optionalVariables, function(index, templatedString) {
                  var
                    // allow legacy {/$var} style
                    variable = (templatedString.indexOf('$') !== -1)
                      ? templatedString.substr(3, templatedString.length - 4)
                      : templatedString.substr(2, templatedString.length - 3),
                    value   = ($.isPlainObject(urlData) && urlData[variable] !== undefined)
                      ? urlData[variable]
                      : ($module.data(variable) !== undefined)
                        ? $module.data(variable)
                        : ($context.data(variable) !== undefined)
                          ? $context.data(variable)
                          : urlData[variable]
                  ;
                  // optional replacement
                  if(value !== undefined) {
                    module.verbose('Optional variable Found', variable, value);
                    url = url.replace(templatedString, value);
                  }
                  else {
                    module.verbose('Optional variable not found', variable);
                    // remove preceding slash if set
                    if(url.indexOf('/' + templatedString) !== -1) {
                      url = url.replace('/' + templatedString, '');
                    }
                    else {
                      url = url.replace(templatedString, '');
                    }
                  }
                });
              }
            }
            return url;
          }
        },

        event: {
          trigger: function(event) {
            module.query();
            if(event.type == 'submit' || event.type == 'click') {
              event.preventDefault();
            }
          },
          xhr: {
            always: function() {
              // calculate if loading time was below minimum threshold
            },
            done: function(response) {
              var
                context      = this,
                elapsedTime  = (new Date().getTime() - time),
                timeLeft     = (settings.loadingDuration - elapsedTime)
              ;
              timeLeft = (timeLeft > 0)
                ? timeLeft
                : 0
              ;
              setTimeout(function() {
                module.request.resolveWith(context, [response]);
              }, timeLeft);
            },
            fail: function(xhr, status, httpMessage) {
              var
                context     = this,
                elapsedTime = (new Date().getTime() - time),
                timeLeft    = (settings.loadingDuration - elapsedTime)
              ;
              timeLeft = (timeLeft > 0)
                ? timeLeft
                : 0
              ;
              // page triggers abort on navigation, dont show error
              setTimeout(function() {
                if(status !== 'abort') {
                  module.request.rejectWith(context, [xhr, status, httpMessage]);
                }
                else {
                  module.reset();
                }
              }, timeLeft);
            }
          },
          request: {
            complete: function(response) {
              module.remove.loading();
              $.proxy(settings.onComplete, context)(response, $module);
            },
            done: function(response) {
              module.debug('API Response Received', response);
              if(settings.dataType == 'json') {
                if( $.isFunction(settings.successTest) ) {
                  module.debug('Checking JSON returned success', settings.successTest, response);
                  if( settings.successTest(response) ) {
                    $.proxy(settings.onSuccess, context)(response, $module);
                  }
                  else {
                    module.debug('JSON test specified by user and response failed', response);
                    $.proxy(settings.onFailure, context)(response, $module);
                  }
                }
                else {
                  $.proxy(settings.onSuccess, context)(response, $module);
                }
              }
              else {
                $.proxy(settings.onSuccess, context)(response, $module);
              }
            },
            error: function(xhr, status, httpMessage) {
              var
                errorMessage = (settings.error[status] !== undefined)
                  ? settings.error[status]
                  : httpMessage,
                response
              ;
              // let em know unless request aborted
              if(xhr !== undefined) {
                // readyState 4 = done, anything less is not really sent
                if(xhr.readyState !== undefined && xhr.readyState == 4) {

                  // if http status code returned and json returned error, look for it
                  if( xhr.status != 200 && httpMessage !== undefined && httpMessage !== '') {
                    module.error(error.statusMessage + httpMessage);
                  }
                  else {
                    if(status == 'error' && settings.dataType == 'json') {
                      try {
                        response = $.parseJSON(xhr.responseText);
                        if(response && response.error !== undefined) {
                          errorMessage = response.error;
                        }
                      }
                      catch(e) {
                        module.error(error.JSONParse);
                      }
                    }
                  }
                  module.remove.loading();
                  module.set.error();
                  // show error state only for duration specified in settings
                  if(settings.errorDuration) {
                    setTimeout(module.remove.error, settings.errorDuration);
                  }
                  module.debug('API Request error:', errorMessage);
                  $.proxy(settings.onError, context)(errorMessage, context);
                }
                else {
                  $.proxy(settings.onAbort, context)(errorMessage, context);
                  module.debug('Request Aborted (Most likely caused by page change or CORS Policy)', status, httpMessage);
                }
              }
            }
          }
        },

        create: {
          request: function() {
            return $.Deferred()
              .always(module.event.request.complete)
              .done(module.event.request.done)
              .fail(module.event.request.error)
            ;
          },
          xhr: function() {
            $.ajax(ajaxSettings)
              .always(module.event.xhr.always)
              .done(module.event.xhr.done)
              .fail(module.event.xhr.fail)
            ;
          }
        },

        set: {
          error: function() {
            module.verbose('Adding error state to element', $context);
            $context.addClass(className.error);
          },
          loading: function() {
            module.verbose('Adding loading state to element', $context);
            $context.addClass(className.loading);
          }
        },

        remove: {
          error: function() {
            module.verbose('Removing error state from element', $context);
            $context.removeClass(className.error);
          },
          loading: function() {
            module.verbose('Removing loading state from element', $context);
            $context.removeClass(className.loading);
          }
        },

        get: {
          request: function() {
            return module.request || false;
          },
          xhr: function() {
            return module.xhr || false;
          },
          settings: function() {
            var
              runSettings
            ;
            runSettings = $.proxy(settings.beforeSend, $module)(settings);
            if(runSettings) {
              if(runSettings.success !== undefined) {
                module.debug('Legacy success callback detected', runSettings);
                module.error(error.legacyParameters, runSettings.success);
                runSettings.onSuccess = runSettings.success;
              }
              if(runSettings.failure !== undefined) {
                module.debug('Legacy failure callback detected', runSettings);
                module.error(error.legacyParameters, runSettings.failure);
                runSettings.onFailure = runSettings.failure;
              }
              if(runSettings.complete !== undefined) {
                module.debug('Legacy complete callback detected', runSettings);
                module.error(error.legacyParameters, runSettings.complete);
                runSettings.onComplete = runSettings.complete;
              }
            }
            if(runSettings === undefined) {
              module.error(error.noReturnedValue);
            }
            return (runSettings !== undefined)
              ? runSettings
              : settings
            ;
          },
          defaultData: function() {
            var
              data = {}
            ;
            if( !$.isWindow(element) ) {
              if( $module.is('input') ) {
                data.value = $module.val();
              }
              else if( $module.is('form') ) {

              }
              else {
                data.text = $module.text();
              }
            }
            return data;
          },
          event: function() {
            if( $.isWindow(element) || settings.on == 'now' ) {
              module.debug('API called without element, no events attached');
              return false;
            }
            else if(settings.on == 'auto') {
              if( $module.is('input') ) {
                return (element.oninput !== undefined)
                  ? 'input'
                  : (element.onpropertychange !== undefined)
                    ? 'propertychange'
                    : 'keyup'
                ;
              }
              else if( $module.is('form') ) {
                return 'submit';
              }
              else {
                return 'click';
              }
            }
            else {
              return settings.on;
            }
          },
          formData: function() {
            var
              formData
            ;
            if($(this).serializeObject() !== undefined) {
              formData = $form.serializeObject();
            }
            else {
              module.error(error.missingSerialize);
              formData = $form.serialize();
            }
            module.debug('Retrieved form data', formData);
            return formData;
          },
          templateURL: function(action) {
            var
              url
            ;
            action = action || $module.data(settings.metadata.action) || settings.action || false;
            if(action) {
              module.debug('Looking up url for action', action, settings.api);
              if(settings.api[action] !== undefined) {
                url = settings.api[action];
                module.debug('Found template url', url);
              }
              else {
                module.error(error.missingAction, settings.action, settings.api);
              }
            }
            return url;
          }
        },

        // reset state
        reset: function() {
          module.remove.error();
          module.remove.loading();
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
                //'Element'        : element,
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

$.api.settings = {

  name            : 'API',
  namespace       : 'api',

  debug           : false,
  verbose         : true,
  performance     : true,

  // event binding
  on              : 'auto',
  filter          : '.disabled',
  stateContext    : false,

  // state
  loadingDuration : 0,
  errorDuration   : 2000,

  // templating
  action          : false,
  url             : false,
  base            : '',

  // data
  urlData         : {},

  // ui
  defaultData     : true,
  serializeForm   : false,
  throttle        : 0,

  // jQ ajax
  method          : 'get',
  data            : {},
  dataType        : 'json',

  // callbacks
  beforeSend  : function(settings) { return settings; },
  beforeXHR   : function(xhr) {},

  onSuccess   : function(response, $module) {},
  onComplete  : function(response, $module) {},
  onFailure   : function(errorMessage, $module) {},
  onError     : function(errorMessage, $module) {},
  onAbort     : function(errorMessage, $module) {},

  successTest : false,

  // errors
  error : {
    beforeSend        : 'The before send function has aborted the request',
    error             : 'There was an error with your request',
    exitConditions    : 'API Request Aborted. Exit conditions met',
    JSONParse         : 'JSON could not be parsed during error handling',
    legacyParameters  : 'You are using legacy API success callback names',
    missingAction     : 'API action used but no url was defined',
    missingSerialize  : 'Required dependency jquery-serialize-object missing, using basic serialize',
    missingURL        : 'No URL specified for api event',
    noReturnedValue   : 'The beforeSend callback must return a settings object, beforeSend ignored.',
    parseError        : 'There was an error parsing your request',
    requiredParameter : 'Missing a required URL parameter: ',
    statusMessage     : 'Server gave an error: ',
    timeout           : 'Your request timed out'
  },

  regExp  : {
    required: /\{\$*[A-z0-9]+\}/g,
    optional: /\{\/\$*[A-z0-9]+\}/g,
  },

  className: {
    loading : 'loading',
    error   : 'error'
  },

  selector: {
    form: 'form'
  },

  metadata: {
    action  : 'action',
    request : 'request',
    xhr     : 'xhr'
  }
};


$.api.settings.api = {};


})( jQuery, window , document );
/*
 * # Semantic - Checkbox
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

$.fn.checkbox = function(parameters) {
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
        settings        = $.extend(true, {}, $.fn.checkbox.settings, parameters),

        className       = settings.className,
        namespace       = settings.namespace,
        selector        = settings.selector,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        $module         = $(this),
        $label          = $(this).next(selector.label).first(),
        $input          = $(this).find(selector.input),

        instance        = $module.data(moduleNamespace),

        observer,
        element         = this,
        module
      ;

      module      = {

        initialize: function() {
          module.verbose('Initializing checkbox', settings);
          $module
            .on('click'   + eventNamespace, module.toggle)
            .on('keydown' + eventNamespace, selector.input, module.event.keydown)
          ;
          if( module.is.checked() ) {
            module.set.checked();
            if(settings.fireOnInit) {
              $.proxy(settings.onChecked, $input.get())();
            }
          }
          else {
            module.remove.checked();
            if(settings.fireOnInit) {
              $.proxy(settings.onUnchecked, $input.get())();
            }
          }
          module.observeChanges();

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
          module.verbose('Destroying previous module');
          $module
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
          $input
            .off(eventNamespace, module.event.keydown)
          ;
          $label
            .off(eventNamespace)
          ;
        },

        refresh: function() {
          $module = $(this);
          $label  = $(this).next(selector.label).first();
          $input  = $(this).find(selector.input);
        },

        observeChanges: function() {
          if('MutationObserver' in window) {
            observer = new MutationObserver(function(mutations) {
              module.debug('DOM tree modified, updating selector cache');
              module.refresh();
            });
            observer.observe(element, {
              childList : true,
              subtree   : true
            });
            module.debug('Setting up mutation observer', observer);
          }
        },

        attachEvents: function(selector, event) {
          var
            $toggle = $(selector)
          ;
          event = $.isFunction(module[event])
            ? module[event]
            : module.toggle
          ;
          if($toggle.size() > 0) {
            module.debug('Attaching checkbox events to element', selector, event);
            $toggle
              .on('click' + eventNamespace, event)
            ;
          }
          else {
            module.error(error.notFound);
          }
        },

        event: {
          keydown: function(event) {
            var
              key     = event.which,
              keyCode = {
                enter  : 13,
                escape : 27
              }
            ;
            if( key == keyCode.escape) {
              module.verbose('Escape key pressed blurring field');
              $module
                .blur()
              ;
            }
            if(!event.ctrlKey && key == keyCode.enter) {
              module.verbose('Enter key pressed, toggling checkbox');
              $.proxy(module.toggle, this)();
              event.preventDefault();
            }
          }
        },

        is: {
          radio: function() {
            return $module.hasClass(className.radio);
          },
          checked: function() {
            return $input.prop('checked') !== undefined && $input.prop('checked');
          },
          unchecked: function() {
            return !module.is.checked();
          }
        },

        can: {
          change: function() {
            return !( $module.hasClass(className.disabled) || $module.hasClass(className.readOnly) || $input.prop('disabled') );
          },
          uncheck: function() {
            return (typeof settings.uncheckable === 'boolean')
              ? settings.uncheckable
              : !module.is.radio()
            ;
          }
        },

        set: {
          checked: function() {
            $module.addClass(className.checked);
          },
          tab: function() {
            if( $input.attr('tabindex') === undefined) {
              $input
                .attr('tabindex', 0)
              ;
            }
          }
        },

        remove: {
          checked: function() {
            $module.removeClass(className.checked);
          }
        },

        enable: function() {
          module.debug('Enabling checkbox functionality');
          $module.removeClass(className.disabled);
          $input.prop('disabled', false);
          $.proxy(settings.onEnabled, $input.get())();
        },

        disable: function() {
          module.debug('Disabling checkbox functionality');
          $module.addClass(className.disabled);
          $input.prop('disabled', 'disabled');
          $.proxy(settings.onDisabled, $input.get())();
        },

        check: function() {
          module.debug('Enabling checkbox', $input);
          $input
            .prop('checked', true)
            .trigger('change')
          ;
          module.set.checked();
          $.proxy(settings.onChange, $input.get())();
          $.proxy(settings.onChecked, $input.get())();
        },

        uncheck: function() {
          module.debug('Disabling checkbox');
          $input
            .prop('checked', false)
            .trigger('change')
          ;
          module.remove.checked();
          $.proxy(settings.onChange, $input.get())();
          $.proxy(settings.onUnchecked, $input.get())();
        },

        toggle: function(event) {
          if( !module.can.change() ) {
            console.log(module.can.change());
            module.debug('Checkbox is read-only or disabled, ignoring toggle');
            return;
          }
          module.verbose('Determining new checkbox state');
          if( module.is.unchecked() ) {
            module.check();
          }
          else if( module.is.checked() && module.can.uncheck() ) {
            module.uncheck();
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

$.fn.checkbox.settings = {

  name        : 'Checkbox',
  namespace   : 'checkbox',

  debug       : false,
  verbose     : true,
  performance : true,

  // delegated event context
  uncheckable : 'auto',
  fireOnInit  : true,

  onChange    : function(){},
  onChecked   : function(){},
  onUnchecked : function(){},
  onEnabled   : function(){},
  onDisabled  : function(){},

  className   : {
    checked  : 'checked',
    disabled : 'disabled',
    radio    : 'radio',
    readOnly : 'read-only'
  },

  error     : {
    method   : 'The method you called is not defined.'
  },

  selector : {
    input  : 'input[type=checkbox], input[type=radio]',
    label  : 'label'
  }

};

})( jQuery, window , document );

/*
 * # Semantic - Colorize
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

  $.fn.colorize = function(parameters) {
    var
      settings        = $.extend(true, {}, $.fn.colorize.settings, parameters),
      // hoist arguments
      moduleArguments = arguments || false
    ;
    $(this)
      .each(function(instanceIndex) {

        var
          $module         = $(this),

          mainCanvas      = $('<canvas />')[0],
          imageCanvas     = $('<canvas />')[0],
          overlayCanvas   = $('<canvas />')[0],

          backgroundImage = new Image(),

          // defs
          mainContext,
          imageContext,
          overlayContext,

          image,
          imageName,

          width,
          height,

          // shortucts
          colors    = settings.colors,
          paths     = settings.paths,
          namespace = settings.namespace,
          error     = settings.error,

          // boilerplate
          instance   = $module.data('module-' + namespace),
          module
        ;

        module = {

          checkPreconditions: function() {
            module.debug('Checking pre-conditions');

            if( !$.isPlainObject(colors) || $.isEmptyObject(colors) ) {
              module.error(error.undefinedColors);
              return false;
            }
            return true;
          },

          async: function(callback) {
            if(settings.async) {
              setTimeout(callback, 0);
            }
            else {
              callback();
            }
          },

          getMetadata: function() {
            module.debug('Grabbing metadata');
            image     = $module.data('image') || settings.image || undefined;
            imageName = $module.data('name')  || settings.name  || instanceIndex;
            width     = settings.width        || $module.width();
            height    = settings.height       || $module.height();
            if(width === 0 || height === 0) {
              module.error(error.undefinedSize);
            }
          },

          initialize: function() {
            module.debug('Initializing with colors', colors);
            if( module.checkPreconditions() ) {

              module.async(function() {
                module.getMetadata();
                module.canvas.create();

                module.draw.image(function() {
                  module.draw.colors();
                  module.canvas.merge();
                });
                $module
                  .data('module-' + namespace, module)
                ;
              });
            }
          },

          redraw: function() {
            module.debug('Redrawing image');
            module.async(function() {
              module.canvas.clear();
              module.draw.colors();
              module.canvas.merge();
            });
          },

          change: {
            color: function(colorName, color) {
              module.debug('Changing color', colorName);
              if(colors[colorName] === undefined) {
                module.error(error.missingColor);
                return false;
              }
              colors[colorName] = color;
              module.redraw();
            }
          },

          canvas: {
            create: function() {
              module.debug('Creating canvases');

              mainCanvas.width     = width;
              mainCanvas.height    = height;
              imageCanvas.width    = width;
              imageCanvas.height   = height;
              overlayCanvas.width  = width;
              overlayCanvas.height = height;

              mainContext    = mainCanvas.getContext('2d');
              imageContext   = imageCanvas.getContext('2d');
              overlayContext = overlayCanvas.getContext('2d');

              $module
                .append( mainCanvas )
              ;
              mainContext    = $module.children('canvas')[0].getContext('2d');
            },
            clear: function(context) {
              module.debug('Clearing canvas');
              overlayContext.fillStyle = '#FFFFFF';
              overlayContext.fillRect(0, 0, width, height);
            },
            merge: function() {
              if( !$.isFunction(mainContext.blendOnto) ) {
                module.error(error.missingPlugin);
                return;
              }
              mainContext.putImageData( imageContext.getImageData(0, 0, width, height), 0, 0);
              overlayContext.blendOnto(mainContext, 'multiply');
            }
          },

          draw: {

            image: function(callback) {
              module.debug('Drawing image');
              callback = callback || function(){};
              if(image) {
                backgroundImage.src    = image;
                backgroundImage.onload = function() {
                  imageContext.drawImage(backgroundImage, 0, 0);
                  callback();
                };
              }
              else {
                module.error(error.noImage);
                callback();
              }
            },

            colors: function() {
              module.debug('Drawing color overlays', colors);
              $.each(colors, function(colorName, color) {
                settings.onDraw(overlayContext, imageName, colorName, color);
              });
            }

          },

          debug: function(message, variableName) {
            if(settings.debug) {
              if(variableName !== undefined) {
                console.info(settings.name + ': ' + message, variableName);
              }
              else {
                console.info(settings.name + ': ' + message);
              }
            }
          },
          error: function(errorMessage) {
            console.warn(settings.name + ': ' + errorMessage);
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
                module.error(settings.error.method);
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

  $.fn.colorize.settings = {
    name      : 'Image Colorizer',
    debug     : true,
    namespace : 'colorize',

    onDraw    : function(overlayContext, imageName, colorName, color) {},

    // whether to block execution while updating canvas
    async     : true,
    // object containing names and default values of color regions
    colors    : {},

    metadata: {
      image : 'image',
      name  : 'name'
    },

    error: {
      noImage         : 'No tracing image specified',
      undefinedColors : 'No default colors specified.',
      missingColor    : 'Attempted to change color that does not exist',
      missingPlugin   : 'Blend onto plug-in must be included',
      undefinedHeight : 'The width or height of image canvas could not be automatically determined. Please specify a height.'
    }

  };

})( jQuery, window , document );

/*
 * # Semantic - Dimmer
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

$.fn.dimmer = function(parameters) {
  var
    $allModules     = $(this),

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    returnedValue
  ;

  $allModules
    .each(function() {
      var
        settings        = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.dimmer.settings, parameters)
          : $.extend({}, $.fn.dimmer.settings),

        selector        = settings.selector,
        namespace       = settings.namespace,
        className       = settings.className,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,
        moduleSelector  = $allModules.selector || '',

        clickEvent      = ('ontouchstart' in document.documentElement)
          ? 'touchstart'
          : 'click',

        $module = $(this),
        $dimmer,
        $dimmable,

        element   = this,
        instance  = $module.data(moduleNamespace),
        module
      ;

      module = {

        preinitialize: function() {
          if( module.is.dimmer() ) {
            $dimmable = $module.parent();
            $dimmer   = $module;
          }
          else {
            $dimmable = $module;
            if( module.has.dimmer() ) {
              if(settings.dimmerName) {
                $dimmer = $dimmable.children(selector.dimmer).filter('.' + settings.dimmerName);
              }
              else {
                $dimmer = $dimmable.children(selector.dimmer);
              }
            }
            else {
              $dimmer = module.create();
            }
          }
        },

        initialize: function() {
          module.debug('Initializing dimmer', settings);
          if(settings.on == 'hover') {
            $dimmable
              .on('mouseenter' + eventNamespace, module.show)
              .on('mouseleave' + eventNamespace, module.hide)
            ;
          }
          else if(settings.on == 'click') {
            $dimmable
              .on(clickEvent + eventNamespace, module.toggle)
            ;
          }
          if( module.is.page() ) {
            module.debug('Setting as a page dimmer', $dimmable);
            module.set.pageDimmer();
          }

          if( module.is.closable() ) {
            module.verbose('Adding dimmer close event', $dimmer);
            $dimmer
              .on(clickEvent + eventNamespace, module.event.click)
            ;
          }
          module.set.dimmable();
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, instance)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module', $dimmer);
          $module
            .removeData(moduleNamespace)
          ;
          $dimmable
            .off(eventNamespace)
          ;
          $dimmer
            .off(eventNamespace)
          ;
        },

        event: {
          click: function(event) {
            module.verbose('Determining if event occured on dimmer', event);
            if( $dimmer.find(event.target).size() === 0 || $(event.target).is(selector.content) ) {
              module.hide();
              event.stopImmediatePropagation();
            }
          }
        },

        addContent: function(element) {
          var
            $content = $(element)
          ;
          module.debug('Add content to dimmer', $content);
          if($content.parent()[0] !== $dimmer[0]) {
            $content.detach().appendTo($dimmer);
          }
        },

        create: function() {
          var
            $element = $( settings.template.dimmer() )
          ;
          if(settings.variation) {
            module.debug('Creating dimmer with variation', settings.variation);
            $element.addClass(className.variation);
          }
          if(settings.dimmerName) {
            module.debug('Creating named dimmer', settings.dimmerName);
            $element.addClass(settings.dimmerName);
          }
          $element
            .appendTo($dimmable)
          ;
          return $element;
        },

        show: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          module.debug('Showing dimmer', $dimmer, settings);
          if( (!module.is.dimmed() || module.is.animating()) && module.is.enabled() ) {
            module.animate.show(callback);
            $.proxy(settings.onShow, element)();
            $.proxy(settings.onChange, element)();
          }
          else {
            module.debug('Dimmer is already shown or disabled');
          }
        },

        hide: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          if( module.is.dimmed() || module.is.animating() ) {
            module.debug('Hiding dimmer', $dimmer);
            module.animate.hide(callback);
            $.proxy(settings.onHide, element)();
            $.proxy(settings.onChange, element)();
          }
          else {
            module.debug('Dimmer is not visible');
          }
        },

        toggle: function() {
          module.verbose('Toggling dimmer visibility', $dimmer);
          if( !module.is.dimmed() ) {
            module.show();
          }
          else {
            module.hide();
          }
        },

        animate: {
          show: function(callback) {
            callback = $.isFunction(callback)
              ? callback
              : function(){}
            ;
            if(settings.useCSS && $.fn.transition !== undefined && $dimmer.transition('is supported')) {
              $dimmer
                .transition({
                  animation : settings.transition + ' in',
                  queue       : false,
                  duration  : module.get.duration(),
                  onStart   : function() {
                    module.set.dimmed();
                  },
                  onComplete : function() {
                    module.set.active();
                    callback();
                  }
                })
              ;
            }
            else {
              module.verbose('Showing dimmer animation with javascript');
              module.set.dimmed();
              $dimmer
                .stop()
                .css({
                  opacity : 0,
                  width   : '100%',
                  height  : '100%'
                })
                .fadeTo(module.get.duration(), 1, function() {
                  $dimmer.removeAttr('style');
                  module.set.active();
                  callback();
                })
              ;
            }
          },
          hide: function(callback) {
            callback = $.isFunction(callback)
              ? callback
              : function(){}
            ;
            if(settings.useCSS && $.fn.transition !== undefined && $dimmer.transition('is supported')) {
              module.verbose('Hiding dimmer with css');
              $dimmer
                .transition({
                  animation  : settings.transition + ' out',
                  queue      : false,
                  duration   : module.get.duration(),
                  onStart    : function() {
                    module.remove.dimmed();
                  },
                  onComplete : function() {
                    module.remove.active();
                    callback();
                  }
                })
              ;
            }
            else {
              module.verbose('Hiding dimmer with javascript');
              module.remove.dimmed();
              $dimmer
                .stop()
                .fadeOut(module.get.duration(), function() {
                  module.remove.active();
                  $dimmer.removeAttr('style');
                  callback();
                })
              ;
            }
          }
        },

        get: {
          dimmer: function() {
            return $dimmer;
          },
          duration: function() {
            if(typeof settings.duration == 'object') {
              if( module.is.active() ) {
                return settings.duration.hide;
              }
              else {
                return settings.duration.show;
              }
            }
            return settings.duration;
          }
        },

        has: {
          dimmer: function() {
            if(settings.dimmerName) {
              return ($module.children(selector.dimmer).filter('.' + settings.dimmerName).size() > 0);
            }
            else {
              return ( $module.children(selector.dimmer).size() > 0 );
            }
          }
        },

        is: {
          active: function() {
            return $dimmer.hasClass(className.active);
          },
          animating: function() {
            return ( $dimmer.is(':animated') || $dimmer.hasClass(className.animating) );
          },
          closable: function() {
            if(settings.closable == 'auto') {
              if(settings.on == 'hover') {
                return false;
              }
              return true;
            }
            return settings.closable;
          },
          dimmer: function() {
            return $module.is(selector.dimmer);
          },
          dimmable: function() {
            return $module.is(selector.dimmable);
          },
          dimmed: function() {
            return $dimmable.hasClass(className.dimmed);
          },
          disabled: function() {
            return $dimmable.hasClass(className.disabled);
          },
          enabled: function() {
            return !module.is.disabled();
          },
          page: function () {
            return $dimmable.is('body');
          },
          pageDimmer: function() {
            return $dimmer.hasClass(className.pageDimmer);
          }
        },

        can: {
          show: function() {
            return !$dimmer.hasClass(className.disabled);
          }
        },

        set: {
          active: function() {
            $dimmer.addClass(className.active);
          },
          dimmable: function() {
            $dimmable.addClass(className.dimmable);
          },
          dimmed: function() {
            $dimmable.addClass(className.dimmed);
          },
          pageDimmer: function() {
            $dimmer.addClass(className.pageDimmer);
          },
          disabled: function() {
            $dimmer.addClass(className.disabled);
          }
        },

        remove: {
          active: function() {
            $dimmer
              .removeClass(className.active)
            ;
          },
          dimmed: function() {
            $dimmable.removeClass(className.dimmed);
          },
          disabled: function() {
            $dimmer.removeClass(className.disabled);
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

      module.preinitialize();

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

$.fn.dimmer.settings = {

  name        : 'Dimmer',
  namespace   : 'dimmer',

  debug       : false,
  verbose     : true,
  performance : true,

  dimmerName  : false,
  variation   : false,
  closable    : 'auto',
  transition  : 'fade',
  useCSS      : true,
  on          : false,

  duration    : {
    show : 500,
    hide : 500
  },

  onChange    : function(){},
  onShow      : function(){},
  onHide      : function(){},

  error   : {
    method   : 'The method you called is not defined.'
  },

  selector: {
    dimmable : '.dimmable',
    dimmer   : '.ui.dimmer',
    content  : '.ui.dimmer > .content, .ui.dimmer > .content > .center'
  },

  template: {
    dimmer: function() {
     return $('<div />').attr('class', 'ui dimmer');
    }
  },

  className : {
    active     : 'active',
    animating  : 'animating',
    dimmable   : 'dimmable',
    dimmed     : 'dimmed',
    disabled   : 'disabled',
    hide       : 'hide',
    pageDimmer : 'page',
    show       : 'show'
  }

};

})( jQuery, window , document );
/*
 * # Semantic - Dropdown
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

$.fn.dropdown = function(parameters) {
  var
    $allModules    = $(this),
    $document      = $(document),

    moduleSelector = $allModules.selector || '',

    hasTouch       = ('ontouchstart' in document.documentElement),
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
          ? $.extend(true, {}, $.fn.dropdown.settings, parameters)
          : $.extend({}, $.fn.dropdown.settings),

        className       = settings.className,
        metadata        = settings.metadata,
        namespace       = settings.namespace,
        selector        = settings.selector,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        $module         = $(this),
        $text           = $module.find(selector.text),
        $search         = $module.find(selector.search),
        $input          = $module.find(selector.input),

        $combo = ($module.prev().find(selector.text).size() > 0)
          ? $module.prev().find(selector.text)
          : $module.prev(),

        $menu           = $module.children(selector.menu),
        $item           = $menu.find(selector.item),

        activated       = false,
        itemActivated   = false,

        element         = this,
        instance        = $module.data(moduleNamespace),
        observer,
        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing dropdown', settings);
          module.setup.layout();
          module.save.defaults();
          module.set.selected();

          if(hasTouch) {
            module.bind.touchEvents();
          }
          module.bind.mouseEvents();
          module.bind.keyboardEvents();

          module.observeChanges();
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of dropdown', module);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous dropdown for', $module);
          module.remove.tabbable();
          $module
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        observeChanges: function() {
          if('MutationObserver' in window) {
            observer = new MutationObserver(function(mutations) {
              module.debug('DOM tree modified, updating selector cache');
              module.refresh();
            });
            observer.observe(element, {
              childList : true,
              subtree   : true
            });
            module.debug('Setting up mutation observer', observer);
          }
        },

        setup: {

          layout: function() {
            if( $module.is('select') ) {
              module.setup.select();
            }
            if( module.is.search() && !module.is.searchable() ) {
              $search = $('<input />')
                .addClass(className.search)
                .insertBefore($text)
              ;
            }
            if(settings.allowTab) {
              module.set.tabbable();
            }
          },
          select: function() {
            var
              selectValues = module.get.selectValues()
            ;
            module.debug('Dropdown initialized on a select', selectValues);
            // see if select exists inside a dropdown
            $input = $module;
            if($input.parents(selector.dropdown).size() > 0) {
              module.debug('Creating dropdown menu only from template');
              $module = $input.closest(selector.dropdown);
              if($module.find('.' + className.dropdown).size() === 0) {
                $('<div />')
                  .addClass(className.menu)
                  .html( settings.templates.menu( selectValues ))
                  .appendTo($module)
                ;
              }
            }
            else {
              module.debug('Creating entire dropdown from template');
              $module = $('<div />')
                .attr('class', $input.attr('class') )
                .addClass(className.selection)
                .addClass(className.dropdown)
                .html( settings.templates.dropdown(selectValues) )
                .insertBefore($input)
              ;
              $input
                .removeAttr('class')
                .prependTo($module)
              ;
            }
            module.refresh();
          }
        },

        refresh: function() {
          $text   = $module.find(selector.text);
          $search = $module.find(selector.search);
          $input  = $module.find(selector.input);
          $menu   = $module.children(selector.menu);
          $item   = $menu.find(selector.item);
        },

        toggle: function() {
          module.verbose('Toggling menu visibility');
          if( !module.is.active() ) {
            module.show();
          }
          else {
            module.hide();
          }
        },

        show: function() {
          module.debug('Checking if dropdown can show');
          if( !module.is.active() ) {
            module.animate.show(function() {
              if( module.can.click() ) {
                module.bind.intent();
              }
              module.set.visible();
            });
            $.proxy(settings.onShow, element)();
          }
        },

        hide: function() {
          if( module.is.active() ) {
            module.debug('Hiding dropdown');
            module.animate.hide(function() {
              module.remove.visible();
            });
            $.proxy(settings.onHide, element)();
          }
        },

        hideOthers: function() {
          module.verbose('Finding other dropdowns to hide');
          $allModules
            .not($module)
              .has(selector.menu + ':visible:not(.' + className.animating + ')')
                .dropdown('hide')
          ;
        },

        hideSubMenus: function() {
          var
            $subMenus = $menu.find(selector.menu),
            $activeSubMenu = $subMenus.has(selector.item + '.' + className.active)
          ;
          $subMenus
            .not($activeSubMenu)
              .removeClass(className.visible)
              .removeAttr('style')
          ;
        },

        bind: {
          keyboardEvents: function() {
            module.debug('Binding keyboard events');
            $module
              .on('keydown' + eventNamespace, module.event.keydown)
            ;
            if( module.is.searchable() ) {
              $module
                .on(module.get.inputEvent(), selector.search, module.event.input)
              ;
            }
          },
          touchEvents: function() {
            module.debug('Touch device detected binding additional touch events');
            if( module.is.searchSelection() ) {
              // do nothing special yet
            }
            else {
              $module
                .on('touchstart' + eventNamespace, module.event.test.toggle)
              ;
            }
            $menu
              .on('touchstart' + eventNamespace, selector.item, module.event.item.mouseenter)
            ;
          },
          mouseEvents: function() {
            module.verbose('Mouse detected binding mouse events');
            if( module.is.searchSelection() ) {
              $module
                .on('mousedown' + eventNamespace, selector.menu, module.event.menu.activate)
                .on('mouseup'   + eventNamespace, selector.menu, module.event.menu.deactivate)
                .on('focus'     + eventNamespace, selector.search, module.event.searchFocus)
                .on('click'     + eventNamespace, selector.search, module.show)
                .on('blur'      + eventNamespace, selector.search, module.event.searchBlur)
              ;
            }
            else {
              if(settings.on == 'click') {
                $module
                  .on('click' + eventNamespace, module.event.test.toggle)
                ;
              }
              else if(settings.on == 'hover') {
                $module
                  .on('mouseenter' + eventNamespace, module.delay.show)
                  .on('mouseleave' + eventNamespace, module.delay.hide)
                ;
              }
              else {
                $module
                  .on(settings.on + eventNamespace, module.toggle)
                ;
              }
              $module
                .on('mousedown' + eventNamespace, module.event.mousedown)
                .on('mouseup'   + eventNamespace, module.event.mouseup)
                .on('focus'     + eventNamespace, module.event.focus)
                .on('blur'      + eventNamespace, module.event.blur)
              ;
            }
            $menu
              .on('mouseenter' + eventNamespace, selector.item, module.event.item.mouseenter)
              .on('mouseleave' + eventNamespace, selector.item, module.event.item.mouseleave)
              .on('click'      + eventNamespace, selector.item, module.event.item.click)
            ;
          },
          intent: function() {
            module.verbose('Binding hide intent event to document');
            if(hasTouch) {
              $document
                .on('touchstart' + eventNamespace, module.event.test.touch)
                .on('touchmove'  + eventNamespace, module.event.test.touch)
              ;
            }
            $document
              .on('click' + eventNamespace, module.event.test.hide)
            ;
          }
        },

        unbind: {
          intent: function() {
            module.verbose('Removing hide intent event from document');
            if(hasTouch) {
              $document
                .off('touchstart' + eventNamespace)
                .off('touchmove' + eventNamespace)
              ;
            }
            $document
              .off('click' + eventNamespace)
            ;
          }
        },

        filter: function(searchTerm) {
          var
            $results       = $(),
            exactRegExp    = new RegExp('(?:\s|^)' + searchTerm, 'i'),
            fullTextRegExp = new RegExp(searchTerm, 'i'),
            allItemsFiltered,
            $filteredItems
          ;
          $item
            .each(function(){
              var
                $choice = $(this),
                text    = ( $choice.data(metadata.text) !== undefined )
                  ? $choice.data(metadata.text)
                  : (settings.preserveHTML)
                    ? $choice.html()
                    : $choice.text(),
                value   = ( $choice.data(metadata.value) !== undefined)
                  ? $choice.data(metadata.value)
                  : (typeof text === 'string')
                      ? text.toLowerCase()
                      : text
              ;
              if( exactRegExp.test( text ) || exactRegExp.test( value ) ) {
                $results = $results.add($choice);
              }
              else if(settings.fullTextSearch) {
                if( fullTextRegExp.test( text ) || fullTextRegExp.test( value ) ) {
                  $results = $results.add($choice);
                }
              }
            })
          ;
          $filteredItems   = $item.not($results);
          allItemsFiltered = ($filteredItems.size() == $item.size());

          module.remove.filteredItem();
          module.remove.selectedItem();
          $filteredItems
            .addClass(className.filtered)
          ;
          $item
            .not('.' + className.filtered)
              .eq(0)
              .addClass(className.selected)
          ;
          if(allItemsFiltered) {
            module.hide();
          }
        },

        focusSearch: function() {
          if( module.is.search() ) {
            $search
              .focus()
            ;
          }
        },

        event: {
          // prevents focus callback from occuring on mousedown
          mousedown: function() {
            activated = true;
          },
          mouseup: function() {
            activated = false;
          },
          focus: function() {
            if(!activated && module.is.hidden()) {
              module.show();
            }
          },
          blur: function(event) {
            if(!activated) {
              module.hide();
            }
          },
          searchFocus: function() {
            activated = true;
            module.show();
          },
          searchBlur: function(event) {
            if(!itemActivated) {
              module.hide();
            }
          },
          input: function(event) {
            var
              query = $search.val()
            ;
            if(module.is.searchSelection()) {
              if( module.can.show() ) {
                module.show();
              }
              module.set.filtered();
            }
            module.filter(query);
          },
          keydown: function(event) {
            var
              $selectedItem = $item.not(className.filtered).filter('.' + className.selected).eq(0),
              $visibleItems = $item.not('.' + className.filtered),
              pressedKey    = event.which,
              keys          = {
                enter     : 13,
                escape    : 27,
                upArrow   : 38,
                downArrow : 40
              },
              selectedClass   = className.selected,
              currentIndex    = $visibleItems.index( $selectedItem ),
              hasSelectedItem = ($selectedItem.size() > 0),
              $nextItem,
              newIndex
            ;
            // default to activated choice if no selection present
            if(!hasSelectedItem) {
              $selectedItem   = $item.filter('.' + className.active).eq(0);
              hasSelectedItem = ($selectedItem.size() > 0);
            }
            // close shortcuts
            if(pressedKey == keys.escape) {
              module.verbose('Escape key pressed, closing dropdown');
              module.hide();
            }
            // result shortcuts
            if(module.is.visible()) {
              if(pressedKey == keys.enter && hasSelectedItem) {
                module.verbose('Enter key pressed, choosing selected item');
                $.proxy(module.event.item.click, $selectedItem)(event);
                event.preventDefault();
                return false;
              }
              else if(pressedKey == keys.upArrow) {
                if(!hasSelectedItem) {
                  $nextItem = $visibleItems.eq(0);
                }
                else {
                  $nextItem = $selectedItem.prevAll(selector.item + ':not(.' + className.filtered + ')').eq(0);
                }
                if(currentIndex !== 0) {
                  module.verbose('Up key pressed, changing active item');
                  $item
                    .removeClass(selectedClass)
                  ;
                  $nextItem
                    .addClass(selectedClass)
                  ;
                  module.set.scrollPosition($nextItem);
                }
                event.preventDefault();
              }
              else if(pressedKey == keys.downArrow) {
                if(!hasSelectedItem) {
                  $nextItem = $visibleItems.eq(0);
                }
                else {
                  $nextItem = $selectedItem.nextAll(selector.item + ':not(.' + className.filtered + ')').eq(0);
                }
                if(currentIndex + 1 < $visibleItems.size() ) {
                  module.verbose('Down key pressed, changing active item');
                  $item
                    .removeClass(selectedClass)
                  ;
                  $nextItem
                    .addClass(selectedClass)
                  ;
                  module.set.scrollPosition($nextItem);
                }
                event.preventDefault();
              }
            }
            else {
              if(pressedKey == keys.enter) {
                module.show();
              }
            }
          },
          test: {
            toggle: function(event) {
              if( module.determine.eventInMenu(event, module.toggle) ) {
                event.preventDefault();
              }
            },
            touch: function(event) {
              module.determine.eventInMenu(event, function() {
                if(event.type == 'touchstart') {
                  module.timer = setTimeout(module.hide, settings.delay.touch);
                }
                else if(event.type == 'touchmove') {
                  clearTimeout(module.timer);
                }
              });
              event.stopPropagation();
            },
            hide: function(event) {
              module.determine.eventInModule(event, module.hide);
            }
          },

          menu: {
            activate: function() {
              itemActivated = true;
            },
            deactivate: function() {
              itemActivated = false;
            }
          },
          item: {
            mouseenter: function(event) {
              var
                $currentMenu = $(this).find(selector.menu),
                $otherMenus  = $(this).siblings(selector.item).children(selector.menu)
              ;
              if( $currentMenu.size() > 0 ) {
                clearTimeout(module.itemTimer);
                module.itemTimer = setTimeout(function() {
                  module.animate.hide(false, $otherMenus);
                  module.verbose('Showing sub-menu', $currentMenu);
                  module.animate.show(false,  $currentMenu);
                }, settings.delay.show * 2);
                event.preventDefault();
              }
            },

            mouseleave: function(event) {
              var
                $currentMenu = $(this).find(selector.menu)
              ;
              if($currentMenu.size() > 0) {
                clearTimeout(module.itemTimer);
                module.itemTimer = setTimeout(function() {
                  module.verbose('Hiding sub-menu', $currentMenu);
                  module.animate.hide(false,  $currentMenu);
                }, settings.delay.hide);
              }
            },

            click: function (event) {
              var
                $choice = $(this),
                text    = ( $choice.data(metadata.text) !== undefined )
                  ? $choice.data(metadata.text)
                  : (settings.preserveHTML)
                    ? $choice.html()
                    : $choice.text(),
                value   = ( $choice.data(metadata.value) !== undefined)
                  ? $choice.data(metadata.value)
                  : (typeof text === 'string')
                      ? text.toLowerCase()
                      : text,
                callback = function() {
                  module.remove.searchTerm();
                  module.remove.filteredItem();
                  module.determine.selectAction(text, value);
                  $.proxy(settings.onChange, element)(value, text, $choice);
                },
                openingSubMenu = ($choice.find(selector.menu).size() > 0)
              ;
              if( !openingSubMenu ) {
                callback();
              }
            }

          },

          resetStyle: function() {
            $(this).removeAttr('style');
          }

        },

        determine: {
          selectAction: function(text, value) {
            module.verbose('Determining action', settings.action);
            if( $.isFunction( module.action[settings.action] ) ) {
              module.verbose('Triggering preset action', settings.action, text, value);
              module.action[ settings.action ](text, value);
            }
            else if( $.isFunction(settings.action) ) {
              module.verbose('Triggering user action', settings.action, text, value);
              settings.action(text, value);
            }
            else {
              module.error(error.action, settings.action);
            }
          },
          eventInModule: function(event, callback) {
            callback = callback || function(){};
            if( $(event.target).closest($module).size() === 0 ) {
              module.verbose('Triggering event', callback);
              callback();
              return true;
            }
            else {
              module.verbose('Event occurred in dropdown, canceling callback');
              return false;
            }
          },
          eventInMenu: function(event, callback) {
            callback = callback || function(){};
            if( $(event.target).closest($menu).size() === 0 ) {
              module.verbose('Triggering event', callback);
              callback();
              return true;
            }
            else {
              module.verbose('Event occurred in dropdown menu, canceling callback');
              return false;
            }
          }
        },

        action: {

          nothing: function() {},

          hide: function() {
            module.hide();
          },

          select: function(text, value) {
            value = (value !== undefined)
              ? value
              : text
            ;
            module.set.selected(value);
            module.set.value(value);
            module.hide();
          },

          activate: function(text, value) {
            value = (value !== undefined)
              ? value
              : text
            ;
            module.set.selected(value);
            module.set.value(value);
            module.hide();
          },

          combo: function(text, value) {
            value = (value !== undefined)
              ? value
              : text
            ;
            module.set.selected(value);
            module.set.value(value);
            module.hide();
          }

        },

        get: {
          text: function() {
            return $text.text();
          },
          value: function() {
            return ($input.size() > 0)
              ? $input.val()
              : $module.data(metadata.value)
            ;
          },
          inputEvent: function() {
            var
              input = $search[0]
            ;
            if(input) {
              return (input.oninput !== undefined)
                ? 'input'
                : (input.onpropertychange !== undefined)
                  ? 'propertychange'
                  : 'keyup'
              ;
            }
            return false;
          },
          selectValues: function() {
            var
              select = {
                values : {}
              }
            ;
            $module
              .find('option')
                .each(function() {
                  var
                    name  = $(this).html(),
                    value = ( $(this).attr('value') !== undefined )
                      ? $(this).attr('value')
                      : name
                  ;
                  if(value === '') {
                    select.placeholder = name;
                  }
                  else {
                    select.values[value] = name;
                  }
                })
            ;
            module.debug('Retrieved values from select', select);
            return select;
          },
          item: function(value, strict) {
            var
              $selectedItem = false
            ;
            value = (value !== undefined)
              ? value
              : ( module.get.value() !== undefined)
                ? module.get.value()
                : module.get.text()
            ;
            strict = (value === '' || value === 0)
              ? true
              : strict || false
            ;
            if(value !== undefined) {
              $item
                .each(function() {
                  var
                    $choice       = $(this),
                    optionText    = ( $choice.data(metadata.text) !== undefined )
                      ? $choice.data(metadata.text)
                      : (settings.preserveHTML)
                        ? $choice.html()
                        : $choice.text(),
                    optionValue   = ( $choice.data(metadata.value) !== undefined )
                      ? $choice.data(metadata.value)
                      : (typeof optionText === 'string')
                        ? optionText.toLowerCase()
                        : optionText
                  ;
                  if(strict) {
                    module.verbose('Ambiguous dropdown value using strict type check', $choice, value);
                    if( optionValue === value ) {
                      $selectedItem = $(this);
                    }
                    else if( !$selectedItem && optionText === value ) {
                      $selectedItem = $(this);
                    }
                  }
                  else {
                    if( optionValue == value ) {
                      module.verbose('Found select item by value', optionValue, value);
                      $selectedItem = $(this);
                    }
                    else if( !$selectedItem && optionText == value ) {
                      module.verbose('Found select item by text', optionText, value);
                      $selectedItem = $(this);
                    }
                  }
                })
              ;
            }
            else {
              value = module.get.text();
            }
            return $selectedItem || false;
          }
        },

        restore: {
          defaults: function() {
            module.restore.defaultText();
            module.restore.defaultValue();
          },
          defaultText: function() {
            var
              defaultText = $module.data(metadata.defaultText)
            ;
            module.debug('Restoring default text', defaultText);
            module.set.text(defaultText);
          },
          defaultValue: function() {
            var
              defaultValue = $module.data(metadata.defaultValue)
            ;
            if(defaultValue !== undefined) {
              module.debug('Restoring default value', defaultValue);
              module.set.selected(defaultValue);
              module.set.value(defaultValue);
            }
          }
        },

        save: {
          defaults: function() {
            module.save.defaultText();
            module.save.defaultValue();
          },
          defaultValue: function() {
            $module.data(metadata.defaultValue, module.get.value() );
          },
          defaultText: function() {
            $module.data(metadata.defaultText, $text.text() );
          }
        },

        set: {
          filtered: function() {
            $text.addClass(className.filtered);
          },
          tabbable: function() {
            if( module.is.searchable() ) {
              module.debug('Searchable dropdown initialized');
              $search
                .val('')
                .attr('tabindex', 0)
              ;
              $menu
                .attr('tabindex', '-1')
              ;
            }
            else {
              module.debug('Simple selection dropdown initialized');
              if(!$module.attr('tabindex') ) {
                $module
                  .attr('tabindex', 0)
                ;
                $menu
                  .attr('tabindex', '-1')
                ;
              }
            }
          },
          scrollPosition: function($item) {
            var
              $item         = $item || module.get.item(),
              hasActive     = ($item && $item.size() > 0),
              edgeTolerance = 5,
              offset,
              itemHeight,
              itemOffset,
              menuOffset,
              menuScroll,
              menuHeight,
              abovePage,
              belowPage
            ;
            if($item && hasActive) {
              menuHeight = $menu.height();
              itemHeight = $item.height();
              menuScroll = $menu.scrollTop();
              menuOffset = $menu.offset().top;
              itemOffset = $item.offset().top;
              offset     = menuScroll - menuOffset + itemOffset;
              belowPage  = menuScroll + menuHeight < (offset + edgeTolerance);
              abovePage  = ((offset - edgeTolerance) < menuScroll);
              if(abovePage || belowPage) {
                module.debug('Scrolling to active item');
                $menu
                  .scrollTop(offset)
                ;
              }
            }
          },
          text: function(text) {
            if(settings.action == 'combo') {
              module.debug('Changing combo button text', text, $combo);
              if(settings.preserveHTML) {
                $combo.html(text);
              }
              else {
                $combo.text(text);
              }
            }
            else if(settings.action !== 'select') {
              module.debug('Changing text', text, $text);
              $text
                .removeClass(className.filtered)
                .removeClass(className.placeholder)
              ;
              if(settings.preserveHTML) {
                $text.html(text);
              }
              else {
                $text.text(text);
              }
            }
          },
          value: function(value) {
            module.debug('Adding selected value to hidden input', value, $input);
            if($input.size() > 0) {
              $input
                .val(value)
                .trigger('change')
              ;
            }
            else {
              $module.data(metadata.value, value);
            }
          },
          active: function() {
            $module
              .addClass(className.active)
            ;
          },
          visible: function() {
            $module.addClass(className.visible);
          },
          selected: function(value) {
            var
              $selectedItem = module.get.item(value),
              selectedText
            ;
            if($selectedItem) {
              module.debug('Setting selected menu item to', $selectedItem);
              selectedText = ($selectedItem.data(metadata.text) !== undefined)
                ? $selectedItem.data(metadata.text)
                : (settings.preserveHTML)
                  ? $selectedItem.html()
                  : $selectedItem.text()
              ;
              module.remove.activeItem();
              module.remove.selectedItem();
              $selectedItem
                .addClass(className.active)
                .addClass(className.selected)
              ;
              module.set.text(selectedText);
            }
          }
        },

        remove: {
          active: function() {
            $module.removeClass(className.active);
          },
          visible: function() {
            $module.removeClass(className.visible);
          },
          activeItem: function() {
            $item.removeClass(className.active);
          },
          filteredItem: function() {
            $item.removeClass(className.filtered);
          },
          searchTerm: function() {
            $search.val('');
          },
          selectedItem: function() {
            $item.removeClass(className.selected);
          },
          tabbable: function() {
            if( module.is.searchable() ) {
              module.debug('Searchable dropdown initialized');
              $search
                .attr('tabindex', '-1')
              ;
              $menu
                .attr('tabindex', '-1')
              ;
            }
            else {
              module.debug('Simple selection dropdown initialized');
              $module
                .attr('tabindex', '-1')
              ;
              $menu
                .attr('tabindex', '-1')
              ;
            }
          }
        },

        is: {
          search: function() {
            return $module.hasClass(className.search);
          },
          searchable: function() {
            return ($search.size() > 0);
          },
          searchSelection: function() {
            return ( module.is.searchable() && $search.parent().is($module) );
          },
          selection: function() {
            return $module.hasClass(className.selection);
          },
          animated: function($subMenu) {
            return ($subMenu)
              ? $subMenu.is(':animated') || $subMenu.transition && $subMenu.transition('is animating')
              : $menu.is(':animated') || $menu.transition && $menu.transition('is animating')
            ;
          },
          active: function() {
            return $module.hasClass(className.active);
          },
          visible: function($subMenu) {
            return ($subMenu)
              ? $subMenu.is(':visible')
              : $menu.is(':visible')
            ;
          },
          hidden: function($subMenu) {
            return ($subMenu)
              ? $subMenu.is(':hidden')
              : $menu.is(':hidden')
            ;
          }
        },

        can: {
          click: function() {
            return (hasTouch || settings.on == 'click');
          },
          show: function() {
            return !$module.hasClass(className.disabled);
          }
        },

        animate: {
          show: function(callback, $subMenu) {
            var
              $currentMenu = $subMenu || $menu,
              start = ($subMenu)
                ? function() {}
                : function() {
                  module.hideOthers();
                  module.set.active();
                  module.set.scrollPosition();
                }
            ;
            callback = callback || function(){};
            module.verbose('Doing menu show animation', $currentMenu);
            if( module.is.hidden($currentMenu) ) {
              if(settings.transition == 'none') {
                $.proxy(callback, element)();
              }
              else if($.fn.transition !== undefined && $module.transition('is supported')) {
                $currentMenu
                  .transition({
                    animation  : settings.transition + ' in',
                    debug      : settings.debug,
                    verbose    : settings.verbose,
                    duration   : settings.duration,
                    queue      : true,
                    onStart    : start,
                    onComplete : function() {
                      $.proxy(callback, element)();
                    }
                  })
                ;
              }
              else if(settings.transition == 'slide down') {
                start();
                $currentMenu
                  .hide()
                  .clearQueue()
                  .children()
                    .clearQueue()
                    .css('opacity', 0)
                    .delay(50)
                    .animate({
                      opacity : 1
                    }, settings.duration, 'easeOutQuad', module.event.resetStyle)
                    .end()
                  .slideDown(100, 'easeOutQuad', function() {
                    $.proxy(module.event.resetStyle, this)();
                    $.proxy(callback, element)();
                  })
                ;
              }
              else if(settings.transition == 'fade') {
                start();
                $currentMenu
                  .hide()
                  .clearQueue()
                  .fadeIn(settings.duration, function() {
                    $.proxy(module.event.resetStyle, this)();
                    $.proxy(callback, element)();
                  })
                ;
              }
              else {
                module.error(error.transition, settings.transition);
              }
            }
          },
          hide: function(callback, $subMenu) {
            var
              $currentMenu = $subMenu || $menu,
              start = ($subMenu)
                ? function() {}
                : function() {
                  if( module.can.click() ) {
                    module.unbind.intent();
                  }
                  module.focusSearch();
                  module.hideSubMenus();
                  module.remove.active();
                }
            ;
            callback = callback || function(){};
            if( module.is.visible($currentMenu) ) {
              module.verbose('Doing menu hide animation', $currentMenu);

              if(settings.transition == 'none') {
                $.proxy(callback, element)();
              }
              else if($.fn.transition !== undefined && $module.transition('is supported')) {
                $currentMenu
                  .transition({
                    animation  : settings.transition + ' out',
                    duration   : settings.duration,
                    debug      : settings.debug,
                    verbose    : settings.verbose,
                    queue      : true,
                    onStart    : start,
                    onComplete : function() {
                      $.proxy(callback, element)();
                    }
                  })
                ;
              }
              else if(settings.transition == 'slide down') {
                start();
                $currentMenu
                  .show()
                  .clearQueue()
                  .children()
                    .clearQueue()
                    .css('opacity', 1)
                    .animate({
                      opacity : 0
                    }, 100, 'easeOutQuad', module.event.resetStyle)
                    .end()
                  .delay(50)
                  .slideUp(100, 'easeOutQuad', function() {
                    $.proxy(module.event.resetStyle, this)();
                    $.proxy(callback, element)();
                  })
                ;
              }
              else if(settings.transition == 'fade') {
                start();
                $currentMenu
                  .show()
                  .clearQueue()
                  .fadeOut(150, function() {
                    $.proxy(module.event.resetStyle, this)();
                    $.proxy(callback, element)();
                  })
                ;
              }
              else {
                module.error(error.transition);
              }
            }
          }
        },

        delay: {
          show: function() {
            module.verbose('Delaying show event to ensure user intent');
            clearTimeout(module.timer);
            module.timer = setTimeout(module.show, settings.delay.show);
          },
          hide: function() {
            module.verbose('Delaying hide event to ensure user intent');
            clearTimeout(module.timer);
            module.timer = setTimeout(module.hide, settings.delay.hide);
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

$.fn.dropdown.settings = {

  debug          : false,
  verbose        : true,
  performance    : true,

  on             : 'click',
  action         : 'activate',

  allowTab       : true,
  fullTextSearch : true,
  preserveHTML   : true,

  delay          : {
    show  : 200,
    hide  : 300,
    touch : 50
  },

  transition : 'slide down',
  duration   : 250,

  /* Callbacks */

  onChange   : function(value, text){},
  onShow     : function(){},
  onHide     : function(){},

  /* Component */

  name           : 'Dropdown',
  namespace      : 'dropdown',

  error   : {
    action     : 'You called a dropdown action that was not defined',
    method     : 'The method you called is not defined.',
    transition : 'The requested transition was not found'
  },

  metadata: {
    defaultText  : 'defaultText',
    defaultValue : 'defaultValue',
    text         : 'text',
    value        : 'value'
  },

  selector : {
    dropdown : '.ui.dropdown',
    text     : '> .text:not(.icon)',
    input    : '> input[type="hidden"], > select',
    search   : '> input.search, .menu > .search > input, .menu > input.search',
    menu     : '.menu',
    item     : '.item'
  },

  className : {
    active      : 'active',
    animating   : 'animating',
    disabled    : 'disabled',
    dropdown    : 'ui dropdown',
    filtered    : 'filtered',
    menu        : 'menu',
    placeholder : 'default',
    search      : 'search',
    selected    : 'selected',
    selection   : 'selection',
    visible     : 'visible'
  }

};

/* Templates */
$.fn.dropdown.settings.templates = {
  menu: function(select) {
    var
      placeholder = select.placeholder || false,
      values      = select.values || {},
      html        = ''
    ;
    $.each(select.values, function(value, name) {
      if(value === name) {
        html += '<div class="item">' + name + '</div>';
      }
      else {
        html += '<div class="item" data-value="' + value + '">' + name + '</div>';
      }
    });
    return html;
  },
  dropdown: function(select) {
    var
      placeholder = select.placeholder || false,
      values      = select.values || {},
      html        = ''
    ;
    html +=  '<i class="dropdown icon"></i>';
    if(select.placeholder) {
      html += '<div class="default text">' + placeholder + '</div>';
    }
    else {
      html += '<div class="text"></div>';
    }
    html += '<div class="menu">';
    $.each(select.values, function(value, name) {
      if(value === name) {
        html += '<div class="item">' + name + '</div>';
      }
      else {
        html += '<div class="item" data-value="' + value + '">' + name + '</div>';
      }
    });
    html += '</div>';
    return html;
  }
};


/* Dependencies */
$.extend( $.easing, {
  easeOutQuad: function (x, t, b, c, d) {
    return -c *(t/=d)*(t-2) + b;
  },
});


})( jQuery, window , document );
/*
 * # Semantic - Form Validation
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

$.fn.form = function(fields, parameters) {
  var
    $allModules     = $(this),

    settings        = $.extend(true, {}, $.fn.form.settings, parameters),
    validation      = $.extend({}, $.fn.form.settings.defaults, fields),

    namespace       = settings.namespace,
    metadata        = settings.metadata,
    selector        = settings.selector,
    className       = settings.className,
    error           = settings.error,

    eventNamespace  = '.' + namespace,
    moduleNamespace = 'module-' + namespace,

    moduleSelector  = $allModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),
    returnedValue
  ;
  $allModules
    .each(function() {
      var
        $module    = $(this),
        $field     = $(this).find(selector.field),
        $group     = $(this).find(selector.group),
        $message   = $(this).find(selector.message),
        $prompt    = $(this).find(selector.prompt),
        $submit    = $(this).find(selector.submit),

        formErrors = [],

        element    = this,
        instance   = $module.data(moduleNamespace),
        module
      ;

      module      = {

        initialize: function() {
          module.verbose('Initializing form validation', $module, validation, settings);
          module.bindEvents();
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
          module.verbose('Destroying previous module', instance);
          module.removeEvents();
          $module
            .removeData(moduleNamespace)
          ;
        },

        refresh: function() {
          module.verbose('Refreshing selector cache');
          $field = $module.find(selector.field);
        },

        submit: function() {
          module.verbose('Submitting form', $module);
          $module
            .submit()
          ;
        },

        attachEvents: function(selector, action) {
          action = action || 'submit';
          $(selector)
            .on('click', function(event) {
              module[action]();
              event.preventDefault();
            })
          ;
        },

        bindEvents: function() {

          if(settings.keyboardShortcuts) {
            $field
              .on('keydown' + eventNamespace, module.event.field.keydown)
            ;
          }
          $module
            .on('submit' + eventNamespace, module.validate.form)
          ;
          $field
            .on('blur' + eventNamespace, module.event.field.blur)
          ;
          // attach submit events
          module.attachEvents($submit, 'submit');

          $field
            .each(function() {
              var
                type       = $(this).prop('type'),
                inputEvent = module.get.changeEvent(type)
              ;
              $(this)
                .on(inputEvent + eventNamespace, module.event.field.change)
              ;
            })
          ;
        },

        removeEvents: function() {
          $module
            .off(eventNamespace)
          ;
          $field
            .off(eventNamespace)
          ;
          $submit
            .off(eventNamespace)
          ;
          $field
            .off(eventNamespace)
          ;
        },

        event: {
          field: {
            keydown: function(event) {
              var
                $field  = $(this),
                key     = event.which,
                keyCode = {
                  enter  : 13,
                  escape : 27
                }
              ;
              if( key == keyCode.escape) {
                module.verbose('Escape key pressed blurring field');
                $field
                  .blur()
                ;
              }
              if(!event.ctrlKey && key == keyCode.enter && $field.is(selector.input) && $field.not(selector.checkbox).size() > 0 ) {
                module.debug('Enter key pressed, submitting form');
                $submit
                  .addClass(className.down)
                ;
                $field
                  .one('keyup' + eventNamespace, module.event.field.keyup)
                ;
              }
            },
            keyup: function() {
              module.verbose('Doing keyboard shortcut form submit');
              $submit.removeClass(className.down);
              module.submit();
            },
            blur: function() {
              var
                $field      = $(this),
                $fieldGroup = $field.closest($group)
              ;
              if( $fieldGroup.hasClass(className.error) ) {
                module.debug('Revalidating field', $field,  module.get.validation($field));
                module.validate.field( module.get.validation($field) );
              }
              else if(settings.on == 'blur' || settings.on == 'change') {
                module.validate.field( module.get.validation($field) );
              }
            },
            change: function() {
              var
                $field      = $(this),
                $fieldGroup = $field.closest($group)
              ;
              if(settings.on == 'change' || ( $fieldGroup.hasClass(className.error) && settings.revalidate) ) {
                clearTimeout(module.timer);
                module.timer = setTimeout(function() {
                  module.debug('Revalidating field', $field,  module.get.validation($field));
                  module.validate.field( module.get.validation($field) );
                }, settings.delay);
              }
            }
          }

        },

        get: {
          changeEvent: function(type) {
            if(type == 'checkbox' || type == 'radio') {
              return 'change';
            }
            else {
              return (document.createElement('input').oninput !== undefined)
                ? 'input'
                : (document.createElement('input').onpropertychange !== undefined)
                  ? 'propertychange'
                  : 'keyup'
              ;
            }
          },
          field: function(identifier) {
            module.verbose('Finding field with identifier', identifier);
            if( $field.filter('#' + identifier).size() > 0 ) {
              return $field.filter('#' + identifier);
            }
            else if( $field.filter('[name="' + identifier +'"]').size() > 0 ) {
              return $field.filter('[name="' + identifier +'"]');
            }
            else if( $field.filter('[data-' + metadata.validate + '="'+ identifier +'"]').size() > 0 ) {
              return $field.filter('[data-' + metadata.validate + '="'+ identifier +'"]');
            }
            return $('<input/>');
          },
          validation: function($field) {
            var
              rules
            ;
            $.each(validation, function(fieldName, field) {
              if( module.get.field(field.identifier).get(0) == $field.get(0) ) {
                rules = field;
              }
            });
            return rules || false;
          }
        },

        has: {

          field: function(identifier) {
            module.verbose('Checking for existence of a field with identifier', identifier);
            if( $field.filter('#' + identifier).size() > 0 ) {
              return true;
            }
            else if( $field.filter('[name="' + identifier +'"]').size() > 0 ) {
              return true;
            }
            else if( $field.filter('[data-' + metadata.validate + '="'+ identifier +'"]').size() > 0 ) {
              return true;
            }
            return false;
          }

        },

        add: {
          prompt: function(identifier, errors) {
            var
              $field       = module.get.field(identifier),
              $fieldGroup  = $field.closest($group),
              $prompt      = $fieldGroup.find(selector.prompt),
              promptExists = ($prompt.size() !== 0)
            ;
            errors = (typeof errors == 'string')
              ? [errors]
              : errors
            ;
            module.verbose('Adding field error state', identifier);
            $fieldGroup
              .addClass(className.error)
            ;
            if(settings.inline) {
              if(!promptExists) {
                $prompt = settings.templates.prompt(errors);
                $prompt
                  .appendTo($fieldGroup)
                ;
              }
              $prompt
                .html(errors[0])
              ;
              if(!promptExists) {
                if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
                  module.verbose('Displaying error with css transition', settings.transition);
                  $prompt.transition(settings.transition + ' in', settings.duration);
                }
                else {
                  module.verbose('Displaying error with fallback javascript animation');
                  $prompt
                    .fadeIn(settings.duration)
                  ;
                }
              }
              else {
                module.verbose('Inline errors are disabled, no inline error added', identifier);
              }
            }
          },
          errors: function(errors) {
            module.debug('Adding form error messages', errors);
            $message
              .html( settings.templates.error(errors) )
            ;
          }
        },

        remove: {
          prompt: function(field) {
            var
              $field      = module.get.field(field.identifier),
              $fieldGroup = $field.closest($group),
              $prompt     = $fieldGroup.find(selector.prompt)
            ;
            $fieldGroup
              .removeClass(className.error)
            ;
            if(settings.inline && $prompt.is(':visible')) {
              module.verbose('Removing prompt for field', field);
              if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
                $prompt.transition(settings.transition + ' out', settings.duration, function() {
                  $prompt.remove();
                });
              }
              else {
                $prompt
                  .fadeOut(settings.duration, function(){
                    $prompt.remove();
                  })
                ;
              }
            }
          }
        },

        set: {
          success: function() {
            $module
              .removeClass(className.error)
              .addClass(className.success)
            ;
          },
          error: function() {
            $module
              .removeClass(className.success)
              .addClass(className.error)
            ;
          }
        },

        validate: {

          form: function(event) {
            var
              allValid = true,
              apiRequest
            ;
            // reset errors
            formErrors = [];
            $.each(validation, function(fieldName, field) {
              if( !( module.validate.field(field) ) ) {
                allValid = false;
              }
            });
            if(allValid) {
              module.debug('Form has no validation errors, submitting');
              module.set.success();
              return $.proxy(settings.onSuccess, this)(event);
            }
            else {
              module.debug('Form has errors');
              module.set.error();
              if(!settings.inline) {
                module.add.errors(formErrors);
              }
              // prevent ajax submit
              if($module.data('moduleApi') !== undefined) {
                event.stopImmediatePropagation();
              }
              return $.proxy(settings.onFailure, this)(formErrors);
            }
          },

          // takes a validation object and returns whether field passes validation
          field: function(field) {
            var
              $field      = module.get.field(field.identifier),
              fieldValid  = true,
              fieldErrors = []
            ;
            if(field.rules !== undefined) {
              $.each(field.rules, function(index, rule) {
                if( module.has.field(field.identifier) && !( module.validate.rule(field, rule) ) ) {
                  module.debug('Field is invalid', field.identifier, rule.type);
                  fieldErrors.push(rule.prompt);
                  fieldValid = false;
                }
              });
            }
            if(fieldValid) {
              module.remove.prompt(field, fieldErrors);
              $.proxy(settings.onValid, $field)();
            }
            else {
              formErrors = formErrors.concat(fieldErrors);
              module.add.prompt(field.identifier, fieldErrors);
              $.proxy(settings.onInvalid, $field)(fieldErrors);
              return false;
            }
            return true;
          },

          // takes validation rule and returns whether field passes rule
          rule: function(field, validation) {
            var
              $field        = module.get.field(field.identifier),
              type          = validation.type,
              value         = $.trim($field.val() + ''),

              bracketRegExp = /\[(.*)\]/i,
              bracket       = bracketRegExp.exec(type),
              isValid       = true,
              ancillary,
              functionType
            ;
            // if bracket notation is used, pass in extra parameters
            if(bracket !== undefined && bracket !== null) {
              ancillary    = '' + bracket[1];
              functionType = type.replace(bracket[0], '');
              isValid      = $.proxy(settings.rules[functionType], $module)(value, ancillary);
            }
            // normal notation
            else {
              isValid = $.proxy(settings.rules[type], $field)(value);
            }
            return isValid;
          }
        },

        setting: function(name, value) {
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

$.fn.form.settings = {

  name              : 'Form',
  namespace         : 'form',

  debug             : false,
  verbose           : true,
  performance       : true,


  keyboardShortcuts : true,
  on                : 'submit',
  inline            : false,

  delay             : 200,
  revalidate        : true,

  transition        : 'scale',
  duration          : 150,


  onValid           : function() {},
  onInvalid         : function() {},
  onSuccess         : function() { return true; },
  onFailure         : function() { return false; },

  metadata : {
    validate: 'validate'
  },

  selector : {
    message : '.error.message',
    field   : 'input, textarea, select',
    group   : '.field',
    checkbox: 'input[type="checkbox"], input[type="radio"]',
    input   : 'input',
    prompt  : '.prompt',
    submit  : '.submit'
  },

  className : {
    error   : 'error',
    success : 'success',
    down    : 'down',
    label   : 'ui label prompt'
  },

  // errors
  error: {
    method   : 'The method you called is not defined.'
  },


  templates: {
    error: function(errors) {
      var
        html = '<ul class="list">'
      ;
      $.each(errors, function(index, value) {
        html += '<li>' + value + '</li>';
      });
      html += '</ul>';
      return $(html);
    },
    prompt: function(errors) {
      return $('<div/>')
        .addClass('ui red pointing prompt label')
        .html(errors[0])
      ;
    }
  },

  rules: {
    checked: function() {
      return ($(this).filter(':checked').size() > 0);
    },
    empty: function(value) {
      return !(value === undefined || '' === value);
    },
    email: function(value){
      var
        emailRegExp = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?", "i")
      ;
      return emailRegExp.test(value);
    },
    length: function(value, requiredLength) {
      return (value !== undefined)
        ? (value.length >= requiredLength)
        : false
      ;
    },
    not: function(value, notValue) {
      return (value != notValue);
    },
    contains: function(value, text) {
      text = text.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
      return (value.search(text) !== -1);
    },
    is: function(value, text) {
      return (value == text);
    },
    maxLength: function(value, maxLength) {
      return (value !== undefined)
        ? (value.length <= maxLength)
        : false
      ;
    },
    match: function(value, fieldIdentifier) {
      // use either id or name of field
      var
        $form = $(this),
        matchingValue
      ;
      if($form.find('#' + fieldIdentifier).size() > 0) {
        matchingValue = $form.find('#' + fieldIdentifier).val();
      }
      else if($form.find('[name="' + fieldIdentifier +'"]').size() > 0) {
        matchingValue = $form.find('[name="' + fieldIdentifier + '"]').val();
      }
      else if( $form.find('[data-validate="'+ fieldIdentifier +'"]').size() > 0 ) {
        matchingValue = $form.find('[data-validate="'+ fieldIdentifier +'"]').val();
      }
      return (matchingValue !== undefined)
        ? ( value.toString() == matchingValue.toString() )
        : false
      ;
    },
    url: function(value) {
      var
        urlRegExp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
      ;
      return urlRegExp.test(value);
    },
    integer: function(value, range) {
      var
        intRegExp = /^\-?\d+$/,
        min,
        max,
        parts
      ;
      if (range === undefined || range === '' || range === '..') {
        // do nothing
      }
      else if (range.indexOf('..') == -1) {
        if (intRegExp.test(range)) {
          min = max = range - 0;
        }
      }
      else {
        parts = range.split('..', 2);
        if (intRegExp.test(parts[0])) {
          min = parts[0] - 0;
        }
        if (intRegExp.test(parts[1])) {
          max = parts[1] - 0;
        }
      }
      return (
        intRegExp.test(value) &&
        (min === undefined || value >= min) &&
        (max === undefined || value <= max)
      );
    }
  }

};

})( jQuery, window , document );

/*
 * # Semantic - Modal
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

$.fn.modal = function(parameters) {
  var
    $allModules    = $(this),
    $window        = $(window),
    $document      = $(document),
    $body          = $('body'),

    moduleSelector = $allModules.selector || '',

    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),

    requestAnimationFrame = window.requestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.msRequestAnimationFrame
      || function(callback) { setTimeout(callback, 0); },

    returnedValue
  ;

  $allModules
    .each(function() {
      var
        settings    = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.modal.settings, parameters)
          : $.extend({}, $.fn.modal.settings),

        selector        = settings.selector,
        className       = settings.className,
        namespace       = settings.namespace,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        $module      = $(this),
        $context     = $(settings.context),
        $close       = $module.find(selector.close),

        $allModals,
        $otherModals,
        $focusedElement,
        $dimmable,
        $dimmer,

        element      = this,
        instance     = $module.data(moduleNamespace),
        observer,
        module
      ;
      module  = {

        initialize: function() {
          module.verbose('Initializing dimmer', $context);

          if($.fn.dimmer === undefined) {
            module.error(error.dimmer);
            return;
          }

          $dimmable = $context
            .dimmer({
              debug      : settings.debug,
              dimmerName : 'modals',
              closable   : false,
              useCSS     : true,
              duration   : {
                show     : settings.duration * 0.9,
                hide     : settings.duration * 1.1
              }
            })
          ;
          if(settings.detachable) {
            $dimmable.dimmer('add content', $module);
          }

          $dimmer = $dimmable.dimmer('get dimmer');
          $otherModals = $module.siblings(selector.modal);
          $allModals   = $otherModals.add($module);

          module.verbose('Attaching close events', $close);
          module.bind.events();
          module.observeChanges();

          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of modal');
          instance = module;
          $module
            .data(moduleNamespace, instance)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous modal');
          $module
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
          $close.off(eventNamespace);
          $context.dimmer('destroy');
        },

        observeChanges: function() {
          if('MutationObserver' in window) {
            observer = new MutationObserver(function(mutations) {
              module.debug('DOM tree modified, refreshing');
              module.refresh();
            });
            observer.observe(element, {
              childList : true,
              subtree   : true
            });
            module.debug('Setting up mutation observer', observer);
          }
        },

        refresh: function() {
          module.remove.scrolling();
          module.cacheSizes();
          module.set.screenHeight();
          module.set.type();
          module.set.position();
        },

        attachEvents: function(selector, event) {
          var
            $toggle = $(selector)
          ;
          event = $.isFunction(module[event])
            ? module[event]
            : module.toggle
          ;
          if($toggle.size() > 0) {
            module.debug('Attaching modal events to element', selector, event);
            $toggle
              .off(eventNamespace)
              .on('click' + eventNamespace, event)
            ;
          }
          else {
            module.error(error.notFound, selector);
          }
        },

        bind: {
          events: function() {
            $close
              .on('click' + eventNamespace, module.event.close)
            ;
            $window
              .on('resize' + eventNamespace, module.event.resize)
            ;
          }
        },

        event: {
          close: function() {
            module.verbose('Closing element pressed');
            if( $(this).is(selector.approve) ) {
              if($.proxy(settings.onApprove, element)() !== false) {
                module.hide();
              }
              else {
                module.verbose('Approve callback returned false cancelling hide');
              }
            }
            else if( $(this).is(selector.deny) ) {
              if($.proxy(settings.onDeny, element)() !== false) {
                module.hide();
              }
              else {
                module.verbose('Deny callback returned false cancelling hide');
              }
            }
            else {
              module.hide();
            }
          },
          click: function(event) {
            if( $(event.target).closest(selector.modal).size() === 0 ) {
              module.debug('Dimmer clicked, hiding all modals');
              if(settings.allowMultiple) {
                module.hide();
              }
              else {
                module.hideAll();
              }
              event.stopImmediatePropagation();
            }
          },
          debounce: function(method, delay) {
            clearTimeout(module.timer);
            module.timer = setTimeout(method, delay);
          },
          keyboard: function(event) {
            var
              keyCode   = event.which,
              escapeKey = 27
            ;
            if(keyCode == escapeKey) {
              if(settings.closable) {
                module.debug('Escape key pressed hiding modal');
                module.hide();
              }
              else {
                module.debug('Escape key pressed, but closable is set to false');
              }
              event.preventDefault();
            }
          },
          resize: function() {
            if( $dimmable.dimmer('is active') ) {
              requestAnimationFrame(module.refresh);
            }
          }
        },

        toggle: function() {
          if( module.is.active() || module.is.animating() ) {
            module.hide();
          }
          else {
            module.show();
          }
        },

        show: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          module.showDimmer();
          module.showModal(callback);
        },

        showModal: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          if( !module.is.active() ) {

            if( $otherModals.filter(':visible').size() > 0 && !settings.allowMultiple) {
              module.debug('Other modals visible, queueing show animation');
              module.hideOthers(module.showModal);
            }
            else {
              $.proxy(settings.onShow, element)();
              if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
                module.debug('Showing modal with css animations');
                module.cacheSizes();
                module.set.position();
                module.set.screenHeight();
                module.set.type();
                $module
                  .transition({
                    debug     : settings.debug,
                    animation : settings.transition + ' in',
                    queue     : false,
                    duration  : settings.duration,
                    onStart   : function() {
                      module.set.clickaway();
                    },
                    onComplete : function() {
                      $.proxy(settings.onVisible, element)();
                      module.add.keyboardShortcuts();
                      module.save.focus();
                      module.set.active();
                      module.set.autofocus();
                      callback();
                    }
                  })
                ;
              }
              else {
                module.debug('Showing modal with javascript');
                $module
                  .fadeIn(settings.duration, settings.easing, function() {
                    $.proxy(settings.onVisible, element)();
                    module.add.keyboardShortcuts();
                    module.save.focus();
                    module.set.active();
                    callback();
                  })
                ;
              }
            }
          }
          else {
            module.debug('Modal is already visible');
          }
        },

        showDimmer: function() {
          if( !$dimmable.dimmer('is active') ) {
            module.debug('Showing dimmer');
            $dimmable.dimmer('show');
          }
          else {
            module.debug('Dimmer already visible');
          }
        },

        hide: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          if($allModals.filter(':visible').size() <= 1) {
            module.hideDimmer();
          }
          module.hideModal(callback);
        },

        hideDimmer: function() {
          if( !($dimmable.dimmer('is active') || $dimmable.dimmer('is animating')) ) {
            module.debug('Dimmer is not visible cannot hide');
            return;
          }
          module.debug('Hiding dimmer');
          module.remove.clickaway();
          $dimmable.dimmer('hide', function() {
            if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
              module.remove.screenHeight();
            }
            module.remove.active();
          });
        },

        hideModal: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          module.debug('Hiding modal');
          $.proxy(settings.onHide, element)();
          if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
            $module
              .transition({
                debug      : settings.debug,
                animation  : settings.transition + ' out',
                queue      : false,
                duration   : settings.duration,
                onStart    : function() {
                  module.remove.keyboardShortcuts();
                },
                onComplete : function() {
                  $.proxy(settings.onHidden, element)();
                  module.remove.active();
                  module.restore.focus();
                  callback();
                }
              })
            ;
          }
          else {
            module.remove.keyboardShortcuts();
            $module
              .fadeOut(settings.duration, settings.easing, function() {
                $.proxy(settings.onHidden, element)();
                module.remove.active();
                module.restore.focus();
                callback();
              })
            ;
          }
        },

        hideAll: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          if( $allModals.is(':visible') ) {
            module.debug('Hiding all visible modals');
            module.hideDimmer();
            $allModals
              .filter(':visible')
                .modal('hide modal', callback)
            ;
          }
        },

        hideOthers: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          if( $otherModals.is(':visible') ) {
            module.debug('Hiding other modals', $otherModals);
            $otherModals
              .filter(':visible')
                .modal('hide modal', callback)
            ;
          }
        },

        add: {
          keyboardShortcuts: function() {
            module.verbose('Adding keyboard shortcuts');
            $document
              .on('keyup' + eventNamespace, module.event.keyboard)
            ;
          }
        },

        save: {
          focus: function() {
            $focusedElement = $(document.activeElement).blur();
          }
        },

        restore: {
          focus: function() {
            if($focusedElement && $focusedElement.size() > 0) {
              $focusedElement.focus();
            }
          }
        },

        remove: {
          active: function() {
            $module.removeClass(className.active);
          },
          clickaway: function() {
            if(settings.closable) {
              $dimmer
                .off('click' + eventNamespace)
              ;
            }
          },
          screenHeight: function() {
            if(module.cache.height > module.cache.pageHeight) {
              module.debug('Removing page height');
              $body
                .css('height', '')
              ;
            }
          },
          keyboardShortcuts: function() {
            module.verbose('Removing keyboard shortcuts');
            $document
              .off('keyup' + eventNamespace)
            ;
          },
          scrolling: function() {
            $dimmable.removeClass(className.scrolling);
            $module.removeClass(className.scrolling);
          }
        },

        cacheSizes: function() {
          var
            modalHeight = $module.outerHeight()
          ;
          if(module.cache === undefined || modalHeight !== 0) {
            module.cache = {
              pageHeight    : $(document).outerHeight(),
              height        : modalHeight + settings.offset,
              contextHeight : (settings.context == 'body')
                ? $(window).height()
                : $dimmable.height()
            };
          }
          module.debug('Caching modal and container sizes', module.cache);
        },

        can: {
          fit: function() {
            return (module.cache.height < module.cache.contextHeight);
          }
        },

        is: {
          active: function() {
            return $module.hasClass(className.active);
          },
          animating: function() {
            return $module.transition('is supported')
              ? $module.transition('is animating')
              : $module.is(':visible')
            ;
          },
          modernBrowser: function() {
            // appName for IE11 reports 'Netscape' can no longer use
            return !(window.ActiveXObject || "ActiveXObject" in window);
          }
        },

        set: {
          autofocus: function() {
            if(settings.autofocus) {
              var
                $inputs    = $module.find(':input:visible'),
                $autofocus = $inputs.filter('[autofocus]'),
                $input     = ($autofocus.size() > 0)
                  ? $autofocus
                  : $inputs
              ;
              $input.first().focus();
            }
          },
          clickaway: function() {
            if(settings.closable) {
              $dimmer
                .off('click' + eventNamespace)
                .on('click' + eventNamespace, module.event.click)
              ;
            }
          },
          screenHeight: function() {
            if(module.cache.height > module.cache.pageHeight) {
              module.debug('Modal is taller than page content, resizing page height');
              $body
                .css('height', module.cache.height + settings.padding)
              ;
            }
            else {
              $body.css('height', '');
            }
          },
          active: function() {
            $module.addClass(className.active);
          },
          scrolling: function() {
            $dimmable.addClass(className.scrolling);
            $module.addClass(className.scrolling);
          },
          type: function() {
            if(module.can.fit()) {
              module.verbose('Modal fits on screen');
              module.remove.scrolling();
            }
            else {
              module.verbose('Modal cannot fit on screen setting to scrolling');
              module.set.scrolling();
            }
          },
          position: function() {
            module.verbose('Centering modal on page', module.cache);
            if(module.can.fit()) {
              $module
                .css({
                  top: '',
                  marginTop: -(module.cache.height / 2)
                })
              ;
            }
            else {
              $module
                .css({
                  marginTop : '',
                  top       : $document.scrollTop()
                })
              ;
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

$.fn.modal.settings = {

  name          : 'Modal',
  namespace     : 'modal',

  debug         : false,
  verbose       : true,
  performance   : true,

  allowMultiple : false,
  detachable    : true,
  closable      : true,
  autofocus     : true,

  context       : 'body',

  duration      : 500,
  easing        : 'easeOutExpo',
  offset        : 0,
  transition    : 'scale',

  padding       : 30,

  onShow        : function(){},
  onHide        : function(){},

  onVisible     : function(){},
  onHidden      : function(){},

  onApprove     : function(){ return true; },
  onDeny        : function(){ return true; },

  selector    : {
    close    : '.close, .actions .button',
    approve  : '.actions .positive, .actions .approve, .actions .ok',
    deny     : '.actions .negative, .actions .deny, .actions .cancel',
    modal    : '.ui.modal'
  },
  error : {
    dimmer    : 'UI Dimmer, a required component is not included in this page',
    method    : 'The method you called is not defined.',
    notFound  : 'The element you specified could not be found'
  },
  className : {
    active    : 'active',
    scrolling : 'scrolling'
  }
};


})( jQuery, window , document );

/*
 * # Semantic - Nag
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

"use strict";

$.fn.nag = function(parameters) {
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
          ? $.extend(true, {}, $.fn.nag.settings, parameters)
          : $.extend({}, $.fn.nag.settings),

        className       = settings.className,
        selector        = settings.selector,
        error           = settings.error,
        namespace       = settings.namespace,

        eventNamespace  = '.' + namespace,
        moduleNamespace = namespace + '-module',

        $module         = $(this),

        $close          = $module.find(selector.close),
        $context        = (settings.context)
          ? $(settings.context)
          : $('body'),

        element         = this,
        instance        = $module.data(moduleNamespace),

        moduleOffset,
        moduleHeight,

        contextWidth,
        contextHeight,
        contextOffset,

        yOffset,
        yPosition,

        timer,
        module,

        requestAnimationFrame = window.requestAnimationFrame
          || window.mozRequestAnimationFrame
          || window.webkitRequestAnimationFrame
          || window.msRequestAnimationFrame
          || function(callback) { setTimeout(callback, 0); }
      ;
      module = {

        initialize: function() {
          module.verbose('Initializing element');

          $module
            .data(moduleNamespace, module)
          ;
          $close
            .on('click' + eventNamespace, module.dismiss)
          ;

          if(settings.detachable && $module.parent()[0] !== $context[0]) {
            $module
              .detach()
              .prependTo($context)
            ;
          }

          if(settings.displayTime > 0) {
            setTimeout(module.hide, settings.displayTime);
          }
          module.show();
        },

        destroy: function() {
          module.verbose('Destroying instance');
          $module
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
        },

        show: function() {
          if( module.should.show() && !$module.is(':visible') ) {
            module.debug('Showing nag', settings.animation.show);
            if(settings.animation.show == 'fade') {
              $module
                .fadeIn(settings.duration, settings.easing)
              ;
            }
            else {
              $module
                .slideDown(settings.duration, settings.easing)
              ;
            }
          }
        },

        hide: function() {
          module.debug('Showing nag', settings.animation.hide);
          if(settings.animation.show == 'fade') {
            $module
              .fadeIn(settings.duration, settings.easing)
            ;
          }
          else {
            $module
              .slideUp(settings.duration, settings.easing)
            ;
          }
        },

        onHide: function() {
          module.debug('Removing nag', settings.animation.hide);
          $module.remove();
          if (settings.onHide) {
            settings.onHide();
          }
        },

        dismiss: function(event) {
          if(settings.storageMethod) {
            module.storage.set(settings.key, settings.value);
          }
          module.hide();
          event.stopImmediatePropagation();
          event.preventDefault();
        },

        should: {
          show: function() {
            if(settings.persist) {
              module.debug('Persistent nag is set, can show nag');
              return true;
            }
            if( module.storage.get(settings.key) != settings.value.toString() ) {
              module.debug('Stored value is not set, can show nag', module.storage.get(settings.key));
              return true;
            }
            module.debug('Stored value is set, cannot show nag', module.storage.get(settings.key));
            return false;
          }
        },

        get: {
          storageOptions: function() {
            var
              options = {}
            ;
            if(settings.expires) {
              options.expires = settings.expires;
            }
            if(settings.domain) {
              options.domain = settings.domain;
            }
            if(settings.path) {
              options.path = settings.path;
            }
            return options;
          }
        },

        clear: function() {
          module.storage.remove(settings.key);
        },

        storage: {
          set: function(key, value) {
            var
              options = module.get.storageOptions()
            ;
            if(settings.storageMethod == 'localstorage' && window.localStorage !== undefined) {
              window.localStorage.setItem(key, value);
              module.debug('Value stored using local storage', key, value);
            }
            else if($.cookie !== undefined) {
              $.cookie(key, value, options);
              module.debug('Value stored using cookie', key, value, options);
            }
            else {
              module.error(error.noCookieStorage);
              return;
            }
          },
          get: function(key, value) {
            var
              storedValue
            ;
            if(settings.storageMethod == 'localstorage' && window.localStorage !== undefined) {
              storedValue = window.localStorage.getItem(key);
            }
            // get by cookie
            else if($.cookie !== undefined) {
              storedValue = $.cookie(key);
            }
            else {
              module.error(error.noCookieStorage);
            }
            if(storedValue == 'undefined' || storedValue == 'null' || storedValue === undefined || storedValue === null) {
              storedValue = undefined;
            }
            return storedValue;
          },
          remove: function(key) {
            var
              options = module.get.storageOptions()
            ;
            if(settings.storageMethod == 'local' && window.store !== undefined) {
              window.localStorage.removeItem(key);
            }
            // store by cookie
            else if($.cookie !== undefined) {
              $.removeCookie(key, options);
            }
            else {
              module.error(error.noStorage);
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

$.fn.nag.settings = {

  name        : 'Nag',

  debug       : false,
  verbose     : true,
  performance : true,

  namespace   : 'Nag',

  // allows cookie to be overriden
  persist     : false,

  // set to zero to require manually dismissal, otherwise hides on its own
  displayTime : 0,

  animation   : {
    show : 'slide',
    hide : 'slide'
  },

  context       : false,
  detachable    : false,

  expires       : 30,
  domain        : false,
  path          : '/',

  // type of storage to use
  storageMethod : 'cookie',

  // value to store in dismissed localstorage/cookie
  key           : 'nag',
  value         : 'dismiss',

  error: {
    noStorage : 'Neither $.cookie or store is defined. A storage solution is required for storing state',
    method    : 'The method you called is not defined.'
  },

  className     : {
    bottom : 'bottom',
    fixed  : 'fixed'
  },

  selector      : {
    close : '.close.icon'
  },

  speed         : 500,
  easing        : 'easeOutQuad',

  onHide: function() {}

};

})( jQuery, window , document );

/*! jquery.cookie v1.4.1 | MIT */
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?a(require("jquery")):a(jQuery)}(function(a){function b(a){return h.raw?a:encodeURIComponent(a)}function c(a){return h.raw?a:decodeURIComponent(a)}function d(a){return b(h.json?JSON.stringify(a):String(a))}function e(a){0===a.indexOf('"')&&(a=a.slice(1,-1).replace(/\\"/g,'"').replace(/\\\\/g,"\\"));try{return a=decodeURIComponent(a.replace(g," ")),h.json?JSON.parse(a):a}catch(b){}}function f(b,c){var d=h.raw?b:e(b);return a.isFunction(c)?c(d):d}var g=/\+/g,h=a.cookie=function(e,g,i){if(void 0!==g&&!a.isFunction(g)){if(i=a.extend({},h.defaults,i),"number"==typeof i.expires){var j=i.expires,k=i.expires=new Date;k.setTime(+k+864e5*j)}return document.cookie=[b(e),"=",d(g),i.expires?"; expires="+i.expires.toUTCString():"",i.path?"; path="+i.path:"",i.domain?"; domain="+i.domain:"",i.secure?"; secure":""].join("")}for(var l=e?void 0:{},m=document.cookie?document.cookie.split("; "):[],n=0,o=m.length;o>n;n++){var p=m[n].split("="),q=c(p.shift()),r=p.join("=");if(e&&e===q){l=f(r,g);break}e||void 0===(r=f(r))||(l[q]=r)}return l};h.defaults={},a.removeCookie=function(b,c){return void 0===a.cookie(b)?!1:(a.cookie(b,"",a.extend({},c,{expires:-1})),!a.cookie(b))}});
/*
 * # Semantic - Popup
 * http://github.com/jlukic/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

"use strict";

$.fn.popup = function(parameters) {
  var
    $allModules    = $(this),
    $document      = $(document),

    moduleSelector = $allModules.selector || '',

    hasTouch       = ('ontouchstart' in document.documentElement),
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
        settings        = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.popup.settings, parameters)
          : $.extend({}, $.fn.popup.settings),

        selector        = settings.selector,
        className       = settings.className,
        error           = settings.error,
        metadata        = settings.metadata,
        namespace       = settings.namespace,

        eventNamespace  = '.' + settings.namespace,
        moduleNamespace = 'module-' + namespace,

        $module         = $(this),
        $context        = $(settings.context),
        $target         = (settings.target)
          ? $(settings.target)
          : $module,

        $window         = $(window),
        $body           = $('body'),
        $popup,
        $offsetParent,

        searchDepth     = 0,

        element         = this,
        instance        = $module.data(moduleNamespace),
        module
      ;

      module = {

        // binds events
        initialize: function() {
          module.debug('Initializing module', $module);
          module.refresh();
          if(settings.on == 'click') {
            $module
              .on('click' + eventNamespace, module.toggle)
            ;
          }
          else if( module.get.startEvent() ) {
            $module
              .on(module.get.startEvent() + eventNamespace, module.event.start)
              .on(module.get.endEvent() + eventNamespace, module.event.end)
            ;
          }
          if(settings.target) {
            module.debug('Target set to element', $target);
          }
          $window
            .on('resize' + eventNamespace, module.event.resize)
          ;
          if( !module.exists() ) {
            module.create();
          }
          else if(settings.hoverable) {
            module.bind.popup();
          }
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, instance)
          ;
        },

        refresh: function() {
          if(settings.popup) {
            $popup = $(settings.popup);
          }
          else {
            if(settings.inline) {
              $popup = $target.next(settings.selector.popup);
            }
          }
          if(settings.popup) {
            $popup.addClass(className.loading);
            $offsetParent = $popup.offsetParent();
            $popup.removeClass(className.loading);
          }
          else {
            $offsetParent = (settings.inline)
                ? $target.offsetParent()
                : $body
            ;
          }
          if( $offsetParent.is('html') ) {
            module.debug('Page is popups offset parent');
            $offsetParent = $body;
          }
        },

        reposition: function() {
          module.refresh();
          module.set.position();
        },

        destroy: function() {
          module.debug('Destroying previous module');
          if($popup && !settings.preserve) {
            module.removePopup();
          }
          $module
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        event: {
          start:  function(event) {
            var
              delay = ($.isPlainObject(settings.delay))
                ? settings.delay.show
                : settings.delay
            ;
            clearTimeout(module.hideTimer);
            module.showTimer = setTimeout(function() {
              if( module.is.hidden() && !( module.is.active() && module.is.dropdown()) ) {
                module.show();
              }
            }, delay);
          },
          end:  function() {
            var
              delay = ($.isPlainObject(settings.delay))
                ? settings.delay.hide
                : settings.delay
            ;
            clearTimeout(module.showTimer);
            module.hideTimer = setTimeout(function() {
              if( module.is.visible() ) {
                module.hide();
              }
            }, delay);
          },
          resize: function() {
            if( module.is.visible() ) {
              module.set.position();
            }
          }
        },

        // generates popup html from metadata
        create: function() {
          var
            html      = $module.data(metadata.html)      || settings.html,
            variation = $module.data(metadata.variation) || settings.variation,
            title     = $module.data(metadata.title)     || settings.title,
            content   = $module.data(metadata.content)   || $module.attr('title') || settings.content
          ;
          if(html || content || title) {
            module.debug('Creating pop-up html');
            if(!html) {
              html = settings.templates.popup({
                title   : title,
                content : content
              });
            }
            $popup = $('<div/>')
              .addClass(className.popup)
              .addClass(variation)
              .html(html)
            ;
            if(variation) {
              $popup
                .addClass(variation)
              ;
            }
            if(settings.inline) {
              module.verbose('Inserting popup element inline', $popup);
              $popup
                .insertAfter($module)
              ;
            }
            else {
              module.verbose('Appending popup element to body', $popup);
              $popup
                .appendTo( $context )
              ;
            }
            if(settings.hoverable) {
              module.bind.popup();
            }
            $.proxy(settings.onCreate, $popup)(element);
          }
          else if($target.next(settings.selector.popup).size() !== 0) {
            module.verbose('Pre-existing popup found, reverting to inline');
            settings.inline = true;
            module.refresh();
            if(settings.hoverable) {
              module.bind.popup();
            }
          }
          else {
            module.debug('No content specified skipping display', element);
          }
        },

        // determines popup state
        toggle: function() {
          module.debug('Toggling pop-up');
          if( module.is.hidden() ) {
            module.debug('Popup is hidden, showing pop-up');
            module.unbind.close();
            module.hideAll();
            module.show();
          }
          else {
            module.debug('Popup is visible, hiding pop-up');
            module.hide();
          }
        },

        show: function(callback) {
          callback = $.isFunction(callback) ? callback : function(){};
          module.debug('Showing pop-up', settings.transition);
          if(!settings.preserve && !settings.popup) {
            module.refresh();
          }
          if( !module.exists() ) {
            module.create();
          }
          if( $popup && module.set.position() ) {
            module.save.conditions();
            module.animate.show(callback);
          }
        },


        hide: function(callback) {
          callback = $.isFunction(callback) ? callback : function(){};
          module.remove.visible();
          module.unbind.close();
          if( module.is.visible() ) {
            module.restore.conditions();
            module.animate.hide(callback);
          }
        },

        hideAll: function() {
          $(selector.popup)
            .filter(':visible')
              .popup('hide')
          ;
        },

        hideGracefully: function(event) {
          // don't close on clicks inside popup
          if(event && $(event.target).closest(selector.popup).size() === 0) {
            module.debug('Click occurred outside popup hiding popup');
            module.hide();
          }
          else {
            module.debug('Click was inside popup, keeping popup open');
          }
        },

        exists: function() {
          if(!$popup) {
            return false;
          }
          if(settings.inline || settings.popup) {
            return ( $popup.size() !== 0 );
          }
          else {
            return ( $popup.closest($context).size() );
          }
        },

        removePopup: function() {
          module.debug('Removing popup');
          $.proxy(settings.onRemove, $popup)(element);
          $popup
            .removePopup()
          ;
        },

        save: {
          conditions: function() {
            module.cache = {
              title: $module.attr('title')
            };
            if (module.cache.title) {
              $module.removeAttr('title');
            }
            module.verbose('Saving original attributes', module.cache.title);
          }
        },
        restore: {
          conditions: function() {
            element.blur();
            if(module.cache && module.cache.title) {
              $module.attr('title', module.cache.title);
              module.verbose('Restoring original attributes', module.cache.title);
            }
            return true;
          }
        },
        animate: {
          show: function(callback) {
            callback = $.isFunction(callback) ? callback : function(){};
            if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
              module.set.visible();
              $popup
                .transition({
                  animation  : settings.transition + ' in',
                  queue      : false,
                  debug      : settings.debug,
                  verbose    : settings.verbose,
                  duration   : settings.duration,
                  onComplete : function() {
                    module.bind.close();
                    $.proxy(callback, $popup)(element);
                    $.proxy(settings.onVisible, $popup)(element);
                  }
                })
              ;
            }
            else {
              module.set.visible();
              $popup
                .stop()
                .fadeIn(settings.duration, settings.easing, function() {
                  module.bind.close();
                  $.proxy(callback, element)();
                })
              ;
            }
            $.proxy(settings.onShow, $popup)(element);
          },
          hide: function(callback) {
            callback = $.isFunction(callback) ? callback : function(){};
            module.debug('Hiding pop-up');
            if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
              $popup
                .transition({
                  animation  : settings.transition + ' out',
                  queue      : false,
                  duration   : settings.duration,
                  debug      : settings.debug,
                  verbose    : settings.verbose,
                  onComplete : function() {
                    module.reset();
                    $.proxy(callback, $popup)(element);
                    $.proxy(settings.onHidden, $popup)(element);
                  }
                })
              ;
            }
            else {
              $popup
                .stop()
                .fadeOut(settings.duration, settings.easing, function() {
                  module.reset();
                  callback();
                })
              ;
            }
            $.proxy(settings.onHide, $popup)(element);
          }
        },

        get: {
          startEvent: function() {
            if(settings.on == 'hover') {
              return 'mouseenter';
            }
            else if(settings.on == 'focus') {
              return 'focus';
            }
            return false;
          },
          endEvent: function() {
            if(settings.on == 'hover') {
              return 'mouseleave';
            }
            else if(settings.on == 'focus') {
              return 'blur';
            }
            return false;
          },
          offstagePosition: function(position) {
            var
              position = position || false,
              boundary  = {
                top    : $(window).scrollTop(),
                bottom : $(window).scrollTop() + $(window).height(),
                left   : 0,
                right  : $(window).width()
              },
              popup     = {
                width  : $popup.width(),
                height : $popup.height(),
                offset : $popup.offset()
              },
              offstage  = {},
              offstagePositions = []
            ;
            if(popup.offset && position) {
              module.verbose('Checking if outside viewable area', popup.offset);
              offstage = {
                top    : (popup.offset.top < boundary.top),
                bottom : (popup.offset.top + popup.height > boundary.bottom),
                right  : (popup.offset.left + popup.width > boundary.right),
                left   : false
              };
            }
            // return only boundaries that have been surpassed
            $.each(offstage, function(direction, isOffstage) {
              if(isOffstage) {
                offstagePositions.push(direction);
              }
            });
            return (offstagePositions.length > 0)
              ? offstagePositions.join(' ')
              : false
            ;
          },
          nextPosition: function(position) {
            switch(position) {
              case 'top left':
                position = 'bottom left';
              break;
              case 'bottom left':
                position = 'top right';
              break;
              case 'top right':
                position = 'bottom right';
              break;
              case 'bottom right':
                position = 'top center';
              break;
              case 'top center':
                position = 'bottom center';
              break;
              case 'bottom center':
                position = 'right center';
              break;
              case 'right center':
                position = 'left center';
              break;
              case 'left center':
                position = 'top center';
              break;
            }
            return position;
          }
        },

        set: {
          position: function(position, arrowOffset) {
            var
              windowWidth   = $(window).width(),
              windowHeight  = $(window).height(),

              targetWidth   = $target.outerWidth(),
              targetHeight  = $target.outerHeight(),

              popupWidth    = $popup.outerWidth(),
              popupHeight   = $popup.outerHeight(),

              parentWidth   = $offsetParent.outerWidth(),
              parentHeight  = $offsetParent.outerHeight(),

              distanceAway  = settings.distanceAway,

              targetElement = $target[0],

              marginTop     = (settings.inline)
                ? parseInt( window.getComputedStyle(targetElement).getPropertyValue('margin-top'), 10)
                : 0,
              marginLeft    = (settings.inline)
                ? parseInt( window.getComputedStyle(targetElement).getPropertyValue('margin-left'), 10)
                : 0,

              target        = (settings.inline || settings.popup)
                ? $target.position()
                : $target.offset(),

              positioning,
              offstagePosition
            ;
            position    = position    || $module.data(metadata.position)    || settings.position;
            arrowOffset = arrowOffset || $module.data(metadata.offset)      || settings.offset;
            if(settings.inline) {
              module.debug('Adding targets margin to calculation');
              if(position == 'left center' || position == 'right center') {
                arrowOffset  += marginTop;
                distanceAway += -marginLeft;
              }
              else if (position == 'top left' || position == 'top center' || position == 'top right') {
                arrowOffset  += marginLeft;
                distanceAway -= marginTop;
              }
              else {
                arrowOffset  += marginLeft;
                distanceAway += marginTop;
              }
            }
            module.debug('Calculating popup positioning', position);
            switch(position) {
              case 'top left':
                positioning = {
                  top    : 'auto',
                  bottom : parentHeight - target.top + distanceAway,
                  left   : target.left + arrowOffset,
                  right  : 'auto'
                };
              break;
              case 'top center':
                positioning = {
                  bottom : parentHeight - target.top + distanceAway,
                  left   : target.left + (targetWidth / 2) - (popupWidth / 2) + arrowOffset,
                  top    : 'auto',
                  right  : 'auto'
                };
              break;
              case 'top right':
                positioning = {
                  bottom :  parentHeight - target.top + distanceAway,
                  right  :  parentWidth - target.left - targetWidth - arrowOffset,
                  top    : 'auto',
                  left   : 'auto'
                };
              break;
              case 'left center':
                positioning = {
                  top    : target.top + (targetHeight / 2) - (popupHeight / 2) + arrowOffset,
                  right  : parentWidth - target.left + distanceAway,
                  left   : 'auto',
                  bottom : 'auto'
                };
              break;
              case 'right center':
                positioning = {
                  top    : target.top + (targetHeight / 2) - (popupHeight / 2) + arrowOffset,
                  left   : target.left + targetWidth + distanceAway,
                  bottom : 'auto',
                  right  : 'auto'
                };
              break;
              case 'bottom left':
                positioning = {
                  top    : target.top + targetHeight + distanceAway,
                  left   : target.left + arrowOffset,
                  bottom : 'auto',
                  right  : 'auto'
                };
              break;
              case 'bottom center':
                positioning = {
                  top    : target.top + targetHeight + distanceAway,
                  left   : target.left + (targetWidth / 2) - (popupWidth / 2) + arrowOffset,
                  bottom : 'auto',
                  right  : 'auto'
                };
              break;
              case 'bottom right':
                positioning = {
                  top    : target.top + targetHeight + distanceAway,
                  right  : parentWidth - target.left  - targetWidth - arrowOffset,
                  left   : 'auto',
                  bottom : 'auto'
                };
              break;
            }
            if(positioning === undefined) {
              module.error(error.invalidPosition);
            }
            // tentatively place on stage
            $popup
              .css(positioning)
              .removeClass(className.position)
              .addClass(position)
              .addClass(className.loading)
            ;
            // check if is offstage
            offstagePosition = module.get.offstagePosition(position);

            // recursively find new positioning
            if(offstagePosition) {
              module.debug('Element is outside boundaries', offstagePosition);
              if(searchDepth < settings.maxSearchDepth) {
                position = module.get.nextPosition(position);
                searchDepth++;
                module.debug('Trying new position', position);
                return ($popup)
                  ? module.set.position(position)
                  : false
                ;
              }
              else {
                module.debug('Popup could not find a position onstage', $popup);
                searchDepth = 0;
                module.reset();
                $popup.removeClass(className.loading);
                return false;
              }
            }
            else {
              module.debug('Position is on stage', position);
              searchDepth = 0;
              if( settings.setFluidWidth && $popup.hasClass(className.fluid) ) {
                $popup.css('width', $offsetParent.width());
              }
              $popup.removeClass(className.loading);
              return true;
            }
          },

          visible: function() {
            $module.addClass(className.visible);
          }
        },

        remove: {
          visible: function() {
            $module.removeClass(className.visible);
          }
        },

        bind: {
          popup: function() {
            module.verbose('Allowing hover events on popup to prevent closing');
            if($popup && $popup.size() > 0) {
              $popup
                .on('mouseenter' + eventNamespace, module.event.start)
                .on('mouseleave' + eventNamespace, module.event.end)
              ;
            }
          },
          close:function() {
            if(settings.hideOnScroll === true || settings.hideOnScroll == 'auto' && settings.on != 'click') {
              $document
                .one('touchmove' + eventNamespace, module.hideGracefully)
                .one('scroll' + eventNamespace, module.hideGracefully)
              ;
              $context
                .one('touchmove' + eventNamespace, module.hideGracefully)
                .one('scroll' + eventNamespace, module.hideGracefully)
              ;
            }
            if(settings.on == 'click' && settings.closable) {
              module.verbose('Binding popup close event to document');
              $document
                .on('click' + eventNamespace, function(event) {
                  module.verbose('Pop-up clickaway intent detected');
                  $.proxy(module.hideGracefully, element)(event);
                })
              ;
            }
          }
        },

        unbind: {
          close: function() {
            if(settings.hideOnScroll === true || settings.hideOnScroll == 'auto' && settings.on != 'click') {
              $document
                .off('scroll' + eventNamespace, module.hide)
              ;
              $context
                .off('scroll' + eventNamespace, module.hide)
              ;
            }
            if(settings.on == 'click' && settings.closable) {
              module.verbose('Removing close event from document');
              $document
                .off('click' + eventNamespace)
              ;
            }
          }
        },

        is: {
          active: function() {
            return $module.hasClass(className.active);
          },
          animating: function() {
            return ( $popup && $popup.is(':animated') || $popup.hasClass(className.animating) );
          },
          visible: function() {
            return $popup && $popup.is(':visible');
          },
          dropdown: function() {
            return $module.hasClass(className.dropdown);
          },
          hidden: function() {
            return !module.is.visible();
          }
        },

        reset: function() {
          module.remove.visible();
          if(settings.preserve || settings.popup) {
            if($.fn.transition !== undefined) {
              $popup
                .transition('remove transition')
              ;
            }
          }
          else {
            module.removePopup();
          }
        },

        setting: function(name, value) {
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

$.fn.popup.settings = {

  name           : 'Popup',

  debug          : false,
  verbose        : true,
  performance    : true,
  namespace      : 'popup',

  onCreate       : function(){},
  onRemove       : function(){},

  onShow         : function(){},
  onVisible      : function(){},
  onHide         : function(){},
  onHidden       : function(){},

  variation      : '',
  content        : false,
  html           : false,
  title          : false,

  on             : 'hover',
  closable       : true,
  hideOnScroll   : 'auto',

  context        : 'body',
  position       : 'top left',
  delay          : {
    show : 30,
    hide : 0
  },

  setFluidWidth  : true,

  target         : false,
  popup          : false,
  inline         : false,
  preserve       : true,
  hoverable      : false,

  duration       : 200,
  easing         : 'easeOutQuint',
  transition     : 'scale',

  distanceAway   : 0,
  offset         : 0,
  maxSearchDepth : 10,

  error: {
    invalidPosition : 'The position you specified is not a valid position',
    method          : 'The method you called is not defined.'
  },

  metadata: {
    content   : 'content',
    html      : 'html',
    offset    : 'offset',
    position  : 'position',
    title     : 'title',
    variation : 'variation'
  },

  className   : {
    active    : 'active',
    animating : 'animating',
    dropdown  : 'dropdown',
    fluid     : 'fluid',
    loading   : 'loading',
    popup     : 'ui popup',
    position  : 'top left center bottom right',
    visible   : 'visible'
  },

  selector    : {
    popup    : '.ui.popup'
  },

  templates: {
    escape: function(string) {
      var
        badChars     = /[&<>"'`]/g,
        shouldEscape = /[&<>"'`]/,
        escape       = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#x27;",
          "`": "&#x60;"
        },
        escapedChar  = function(chr) {
          return escape[chr];
        }
      ;
      if(shouldEscape.test(string)) {
        return string.replace(badChars, escapedChar);
      }
      return string;
    },
    popup: function(text) {
      var
        html   = '',
        escape = $.fn.popup.settings.templates.escape
      ;
      if(typeof text !== undefined) {
        if(typeof text.title !== undefined && text.title) {
          text.title = escape(text.title);
          html += '<div class="header">' + text.title + '</div>';
        }
        if(typeof text.content !== undefined && text.content) {
          text.content = escape(text.content);
          html += '<div class="content">' + text.content + '</div>';
        }
      }
      return html;
    }
  }

};

// Adds easing
$.extend( $.easing, {
  easeOutQuad: function (x, t, b, c, d) {
    return -c *(t/=d)*(t-2) + b;
  }
});


})( jQuery, window , document );

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

    hasTouch       = ('ontouchstart' in document.documentElement),
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
        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing progress', settings);
          module.read.metadata();
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
          module.verbose('Destroying previous dropdown for', $module);
          $module
            .removeData(moduleNamespace)
          ;
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
              value   = module.value || 0,
              total   = module.total || 0,
              percent = module.percent || 0
            ;
            templateText = templateText || '';
            templateText = templateText
              .replace('{value}', value)
              .replace('{total}', total)
              .replace('{percent}', percent)
            ;
            module.debug('Adding variables to progress bar text', templateText);
            return templateText;
          },
          randomValue: function() {
            module.debug('Generating random increment percentage');
            return Math.floor((Math.random() * settings.random.max) + settings.random.min);
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
          }
        },

        remove: {
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
            $bar
              .css('width', value + '%')
            ;
          },
          initials: function() {
            if(settings.value) {
              module.verbose('Current value set in settings', settings.value);
              module.value = settings.value;
            }
            if(settings.total) {
              module.verbose('Current total set in settings', settings.total);
              module.total = settings.total;
            }
            if(settings.percent) {
              module.verbose('Current percent set in settings', settings.percent);
              module.percent = settings.percent;
            }
            if(module.percent) {
              module.set.percent(module.percent);
            }
            else if(module.value) {
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
            module.set.barWidth(percent);
            module.set.barLabel();
            if(percent === 100) {
              if(settings.autoSuccess && !(module.is.warning() || module.is.error())) {
                module.set.success();
                module.debug('Automatically triggering success at 100%');
              }
              else {
                module.remove.active();
              }
            }
            else {
              module.set.active();
            }
            $.proxy(settings.onChange, element)(percent, module.value, module.total);
          },
          label: function(text) {
            text = text || '';
            if(text) {
              text = module.get.text(text);
              module.debug('Setting label to text', text);
              $label.text(text);
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
            if(settings.showActivity) {
              $module.addClass(className.active);
            }
            module.remove.warning();
            module.remove.error();
            module.remove.success();
            if(text) {
              module.set.label(text);
            }
            $.proxy(settings.onActive, element)(module.value, module.total);
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
            $.proxy(settings.onSuccess, element)(module.total);
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
            $.proxy(settings.onWarning, element)(module.value, module.total);
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
            $.proxy(settings.onError, element)(module.value, module.total);
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
            if(!numericValue) {
              module.error(error.nonNumeric);
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

  autoSuccess  : true,
  showActivity : true,

  label        : 'percent',
  precision    : 1,

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
    nonNumeric : 'Progress value is non numeric'
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
/*
 * # Semantic - Rating
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

"use strict";

$.fn.rating = function(parameters) {
  var
    $allModules     = $(this),
    moduleSelector  = $allModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),
    returnedValue
  ;
  $allModules
    .each(function() {
      var
        settings        = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.rating.settings, parameters)
          : $.extend({}, $.fn.rating.settings),

        namespace       = settings.namespace,
        className       = settings.className,
        metadata        = settings.metadata,
        selector        = settings.selector,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        element         = this,
        instance        = $(this).data(moduleNamespace),

        $module         = $(this),
        $icon           = $module.find(selector.icon),

        module
      ;

      module = {

        initialize: function() {
          module.verbose('Initializing rating module', settings);

          if($icon.size() === 0) {
            module.setup.layout();
          }

          if(settings.interactive) {
            module.enable();
          }
          else {
            module.disable();
          }
          if(settings.initialRating) {
            module.debug('Setting initial rating');
            module.setRating(settings.initialRating);
          }
          if( $module.data(metadata.rating) ) {
            module.debug('Rating found in metadata');
            module.setRating( $module.data(metadata.rating) );
          }
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Instantiating module', settings);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous instance', instance);
          $module
            .removeData(moduleNamespace)
          ;
          $icon
            .off(eventNamespace)
          ;
        },

        refresh: function() {
          $icon   = $module.find(selector.icon);
        },

        setup: {
          layout: function() {
            var
              maxRating = $module.data(metadata.maxRating) || settings.maxRating
            ;
            module.debug('Generating icon html dynamically');
            $module
              .html($.fn.rating.settings.templates.icon(maxRating))
            ;
            module.refresh();
          }
        },

        event: {
          mouseenter: function() {
            var
              $activeIcon = $(this)
            ;
            $activeIcon
              .nextAll()
                .removeClass(className.selected)
            ;
            $module
              .addClass(className.selected)
            ;
            $activeIcon
              .addClass(className.selected)
                .prevAll()
                .addClass(className.selected)
            ;
          },
          mouseleave: function() {
            $module
              .removeClass(className.selected)
            ;
            $icon
              .removeClass(className.selected)
            ;
          },
          click: function() {
            var
              $activeIcon   = $(this),
              currentRating = module.getRating(),
              rating        = $icon.index($activeIcon) + 1,
              canClear      = (settings.clearable == 'auto')
               ? ($icon.size() === 1)
               : settings.clearable
            ;
            if(canClear && currentRating == rating) {
              module.clearRating();
            }
            else {
              module.setRating( rating );
            }
          }
        },

        clearRating: function() {
          module.debug('Clearing current rating');
          module.setRating(0);
        },

        getRating: function() {
          var
            currentRating = $icon.filter('.' + className.active).size()
          ;
          module.verbose('Current rating retrieved', currentRating);
          return currentRating;
        },

        enable: function() {
          module.debug('Setting rating to interactive mode');
          $icon
            .on('mouseenter' + eventNamespace, module.event.mouseenter)
            .on('mouseleave' + eventNamespace, module.event.mouseleave)
            .on('click' + eventNamespace, module.event.click)
          ;
          $module
            .removeClass(className.disabled)
          ;
        },

        disable: function() {
          module.debug('Setting rating to read-only mode');
          $icon
            .off(eventNamespace)
          ;
          $module
            .addClass(className.disabled)
          ;
        },

        setRating: function(rating) {
          var
            ratingIndex = (rating - 1 >= 0)
              ? (rating - 1)
              : 0,
            $activeIcon = $icon.eq(ratingIndex)
          ;
          $module
            .removeClass(className.selected)
          ;
          $icon
            .removeClass(className.selected)
            .removeClass(className.active)
          ;
          if(rating > 0) {
            module.verbose('Setting current rating to', rating);
            $activeIcon
              .prevAll()
              .andSelf()
                .addClass(className.active)
            ;
          }
          $.proxy(settings.onRate, element)(rating);
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

$.fn.rating.settings = {

  name          : 'Rating',
  namespace     : 'rating',

  debug         : false,
  verbose       : true,
  performance   : true,

  initialRating : 0,
  interactive   : true,
  maxRating     : 4,
  clearable     : 'auto',

  onRate        : function(rating){},

  error         : {
    method    : 'The method you called is not defined',
    noMaximum : 'No maximum rating specified. Cannot generate HTML automatically'
  },


  metadata: {
    rating    : 'rating',
    maxRating : 'maxRating'
  },

  className : {
    active   : 'active',
    disabled : 'disabled',
    selected : 'selected',
    loading  : 'loading'
  },

  selector  : {
    icon : '.icon'
  },

  templates: {
    icon: function(maxRating) {
      var
        icon = 1,
        html = ''
      ;
      while(icon <= maxRating) {
        html += '<i class="icon"></i>';
        icon++;
      }
      return html;
    }
  }

};

})( jQuery, window , document );

/*
 * # Semantic - Search
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

"use strict";

$.fn.search = function(parameters) {
  var
    $allModules     = $(this),
    moduleSelector  = $allModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),
    returnedValue
  ;
  $(this)
    .each(function() {
      var
        settings        = $.extend(true, {}, $.fn.search.settings, parameters),

        className       = settings.className,
        selector        = settings.selector,
        error           = settings.error,
        namespace       = settings.namespace,

        eventNamespace  = '.' + namespace,
        moduleNamespace = namespace + '-module',

        $module         = $(this),
        $prompt         = $module.find(selector.prompt),
        $searchButton   = $module.find(selector.searchButton),
        $results        = $module.find(selector.results),
        $result         = $module.find(selector.result),
        $category       = $module.find(selector.category),

        element         = this,
        instance        = $module.data(moduleNamespace),

        module
      ;
      module = {

        initialize: function() {
          module.verbose('Initializing module');
          var
            prompt = $prompt[0],
            inputEvent   = (prompt !== undefined && prompt.oninput !== undefined)
              ? 'input'
              : (prompt !== undefined && prompt.onpropertychange !== undefined)
                ? 'propertychange'
                : 'keyup'
          ;
          if(settings.automatic) {
            $prompt
              .on(inputEvent + eventNamespace, module.search.throttle)
            ;
          }
          $prompt
            .on('focus' + eventNamespace, module.event.focus)
            .on('blur' + eventNamespace, module.event.blur)
            .on('keydown' + eventNamespace, module.handleKeyboard)
          ;
          $searchButton
            .on('click' + eventNamespace, module.search.query)
          ;
          $results
            .on('mousedown' + eventNamespace, module.event.mousedown)
            .on('mouseup' + eventNamespace, module.event.mouseup)
            .on('click' + eventNamespace, selector.result, module.results.select)
          ;
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
          module.verbose('Destroying instance');
          $module
            .removeData(moduleNamespace)
          ;
          $prompt
            .off(eventNamespace)
          ;
          $searchButton
            .off(eventNamespace)
          ;
          $results
            .off(eventNamespace)
          ;
        },
        event: {
          focus: function() {
            $module
              .addClass(className.focus)
            ;
            clearTimeout(module.timer);
            module.search.throttle();
            if(module.has.minimum())  {
              module.results.show();
            }
          },
          mousedown: function() {
            module.resultsClicked = true;
          },
          mouseup: function() {
            module.resultsClicked = false;
          },
          blur: function(event) {
            module.search.cancel();
            $module
              .removeClass(className.focus)
            ;
            if(!module.resultsClicked) {
              module.timer = setTimeout(module.results.hide, settings.hideDelay);
            }
          }
        },
        handleKeyboard: function(event) {
          var
            // force latest jq dom
            $result       = $module.find(selector.result),
            $category     = $module.find(selector.category),
            keyCode       = event.which,
            keys          = {
              backspace : 8,
              enter     : 13,
              escape    : 27,
              upArrow   : 38,
              downArrow : 40
            },
            activeClass  = className.active,
            currentIndex = $result.index( $result.filter('.' + activeClass) ),
            resultSize   = $result.size(),
            newIndex
          ;
          // search shortcuts
          if(keyCode == keys.escape) {
            module.verbose('Escape key pressed, blurring search field');
            $prompt
              .trigger('blur')
            ;
          }
          // result shortcuts
          if($results.filter(':visible').size() > 0) {
            if(keyCode == keys.enter) {
              module.verbose('Enter key pressed, selecting active result');
              if( $result.filter('.' + activeClass).size() > 0 ) {
                $.proxy(module.results.select, $result.filter('.' + activeClass) )(event);
                event.preventDefault();
                return false;
              }
            }
            else if(keyCode == keys.upArrow) {
              module.verbose('Up key pressed, changing active result');
              newIndex = (currentIndex - 1 < 0)
                ? currentIndex
                : currentIndex - 1
              ;
              $category
                .removeClass(activeClass)
              ;
              $result
                .removeClass(activeClass)
                .eq(newIndex)
                  .addClass(activeClass)
                  .closest($category)
                    .addClass(activeClass)
              ;
              event.preventDefault();
            }
            else if(keyCode == keys.downArrow) {
              module.verbose('Down key pressed, changing active result');
              newIndex = (currentIndex + 1 >= resultSize)
                ? currentIndex
                : currentIndex + 1
              ;
              $category
                .removeClass(activeClass)
              ;
              $result
                .removeClass(activeClass)
                .eq(newIndex)
                  .addClass(activeClass)
                  .closest($category)
                    .addClass(activeClass)
              ;
              event.preventDefault();
            }
          }
          else {
            // query shortcuts
            if(keyCode == keys.enter) {
              module.verbose('Enter key pressed, executing query');
              module.search.query();
              $searchButton
                .addClass(className.down)
              ;
              $prompt
                .one('keyup', function(){
                  $searchButton
                    .removeClass(className.down)
                  ;
                })
              ;
            }
          }
        },
        has: {
          minimum: function() {
            var
              searchTerm    = $prompt.val(),
              numCharacters = searchTerm.length
            ;
            return (numCharacters >= settings.minCharacters);
          }
        },
        search: {
          cancel: function() {
            var
              xhr = $module.data('xhr') || false
            ;
            if( xhr && xhr.state() != 'resolved') {
              module.debug('Cancelling last search');
              xhr.abort();
            }
          },
          throttle: function() {
            clearTimeout(module.timer);
            if(module.has.minimum())  {
              module.timer = setTimeout(module.search.query, settings.searchDelay);
            }
            else {
              module.results.hide();
            }
          },
          query: function() {
            var
              searchTerm = $prompt.val(),
              cachedHTML = module.search.cache.read(searchTerm)
            ;
            if(cachedHTML) {
              module.debug("Reading result for '" + searchTerm + "' from cache");
              module.results.add(cachedHTML);
            }
            else {
              module.debug("Querying for '" + searchTerm + "'");
              if($.isPlainObject(settings.source) || $.isArray(settings.source)) {
                module.search.local(searchTerm);
              }
              else if(settings.apiSettings) {
                module.search.remote(searchTerm);
              }
              else if($.fn.api !== undefined && $.api.settings.api.search !== undefined) {
                module.debug('Searching with default search API endpoint');
                settings.apiSettings = {
                  action: 'search'
                };
                module.search.remote(searchTerm);
              }
              else {
                module.error(error.source);
              }
              $.proxy(settings.onSearchQuery, $module)(searchTerm);
            }
          },
          local: function(searchTerm) {
            var
              results   = [],
              fullTextResults = [],
              searchFields    = $.isArray(settings.searchFields)
                ? settings.searchFields
                : [settings.searchFields],
              searchRegExp   = new RegExp('(?:\s|^)' + searchTerm, 'i'),
              fullTextRegExp = new RegExp(searchTerm, 'i'),
              searchHTML
            ;
            $module
              .addClass(className.loading)
            ;
            // iterate through search fields in array order
            $.each(searchFields, function(index, field) {
              $.each(settings.source, function(label, content) {
                var
                  fieldExists = (typeof content[field] == 'string'),
                  notAlreadyResult = ($.inArray(content, results) == -1 && $.inArray(content, fullTextResults) == -1)
                ;
                if(fieldExists && notAlreadyResult) {
                  if( searchRegExp.test( content[field] ) ) {
                    results.push(content);
                  }
                  else if( settings.searchFullText && fullTextRegExp.test( content[field] ) ) {
                    fullTextResults.push(content);
                  }
                }
              });
            });
            searchHTML = module.results.generate({
              results: $.merge(results, fullTextResults)
            });
            $module
              .removeClass(className.loading)
            ;
            module.search.cache.write(searchTerm, searchHTML);
            module.results.add(searchHTML);
          },
          remote: function(searchTerm) {
            var
              apiSettings = {
                stateContext : $module,
                urlData      : {
                  query: searchTerm
                },
                onSuccess : function(response) {
                  searchHTML = module.results.generate(response);
                  module.search.cache.write(searchTerm, searchHTML);
                  module.results.add(searchHTML);
                },
                onFailure : module.error
              },
              searchHTML
            ;
            module.search.cancel();
            module.debug('Executing search');
            $.extend(true, apiSettings, settings.apiSettings);
            $.api(apiSettings);
          },

          cache: {
            read: function(name) {
              var
                cache = $module.data('cache')
              ;
              return (settings.cache && (typeof cache == 'object') && (cache[name] !== undefined) )
                ? cache[name]
                : false
              ;
            },
            write: function(name, value) {
              var
                cache = ($module.data('cache') !== undefined)
                  ? $module.data('cache')
                  : {}
              ;
              cache[name] = value;
              $module
                .data('cache', cache)
              ;
            }
          }
        },

        results: {
          generate: function(response) {
            module.debug('Generating html from response', response);
            var
              template = settings.templates[settings.type],
              html     = ''
            ;
            if(($.isPlainObject(response.results) && !$.isEmptyObject(response.results)) || ($.isArray(response.results) && response.results.length > 0) ) {
              if(settings.maxResults > 0) {
                response.results = $.isArray(response.results)
                  ? response.results.slice(0, settings.maxResults)
                  : response.results
                ;
              }
              if($.isFunction(template)) {
                html = template(response);
              }
              else {
                module.error(error.noTemplate, false);
              }
            }
            else {
              html = module.message(error.noResults, 'empty');
            }
            $.proxy(settings.onResults, $module)(response);
            return html;
          },
          add: function(html) {
            if(settings.onResultsAdd == 'default' || $.proxy(settings.onResultsAdd, $results)(html) == 'default') {
              $results
                .html(html)
              ;
            }
            module.results.show();
          },
          show: function() {
            if( ($results.filter(':visible').size() === 0) && ($prompt.filter(':focus').size() > 0) && $results.html() !== '') {
              if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported') && !$results.transition('is inward')) {
                module.debug('Showing results with css animations');
                $results
                  .transition({
                    animation  : settings.transition + ' in',
                    duration   : settings.duration,
                    queue      : true
                  })
                ;
              }
              else {
                module.debug('Showing results with javascript');
                $results
                  .stop()
                  .fadeIn(settings.duration, settings.easing)
                ;
              }
              $.proxy(settings.onResultsOpen, $results)();
            }
          },
          hide: function() {
            if($results.filter(':visible').size() > 0) {
              if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported') && !$results.transition('is outward')) {
                module.debug('Hiding results with css animations');
                $results
                  .transition({
                    animation  : settings.transition + ' out',
                    duration   : settings.duration,
                    queue      : true
                  })
                ;
              }
              else {
                module.debug('Hiding results with javascript');
                $results
                  .stop()
                  .fadeIn(settings.duration, settings.easing)
                ;
              }
              $.proxy(settings.onResultsClose, $results)();
            }
          },
          select: function(event) {
            module.debug('Search result selected');
            var
              $result = $(this),
              $title  = $result.find('.title'),
              title   = $title.html()
            ;
            if(settings.onSelect == 'default' || $.proxy(settings.onSelect, this)(event) == 'default') {
              var
                $link  = $result.find('a[href]').eq(0),
                $title = $result.find(selector.title).eq(0),
                href   = $link.attr('href') || false,
                target = $link.attr('target') || false,
                name   = ($title.size() > 0)
                  ? $title.text()
                  : false
              ;
              module.results.hide();
              if(name) {
                $prompt.val(name);
              }
              if(href) {
                if(target == '_blank' || event.ctrlKey) {
                  window.open(href);
                }
                else {
                  window.location.href = (href);
                }
              }
            }
          }
        },

        // displays mesage visibly in search results
        message: function(text, type) {
          type = type || 'standard';
          module.results.add( settings.templates.message(text, type) );
          return settings.templates.message(text, type);
        },

        setting: function(name, value) {
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

$.fn.search.settings = {

  name           : 'Search Module',
  namespace      : 'search',

  debug          : false,
  verbose        : true,
  performance    : true,

  // api config
  apiSettings    : false,
  type           : 'standard',
  minCharacters  : 1,

  source         : false,
  searchFields   : [
    'title',
    'description'
  ],
  searchFullText : true,

  automatic      : 'true',
  hideDelay      : 0,
  searchDelay    : 300,
  maxResults     : 7,
  cache          : true,

  transition     : 'scale',
  duration       : 300,
  easing         : 'easeOutExpo',

  // onSelect default action is defined in module
  onSelect       : 'default',
  onResultsAdd   : 'default',

  onSearchQuery  : function(){},
  onResults      : function(response){},

  onResultsOpen  : function(){},
  onResultsClose : function(){},

  className: {
    active  : 'active',
    down    : 'down',
    focus   : 'focus',
    empty   : 'empty',
    loading : 'loading'
  },

  error : {
    source      : 'Cannot search. No source used, and Semantic API module was not included',
    noResults   : 'Your search returned no results',
    logging     : 'Error in debug logging, exiting.',
    noTemplate  : 'A valid template name was not specified.',
    serverError : 'There was an issue with querying the server.',
    method      : 'The method you called is not defined.'
  },

  selector : {
    prompt       : '.prompt',
    searchButton : '.search.button',
    results      : '.results',
    category     : '.category',
    result       : '.result',
    title        : '.title, .name'
  },

  templates: {
    escape: function(string) {
      var
        badChars     = /[&<>"'`]/g,
        shouldEscape = /[&<>"'`]/,
        escape       = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#x27;",
          "`": "&#x60;"
        },
        escapedChar  = function(chr) {
          return escape[chr];
        }
      ;
      if(shouldEscape.test(string)) {
        return string.replace(badChars, escapedChar);
      }
      return string;
    },
    message: function(message, type) {
      var
        html = ''
      ;
      if(message !== undefined && type !== undefined) {
        html +=  ''
          + '<div class="message ' + type + '">'
        ;
        // message type
        if(type == 'empty') {
          html += ''
            + '<div class="header">No Results</div class="header">'
            + '<div class="description">' + message + '</div class="description">'
          ;
        }
        else {
          html += ' <div class="description">' + message + '</div>';
        }
        html += '</div>';
      }
      return html;
    },
    category: function(response) {
      var
        html = '',
        escape = $.fn.search.settings.templates.escape
      ;
      if(response.results !== undefined) {
        // each category
        $.each(response.results, function(index, category) {
          if(category.results !== undefined && category.results.length > 0) {
            html  += ''
              + '<div class="category">'
              + '<div class="name">' + category.name + '</div>'
            ;
            // each item inside category
            $.each(category.results, function(index, result) {
              html  += '<div class="result">';
              if(result.url) {
                html  += '<a href="' + result.url + '"></a>';
              }
              if(result.image !== undefined) {
                result.image = escape(result.image);
                html += ''
                  + '<div class="image">'
                  + ' <img src="' + result.image + '" alt="">'
                  + '</div>'
                ;
              }
              html += '<div class="content">';
              if(result.price !== undefined) {
                result.price = escape(result.price);
                html += '<div class="price">' + result.price + '</div>';
              }
              if(result.title !== undefined) {
                result.title = escape(result.title);
                html += '<div class="title">' + result.title + '</div>';
              }
              if(result.description !== undefined) {
                html += '<div class="description">' + result.description + '</div>';
              }
              html  += ''
                + '</div>'
                + '</div>'
              ;
            });
            html  += ''
              + '</div>'
            ;
          }
        });
        if(response.action) {
          html += ''
          + '<a href="' + response.action.url + '" class="action">'
          +   response.action.text
          + '</a>';
        }
        return html;
      }
      return false;
    },
    standard: function(response) {
      var
        html = ''
      ;
      if(response.results !== undefined) {

        // each result
        $.each(response.results, function(index, result) {
          if(result.url) {
            html  += '<a class="result" href="' + result.url + '">';
          }
          else {
            html  += '<a class="result">';
          }
          if(result.image !== undefined) {
            html += ''
              + '<div class="image">'
              + ' <img src="' + result.image + '">'
              + '</div>'
            ;
          }
          html += '<div class="content">';
          if(result.price !== undefined) {
            html += '<div class="price">' + result.price + '</div>';
          }
          if(result.title !== undefined) {
            html += '<div class="title">' + result.title + '</div>';
          }
          if(result.description !== undefined) {
            html += '<div class="description">' + result.description + '</div>';
          }
          html  += ''
            + '</div>'
          ;
          html += '</a>';
        });

        if(response.action) {
          html += ''
          + '<a href="' + response.action.url + '" class="action">'
          +   response.action.text
          + '</a>';
        }
        return html;
      }
      return false;
    }
  }
};

})( jQuery, window , document );

/*
 * # Semantic - Shape
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

$.fn.shape = function(parameters) {
  var
    $allModules     = $(this),
    $body           = $('body'),

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    requestAnimationFrame = window.requestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.msRequestAnimationFrame
      || function(callback) { setTimeout(callback, 0); },

    returnedValue
  ;

  $allModules
    .each(function() {
      var
        moduleSelector  = $allModules.selector || '',
        settings        = $.extend(true, {}, $.fn.shape.settings, parameters),

        // internal aliases
        namespace     = settings.namespace,
        selector      = settings.selector,
        error         = settings.error,
        className     = settings.className,

        // define namespaces for modules
        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        // selector cache
        $module       = $(this),
        $sides        = $module.find(selector.sides),
        $side         = $module.find(selector.side),

        // private variables
        nextIndex = false,
        $activeSide,
        $nextSide,

        // standard module
        element       = this,
        instance      = $module.data(moduleNamespace),
        module
      ;

      module = {

        initialize: function() {
          module.verbose('Initializing module for', element);
          module.set.defaultSide();
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
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
          $sides  = $(this).find(selector.shape);
          $side   = $(this).find(selector.side);
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
            module.verbose('Executing animation callback');
            if(event !== undefined) {
              event.stopPropagation();
            }
            module.reset();
            module.set.active();
          };
          $.proxy(settings.beforeChange, $nextSide[0])();
          if(module.get.transitionEvent()) {
            module.verbose('Starting CSS animation');
            $module
              .addClass(className.animating)
            ;
            $sides
              .css(propertyObject)
              .one(module.get.transitionEvent(), callback)
            ;
            module.set.duration(settings.duration);
            requestAnimationFrame(function() {
              $module
                .addClass(className.animating)
              ;
              $activeSide
                .addClass(className.hidden)
              ;
            });
          }
          else {
            callback();
          }
        },

        queue: function(method) {
          module.debug('Queueing animation of', method);
          $sides
            .one(module.get.transitionEvent(), function() {
              module.debug('Executing queued animation');
              setTimeout(function(){
                $module.shape(method);
              }, 0);
            })
          ;
        },

        reset: function() {
          module.verbose('Animating states reset');
          $module
            .removeClass(className.animating)
            .attr('style', '')
            .removeAttr('style')
          ;
          // removeAttr style does not consistently work in safari
          $sides
            .attr('style', '')
            .removeAttr('style')
          ;
          $side
            .attr('style', '')
            .removeAttr('style')
            .removeClass(className.hidden)
          ;
          $nextSide
            .removeClass(className.animating)
            .attr('style', '')
            .removeAttr('style')
          ;
        },

        is: {
          complete: function() {
            return ($side.filter('.' + className.active)[0] == $nextSide[0]);
          },
          animating: function() {
            return $module.hasClass(className.animating);
          }
        },

        set: {

          defaultSide: function() {
            $activeSide = $module.find('.' + settings.className.active);
            $nextSide   = ( $activeSide.next(selector.side).size() > 0 )
              ? $activeSide.next(selector.side)
              : $module.find(selector.side).first()
            ;
            nextIndex = false;
            module.verbose('Active side set to', $activeSide);
            module.verbose('Next side set to', $nextSide);
          },

          duration: function(duration) {
            duration = duration || settings.duration;
            duration = (typeof duration == 'number')
              ? duration + 'ms'
              : duration
            ;
            module.verbose('Setting animation duration', duration);
            $sides.add($side)
              .css({
                '-webkit-transition-duration': duration,
                '-moz-transition-duration': duration,
                '-ms-transition-duration': duration,
                '-o-transition-duration': duration,
                'transition-duration': duration
              })
            ;
          },

          stageSize: function() {
            var
              $clone      = $module.clone().addClass(className.loading),
              $activeSide = $clone.find('.' + settings.className.active),
              $nextSide   = (nextIndex)
                ? $clone.find(selector.side).eq(nextIndex)
                : ( $activeSide.next(selector.side).size() > 0 )
                  ? $activeSide.next(selector.side)
                  : $clone.find(selector.side).first(),
              newSize = {}
            ;
            $activeSide.removeClass(className.active);
            $nextSide.addClass(className.active);
            $clone.insertAfter($module);
            newSize = {
              width  : $nextSide.outerWidth(),
              height : $nextSide.outerHeight()
            };
            $clone.remove();
            $module
              .css(newSize)
            ;
            module.verbose('Resizing stage to fit new content', newSize);
          },

          nextSide: function(selector) {
            nextIndex = selector;
            $nextSide = $side.filter(selector);
            nextIndex = $side.index($nextSide);
            if($nextSide.size() === 0) {
              module.set.defaultSide();
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
            $.proxy(settings.onChange, $nextSide[0])();
            module.set.defaultSide();
          }
        },

        flip: {

          up: function() {
            if(module.is.complete() && !module.is.animating() && !settings.allowRepeats) {
              module.debug('Side already visible', $nextSide);
              return;
            }
            if( !module.is.animating()) {
              module.debug('Flipping up', $nextSide);
              module.set.stageSize();
              module.stage.above();
              module.animate( module.get.transform.up() );
            }
            else {
              module.queue('flip up');
            }
          },

          down: function() {
            if(module.is.complete() && !module.is.animating() && !settings.allowRepeats) {
              module.debug('Side already visible', $nextSide);
              return;
            }
            if( !module.is.animating()) {
              module.debug('Flipping down', $nextSide);
              module.set.stageSize();
              module.stage.below();
              module.animate( module.get.transform.down() );
            }
            else {
              module.queue('flip down');
            }
          },

          left: function() {
            if(module.is.complete() && !module.is.animating() && !settings.allowRepeats) {
              module.debug('Side already visible', $nextSide);
              return;
            }
            if( !module.is.animating()) {
              module.debug('Flipping left', $nextSide);
              module.set.stageSize();
              module.stage.left();
              module.animate(module.get.transform.left() );
            }
            else {
              module.queue('flip left');
            }
          },

          right: function() {
            if(module.is.complete() && !module.is.animating() && !settings.allowRepeats) {
              module.debug('Side already visible', $nextSide);
              return;
            }
            if( !module.is.animating()) {
              module.debug('Flipping right', $nextSide);
              module.set.stageSize();
              module.stage.right();
              module.animate(module.get.transform.right() );
            }
            else {
              module.queue('flip right');
            }
          },

          over: function() {
            if(module.is.complete() && !module.is.animating() && !settings.allowRepeats) {
              module.debug('Side already visible', $nextSide);
              return;
            }
            if( !module.is.animating()) {
              module.debug('Flipping over', $nextSide);
              module.set.stageSize();
              module.stage.behind();
              module.animate(module.get.transform.over() );
            }
            else {
              module.queue('flip over');
            }
          },

          back: function() {
            if(module.is.complete() && !module.is.animating() && !settings.allowRepeats) {
              module.debug('Side already visible', $nextSide);
              return;
            }
            if( !module.is.animating()) {
              module.debug('Flipping back', $nextSide);
              module.set.stageSize();
              module.stage.behind();
              module.animate(module.get.transform.back() );
            }
            else {
              module.queue('flip back');
            }
          }

        },

        get: {

          transform: {
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

            over: function() {
              var
                translate = {
                  x : -(($activeSide.outerWidth() - $nextSide.outerWidth()) / 2)
                }
              ;
              return {
                transform: 'translateX(' + translate.x + 'px) rotateY(180deg)'
              };
            },

            back: function() {
              var
                translate = {
                  x : -(($activeSide.outerWidth() - $nextSide.outerWidth()) / 2)
                }
              ;
              return {
                transform: 'translateX(' + translate.x + 'px) rotateY(-180deg)'
              };
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
          },

          nextSide: function() {
            return ( $activeSide.next(selector.side).size() > 0 )
              ? $activeSide.next(selector.side)
              : $module.find(selector.side).first()
            ;
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

$.fn.shape.settings = {

  // module info
  name : 'Shape',

  // debug content outputted to console
  debug      : false,

  // verbose debug output
  verbose    : true,

  // performance data output
  performance: true,

  // event namespace
  namespace  : 'shape',

  // callback occurs on side change
  beforeChange : function() {},
  onChange     : function() {},

  // allow animation to same side
  allowRepeats: false,

  // animation duration
  duration   : 700,

  // possible errors
  error: {
    side   : 'You tried to switch to a side that does not exist.',
    method : 'The method you called is not defined'
  },

  // classnames used
  className   : {
    animating : 'animating',
    hidden    : 'hidden',
    loading   : 'loading',
    active    : 'active'
  },

  // selectors used
  selector    : {
    sides : '.sides',
    side  : '.side'
  }

};


})( jQuery, window , document );
/*
 * # Semantic - Sidebar
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

$.fn.sidebar = function(parameters) {
  var
    $allModules    = $(this),
    $head          = $('head'),

    moduleSelector = $allModules.selector || '',

    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),

    requestAnimationFrame = window.requestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.msRequestAnimationFrame
      || function(callback) { setTimeout(callback, 0); },

    returnedValue
  ;

  $allModules
    .each(function() {
      var
        settings        = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.sidebar.settings, parameters)
          : $.extend({}, $.fn.sidebar.settings),

        selector        = settings.selector,
        className       = settings.className,
        namespace       = settings.namespace,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        $module         = $(this),
        $context        = $(settings.context),

        $sidebars       = $module.children(selector.sidebar),
        $pusher         = $context.children(selector.pusher),
        $style,

        element         = this,
        instance        = $module.data(moduleNamespace),

        currentScroll,
        transitionEvent,

        module
      ;

      module      = {

        initialize: function() {
          module.debug('Initializing sidebar', parameters);

          transitionEvent = module.get.transitionEvent();

          // cache on initialize
          if( module.is.legacy() || settings.legacy) {
            settings.transition = 'overlay';
            settings.useLegacy = true;
          }

          // avoid locking rendering if included in onReady
          requestAnimationFrame(module.setup.layout);

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
          module.remove.direction();
          $module
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        event: {
          clickaway: function(event) {
            if( $(event.target).closest(selector.sidebar).size() === 0 ) {
              module.verbose('User clicked on dimmed page');
              module.hide();
            }
          },
          touch: function(event) {
            //event.stopPropagation();
          },
          containScroll: function(event) {
            if(element.scrollTop <= 0)  {
              element.scrollTop = 1;
            }
            if((element.scrollTop + element.offsetHeight) >= element.scrollHeight) {
              element.scrollTop = element.scrollHeight - element.offsetHeight - 1;
            }
          },
          scroll: function(event) {
            if( $(event.target).closest(selector.sidebar).size() === 0 ) {
              event.preventDefault();
            }
          }
        },

        bind: {
          clickaway: function() {
            if(settings.scrollLock) {
              $(window)
                .on('DOMMouseScroll' + eventNamespace, module.event.scroll)
              ;
            }
            $(document)
              .on('touchmove' + eventNamespace, module.event.touch)
            ;
            $module
              .on('scroll' + eventNamespace, module.event.containScroll)
            ;
            if(settings.closable) {
              $context
                .on('click' + eventNamespace, module.event.clickaway)
                .on('touchend' + eventNamespace, module.event.clickaway)
              ;
            }
          }
        },
        unbind: {
          clickaway: function() {
            $context.off(eventNamespace);
            $pusher.off(eventNamespace);
            $(document).off(eventNamespace);
            $(window).off(eventNamespace);
          }
        },

        add: {
          bodyCSS: function(direction, distance) {
            var
              width  = $module.outerWidth(),
              height = $module.outerHeight(),
              style
            ;
            style  = ''
              + '<style title="' + namespace + '">'
              + ' .ui.visible.left.sidebar ~ .fixed,'
              + ' .ui.visible.left.sidebar ~ .pusher {'
              + '   -webkit-transform: translate3d('+ width + 'px, 0, 0);'
              + '           transform: translate3d('+ width + 'px, 0, 0);'
              + ' }'
              + ' .ui.visible.right.sidebar ~ .fixed,'
              + ' .ui.visible.right.sidebar ~ .pusher {'
              + '   -webkit-transform: translate3d(-'+ width + 'px, 0, 0);'
              + '           transform: translate3d(-'+ width + 'px, 0, 0);'
              + ' }'
              + ' .ui.visible.left.sidebar ~ .ui.visible.right.sidebar ~ .fixed,'
              + ' .ui.visible.left.sidebar ~ .ui.visible.right.sidebar ~ .pusher,'
              + ' .ui.visible.right.sidebar ~ .ui.visible.left.sidebar ~ .fixed,'
              + ' .ui.visible.right.sidebar ~ .ui.visible.left.sidebar ~ .pusher {'
              + '   -webkit-transform: translate3d(0px, 0, 0);'
              + '           transform: translate3d(0px, 0, 0);'
              + ' }'
              + ' .ui.visible.top.sidebar ~ .fixed,'
              + ' .ui.visible.top.sidebar ~ .pusher {'
              + '   -webkit-transform: translate3d(0, ' + height + 'px, 0);'
              + '           transform: translate3d(0, ' + height + 'px, 0);'
              + ' }'
              + ' .ui.visible.bottom.sidebar ~ .fixed,'
              + ' .ui.visible.bottom.sidebar ~ .pusher {'
              + '   -webkit-transform: translate3d(0, -' + height + 'px, 0);'
              + '           transform: translate3d(0, -' + height + 'px, 0);'
              + ' }'
            ;

            /* IE is only browser not to create context with transforms */
            /* https://www.w3.org/Bugs/Public/show_bug.cgi?id=16328 */
            if( module.is.ie() ) {
              style += ''
                + ' .ui.visible.left.sidebar ~ .pusher:after {'
                + '   -webkit-transform: translate3d('+ width + 'px, 0, 0);'
                + '           transform: translate3d('+ width + 'px, 0, 0);'
                + ' }'
                + ' .ui.visible.right.sidebar ~ .pusher:after {'
                + '   -webkit-transform: translate3d(-'+ width + 'px, 0, 0);'
                + '           transform: translate3d(-'+ width + 'px, 0, 0);'
                + ' }'
                + ' .ui.visible.left.sidebar ~ .ui.visible.right.sidebar ~ .pusher:after,'
                + ' .ui.visible.right.sidebar ~ .ui.visible.left.sidebar ~ .pusher:after {'
                + '   -webkit-transform: translate3d(0px, 0, 0);'
                + '           transform: translate3d(0px, 0, 0);'
                + ' }'
                + ' .ui.visible.top.sidebar ~ .pusher:after {'
                + '   -webkit-transform: translate3d(0, ' + height + 'px, 0);'
                + '           transform: translate3d(0, ' + height + 'px, 0);'
                + ' }'
                + ' .ui.visible.bottom.sidebar ~ .pusher:after {'
                + '   -webkit-transform: translate3d(0, -' + height + 'px, 0);'
                + '           transform: translate3d(0, -' + height + 'px, 0);'
                + ' }'
              ;
            }

           style += '</style>';

            $head.append(style);
            $style = $('style[title=' + namespace + ']');
            module.debug('Adding sizing css to head', $style);
          }
        },

        refresh: function() {
          module.verbose('Refreshing selector cache');
          $context  = $(settings.context);
          $sidebars = $context.children(selector.sidebar);
          $pusher   = $context.children(selector.pusher);
        },

        repaint: function() {
          module.verbose('Forcing repaint event');
          element.style.display='none';
          element.offsetHeight;
          element.scrollTop = element.scrollTop;
          element.style.display='';
        },

        setup: {
          layout: function() {
            if( $context.children(selector.pusher).size() === 0 ) {
              module.debug('Adding wrapper element for sidebar');
              module.error(error.pusher);
              $pusher = $('<div class="pusher" />');
              $context
                .children()
                  .not(selector.omitted)
                  .not($sidebars)
                  .wrapAll($pusher)
              ;
              module.refresh();
            }
            if($module.nextAll(selector.pusher).size() == 0 || $module.nextAll(selector.pusher)[0] !== $pusher[0]) {
              module.debug('Moved sidebar to correct parent element');
              module.error(error.movedSidebar, element);
              $module.detach().prependTo($context);
              module.refresh();
            }
            module.set.pushable();
            module.set.direction();
          }
        },

        attachEvents: function(selector, event) {
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
            module.error(error.notFound, selector);
          }
        },

        show: function(callback) {
          var
            animateMethod = (settings.useLegacy)
              ? module.legacyPushPage
              : module.pushPage
          ;
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          if(module.is.closed()) {
            if(settings.overlay)  {
              module.error(error.overlay);
              settings.transition = 'overlay';
            }
            module.refresh();
            if(module.othersVisible() && module.get.transition() != 'overlay') {
              module.debug('Other sidebars currently open');
              if(settings.exclusive) {
                module.hideOthers();
              }
            }
            animateMethod(function() {
              $.proxy(callback, element)();
              $.proxy(settings.onShow, element)();
            });
            $.proxy(settings.onChange, element)();
            $.proxy(settings.onVisible, element)();
          }
          else {
            module.debug('Sidebar is already visible');
          }
        },

        hide: function(callback) {
          var
            animateMethod = (settings.useLegacy)
              ? module.legacyPullPage
              : module.pullPage
          ;
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          if(module.is.visible() || module.is.animating()) {
            module.debug('Hiding sidebar', callback);
            animateMethod(function() {
              $.proxy(callback, element)();
              $.proxy(settings.onHidden, element)();
            });
            $.proxy(settings.onChange, element)();
            $.proxy(settings.onHide, element)();
          }
        },

        othersVisible: function() {
          return ($sidebars.not($module).filter('.' + className.visible).size() > 0);
        },
        othersActive: function() {
          return ($sidebars.not($module).filter('.' + className.active).size() > 0);
        },

        hideOthers: function(callback) {
          var
            $otherSidebars = $sidebars.not($module).filter('.' + className.visible),
            callback       = callback || function(){},
            sidebarCount   = $otherSidebars.size(),
            callbackCount  = 0
          ;
          $otherSidebars
            .sidebar('hide', function() {
              callbackCount++;
              if(callbackCount == sidebarCount) {
                callback();
              }
            })
          ;
        },

        toggle: function() {
          module.verbose('Determining toggled direction');
          if(module.is.closed()) {
            module.show();
          }
          else {
            module.hide();
          }
        },

        pushPage: function(callback) {
          var
            transition = module.get.transition(),
            $transition = (transition == 'safe')
              ? $context
              : (transition == 'overlay' || module.othersActive())
                ? $module
                : $pusher,
            animate,
            transitionEnd
          ;
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          if(settings.transition == 'scale down' || (module.is.mobile() && transition !== 'overlay')) {
            module.scrollToTop();
          }
          module.set.transition();
          module.repaint();
          animate = function() {
            module.add.bodyCSS();
            module.set.animating();
            module.set.visible();
            if(!module.othersActive()) {
              if(settings.dimPage) {
                $pusher.addClass(className.dimmed);
              }
            }
          };
          transitionEnd = function(event) {
            if( event.target == $transition[0] ) {
              $transition.off(transitionEvent + eventNamespace, transitionEnd);
              module.remove.animating();
              module.bind.clickaway();
              $.proxy(callback, element)();
            }
          };
          $transition.on(transitionEvent + eventNamespace, transitionEnd);
          requestAnimationFrame(animate);
        },

        pullPage: function(callback) {
          var
            transition = module.get.transition(),
            $transition = (transition == 'safe')
              ? $context
              : (transition == 'overlay' || module.othersActive())
                ? $module
                : $pusher,
            animate,
            transitionEnd
          ;
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          module.verbose('Removing context push state', module.get.direction());
          if(!module.othersActive()) {
            module.unbind.clickaway();
          }
          animate = function() {
            module.set.animating();
            module.remove.visible();
            if(settings.dimPage && !module.othersActive()) {
              $pusher.removeClass(className.dimmed);
            }
          };
          transitionEnd = function(event) {
            if( event.target == $transition[0] ) {
              $transition.off(transitionEvent + eventNamespace, transitionEnd);
              module.remove.animating();
              module.remove.transition();
              module.remove.bodyCSS();
              if(transition == 'scale down' || (settings.returnScroll && module.is.mobile()) ) {
                module.scrollBack();
              }
              $.proxy(callback, element)();
            }
          };
          $transition.on(transitionEvent + eventNamespace, transitionEnd);
          requestAnimationFrame(animate);
        },

        legacyPushPage: function(callback) {
          var
            distance   = $module.width(),
            direction  = module.get.direction(),
            properties = {}
          ;
          distance  = distance || $module.width();
          callback  = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          properties[direction] = distance;
          module.debug('Using javascript to push context', properties);
          module.set.visible();
          module.set.transition();
          module.set.animating();
          if(settings.dimPage) {
            $pusher.addClass(className.dimmed);
          }
          $context
            .css('position', 'relative')
            .animate(properties, settings.duration, settings.easing, function() {
              module.remove.animating();
              module.bind.clickaway();
              $.proxy(callback, module)();
            })
          ;
        },
        legacyPullPage: function(callback) {
          var
            distance   = 0,
            direction  = module.get.direction(),
            properties = {}
          ;
          distance  = distance || $module.width();
          callback  = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          properties[direction] = '0px';
          module.debug('Using javascript to pull context', properties);
          module.unbind.clickaway();
          module.set.animating();
          module.remove.visible();
          if(settings.dimPage && !module.othersVisible()) {
            $pusher.removeClass(className.dimmed);
          }
          $context
            .css('position', 'relative')
            .animate(properties, settings.duration, settings.easing, function() {
              module.remove.animating();
              $.proxy(callback, module)();
            })
          ;
        },

        scrollToTop: function() {
          module.verbose('Scrolling to top of page to avoid animation issues');
          currentScroll = $(window).scrollTop();
          $module.scrollTop(0);
          window.scrollTo(0, 0);
        },

        scrollBack: function() {
          module.verbose('Scrolling back to original page position');
          window.scrollTo(0, currentScroll);
        },

        set: {
          // container
          pushed: function() {
            $context.addClass(className.pushed);
          },
          pushable: function() {
            $context.addClass(className.pushable);
          },

          // sidebar
          active: function() {
            $module.addClass(className.active);
          },
          animating: function() {
            $module.addClass(className.animating);
          },
          transition: function(transition) {
            transition = transition || module.get.transition();
            $module.addClass(transition);
          },
          direction: function(direction) {
            direction = direction || module.get.direction();
            $module.addClass(className[direction]);
          },
          visible: function() {
            $module.addClass(className.visible);
          },
          overlay: function() {
            $module.addClass(className.overlay);
          }
        },
        remove: {

          bodyCSS: function() {
            module.debug('Removing body css styles', $style);
            if($style.size() > 0) {
              $style.remove();
            }
          },

          // context
          pushed: function() {
            $context.removeClass(className.pushed);
          },
          pushable: function() {
            $context.removeClass(className.pushable);
          },

          // sidebar
          active: function() {
            $module.removeClass(className.active);
          },
          animating: function() {
            $module.removeClass(className.animating);
          },
          transition: function(transition) {
            transition = transition || module.get.transition();
            $module.removeClass(transition);
          },
          direction: function(direction) {
            direction = direction || module.get.direction();
            $module.removeClass(className[direction]);
          },
          visible: function() {
            $module.removeClass(className.visible);
          },
          overlay: function() {
            $module.removeClass(className.overlay);
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
            return className.left;
          },
          transition: function() {
            var
              direction = module.get.direction(),
              transition
            ;
            return ( module.is.mobile() )
              ? (settings.mobileTransition == 'auto')
                ? settings.defaultTransition.mobile[direction]
                : settings.mobileTransition
              : (settings.transition == 'auto')
                ? settings.defaultTransition.computer[direction]
                : settings.transition
            ;
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

          ie: function() {
            var
              isIE11 = (!(window.ActiveXObject) && 'ActiveXObject' in window),
              isIE   = ('ActiveXObject' in window)
            ;
            return (isIE11 || isIE);
          },

          legacy: function() {
            var
              element    = document.createElement('div'),
              transforms = {
                'webkitTransform' :'-webkit-transform',
                'OTransform'      :'-o-transform',
                'msTransform'     :'-ms-transform',
                'MozTransform'    :'-moz-transform',
                'transform'       :'transform'
              },
              has3D
            ;

            // Add it to the body to get the computed style.
            document.body.insertBefore(element, null);
            for (var transform in transforms) {
              if (element.style[transform] !== undefined) {
                element.style[transform] = "translate3d(1px,1px,1px)";
                has3D = window.getComputedStyle(element).getPropertyValue(transforms[transform]);
              }
            }
            document.body.removeChild(element);
            return !(has3D !== undefined && has3D.length > 0 && has3D !== 'none');
          },
          mobile: function() {
            var
              userAgent    = navigator.userAgent,
              mobileRegExp = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/,
              isMobile     = mobileRegExp.test(userAgent)
            ;
            if(isMobile) {
              module.verbose('Browser was found to be mobile', userAgent);
              return true;
            }
            else {
              module.verbose('Browser is not mobile, using regular transition', userAgent);
              return false;
            }
          },
          closed: function() {
            return !module.is.visible();
          },
          visible: function() {
            return $module.hasClass(className.visible);
          },
          vertical: function() {
            return $module.hasClass(className.top);
          },
          animating: function() {
            return $context.hasClass(className.animating);
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
      }
    ;

    if(methodInvoked) {
      if(instance === undefined) {
        module.initialize();
      }
      module.invoke(query);
    }
    else {
      if(instance !== undefined) {
        module.invoke('destroy');
      }
      module.initialize();
    }
  });

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.sidebar.settings = {

  name              : 'Sidebar',
  namespace         : 'sidebar',

  debug             : false,
  verbose           : true,
  performance       : true,

  transition        : 'auto',
  mobileTransition  : 'auto',

  defaultTransition : {
    computer: {
      left   : 'uncover',
      right  : 'uncover',
      top    : 'overlay',
      bottom : 'overlay'
    },
    mobile: {
      left   : 'uncover',
      right  : 'uncover',
      top    : 'overlay',
      bottom : 'overlay'
    }
  },

  context           : 'body',
  exclusive         : false,
  closable          : true,
  dimPage           : true,
  scrollLock        : false,
  returnScroll      : false,

  useLegacy         : false,
  duration          : 500,
  easing            : 'easeInOutQuint',

  onChange          : function(){},
  onShow            : function(){},
  onHide            : function(){},

  onHidden          : function(){},
  onVisible         : function(){},

  className         : {
    active    : 'active',
    animating : 'animating',
    dimmed    : 'dimmed',
    pushable  : 'pushable',
    pushed    : 'pushed',
    right     : 'right',
    top       : 'top',
    left      : 'left',
    bottom    : 'bottom',
    visible   : 'visible'
  },

  selector: {
    fixed   : '.fixed',
    omitted : 'script, link, style, .ui.modal, .ui.dimmer, .ui.nag, .ui.fixed',
    pusher  : '.pusher',
    sidebar : '.ui.sidebar'
  },

  error   : {
    method       : 'The method you called is not defined.',
    pusher       : 'Had to add pusher element. For optimal performance make sure body content is inside a pusher element',
    movedSidebar : 'Had to move sidebar. For optimal performance make sure sidebar and pusher are direct children of your body tag',
    overlay      : 'The overlay setting is no longer supported, use animation: overlay',
    notFound     : 'There were no elements that matched the specified selector'
  }

};

// Adds easing
$.extend( $.easing, {
  easeInOutQuint: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
    return c/2*((t-=2)*t*t*t*t + 2) + b;
  }
});


})( jQuery, window , document );

/*
 * # Semantic - Site
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
;(function ( $, window, document, undefined ) {

$.site = $.fn.site = function(parameters) {
  var
    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),

    settings        = ( $.isPlainObject(parameters) )
      ? $.extend(true, {}, $.site.settings, parameters)
      : $.extend({}, $.site.settings),

    namespace       = settings.namespace,
    error           = settings.error,

    eventNamespace  = '.' + namespace,
    moduleNamespace = 'module-' + namespace,

    $document       = $(document),
    $module         = $document,
    element         = this,
    instance        = $module.data(moduleNamespace),

    module,
    returnedValue
  ;
  module = {

    initialize: function() {
      module.instantiate();
    },

    instantiate: function() {
      module.verbose('Storing instance of site', module);
      instance = module;
      $module
        .data(moduleNamespace, module)
      ;
    },

    normalize: function() {
      module.fix.console();
      module.fix.requestAnimationFrame();
    },

    fix: {
      console: function() {
        module.debug('Normalizing window.console');
        if (console === undefined || console.log === undefined) {
          module.verbose('Console not available, normalizing events');
          module.disable.console();
        }
        if (typeof console.group == 'undefined' || typeof console.groupEnd == 'undefined' || typeof console.groupCollapsed == 'undefined') {
          module.verbose('Console group not available, normalizing events');
          window.console.group = function() {};
          window.console.groupEnd = function() {};
          window.console.groupCollapsed = function() {};
        }
        if (typeof console.markTimeline == 'undefined') {
          module.verbose('Mark timeline not available, normalizing events');
          window.console.markTimeline = function() {};
        }
      },
      consoleClear: function() {
        module.debug('Disabling programmatic console clearing');
        window.console.clear = function() {};
      },
      requestAnimationFrame: function() {
        module.debug('Normalizing requestAnimationFrame');
        if(window.requestAnimationFrame === undefined) {
          module.debug('RequestAnimationFrame not available, normailizing event');
          window.requestAnimationFrame = window.requestAnimationFrame
            || window.mozRequestAnimationFrame
            || window.webkitRequestAnimationFrame
            || window.msRequestAnimationFrame
            || function(callback) { setTimeout(callback, 0); }
          ;
        }
      }
    },

    moduleExists: function(name) {
      return ($.fn[name] !== undefined && $.fn[name].settings !== undefined);
    },

    enabled: {
      modules: function(modules) {
        var
          enabledModules = []
        ;
        modules = modules || settings.modules;
        $.each(modules, function(index, name) {
          if(module.moduleExists(name)) {
            enabledModules.push(name);
          }
        });
        return enabledModules;
      }
    },

    disabled: {
      modules: function(modules) {
        var
          disabledModules = []
        ;
        modules = modules || settings.modules;
        $.each(modules, function(index, name) {
          if(!module.moduleExists(name)) {
            disabledModules.push(name);
          }
        });
        return disabledModules;
      }
    },

    change: {
      setting: function(setting, value, modules, modifyExisting) {
        modules = (typeof modules === 'string')
          ? (modules === 'all')
            ? settings.modules
            : [modules]
          : modules || settings.modules
        ;
        modifyExisting = (modifyExisting !== undefined)
          ? modifyExisting
          : true
        ;
        $.each(modules, function(index, name) {
          var
            namespace = (module.moduleExists(name))
              ? $.fn[name].settings.namespace || false
              : true,
            $existingModules
          ;
          if(module.moduleExists(name)) {
            module.verbose('Changing default setting', setting, value, name);
            $.fn[name].settings[setting] = value;
            if(modifyExisting && namespace) {
              $existingModules = $(':data(module-' + namespace + ')');
              if($existingModules.size() > 0) {
                module.verbose('Modifying existing settings', $existingModules);
                $existingModules[name]('setting', setting, value);
              }
            }
          }
        });
      },
      settings: function(newSettings, modules, modifyExisting) {
        modules = (typeof modules === 'string')
          ? [modules]
          : modules || settings.modules
        ;
        modifyExisting = (modifyExisting !== undefined)
          ? modifyExisting
          : true
        ;
        $.each(modules, function(index, name) {
          var
            $existingModules
          ;
          if(module.moduleExists(name)) {
            module.verbose('Changing default setting', newSettings, name);
            $.extend(true, $.fn[name].settings, newSettings);
            if(modifyExisting && namespace) {
              $existingModules = $(':data(module-' + namespace + ')');
              if($existingModules.size() > 0) {
                module.verbose('Modifying existing settings', $existingModules);
                $existingModules[name]('setting', newSettings);
              }
            }
          }
        });
      }
    },

    enable: {
      console: function() {
        module.console(true);
      },
      debug: function(modules, modifyExisting) {
        modules = modules || settings.modules;
        module.debug('Enabling debug for modules', modules);
        module.change.setting('debug', true, modules, modifyExisting);
      },
      verbose: function(modules, modifyExisting) {
        modules = modules || settings.modules;
        module.debug('Enabling verbose debug for modules', modules);
        module.change.setting('verbose', true, modules, modifyExisting);
      }
    },
    disable: {
      console: function() {
        module.console(false);
      },
      debug: function(modules, modifyExisting) {
        modules = modules || settings.modules;
        module.debug('Disabling debug for modules', modules);
        module.change.setting('debug', false, modules, modifyExisting);
      },
      verbose: function(modules, modifyExisting) {
        modules = modules || settings.modules;
        module.debug('Disabling verbose debug for modules', modules);
        module.change.setting('verbose', false, modules, modifyExisting);
      }
    },

    console: function(enable) {
      if(enable) {
        if(instance.cache.console === undefined) {
          module.error(error.console);
          return;
        }
        module.debug('Restoring console function');
        window.console = instance.cache.console;
      }
      else {
        module.debug('Disabling console function');
        instance.cache.console = window.console;
        window.console = {
          clear          : function(){},
          error          : function(){},
          group          : function(){},
          groupCollapsed : function(){},
          groupEnd       : function(){},
          info           : function(){},
          log            : function(){},
          markTimeline   : function(){},
          warn           : function(){}
        };
      }
    },

    destroy: function() {
      module.verbose('Destroying previous site for', $module);
      $module
        .removeData(moduleNamespace)
      ;
    },

    cache: {},

    setting: function(name, value) {
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
  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.site.settings = {

  name        : 'Site',
  namespace   : 'site',

  error : {
    console : 'Console cannot be restored, most likely it was overwritten outside of module',
    method : 'The method you called is not defined.'
  },

  debug       : false,
  verbose     : true,
  performance : true,

  modules: [
    'accordion',
    'api',
    'checkbox',
    'dimmer',
    'dropdown',
    'form',
    'modal',
    'nag',
    'popup',
    'rating',
    'shape',
    'sidebar',
    'state',
    'sticky',
    'tab',
    'transition',
    'video',
    'visit',
    'visibility'
  ],

  siteNamespace   : 'site',
  namespaceStub   : {
    cache     : {},
    config    : {},
    sections  : {},
    section   : {},
    utilities : {}
  }

};

// allows for selection of elements with data attributes
$.extend($.expr[ ":" ], {
  data: ($.expr.createPseudo)
    ? $.expr.createPseudo(function(dataName) {
        return function(elem) {
          return !!$.data(elem, dataName);
        };
      })
    : function(elem, i, match) {
      // support: jQuery < 1.8
      return !!$.data(elem, match[ 3 ]);
    }
});


})( jQuery, window , document );
/*
 * # Semantic - State
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

$.fn.state = function(parameters) {
  var
    $allModules     = $(this),

    moduleSelector  = $allModules.selector || '',

    hasTouch        = ('ontouchstart' in document.documentElement),
    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    returnedValue
  ;
  $allModules
    .each(function() {
      var
        settings          = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.state.settings, parameters)
          : $.extend({}, $.fn.state.settings),

        error           = settings.error,
        metadata        = settings.metadata,
        className       = settings.className,
        namespace       = settings.namespace,
        states          = settings.states,
        text            = settings.text,

        eventNamespace  = '.' + namespace,
        moduleNamespace = namespace + '-module',

        $module         = $(this),

        element         = this,
        instance        = $module.data(moduleNamespace),

        module
      ;
      module = {

        initialize: function() {
          module.verbose('Initializing module');

          // allow module to guess desired state based on element
          if(settings.automatic) {
            module.add.defaults();
          }

          // bind events with delegated events
          if(settings.context && moduleSelector !== '') {
            $(settings.context)
              .on(moduleSelector, 'mouseenter' + eventNamespace, module.change.text)
              .on(moduleSelector, 'mouseleave' + eventNamespace, module.reset.text)
              .on(moduleSelector, 'click'      + eventNamespace, module.toggle.state)
            ;
          }
          else {
            $module
              .on('mouseenter' + eventNamespace, module.change.text)
              .on('mouseleave' + eventNamespace, module.reset.text)
              .on('click'      + eventNamespace, module.toggle.state)
            ;
          }
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
          module.verbose('Destroying previous module', instance);
          $module
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        refresh: function() {
          module.verbose('Refreshing selector cache');
          $module = $(element);
        },

        add: {
          defaults: function() {
            var
              userStates = parameters && $.isPlainObject(parameters.states)
                ? parameters.states
                : {}
            ;
            $.each(settings.defaults, function(type, typeStates) {
              if( module.is[type] !== undefined && module.is[type]() ) {
                module.verbose('Adding default states', type, element);
                $.extend(settings.states, typeStates, userStates);
              }
            });
          }
        },

        is: {

          active: function() {
            return $module.hasClass(className.active);
          },
          loading: function() {
            return $module.hasClass(className.loading);
          },
          inactive: function() {
            return !( $module.hasClass(className.active) );
          },
          state: function(state) {
            if(className[state] === undefined) {
              return false;
            }
            return $module.hasClass( className[state] );
          },

          enabled: function() {
            return !( $module.is(settings.filter.active) );
          },
          disabled: function() {
            return ( $module.is(settings.filter.active) );
          },
          textEnabled: function() {
            return !( $module.is(settings.filter.text) );
          },

          // definitions for automatic type detection
          button: function() {
            return $module.is('.button:not(a, .submit)');
          },
          input: function() {
            return $module.is('input');
          },
          progress: function() {
            return $module.is('.ui.progress');
          }
        },

        allow: function(state) {
          module.debug('Now allowing state', state);
          states[state] = true;
        },
        disallow: function(state) {
          module.debug('No longer allowing', state);
          states[state] = false;
        },

        allows: function(state) {
          return states[state] || false;
        },

        enable: function() {
          $module.removeClass(className.disabled);
        },

        disable: function() {
          $module.addClass(className.disabled);
        },

        setState: function(state) {
          if(module.allows(state)) {
            $module.addClass( className[state] );
          }
        },

        removeState: function(state) {
          if(module.allows(state)) {
            $module.removeClass( className[state] );
          }
        },

        toggle: {
          state: function() {
            var
              apiRequest
            ;
            if( module.allows('active') && module.is.enabled() ) {
              module.refresh();
              if($.fn.api !== undefined) {
                apiRequest = $module.api('get request');
                if(apiRequest) {
                  module.listenTo(apiRequest);
                  return;
                }
              }
              module.change.state();
            }
          }
        },

        listenTo: function(apiRequest) {
          module.debug('API request detected, waiting for state signal', apiRequest);
          if(apiRequest) {
            if(text.loading) {
              module.update.text(text.loading);
            }
            $.when(apiRequest)
              .then(function() {
                if(apiRequest.state() == 'resolved') {
                  module.debug('API request succeeded');
                  settings.activateTest   = function(){ return true; };
                  settings.deactivateTest = function(){ return true; };
                }
                else {
                  module.debug('API request failed');
                  settings.activateTest   = function(){ return false; };
                  settings.deactivateTest = function(){ return false; };
                }
                module.change.state();
              })
            ;
          }
          // xhr exists but set to false, beforeSend killed the xhr
          else {
            settings.activateTest   = function(){ return false; };
            settings.deactivateTest = function(){ return false; };
          }
        },

        // checks whether active/inactive state can be given
        change: {

          state: function() {
            module.debug('Determining state change direction');
            // inactive to active change
            if( module.is.inactive() ) {
              module.activate();
            }
            else {
              module.deactivate();
            }
            if(settings.sync) {
              module.sync();
            }
            $.proxy(settings.onChange, element)();
          },

          text: function() {
            if( module.is.textEnabled() ) {
              if(module.is.disabled() ) {
                module.verbose('Changing text to disabled text', text.hover);
                module.update.text(text.disabled);
              }
              else if( module.is.active() ) {
                if(text.hover) {
                  module.verbose('Changing text to hover text', text.hover);
                  module.update.text(text.hover);
                }
                else if(text.deactivate) {
                  module.verbose('Changing text to deactivating text', text.deactivate);
                  module.update.text(text.deactivate);
                }
              }
              else {
                if(text.hover) {
                  module.verbose('Changing text to hover text', text.hover);
                  module.update.text(text.hover);
                }
                else if(text.activate){
                  module.verbose('Changing text to activating text', text.activate);
                  module.update.text(text.activate);
                }
              }
            }
          }

        },

        activate: function() {
          if( $.proxy(settings.activateTest, element)() ) {
            module.debug('Setting state to active');
            $module
              .addClass(className.active)
            ;
            module.update.text(text.active);
            $.proxy(settings.onActivate, element)();
          }
        },

        deactivate: function() {
          if($.proxy(settings.deactivateTest, element)() ) {
            module.debug('Setting state to inactive');
            $module
              .removeClass(className.active)
            ;
            module.update.text(text.inactive);
            $.proxy(settings.onDeactivate, element)();
          }
        },

        sync: function() {
          module.verbose('Syncing other buttons to current state');
          if( module.is.active() ) {
            $allModules
              .not($module)
                .state('activate');
          }
          else {
            $allModules
              .not($module)
                .state('deactivate')
            ;
          }
        },

        get: {
          text: function() {
            return (settings.selector.text)
              ? $module.find(settings.selector.text).text()
              : $module.html()
            ;
          },
          textFor: function(state) {
            return text[state] || false;
          }
        },

        flash: {
          text: function(text, duration, callback) {
            var
              previousText = module.get.text()
            ;
            module.debug('Flashing text message', text, duration);
            text     = text     || settings.text.flash;
            duration = duration || settings.flashDuration;
            callback = callback || function() {};
            module.update.text(text);
            setTimeout(function(){
              module.update.text(previousText);
              $.proxy(callback, element)();
            }, duration);
          }
        },

        reset: {
          // on mouseout sets text to previous value
          text: function() {
            var
              activeText   = text.active   || $module.data(metadata.storedText),
              inactiveText = text.inactive || $module.data(metadata.storedText)
            ;
            if( module.is.textEnabled() ) {
              if( module.is.active() && activeText) {
                module.verbose('Resetting active text', activeText);
                module.update.text(activeText);
              }
              else if(inactiveText) {
                module.verbose('Resetting inactive text', activeText);
                module.update.text(inactiveText);
              }
            }
          }
        },

        update: {
          text: function(text) {
            var
              currentText = module.get.text()
            ;
            if(text && text !== currentText) {
              module.debug('Updating text', text);
              if(settings.selector.text) {
                $module
                  .data(metadata.storedText, text)
                  .find(settings.selector.text)
                    .text(text)
                ;
              }
              else {
                $module
                  .data(metadata.storedText, text)
                  .html(text)
                ;
              }
            }
            else {
              module.debug('Text is already sane, ignoring update', text);
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

$.fn.state.settings = {

  // module info
  name : 'State',

  // debug output
  debug      : false,

  // verbose debug output
  verbose    : true,

  // namespace for events
  namespace  : 'state',

  // debug data includes performance
  performance: true,

  // callback occurs on state change
  onActivate   : function() {},
  onDeactivate : function() {},
  onChange     : function() {},

  // state test functions
  activateTest   : function() { return true; },
  deactivateTest : function() { return true; },

  // whether to automatically map default states
  automatic     : true,

  // activate / deactivate changes all elements instantiated at same time
  sync          : false,

  // default flash text duration, used for temporarily changing text of an element
  flashDuration : 1000,

  // selector filter
  filter     : {
    text   : '.loading, .disabled',
    active : '.disabled'
  },

  context    : false,

  // error
  error: {
    method : 'The method you called is not defined.'
  },

  // metadata
  metadata: {
    promise    : 'promise',
    storedText : 'stored-text'
  },

  // change class on state
  className: {
    active   : 'active',
    disabled : 'disabled',
    error    : 'error',
    loading  : 'loading',
    success  : 'success',
    warning  : 'warning'
  },

  selector: {
    // selector for text node
    text: false
  },

  defaults : {
    input: {
      disabled : true,
      loading  : true,
      active   : true
    },
    button: {
      disabled : true,
      loading  : true,
      active   : true,
    },
    progress: {
      active   : true,
      success  : true,
      warning  : true,
      error    : true
    }
  },

  states     : {
    active   : true,
    disabled : true,
    error    : true,
    loading  : true,
    success  : true,
    warning  : true
  },

  text     : {
    disabled   : false,
    flash      : false,
    hover      : false,
    active     : false,
    inactive   : false,
    activate   : false,
    deactivate : false
  }

};



})( jQuery, window , document );

 /*
 * # Semantic - Sticky
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

"use strict";

$.fn.sticky = function(parameters) {
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
        settings              = $.extend(true, {}, $.fn.sticky.settings, parameters),

        className             = settings.className,
        namespace             = settings.namespace,
        error                 = settings.error,

        eventNamespace        = '.' + namespace,
        moduleNamespace       = 'module-' + namespace,

        $module               = $(this),
        $window               = $(window),
        $container            = $module.offsetParent(),
        $scroll               = $(settings.scrollContext),
        $context,

        selector              = $module.selector || '',
        instance              = $module.data(moduleNamespace),

        requestAnimationFrame = window.requestAnimationFrame
          || window.mozRequestAnimationFrame
          || window.webkitRequestAnimationFrame
          || window.msRequestAnimationFrame
          || function(callback) { setTimeout(callback, 0); },

        element         = this,
        observer,
        module
      ;

      module      = {

        initialize: function() {
          if(settings.context) {
            $context = $(settings.context);
          }
          else {
            $context = $container;
          }
          if($context.size() === 0) {
            module.error(error.invalidContext, settings.context, $module);
            return;
          }
          module.verbose('Initializing sticky', settings, $container);
          module.save.positions();

          // error conditions
          if( module.is.hidden() ) {
            module.error(error.visible, $module);
          }
          if(module.cache.element.height > module.cache.context.height) {
            module.reset();
            module.error(error.elementSize, $module);
            return;
          }

          $window
            .on('resize' + eventNamespace, module.event.resize)
          ;
          $scroll
            .on('scroll' + eventNamespace, module.event.scroll)
          ;

          module.observeChanges();
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
          module.verbose('Destroying previous module');
          module.reset();
          $window
            .off('resize' + eventNamespace, module.event.resize)
          ;
          $scroll
            .off('scroll' + eventNamespace, module.event.scroll)
          ;
          $module
            .removeData(moduleNamespace)
          ;
        },

        observeChanges: function() {
          var
            context = $context[0]
          ;
          if('MutationObserver' in window) {
            observer = new MutationObserver(function(mutations) {
              clearTimeout(module.timer);
              module.timer = setTimeout(function() {
                module.verbose('DOM tree modified, updating sticky menu');
                module.refresh();
              }, 200);
            });
            observer.observe(element, {
              childList : true,
              subtree   : true
            });
            observer.observe(context, {
              childList : true,
              subtree   : true
            });
            module.debug('Setting up mutation observer', observer);
          }
        },

        event: {
          resize: function() {
            requestAnimationFrame(function() {
              module.refresh();
              module.stick();
            });
          },
          scroll: function() {
            requestAnimationFrame(function() {
              module.stick();
              $.proxy(settings.onScroll, element)();
            });
          }
        },

        refresh: function(hardRefresh) {
          module.reset();
          if(hardRefresh) {
            $container = $module.offsetParent();
          }
          module.save.positions();
          module.stick();
          $.proxy(settings.onReposition, element)();
        },

        supports: {
          sticky: function() {
            var
              $element = $('<div/>'),
              element = $element.get()
            ;
            $element
              .addClass(className.supported)
            ;
            return($element.css('position').match('sticky'));
          }
        },

        save: {
          scroll: function(scroll) {
            module.lastScroll = scroll;
          },
          positions: function() {
            var
              window = {
                height: $window.height()
              },
              element = {
                margin: {
                  top    : parseInt($module.css('margin-top'), 10),
                  bottom : parseInt($module.css('margin-bottom'), 10),
                },
                offset : $module.offset(),
                width  : $module.outerWidth(),
                height : $module.outerHeight()
              },
              context = {
                offset: $context.offset(),
                height: $context.outerHeight()
              }
            ;
            module.cache = {
              fits : ( element.height < window.height ),
              window: {
                height: window.height
              },
              element: {
                margin : element.margin,
                top    : element.offset.top - element.margin.top,
                left   : element.offset.left,
                width  : element.width,
                height : element.height,
                bottom : element.offset.top + element.height
              },
              context: {
                top    : context.offset.top,
                height : context.height,
                bottom : context.offset.top + context.height
              }
            };
            module.set.containerSize();
            module.set.size();
            module.stick();
            module.debug('Caching element positions', module.cache);
          }
        },

        get: {
          direction: function(scroll) {
            var
              direction = 'down'
            ;
            scroll = scroll || $scroll.scrollTop();
            if(module.lastScroll !== undefined) {
              if(module.lastScroll < scroll) {
                direction = 'down';
              }
              else if(module.lastScroll > scroll) {
                direction = 'up';
              }
            }
            return direction;
          },
          scrollChange: function(scroll) {
            scroll = scroll || $scroll.scrollTop();
            return (module.lastScroll)
              ? (scroll - module.lastScroll)
              : 0
            ;
          },
          currentElementScroll: function() {
            return ( module.is.top() )
              ? Math.abs(parseInt($module.css('top'), 10))    || 0
              : Math.abs(parseInt($module.css('bottom'), 10)) || 0
            ;
          },
          elementScroll: function(scroll) {
            scroll = scroll || $scroll.scrollTop();
            var
              element        = module.cache.element,
              window         = module.cache.window,
              delta          = module.get.scrollChange(scroll),
              maxScroll      = (element.height - window.height + settings.offset),
              currentScroll  = module.get.currentElementScroll(),
              possibleScroll = (currentScroll + delta),
              elementScroll
            ;
            if(module.cache.fits || possibleScroll < 0) {
              elementScroll = 0;
            }
            else if (possibleScroll > maxScroll ) {
              elementScroll = maxScroll;
            }
            else {
              elementScroll = possibleScroll;
            }
            return elementScroll;
          }
        },

        remove: {
          offset: function() {
            $module.css('margin-top', '');
          }
        },

        set: {
          offset: function() {
            module.verbose('Setting offset on element', settings.offset);
            $module.css('margin-top', settings.offset);
          },
          containerSize: function() {
            var
              tagName = $container.get(0).tagName
            ;
            if(tagName === 'HTML' || tagName == 'body') {
              // this can trigger for too many reasons
              //module.error(error.container, tagName, $module);
              $container = $module.offsetParent();
            }
            else {
              module.debug('Settings container size', module.cache.context.height);
              $container.height(module.cache.context.height);
            }
          },
          scroll: function(scroll) {
            module.debug('Setting scroll on element', scroll);
            if( module.is.top() ) {
              $module
                .css('bottom', '')
                .css('top', -scroll)
              ;
            }
            if( module.is.bottom() ) {
              $module
                .css('top', '')
                .css('bottom', scroll)
              ;
            }
          },
          size: function() {
            if(module.cache.element.height !== 0 && module.cache.element.width !== 0) {
              $module
                .css({
                  width  : module.cache.element.width,
                  height : module.cache.element.height
                })
              ;
            }
          }
        },

        is: {
          top: function() {
            return $module.hasClass(className.top);
          },
          bottom: function() {
            return $module.hasClass(className.bottom);
          },
          initialPosition: function() {
            return (!module.is.fixed() && !module.is.bound());
          },
          hidden: function() {
            return (!$module.is(':visible'));
          },
          bound: function() {
            return $module.hasClass(className.bound);
          },
          fixed: function() {
            return $module.hasClass(className.fixed);
          }
        },

        stick: function() {
          var
            cache          = module.cache,
            fits           = cache.fits,
            element        = cache.element,
            window         = cache.window,
            context        = cache.context,
            offset         = (module.is.bottom() && settings.pushing)
              ? settings.bottomOffset
              : settings.offset,
            scroll         = {
              top    : $scroll.scrollTop() + offset,
              bottom : $scroll.scrollTop() + offset + window.height
            },
            direction      = module.get.direction(scroll.top),
            elementScroll  = module.get.elementScroll(scroll.top),

            // shorthand
            doesntFit      = !fits,
            elementVisible = (element.height !== 0)
          ;

          // save current scroll for next run
          module.save.scroll(scroll.top);

          if(elementVisible) {

            if( module.is.initialPosition() ) {
              if(scroll.top >= element.top) {
                module.debug('Element passed, fixing element to page');
                module.fixTop();
              }
            }
            else if( module.is.fixed() ) {

              // currently fixed top
              if( module.is.top() ) {
                if( scroll.top < element.top ) {
                  module.debug('Fixed element reached top of container');
                  module.setInitialPosition();
                }
                else if( (element.height + scroll.top - elementScroll) > context.bottom ) {
                  module.debug('Fixed element reached bottom of container');
                  module.bindBottom();
                }
                // scroll element if larger than screen
                else if(doesntFit) {
                  module.set.scroll(elementScroll);
                }
              }

              // currently fixed bottom
              else if(module.is.bottom() ) {

                // top edge
                if( (scroll.bottom - element.height) < element.top) {
                  module.debug('Bottom fixed rail has reached top of container');
                  module.setInitialPosition();
                }
                // bottom edge
                else if(scroll.bottom > context.bottom) {
                  module.debug('Bottom fixed rail has reached bottom of container');
                  module.bindBottom();
                }
                // scroll element if larger than screen
                else if(doesntFit) {
                  module.set.scroll(elementScroll);
                }

              }
            }
            else if( module.is.bottom() ) {
              if(settings.pushing) {
                if(module.is.bound() && scroll.bottom < context.bottom ) {
                  module.debug('Fixing bottom attached element to bottom of browser.');
                  module.fixBottom();
                }
              }
              else {
                if(module.is.bound() && (scroll.top < context.bottom - element.height) ) {
                  module.debug('Fixing bottom attached element to top of browser.');
                  module.fixTop();
                }
              }
            }
          }
        },

        bindTop: function() {
          module.debug('Binding element to top of parent container');
          module.remove.offset();
          $module
            .css('left' , '')
            .css('top' , '')
            .css('bottom' , '')
            .removeClass(className.fixed)
            .removeClass(className.bottom)
            .addClass(className.bound)
            .addClass(className.top)
          ;
          $.proxy(settings.onTop, element)();
          $.proxy(settings.onUnstick, element)();
        },
        bindBottom: function() {
          module.debug('Binding element to bottom of parent container');
          module.remove.offset();
          $module
            .css('left' , '')
            .css('top' , '')
            .css('bottom' , '')
            .removeClass(className.fixed)
            .removeClass(className.top)
            .addClass(className.bound)
            .addClass(className.bottom)
          ;
          $.proxy(settings.onBottom, element)();
          $.proxy(settings.onUnstick, element)();
        },

        setInitialPosition: function() {
          module.unfix();
          module.unbind();
        },


        fixTop: function() {
          module.debug('Fixing element to top of page');
          module.set.offset();
          $module
            .css('left', module.cache.element.left)
            .removeClass(className.bound)
            .removeClass(className.bottom)
            .addClass(className.fixed)
            .addClass(className.top)
          ;
          $.proxy(settings.onStick, element)();
        },

        fixBottom: function() {
          module.debug('Sticking element to bottom of page');
          module.set.offset();
          $module
            .css('left', module.cache.element.left)
            .removeClass(className.bound)
            .removeClass(className.top)
            .addClass(className.fixed)
            .addClass(className.bottom)
          ;
          $.proxy(settings.onStick, element)();
        },

        unbind: function() {
          module.debug('Removing absolute position on element');
          module.remove.offset();
          $module
            .removeClass(className.bound)
            .removeClass(className.top)
            .removeClass(className.bottom)
          ;
        },

        unfix: function() {
          module.debug('Removing fixed position on element');
          module.remove.offset();
          $module
            .removeClass(className.fixed)
            .removeClass(className.top)
            .removeClass(className.bottom)
          ;
          $.proxy(settings.onUnstick, this)();
        },

        reset: function() {
          module.debug('Reseting elements position');
          module.unbind();
          module.unfix();
          module.resetCSS();
        },

        resetCSS: function() {
          $module
            .css({
              top    : '',
              bottom : '',
              width  : '',
              height : ''
            })
          ;
          $container
            .css({
              height: ''
            })
          ;
        },

        setting: function(name, value) {
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
            module.performance.timer = setTimeout(module.performance.display, 0);
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

$.fn.sticky.settings = {

  name          : 'Sticky',
  namespace     : 'sticky',

  debug         : false,
  verbose       : false,
  performance   : false,

  pushing       : false,
  context       : false,
  scrollContext : window,
  offset        : 0,
  bottomOffset  : 0,

  onReposition  : function(){},
  onScroll      : function(){},
  onStick       : function(){},
  onUnstick     : function(){},
  onTop         : function(){},
  onBottom      : function(){},

  error         : {
    container      : 'Sticky element must be inside a relative container',
    visible        : 'Element is hidden, you must call refresh after element becomes visible',
    method         : 'The method you called is not defined.',
    invalidContext : 'Context specified does not exist',
    elementSize    : 'Sticky element is larger than its container, cannot create sticky.'
  },

  className : {
    bound     : 'bound',
    fixed     : 'fixed',
    supported : 'native',
    top       : 'top',
    bottom    : 'bottom'
  }

};

})( jQuery, window , document );

 /*
 * # Semantic - Tab
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

"use strict";

$.tab = $.fn.tab = function(parameters) {

  var
    // use window context if none specified
    $allModules     = $.isFunction(this)
        ? $(window)
        : $(this),

    settings        = ( $.isPlainObject(parameters) )
      ? $.extend(true, {}, $.fn.tab.settings, parameters)
      : $.extend({}, $.fn.tab.settings),

    moduleSelector  = $allModules.selector || '',
    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    module,
    returnedValue
  ;


  $allModules
    .each(function() {
      var

        className          = settings.className,
        metadata           = settings.metadata,
        selector           = settings.selector,
        error              = settings.error,

        eventNamespace     = '.' + settings.namespace,
        moduleNamespace    = 'module-' + settings.namespace,

        $module            = $(this),

        cache              = {},
        firstLoad          = true,
        recursionDepth     = 0,

        $context,
        $tabs,
        activeTabPath,
        parameterArray,
        historyEvent,

        element         = this,
        instance        = $module.data(moduleNamespace)
      ;

      module = {

        initialize: function() {
          module.debug('Initializing tab menu item', $module);

          module.determineTabs();
          module.debug('Determining tabs', settings.context, $tabs);

          // set up automatic routing
          if(settings.auto) {
            module.verbose('Setting up automatic tab retrieval from server');
            settings.apiSettings = {
              url: settings.path + '/{$tab}'
            };
          }

          // attach events if navigation wasn't set to window
          if( !$.isWindow( element ) ) {
            module.debug('Attaching tab activation events to element', $module);
            $module
              .on('click' + eventNamespace, module.event.click)
            ;
          }
          module.instantiate();
        },

        determineTabs: function() {
          var
            $reference
          ;

          // determine tab context
          if(settings.context === 'parent') {
            if($module.closest(selector.ui).size() > 0) {
              $reference = $module.closest(selector.ui);
              module.verbose('Using closest UI element for determining parent', $reference);
            }
            else {
              $reference = $module;
            }
            $context = $reference.parent();
            module.verbose('Determined parent element for creating context', $context);
          }
          else if(settings.context) {
            $context = $(settings.context);
            module.verbose('Using selector for tab context', settings.context, $context);
          }
          else {
            $context = $('body');
          }

          // find tabs
          if(settings.childrenOnly) {
            $tabs = $context.children(selector.tabs);
            module.debug('Searching tab context children for tabs', $context, $tabs);
          }
          else {
            $tabs = $context.find(selector.tabs);
            module.debug('Searching tab context for tabs', $context, $tabs);
          }
        },

        initializeHistory: function() {
          if(settings.history) {
            module.debug('Initializing page state');
            if( $.address === undefined ) {
              module.error(error.state);
              return false;
            }
            else {
              if(settings.historyType == 'state') {
                module.debug('Using HTML5 to manage state');
                if(settings.path !== false) {
                  $.address
                    .history(true)
                    .state(settings.path)
                  ;
                }
                else {
                  module.error(error.path);
                  return false;
                }
              }
              $.address
                .bind('change', module.event.history.change)
              ;
            }
          }
        },

        instantiate: function () {
          module.verbose('Storing instance of module', module);
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.debug('Destroying tabs', $module);
          $module
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
        },

        event: {
          click: function(event) {
            var
              tabPath = $(this).data(metadata.tab)
            ;
            if(tabPath !== undefined) {
              if(settings.history) {
                module.verbose('Updating page state', event);
                $.address.value(tabPath);
              }
              else {
                module.verbose('Changing tab', event);
                module.changeTab(tabPath);
              }
              event.preventDefault();
            }
            else {
              module.debug('No tab specified');
            }
          },
          history: {
            change: function(event) {
              var
                tabPath   = event.pathNames.join('/') || module.get.initialPath(),
                pageTitle = settings.templates.determineTitle(tabPath) || false
              ;
              module.performance.display();
              module.debug('History change event', tabPath, event);
              historyEvent = event;
              if(tabPath !== undefined) {
                module.changeTab(tabPath);
              }
              if(pageTitle) {
                $.address.title(pageTitle);
              }
            }
          }
        },

        refresh: function() {
          if(activeTabPath) {
            module.debug('Refreshing tab', activeTabPath);
            module.changeTab(activeTabPath);
          }
        },

        cache: {

          read: function(cacheKey) {
            return (cacheKey !== undefined)
              ? cache[cacheKey]
              : false
            ;
          },
          add: function(cacheKey, content) {
            cacheKey = cacheKey || activeTabPath;
            module.debug('Adding cached content for', cacheKey);
            cache[cacheKey] = content;
          },
          remove: function(cacheKey) {
            cacheKey = cacheKey || activeTabPath;
            module.debug('Removing cached content for', cacheKey);
            delete cache[cacheKey];
          }
        },

        set: {
          state: function(state) {
            $.address.value(state);
          }
        },

        changeTab: function(tabPath) {
          var
            pushStateAvailable = (window.history && window.history.pushState),
            shouldIgnoreLoad   = (pushStateAvailable && settings.ignoreFirstLoad && firstLoad),
            remoteContent      = (settings.auto || $.isPlainObject(settings.apiSettings) ),
            // only get default path if not remote content
            pathArray = (remoteContent && !shouldIgnoreLoad)
              ? module.utilities.pathToArray(tabPath)
              : module.get.defaultPathArray(tabPath)
          ;
          tabPath = module.utilities.arrayToPath(pathArray);
          $.each(pathArray, function(index, tab) {
            var
              currentPathArray   = pathArray.slice(0, index + 1),
              currentPath        = module.utilities.arrayToPath(currentPathArray),

              isTab              = module.is.tab(currentPath),
              isLastIndex        = (index + 1 == pathArray.length),

              $tab               = module.get.tabElement(currentPath),
              $anchor,
              nextPathArray,
              nextPath,
              isLastTab
            ;
            module.verbose('Looking for tab', tab);
            if(isTab) {
              module.verbose('Tab was found', tab);

              // scope up
              activeTabPath = currentPath;
              parameterArray = module.utilities.filterArray(pathArray, currentPathArray);

              if(isLastIndex) {
                isLastTab = true;
              }
              else {
                nextPathArray = pathArray.slice(0, index + 2);
                nextPath      = module.utilities.arrayToPath(nextPathArray);
                isLastTab     = ( !module.is.tab(nextPath) );
                if(isLastTab) {
                  module.verbose('Tab parameters found', nextPathArray);
                }
              }
              if(isLastTab && remoteContent) {
                if(!shouldIgnoreLoad) {
                  module.activate.navigation(currentPath);
                  module.content.fetch(currentPath, tabPath);
                }
                else {
                  module.debug('Ignoring remote content on first tab load', currentPath);
                  firstLoad = false;
                  module.cache.add(tabPath, $tab.html());
                  module.activate.all(currentPath);
                  $.proxy(settings.onTabInit, $tab)(currentPath, parameterArray, historyEvent);
                  $.proxy(settings.onTabLoad, $tab)(currentPath, parameterArray, historyEvent);
                }
                return false;
              }
              else {
                module.debug('Opened local tab', currentPath);
                module.activate.all(currentPath);
                if( !module.cache.read(currentPath) ) {
                  module.cache.add(currentPath, true);
                  module.debug('First time tab loaded calling tab init');
                  $.proxy(settings.onTabInit, $tab)(currentPath, parameterArray, historyEvent);
                }
                $.proxy(settings.onTabLoad, $tab)(currentPath, parameterArray, historyEvent);
              }
            }
            else if(tabPath.search('/') == -1) {
              // look for in page anchor
              $anchor     = $('#' + tabPath + ', a[name="' + tabPath + '"]'),
              currentPath = $anchor.closest('[data-tab]').data('tab');
              $tab        = module.get.tabElement(currentPath);
              // if anchor exists use parent tab
              if($anchor && $anchor.size() > 0 && currentPath) {
                module.debug('No tab found, but deep anchor link present, opening parent tab');
                module.activate.all(currentPath);
                if( !module.cache.read(currentPath) ) {
                  module.cache.add(currentPath, true);
                  module.debug('First time tab loaded calling tab init');
                  $.proxy(settings.onTabInit, $tab)(currentPath, parameterArray, historyEvent);
                }
                return false;
              }
            }
            else {
              module.error(error.missingTab, $module, $context, currentPath);
              return false;
            }
          });
        },

        content: {

          fetch: function(tabPath, fullTabPath) {
            var
              $tab             = module.get.tabElement(tabPath),
              apiSettings      = {
                dataType     : 'html',
                stateContext : $tab,
                onSuccess      : function(response) {
                  module.cache.add(fullTabPath, response);
                  module.content.update(tabPath, response);
                  if(tabPath == activeTabPath) {
                    module.debug('Content loaded', tabPath);
                    module.activate.tab(tabPath);
                  }
                  else {
                    module.debug('Content loaded in background', tabPath);
                  }
                  $.proxy(settings.onTabInit, $tab)(tabPath, parameterArray, historyEvent);
                  $.proxy(settings.onTabLoad, $tab)(tabPath, parameterArray, historyEvent);
                },
                urlData: { tab: fullTabPath }
              },
              request         = $tab.data(metadata.promise) || false,
              existingRequest = ( request && request.state() === 'pending' ),
              requestSettings,
              cachedContent
            ;

            fullTabPath   = fullTabPath || tabPath;
            cachedContent = module.cache.read(fullTabPath);

            if(settings.cache && cachedContent) {
              module.debug('Showing existing content', fullTabPath);
              module.content.update(tabPath, cachedContent);
              module.activate.tab(tabPath);
              $.proxy(settings.onTabLoad, $tab)(tabPath, parameterArray, historyEvent);
            }
            else if(existingRequest) {
              module.debug('Content is already loading', fullTabPath);
              $tab
                .addClass(className.loading)
              ;
            }
            else if($.api !== undefined) {
              requestSettings = $.extend(true, { headers: { 'X-Remote': true } }, settings.apiSettings, apiSettings);
              module.debug('Retrieving remote content', fullTabPath, requestSettings);
              $.api( requestSettings );
            }
            else {
              module.error(error.api);
            }
          },

          update: function(tabPath, html) {
            module.debug('Updating html for', tabPath);
            var
              $tab = module.get.tabElement(tabPath)
            ;
            $tab
              .html(html)
            ;
          }
        },

        activate: {
          all: function(tabPath) {
            module.activate.tab(tabPath);
            module.activate.navigation(tabPath);
          },
          tab: function(tabPath) {
            var
              $tab = module.get.tabElement(tabPath)
            ;
            module.verbose('Showing tab content for', $tab);
            $tab
              .addClass(className.active)
              .siblings($tabs)
                .removeClass(className.active + ' ' + className.loading)
            ;
          },
          navigation: function(tabPath) {
            var
              $navigation = module.get.navElement(tabPath)
            ;
            module.verbose('Activating tab navigation for', $navigation, tabPath);
            $navigation
              .addClass(className.active)
              .siblings($allModules)
                .removeClass(className.active + ' ' + className.loading)
            ;
          }
        },

        deactivate: {
          all: function() {
            module.deactivate.navigation();
            module.deactivate.tabs();
          },
          navigation: function() {
            $allModules
              .removeClass(className.active)
            ;
          },
          tabs: function() {
            $tabs
              .removeClass(className.active + ' ' + className.loading)
            ;
          }
        },

        is: {
          tab: function(tabName) {
            return (tabName !== undefined)
              ? ( module.get.tabElement(tabName).size() > 0 )
              : false
            ;
          }
        },

        get: {
          initialPath: function() {
            return $allModules.eq(0).data(metadata.tab) || $tabs.eq(0).data(metadata.tab);
          },
          path: function() {
            return $.address.value();
          },
          // adds default tabs to tab path
          defaultPathArray: function(tabPath) {
            return module.utilities.pathToArray( module.get.defaultPath(tabPath) );
          },
          defaultPath: function(tabPath) {
            var
              $defaultNav = $allModules.filter('[data-' + metadata.tab + '^="' + tabPath + '/"]').eq(0),
              defaultTab  = $defaultNav.data(metadata.tab) || false
            ;
            if( defaultTab ) {
              module.debug('Found default tab', defaultTab);
              if(recursionDepth < settings.maxDepth) {
                recursionDepth++;
                return module.get.defaultPath(defaultTab);
              }
              module.error(error.recursion);
            }
            else {
              module.debug('No default tabs found for', tabPath, $tabs);
            }
            recursionDepth = 0;
            return tabPath;
          },
          navElement: function(tabPath) {
            tabPath = tabPath || activeTabPath;
            return $allModules.filter('[data-' + metadata.tab + '="' + tabPath + '"]');
          },
          tabElement: function(tabPath) {
            var
              $fullPathTab,
              $simplePathTab,
              tabPathArray,
              lastTab
            ;
            tabPath        = tabPath || activeTabPath;
            tabPathArray   = module.utilities.pathToArray(tabPath);
            lastTab        = module.utilities.last(tabPathArray);
            $fullPathTab   = $tabs.filter('[data-' + metadata.tab + '="' + lastTab + '"]');
            $simplePathTab = $tabs.filter('[data-' + metadata.tab + '="' + tabPath + '"]');
            return ($fullPathTab.size() > 0)
              ? $fullPathTab
              : $simplePathTab
            ;
          },
          tab: function() {
            return activeTabPath;
          }
        },

        utilities: {
          filterArray: function(keepArray, removeArray) {
            return $.grep(keepArray, function(keepValue) {
              return ( $.inArray(keepValue, removeArray) == -1);
            });
          },
          last: function(array) {
            return $.isArray(array)
              ? array[ array.length - 1]
              : false
            ;
          },
          pathToArray: function(pathName) {
            if(pathName === undefined) {
              pathName = activeTabPath;
            }
            return typeof pathName == 'string'
              ? pathName.split('/')
              : [pathName]
            ;
          },
          arrayToPath: function(pathArray) {
            return $.isArray(pathArray)
              ? pathArray.join('/')
              : false
            ;
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
  if(module && !methodInvoked) {
    module.initializeHistory();
  }
  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;

};

// shortcut for tabbed content with no defined navigation
$.tab = function(settings) {
  $(window).tab(settings);
};

$.fn.tab.settings = {

  name         : 'Tab',
  namespace    : 'tab',

  debug        : false,
  verbose      : true,
  performance  : true,

  // uses pjax style endpoints fetching content from same url with remote-content headers
  auto         : false,
  history      : false,
  historyType  : 'hash',
  path         : false,

  context      : false,
  childrenOnly : false,

  // max depth a tab can be nested
  maxDepth        : 25,

  // dont load content on first load
  ignoreFirstLoad : false,

  // load tab content new every tab click
  alwaysRefresh   : false,

  // cache the content requests to pull locally
  cache           : true,

  // settings for api call
  apiSettings     : false,

  // only called first time a tab's content is loaded (when remote source)
  onTabInit    : function(tabPath, parameterArray, historyEvent) {},

  // called on every load
  onTabLoad    : function(tabPath, parameterArray, historyEvent) {},

  templates    : {
    determineTitle: function(tabArray) {}
  },

  error: {
    api        : 'You attempted to load content without API module',
    method     : 'The method you called is not defined',
    missingTab : 'Activated tab cannot be found for this context.',
    noContent  : 'The tab you specified is missing a content url.',
    path       : 'History enabled, but no path was specified',
    recursion  : 'Max recursive depth reached',
    state      : 'History requires Asual\'s Address library <https://github.com/asual/jquery-address>'
  },

  metadata : {
    tab    : 'tab',
    loaded : 'loaded',
    promise: 'promise'
  },

  className   : {
    loading : 'loading',
    active  : 'active'
  },

  selector    : {
    tabs : '.ui.tab',
    ui   : '.ui'
  }

};

})( jQuery, window , document );
/*
 * # Semantic - Transition
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

$.fn.transition = function() {
  var
    $allModules     = $(this),
    moduleSelector  = $allModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    moduleArguments = arguments,
    query           = moduleArguments[0],
    queryArguments  = [].slice.call(arguments, 1),
    methodInvoked   = (typeof query === 'string'),

    requestAnimationFrame = window.requestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.msRequestAnimationFrame
      || function(callback) { setTimeout(callback, 0); },

    returnedValue
  ;
  $allModules
    .each(function() {
      var
        $module  = $(this),
        element  = this,

        // set at run time
        settings,
        instance,

        error,
        className,
        metadata,
        animationEnd,
        animationName,

        namespace,
        moduleNamespace,
        eventNamespace,
        module
      ;

      module = {

        initialize: function() {

          // get full settings
          moduleNamespace = 'module-' + namespace;
          settings        = module.get.settings.apply(element, moduleArguments);
          className       = settings.className;
          metadata        = settings.metadata;

          animationEnd    = module.get.animationEvent();
          animationName   = module.get.animationName();
          error           = settings.error;
          namespace       = settings.namespace;
          eventNamespace  = '.' + settings.namespace;
          instance        = $module.data(moduleNamespace) || module;

          if(methodInvoked) {
            methodInvoked = module.invoke(query);
          }
          // no internal method was found matching query or query not made
          if(methodInvoked === false) {
            module.verbose('Converted arguments into settings object', settings);
            module.animate();
            module.instantiate();
          }
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          $module
            .data(moduleNamespace, instance)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module for', element);
          $module
            .removeData(moduleNamespace)
          ;
        },

        refresh: function() {
          module.verbose('Refreshing display type on next animation');
          delete module.displayType;
        },

        forceRepaint: function() {
          module.verbose('Forcing element repaint');
          var
            $parentElement = $module.parent(),
            $nextElement = $module.next()
          ;
          if($nextElement.size() === 0) {
            $module.detach().appendTo($parentElement);
          }
          else {
            $module.detach().insertBefore($nextElement);
          }
        },

        repaint: function() {
          module.verbose('Repainting element');
          var
            fakeAssignment = element.offsetWidth
          ;
        },

        animate: function(overrideSettings) {
          settings = overrideSettings || settings;
          if(!module.is.supported()) {
            module.error(error.support);
            return false;
          }
          module.debug('Preparing animation', settings.animation);
          if(module.is.animating()) {
            if(settings.queue) {
              if(!settings.allowRepeats && module.has.direction() && module.is.occuring() && module.queuing !== true) {
                module.error(error.repeated, settings.animation, $module);
              }
              else {
                module.queue(settings.animation);
              }
              return false;
            }
            else {

            }
          }
          if(module.can.animate) {
            module.set.animating(settings.animation);
          }
          else {
            module.error(error.noAnimation, settings.animation);
          }
        },

        reset: function() {
          module.debug('Resetting animation to beginning conditions');
          module.remove.animationEndCallback();
          module.restore.conditions();
          module.remove.animating();
        },

        queue: function(animation) {
          module.debug('Queueing animation of', animation);
          module.queuing = true;
          $module
            .one(animationEnd + eventNamespace, function() {
              module.queuing = false;
              module.repaint();
              module.animate.apply(this, settings);
            })
          ;
        },

        complete: function () {
          module.verbose('CSS animation complete', settings.animation);
          if(!module.is.looping()) {
            if( module.is.outward() ) {
              module.verbose('Animation is outward, hiding element');
              module.restore.conditions();
              module.hide();
              $.proxy(settings.onHide, this)();
            }
            else if( module.is.inward() ) {
              module.verbose('Animation is outward, showing element');
              module.restore.conditions();
              module.show();
              module.set.display();
              $.proxy(settings.onShow, this)();
            }
            else {
              module.restore.conditions();
            }
            module.remove.animation();
            module.remove.animating();
          }
          $.proxy(settings.onComplete, this)();
        },

        has: {
          direction: function(animation) {
            animation = animation || settings.animation;
            if( animation.search(className.inward) !== -1 || animation.search(className.outward) !== -1) {
              module.debug('Direction already set in animation');
              return true;
            }
            return false;
          }
        },

        set: {
          animating: function(animation) {
            animation = animation || settings.animation;
            if(!module.is.animating()) {
              module.save.conditions();
            }
            module.remove.direction();
            module.remove.animationEndCallback();
            if(module.can.transition() && !module.has.direction()) {
              module.set.direction();
            }
            module.remove.hidden();
            module.set.display();
            $module
              .addClass(className.animating)
              .addClass(className.transition)
              .addClass(animation)
              .one(animationEnd + '.complete' + eventNamespace, module.complete)
            ;
            module.set.duration(settings.duration);
            $.proxy(settings.onStart, this)();
            module.debug('Starting tween', animation, $module.attr('class'));
          },
          duration: function(animationName, duration) {
            duration = duration || settings.duration;
            duration = (typeof duration == 'number')
              ? duration + 'ms'
              : duration
            ;
            module.verbose('Setting animation duration', duration);
            $module
              .css({
                '-webkit-animation-duration': duration,
                '-moz-animation-duration': duration,
                '-ms-animation-duration': duration,
                '-o-animation-duration': duration,
                'animation-duration':  duration
              })
            ;
          },
          display: function() {
            var
              style              = module.get.style(),
              displayType        = module.get.displayType(),
              overrideStyle      = style + 'display: ' + displayType + ' !important;'
            ;
            module.refresh();
            if( $module.css('display') !== displayType ) {
              module.verbose('Setting inline visibility to', displayType);
              $module
                .attr('style', overrideStyle)
              ;
            }
          },
          direction: function() {
            if($module.is(':visible') && !module.is.hidden()) {
              module.debug('Automatically determining the direction of animation', 'Outward');
              $module
                .removeClass(className.inward)
                .addClass(className.outward)
              ;
            }
            else {
              module.debug('Automatically determining the direction of animation', 'Inward');
              $module
                .removeClass(className.outward)
                .addClass(className.inward)
              ;
            }
          },
          looping: function() {
            module.debug('Transition set to loop');
            $module
              .addClass(className.looping)
            ;
          },
          hidden: function() {
            if(!module.is.hidden()) {
              $module
                .addClass(className.transition)
                .addClass(className.hidden)
              ;
              if($module.css('display') !== 'none') {
                module.verbose('Overriding default display to hide element');
                $module
                  .css('display', 'none')
                ;
              }
            }
          },
          visible: function() {
            $module
              .addClass(className.transition)
              .addClass(className.visible)
            ;
          }
        },

        save: {
          displayType: function(displayType) {
            $module.data(metadata.displayType, displayType);
          },
          transitionExists: function(animation, exists) {
            $.fn.transition.exists[animation] = exists;
            module.verbose('Saving existence of transition', animation, exists);
          },
          conditions: function() {
            var
              clasName = $module.attr('class') || false,
              style = $module.attr('style') || ''
            ;
            $module.removeClass(settings.animation);
            module.remove.direction();
            module.cache = {
              className : $module.attr('class'),
              style     : module.get.style()
            };
            module.verbose('Saving original attributes', module.cache);
          }
        },

        restore: {
          conditions: function() {
            if(module.cache === undefined) {
              return false;
            }
            if(module.cache.className) {
              $module.attr('class', module.cache.className);
            }
            else {
              $module.removeAttr('class');
            }
            if(module.cache.style) {
              module.verbose('Restoring original style attribute', module.cache.style);
              $module.attr('style', module.cache.style);
            }
            if(module.is.looping()) {
              module.remove.looping();
            }
            module.verbose('Restoring original attributes', module.cache);
          }
        },

        remove: {
          animating: function() {
            $module.removeClass(className.animating);
          },
          animation: function() {
            $module
              .css({
                '-webkit-animation' : '',
                '-moz-animation'    : '',
                '-ms-animation'     : '',
                '-o-animation'      : '',
                'animation'         : ''
              })
            ;
          },
          animationEndCallback: function() {
            $module.off('.complete');
          },
          display: function() {
            $module.css('display', '');
          },
          direction: function() {
            $module
              .removeClass(className.inward)
              .removeClass(className.outward)
            ;
          },
          hidden: function() {
            $module.removeClass(className.hidden);
          },
          visible: function() {
            $module.removeClass(className.visible);
          },
          looping: function() {
            module.debug('Transitions are no longer looping');
            $module
              .removeClass(className.looping)
            ;
            module.forceRepaint();
          },
          transition: function() {
            $module
              .removeClass(className.visible)
              .removeClass(className.hidden)
            ;
          }
        },
        get: {
          settings: function(animation, duration, onComplete) {
            // single settings object
            if(typeof animation == 'object') {
              return $.extend(true, {}, $.fn.transition.settings, animation);
            }
            // all arguments provided
            else if(typeof onComplete == 'function') {
              return $.extend({}, $.fn.transition.settings, {
                animation  : animation,
                onComplete : onComplete,
                duration   : duration
              });
            }
            // only duration provided
            else if(typeof duration == 'string' || typeof duration == 'number') {
              return $.extend({}, $.fn.transition.settings, {
                animation : animation,
                duration  : duration
              });
            }
            // duration is actually settings object
            else if(typeof duration == 'object') {
              return $.extend({}, $.fn.transition.settings, duration, {
                animation : animation
              });
            }
            // duration is actually callback
            else if(typeof duration == 'function') {
              return $.extend({}, $.fn.transition.settings, {
                animation  : animation,
                onComplete : duration
              });
            }
            // only animation provided
            else {
              return $.extend({}, $.fn.transition.settings, {
                animation : animation
              });
            }
            return $.fn.transition.settings;
          },
          displayType: function() {
            if(settings.displayType) {
              return settings.displayType;
            }
            if($module.data(metadata.displayType) === undefined) {
              // create fake element to determine display state
              module.can.transition(true);
            }
            return $module.data(metadata.displayType);
          },
          style: function() {
            var
               style = $module.attr('style') || ''
            ;
            return style.replace(/display.*?;/, '');
          },
          transitionExists: function(animation) {
            return $.fn.transition.exists[animation];
          },
          animationName: function() {
            var
              element     = document.createElement('div'),
              animations  = {
                'animation'       :'animationName',
                'OAnimation'      :'oAnimationName',
                'MozAnimation'    :'mozAnimationName',
                'WebkitAnimation' :'webkitAnimationName'
              },
              animation
            ;
            for(animation in animations){
              if( element.style[animation] !== undefined ){
                return animations[animation];
              }
            }
            return false;
          },
          animationEvent: function() {
            var
              element     = document.createElement('div'),
              animations  = {
                'animation'       :'animationend',
                'OAnimation'      :'oAnimationEnd',
                'MozAnimation'    :'mozAnimationEnd',
                'WebkitAnimation' :'webkitAnimationEnd'
              },
              animation
            ;
            for(animation in animations){
              if( element.style[animation] !== undefined ){
                return animations[animation];
              }
            }
            return false;
          }

        },

        can: {
          animate: function() {
            if($module.css(settings.animation) !== 'none') {
              module.debug('CSS definition found',  $module.css(settings.animation));
              return true;
            }
            else {
              module.debug('Unable to find css definition', $module.attr('class'));
              return false;
            }
          },
          transition: function(forced) {
            var
              elementClass      = $module.attr('class'),
              tagName           = $module.prop('tagName'),
              animation         = settings.animation,
              transitionExists  = module.get.transitionExists(settings.animation),
              $clone,
              currentAnimation,
              inAnimation,
              animationExists,
              displayType
            ;
            if( transitionExists === undefined || forced) {
              module.verbose('Determining whether animation exists');
              $clone = $('<' + tagName + ' />').addClass( elementClass ).insertAfter($module);
              currentAnimation = $clone
                .addClass(animation)
                .removeClass(className.inward)
                .removeClass(className.outward)
                .addClass(className.animating)
                .addClass(className.transition)
                .css(animationName)
              ;
              inAnimation = $clone
                .addClass(className.inward)
                .css(animationName)
              ;
              displayType = $clone
                .attr('class', elementClass)
                .removeAttr('style')
                .removeClass(className.hidden)
                .removeClass(className.visible)
                .show()
                .css('display')
              ;
              module.verbose('Determining final display state', displayType);
              if(currentAnimation != inAnimation) {
                module.debug('Transition exists for animation', animation);
                animationExists = true;
              }
              else {
                module.debug('Static animation found', animation, displayType);
                animationExists = false;
              }
              $clone.remove();
              module.save.displayType(displayType);
              if(transitionExists === undefined) {
                module.save.transitionExists(animation, animationExists);
              }
            }
            return transitionExists || animationExists;
          }
        },

        is: {
          animating: function() {
            return $module.hasClass(className.animating);
          },
          inward: function() {
            return $module.hasClass(className.inward);
          },
          outward: function() {
            return $module.hasClass(className.outward);
          },
          looping: function() {
            return $module.hasClass(className.looping);
          },
          occuring: function(animation) {
            animation = animation || settings.animation;
            animation = animation.replace(' ', '.');
            return ( $module.filter(animation).size() > 0 );
          },
          visible: function() {
            return $module.is(':visible');
          },
          hidden: function() {
            return $module.css('visibility') === 'hidden';
          },
          supported: function() {
            return(animationName !== false && animationEnd !== false);
          }
        },

        hide: function() {
          module.verbose('Hiding element');
          if( module.is.animating() ) {
            module.reset();
          }
          module.remove.display();
          module.remove.visible();
          module.set.hidden();
          module.repaint();
        },

        show: function(display) {
          module.verbose('Showing element', display);
          module.remove.hidden();
          module.set.visible();
          module.repaint();
        },

        start: function() {
          module.verbose('Starting animation');
          $module.removeClass(className.disabled);
        },

        stop: function() {
          module.debug('Stopping animation');
          $module.addClass(className.disabled);
        },

        toggle: function() {
          module.debug('Toggling play status');
          $module.toggleClass(className.disabled);
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
            module.performance.timer = setTimeout(module.performance.display, 600);
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
        // modified for transition to return invoke success
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
          return (found !== undefined)
            ? found
            : false
          ;
        }
      };
      module.initialize();
    })
  ;
  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

// Records if CSS transition is available
$.fn.transition.exists = {};

$.fn.transition.settings = {

  // module info
  name        : 'Transition',

  // debug content outputted to console
  debug       : false,

  // verbose debug output
  verbose     : true,

  // performance data output
  performance : true,

  // event namespace
  namespace   : 'transition',

  // animation complete event
  onStart     : function() {},
  onComplete  : function() {},
  onShow      : function() {},
  onHide      : function() {},

  // whether EXACT animation can occur twice in a row
  allowRepeats : false,

  // Override final display type on visible
  displayType : false,

  // animation duration
  animation  : 'fade',
  duration   : '500ms',

  // new animations will occur after previous ones
  queue       : true,

  metadata : {
    displayType: 'display'
  },

  className   : {
    animating  : 'animating',
    disabled   : 'disabled',
    hidden     : 'hidden',
    inward     : 'in',
    loading    : 'loading',
    looping    : 'looping',
    outward    : 'out',
    transition : 'transition',
    visible    : 'visible'
  },

  // possible errors
  error: {
    noAnimation : 'There is no css animation matching the one you specified.',
    repeated    : 'That animation is already occurring, cancelling repeated animation',
    method      : 'The method you called is not defined',
    support     : 'This browser does not support CSS animations'
  }

};


})( jQuery, window , document );

 /*
 * # Semantic - Video
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

"use strict";

$.fn.video = function(parameters) {

  var
    $allModules     = $(this),

    moduleSelector  = $allModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    requestAnimationFrame = window.requestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.msRequestAnimationFrame
      || function(callback) { setTimeout(callback, 0); },

    returnedValue
  ;

  $allModules
    .each(function() {
      var
        settings        = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.video.settings, parameters)
          : $.extend({}, $.fn.video.settings),

        selector        = settings.selector,
        className       = settings.className,
        error           = settings.error,
        metadata        = settings.metadata,
        namespace       = settings.namespace,
        templates       = settings.templates,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        $window         = $(window),
        $module         = $(this),
        $placeholder    = $module.find(selector.placeholder),
        $playButton     = $module.find(selector.playButton),
        $embed          = $module.find(selector.embed),

        element         = this,
        instance        = $module.data(moduleNamespace),
        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing video');
          module.create();
          $placeholder
            .on('click' + eventNamespace, module.play)
          ;
          $playButton
            .on('click' + eventNamespace, module.play)
          ;
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },

        create: function() {
          var
            image = $module.data(metadata.image),
            html = templates.video(image)
          ;
          $module.html(html);
          module.refresh();
          if(!image) {
            module.play();
          }
          module.debug('Creating html for video element', html);
        },

        destroy: function() {
          module.verbose('Destroying previous instance of video');
          module.reset();
          $module
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
          $placeholder
            .off(eventNamespace)
          ;
          $playButton
            .off(eventNamespace)
          ;
        },

        refresh: function() {
          module.verbose('Refreshing selector cache');
          $placeholder    = $module.find(selector.placeholder);
          $playButton     = $module.find(selector.playButton);
          $embed          = $module.find(selector.embed);
        },

        // sets new video
        change: function(source, id, url) {
          module.debug('Changing video to ', source, id, url);
          $module
            .data(metadata.source, source)
            .data(metadata.id, id)
            .data(metadata.url, url)
          ;
          settings.onChange();
        },

        // clears video embed
        reset: function() {
          module.debug('Clearing video embed and showing placeholder');
          $module
            .removeClass(className.active)
          ;
          $embed
            .html(' ')
          ;
          $placeholder
            .show()
          ;
          settings.onReset();
        },

        // plays current video
        play: function() {
          module.debug('Playing video');
          var
            source = $module.data(metadata.source) || false,
            url    = $module.data(metadata.url)    || false,
            id     = $module.data(metadata.id)     || false
          ;
          $embed
            .html( module.generate.html(source, id, url) )
          ;
          $module
            .addClass(className.active)
          ;
          settings.onPlay();
        },

        get: {
          source: function(url) {
            if(typeof url !== 'string') {
              return false;
            }
            if(url.search('youtube.com') !== -1) {
              return 'youtube';
            }
            else if(url.search('vimeo.com') !== -1) {
              return 'vimeo';
            }
            return false;
          },
          id: function(url) {
            if(settings.regExp.youtube.test(url)) {
              return url.match(settings.regExp.youtube)[1];
            }
            else if(settings.regExp.vimeo.test(url)) {
              return url.match(settings.regExp.vimeo)[2];
            }
            return false;
          }
        },

        generate: {
          // generates iframe html
          html: function(source, id, url) {
            module.debug('Generating embed html');
            var
              html
            ;
            // allow override of settings
            source = source || settings.source;
            id     = id     || settings.id;
            if((source && id) || url) {
              if(!source || !id) {
                source = module.get.source(url);
                id     = module.get.id(url);
              }
              if(source == 'vimeo') {
                html = ''
                  + '<iframe src="http://player.vimeo.com/video/' + id + '?=' + module.generate.url(source) + '"'
                  + ' width="100%" height="100%"'
                  + ' frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>'
                ;
              }
              else if(source == 'youtube') {
                html = ''
                  + '<iframe src="http://www.youtube.com/embed/' + id + '?=' + module.generate.url(source) + '"'
                  + ' width="100%" height="100%"'
                  + ' frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>'
                ;
              }
            }
            else {
              module.error(error.noVideo);
            }
            return html;
          },

          // generate url parameters
          url: function(source) {
            var
              api      = (settings.api)
                ? 1
                : 0,
              autoplay = (settings.autoplay === 'auto')
                ? ($module.data('image') !== undefined)
                : settings.autoplay,
              hd       = (settings.hd)
                ? 1
                : 0,
              showUI   = (settings.showUI)
                ? 1
                : 0,
              // opposite used for some params
              hideUI   = !(settings.showUI)
                ? 1
                : 0,
              url = ''
            ;
            if(source == 'vimeo') {
              url = ''
                +      'api='      + api
                + '&amp;title='    + showUI
                + '&amp;byline='   + showUI
                + '&amp;portrait=' + showUI
                + '&amp;autoplay=' + autoplay
              ;
              if(settings.color) {
                url += '&amp;color=' + settings.color;
              }
            }
            if(source == 'ustream') {
              url = ''
                + 'autoplay=' + autoplay
              ;
              if(settings.color) {
                url += '&amp;color=' + settings.color;
              }
            }
            else if(source == 'youtube') {
              url = ''
                + 'enablejsapi='      + api
                + '&amp;autoplay='    + autoplay
                + '&amp;autohide='    + hideUI
                + '&amp;hq='          + hd
                + '&amp;modestbranding=1'
              ;
              if(settings.color) {
                url += '&amp;color=' + settings.color;
              }
            }
            return url;
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

$.fn.video.settings = {

  name        : 'Video',
  namespace   : 'video',

  debug       : false,
  verbose     : true,
  performance : true,

  metadata    : {
    id     : 'id',
    image  : 'image',
    source : 'source',
    url    : 'url'
  },

  source      : false,
  url         : false,
  id          : false,

  aspectRatio : (16/9),

  onPlay   : function(){},
  onReset  : function(){},
  onChange : function(){},

  // callbacks not coded yet (needs to use jsapi)
  onPause  : function() {},
  onStop   : function() {},

  width    : 'auto',
  height   : 'auto',

  autoplay : 'auto',
  color    : '#442359',
  hd       : true,
  showUI   : false,
  api      : true,

  regExp : {
    youtube : /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/,
    vimeo   : /http:\/\/(www\.)?vimeo.com\/(\d+)($|\/)/
  },

  error      : {
    noVideo     : 'No video specified',
    method      : 'The method you called is not defined'
  },

  className   : {
    active      : 'active'
  },

  selector    : {
    embed       : '.embed',
    placeholder : '.placeholder',
    playButton  : '.play'
  }
};

$.fn.video.settings.templates = {
  video: function(image) {
    var
      html = ''
    ;
    if(image) {
      html += ''
        + '<i class="video play icon"></i>'
        + '<img class="placeholder" src="' + image + '">'
      ;
    }
    html += '<div class="embed"></div>';
    return html;
  }
};


})( jQuery, window , document );

/*
 * # Semantic - Visibility
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

$.fn.visibility = function(parameters) {
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
        settings        = $.extend(true, {}, $.fn.visibility.settings, parameters),

        className       = settings.className,
        namespace       = settings.namespace,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        $window         = $(window),
        $module         = $(this),
        $context        = $(settings.context),
        $container      = $module.offsetParent(),

        selector        = $module.selector || '',
        instance        = $module.data(moduleNamespace),

        requestAnimationFrame = window.requestAnimationFrame
          || window.mozRequestAnimationFrame
          || window.webkitRequestAnimationFrame
          || window.msRequestAnimationFrame
          || function(callback) { setTimeout(callback, 0); },

        element         = this,
        module
      ;

      module      = {

        initialize: function() {
          module.verbose('Initializing visibility', settings);

          module.setup.cache();
          module.save.position();
          module.bindEvents();
          module.instantiate();

          if(settings.type == 'image') {
            module.setup.image();
          }
          if(settings.type == 'fixed') {
            module.setup.fixed();
          }

          requestAnimationFrame(module.checkVisibility);
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module');
          $module
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        bindEvents: function() {
          module.verbose('Binding visibility events to scroll and resize');
          $window
            .on('resize' + eventNamespace, module.event.refresh)
          ;
          $context
            .on('scroll' + eventNamespace, module.event.scroll)
          ;
        },

        event: {
          refresh: function() {
            requestAnimationFrame(module.refresh);
          },
          scroll: function() {
            module.verbose('Scroll position changed');
            if(settings.throttle) {
              clearTimeout(module.timer);
              module.timer = setTimeout(module.checkVisibility, settings.throttle);
            }
            else {
              requestAnimationFrame(module.checkVisibility);
            }
          }
        },

        precache: function(images, callback) {
          if (!(images instanceof Array)) {
            images = [images];
          }
          var
            imagesLength  = images.length,
            loadedCounter = 0,
            cache         = [],
            cacheImage    = document.createElement('img'),
            handleLoad    = function() {
              loadedCounter++;
              if (loadedCounter >= images.length) {
                if ($.isFunction(callback)) {
                  callback();
                }
              }
            }
          ;
          while (imagesLength--) {
            cacheImage         = document.createElement('img');
            cacheImage.onload  = handleLoad;
            cacheImage.onerror = handleLoad;
            cacheImage.src     = images[imagesLength];
            cache.push(cacheImage);
          }
        },

        setup: {
          cache: function() {
            module.cache = {
              occurred : {},
              screen   : {},
              element  : {},
            };
          },
          image: function() {
            var
              src = $module.data('src')
            ;
            if(src) {
              module.verbose('Lazy loading image', src);
              // show when top visible
              module.topVisible(function() {
                module.precache(src, function() {
                  module.set.image(src);
                  settings.onTopVisible = false;
                });
              });
            }
          },
          fixed: function() {
            module.verbose('Setting up fixed on element pass');
            $module
              .visibility({
                once: false,
                continuous: false,
                onTopPassed: function() {
                  $module
                    .addClass(className.fixed)
                    .css({
                      position: 'fixed',
                      top: settings.offset + 'px'
                    })
                  ;
                  if(settings.animation && $.fn.transition !== undefined) {
                    $module.transition(settings.transition, settings.duration);
                  }
                },
                onTopPassedReverse: function() {
                  $module
                    .removeClass(className.fixed)
                    .css({
                      position: '',
                      top: ''
                    })
                  ;
                }
              })
            ;
          }
        },

        set: {
          image: function(src) {
            var
              offScreen = (module.cache.screen.bottom < module.cache.element.top)
            ;
            $module
              .attr('src', src)
            ;
            if(offScreen) {
              module.verbose('Image outside browser, avoiding animation')
              $module.show();
            }
            else {
              if(settings.transition && $.fn.transition !== undefined) {
                $module.transition(settings.transition, settings.duration);
              }
              else {
                $module.fadeIn(settings.duration);
              }
            }
          }
        },

        refresh: function() {
          module.debug('Refreshing constants (element width/height)');
          module.reset();
          module.save.position();
          module.checkVisibility();
          $.proxy(settings.onRefresh, element)();
        },

        reset: function() {
          module.verbose('Reseting all cached values');
          if( $.isPlainObject(module.cache) ) {
            module.cache.screen = {};
            module.cache.element = {};
          }
        },

        checkVisibility: function() {
          module.verbose('Checking visibility of element', module.cache.element);
          module.save.scroll();
          module.save.direction();
          module.save.screenCalculations();
          module.save.elementCalculations();

          // percentage
          module.passed();

          // reverse (must be first)
          module.passingReverse();
          module.topVisibleReverse();
          module.bottomVisibleReverse();
          module.topPassedReverse();
          module.bottomPassedReverse();

          // one time
          module.passing();
          module.topVisible();
          module.bottomVisible();
          module.topPassed();
          module.bottomPassed();
        },

        passed: function(amount, newCallback) {
          var
            calculations   = module.get.elementCalculations(),
            amountInPixels
          ;
          // assign callback
          if(amount !== undefined && newCallback !== undefined) {
            settings.onPassed[amount] = newCallback;
          }
          else if(amount !== undefined) {
            return (module.get.pixelsPassed(amount) > calculations.pixelsPassed);
          }
          else if(calculations.passing) {
            $.each(settings.onPassed, function(amount, callback) {
              if(calculations.bottomVisible || calculations.pixelsPassed > module.get.pixelsPassed(amount)) {
                module.execute(callback, amount);
              }
              else if(!settings.once) {
                module.remove.occurred(callback);
              }
            });
          }
        },

        passing: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onPassing,
            callbackName = 'passing'
          ;
          if(newCallback) {
            module.debug('Adding callback for passing', newCallback);
            settings.onPassing = newCallback;
          }
          if(calculations.passing) {
            module.execute(callback, callbackName);
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback !== undefined) {
            return calculations.passing;
          }
        },


        topVisible: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onTopVisible,
            callbackName = 'topVisible'
          ;
          if(newCallback) {
            module.debug('Adding callback for top visible', newCallback);
            settings.onTopVisible = newCallback;
          }
          if(calculations.topVisible) {
            module.execute(callback, callbackName);
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback === undefined) {
            return calculations.topVisible;
          }
        },

        bottomVisible: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onBottomVisible,
            callbackName = 'bottomVisible'
          ;
          if(newCallback) {
            module.debug('Adding callback for bottom visible', newCallback);
            settings.onBottomVisible = newCallback;
          }
          if(calculations.bottomVisible) {
            module.execute(callback, callbackName);
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback === undefined) {
            return calculations.bottomVisible;
          }
        },

        topPassed: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onTopPassed,
            callbackName = 'topPassed'
          ;
          if(newCallback) {
            module.debug('Adding callback for top passed', newCallback);
            settings.onTopPassed = newCallback;
          }
          if(calculations.topPassed) {
            module.execute(callback, callbackName);
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback === undefined) {
            return calculations.onTopPassed;
          }
        },

        bottomPassed: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onBottomPassed,
            callbackName = 'bottomPassed'
          ;
          if(newCallback) {
            module.debug('Adding callback for bottom passed', newCallback);
            settings.onBottomPassed = newCallback;
          }
          if(calculations.bottomPassed) {
            module.execute(callback, callbackName);
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback === undefined) {
            return calculations.bottomPassed;
          }
        },

        passingReverse: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onPassingReverse,
            callbackName = 'passingReverse'
          ;
          if(newCallback) {
            module.debug('Adding callback for passing reverse', newCallback);
            settings.onPassingReverse = newCallback;
          }
          if(!calculations.passing) {
            if(module.get.occurred('passing')) {
              module.execute(callback, callbackName);
            }
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback !== undefined) {
            return !calculations.passing;
          }
        },


        topVisibleReverse: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onTopVisibleReverse,
            callbackName = 'topVisibleReverse'
          ;
          if(newCallback) {
            module.debug('Adding callback for top visible reverse', newCallback);
            settings.onTopVisibleReverse = newCallback;
          }
          if(!calculations.topVisible) {
            if(module.get.occurred('topVisible')) {
              module.execute(callback, callbackName);
            }
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback === undefined) {
            return !calculations.topVisible;
          }
        },

        bottomVisibleReverse: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onBottomVisibleReverse,
            callbackName = 'bottomVisibleReverse'
          ;
          if(newCallback) {
            module.debug('Adding callback for bottom visible reverse', newCallback);
            settings.onBottomVisibleReverse = newCallback;
          }
          if(!calculations.bottomVisible) {
            if(module.get.occurred('bottomVisible')) {
              module.execute(callback, callbackName);
            }
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback === undefined) {
            return !calculations.bottomVisible;
          }
        },

        topPassedReverse: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onTopPassedReverse,
            callbackName = 'topPassedReverse'
          ;
          if(newCallback) {
            module.debug('Adding callback for top passed reverse', newCallback);
            settings.onTopPassedReverse = newCallback;
          }
          if(!calculations.topPassed) {
            if(module.get.occurred('topPassed')) {
              module.execute(callback, callbackName);
            }
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback === undefined) {
            return !calculations.onTopPassed;
          }
        },

        bottomPassedReverse: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onBottomPassedReverse,
            callbackName = 'bottomPassedReverse'
          ;
          if(newCallback) {
            module.debug('Adding callback for bottom passed reverse', newCallback);
            settings.onBottomPassedReverse = newCallback;
          }
          if(!calculations.bottomPassed) {
            if(module.get.occurred('bottomPassed')) {
              module.execute(callback, callbackName);
            }
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback === undefined) {
            return !calculations.bottomPassed;
          }
        },

        execute: function(callback, callbackName) {
          var
            calculations = module.get.elementCalculations(),
            screen       = module.get.screenCalculations()
          ;
          callback     = callback || false;
          if(callback) {
            if(settings.continuous) {
              module.debug('Callback being called continuously', callbackName, calculations);
              $.proxy(callback, element)(calculations, screen);
            }
            else if(!module.get.occurred(callbackName)) {
              module.debug('Conditions met', callbackName, calculations);
              $.proxy(callback, element)(calculations, screen);
            }
          }
          module.save.occurred(callbackName);
        },

        remove: {
          occurred: function(callback) {
            if(callback) {
              if(module.cache.occurred[callback] !== undefined && module.cache.occurred[callback] === true) {
                module.debug('Callback can now be called again', callback);
                module.cache.occurred[callback] = false;
              }
            }
            else {
              module.cache.occurred = {};
            }
          }
        },

        save: {
          occurred: function(callback) {
            if(callback) {
              if(module.cache.occurred[callback] === undefined || (module.cache.occurred[callback] !== true)) {
                module.verbose('Saving callback occurred', callback);
                module.cache.occurred[callback] = true;
              }
            }
          },
          scroll: function() {
            module.cache.scroll = $context.scrollTop() + settings.offset;
          },
          direction: function() {
            var
              scroll     = module.get.scroll(),
              lastScroll = module.get.lastScroll(),
              direction
            ;
            if(scroll > lastScroll && lastScroll) {
              direction = 'down';
            }
            else if(scroll < lastScroll && lastScroll) {
              direction = 'up';
            }
            else {
              direction = 'static';
            }
            module.cache.direction = direction;
            return module.cache.direction;
          },
          elementPosition: function() {
            var
              screen = module.get.screenSize()
            ;
            module.verbose('Saving element position');
            $.extend(module.cache.element, {
              margin : {
                top    : parseInt($module.css('margin-top'), 10),
                bottom : parseInt($module.css('margin-bottom'), 10)
              },
              fits   : (element.height < screen.height),
              offset : $module.offset(),
              width  : $module.outerWidth(),
              height : $module.outerHeight()
            });
            return module.cache.element;
          },
          elementCalculations: function() {
            var
              screen  = module.get.screenCalculations(),
              element = module.get.elementPosition()
            ;
            // offset
            if(settings.includeMargin) {
              $.extend(module.cache.element, {
                top    : element.offset.top - element.margin.top,
                bottom : element.offset.top + element.height + element.margin.bottom
              });
            }
            else {
              $.extend(module.cache.element, {
                top    : element.offset.top,
                bottom : element.offset.top + element.height
              });
            }
            // visibility
            $.extend(module.cache.element, {
              topVisible       : (screen.bottom >= element.top),
              topPassed        : (screen.top >= element.top),
              bottomVisible    : (screen.bottom >= element.bottom),
              bottomPassed     : (screen.top >= element.bottom),
              pixelsPassed     : 0,
              percentagePassed : 0
            });
            // meta calculations
            $.extend(module.cache.element, {
              visible : (module.cache.element.topVisible || module.cache.element.bottomVisible),
              passing : (module.cache.element.topPassed && !module.cache.element.bottomPassed),
              hidden  : (!module.cache.element.topVisible && !module.cache.element.bottomVisible)
            });
            if(module.cache.element.passing) {
              module.cache.element.pixelsPassed = (screen.top - element.top);
              module.cache.element.percentagePassed = (screen.top - element.top) / element.height;
            }
            module.verbose('Updated element calculations', module.cache.element);
          },
          screenCalculations: function() {
            var
              scroll = $context.scrollTop() + settings.offset
            ;
            if(module.cache.scroll === undefined) {
              module.cache.scroll = $context.scrollTop() + settings.offset;
            }
            module.save.direction();
            $.extend(module.cache.screen, {
              top    : scroll,
              bottom : scroll + module.cache.screen.height
            });
            return module.cache.screen;
          },
          screenSize: function() {
            module.verbose('Saving window position');
            module.cache.screen = {
              height: $context.height()
            };
          },
          position: function() {
            module.save.screenSize();
            module.save.elementPosition();
          }
        },

        get: {
          pixelsPassed: function(amount) {
            var
              element = module.get.elementCalculations()
            ;
            if(amount.search('%') > -1) {
              return ( element.height * (parseInt(amount, 10) / 100) );
            }
            return parseInt(amount, 10);
          },
          occurred: function(callback) {
            return (module.cache.occurred !== undefined)
              ? module.cache.occurred[callback] || false
              : false
            ;
          },
          direction: function() {
            if(module.cache.direction === undefined) {
              module.save.direction();
            }
            return module.cache.direction;
          },
          elementPosition: function() {
            if(module.cache.element === undefined) {
              module.save.elementPosition();
            }
            return module.cache.element;
          },
          elementCalculations: function() {
            if(module.cache.element === undefined) {
              module.save.elementCalculations();
            }
            return module.cache.element;
          },
          screenCalculations: function() {
            if(module.cache.screen === undefined) {
              module.save.screenCalculations();
            }
            return module.cache.screen;
          },
          screenSize: function() {
            if(module.cache.screen === undefined) {
              module.save.screenSize();
            }
            return module.cache.screen;
          },
          scroll: function() {
            if(module.cache.scroll === undefined) {
              module.save.scroll();
            }
            return module.cache.scroll;
          },
          lastScroll: function() {
            if(module.cache.screen === undefined) {
              module.debug('First scroll event, no last scroll could be found');
              return false;
            }
            return module.cache.screen.top;
          }
        },

        setting: function(name, value) {
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

$.fn.visibility.settings = {

  name                   : 'Visibility',
  namespace              : 'visibility',

  className: {
    fixed: 'fixed'
  },

  debug                  : false,
  verbose                : false,
  performance            : true,

  offset                 : 0,
  includeMargin          : false,

  context                : window,

  // visibility check delay in ms (defaults to animationFrame)
  throttle               : false,

  // special visibility type (image, fixed)
  type                   : false,

  // image only settings
  transition             : false,
  duration               : 500,

  // array of callbacks for percentage
  onPassed               : {},

  // standard callbacks
  onPassing              : false,
  onTopVisible           : false,
  onBottomVisible        : false,
  onTopPassed            : false,
  onBottomPassed         : false,

  // reverse callbacks
  onPassingReverse       : false,
  onTopVisibleReverse    : false,
  onBottomVisibleReverse : false,
  onTopPassedReverse     : false,
  onBottomPassedReverse  : false,

  once                   : true,
  continuous             : false,

  // utility callbacks
  onRefresh              : function(){},
  onScroll               : function(){},

  error : {
    method   : 'The method you called is not defined.'
  }

};

})( jQuery, window , document );

/*
 * # Semantic - Visit
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

$.visit = $.fn.visit = function(parameters) {
  var
    $allModules     = $.isFunction(this)
        ? $(window)
        : $(this),
    moduleSelector  = $allModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),
    returnedValue
  ;
  $allModules
    .each(function() {
      var
        settings        = $.extend(true, {}, $.fn.visit.settings, parameters),

        error           = settings.error,
        namespace       = settings.namespace,

        eventNamespace  = '.' + namespace,
        moduleNamespace = namespace + '-module',

        $module         = $(this),
        $displays       = $(),

        element         = this,
        instance        = $module.data(moduleNamespace),
        module
      ;
      module = {

        initialize: function() {
          if(settings.count) {
            module.store(settings.key.count, settings.count);
          }
          else if(settings.id) {
            module.add.id(settings.id);
          }
          else if(settings.increment && methodInvoked !== 'increment') {
            module.increment();
          }
          module.add.display($module);
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of visit module', module);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying instance');
          $module
            .removeData(moduleNamespace)
          ;
        },

        increment: function(id) {
          var
            currentValue = module.get.count(),
            newValue     = +(currentValue) + 1
          ;
          if(id) {
            module.add.id(id);
          }
          else {
            if(newValue > settings.limit && !settings.surpass) {
              newValue = settings.limit;
            }
            module.debug('Incrementing visits', newValue);
            module.store(settings.key.count, newValue);
          }
        },

        decrement: function(id) {
          var
            currentValue = module.get.count(),
            newValue     = +(currentValue) - 1
          ;
          if(id) {
            module.remove.id(id);
          }
          else {
            module.debug('Removing visit');
            module.store(settings.key.count, newValue);
          }
        },

        get: {
          count: function() {
            return +(module.retrieve(settings.key.count)) || 0;
          },
          idCount: function(ids) {
            ids = ids || module.get.ids();
            return ids.length;
          },
          ids: function(delimitedIDs) {
            var
              idArray = []
            ;
            delimitedIDs = delimitedIDs || module.retrieve(settings.key.ids);
            if(typeof delimitedIDs === 'string') {
              idArray = delimitedIDs.split(settings.delimiter);
            }
            module.verbose('Found visited ID list', idArray);
            return idArray;
          },
          storageOptions: function(data) {
            var
              options = {}
            ;
            if(settings.expires) {
              options.expires = settings.expires;
            }
            if(settings.domain) {
              options.domain = settings.domain;
            }
            if(settings.path) {
              options.path = settings.path;
            }
            return options;
          }
        },

        has: {
          visited: function(id, ids) {
            var
              visited = false
            ;
            ids = ids || module.get.ids();
            if(id !== undefined && ids) {
              $.each(ids, function(index, value){
                if(value == id) {
                  visited = true;
                }
              });
            }
            return visited;
          }
        },

        set: {
          count: function(value) {
            module.store(settings.key.count, value);
          },
          ids: function(value) {
            module.store(settings.key.ids, value);
          }
        },

        reset: function() {
          module.store(settings.key.count, 0);
          module.store(settings.key.ids, null);
        },

        add: {
          id: function(id) {
            var
              currentIDs = module.retrieve(settings.key.ids),
              newIDs = (currentIDs === undefined || currentIDs === '')
                ? id
                : currentIDs + settings.delimiter + id
            ;
            if( module.has.visited(id) ) {
              module.debug('Unique content already visited, not adding visit', id, currentIDs);
            }
            else if(id === undefined) {
              module.debug('ID is not defined');
            }
            else {
              module.debug('Adding visit to unique content', id);
              module.store(settings.key.ids, newIDs);
            }
            module.set.count( module.get.idCount() );
          },
          display: function(selector) {
            var
              $element = $(selector)
            ;
            if($element.size() > 0 && !$.isWindow($element[0])) {
              module.debug('Updating visit count for element', $element);
              $displays = ($displays.size() > 0)
                ? $displays.add($element)
                : $element
              ;
            }
          }
        },

        remove: {
          id: function(id) {
            var
              currentIDs = module.get.ids(),
              newIDs     = []
            ;
            if(id !== undefined && currentIDs !== undefined) {
              module.debug('Removing visit to unique content', id, currentIDs);
              $.each(currentIDs, function(index, value){
                if(value !== id) {
                  newIDs.push(value);
                }
              });
              newIDs = newIDs.join(settings.delimiter);
              module.store(settings.key.ids, newIDs );
            }
            module.set.count( module.get.idCount() );
          }
        },

        check: {
          limit: function(value) {
            value = value || module.get.count();
            if(settings.limit) {
              if(value >= settings.limit) {
                module.debug('Pages viewed exceeded limit, firing callback', value, settings.limit);
                $.proxy(settings.onLimit, this)(value);
              }
              module.debug('Limit not reached', value, settings.limit);
              $.proxy(settings.onChange, this)(value);
            }
            module.update.display(value);
          }
        },

        update: {
          display: function(value) {
            value = value || module.get.count();
            if($displays.size() > 0) {
              module.debug('Updating displayed view count', $displays);
              $displays.html(value);
            }
          }
        },

        store: function(key, value) {
          var
            options = module.get.storageOptions(value)
          ;
          if(settings.storageMethod == 'localstorage' && window.localStorage !== undefined) {
            window.localStorage.setItem(key, value);
            module.debug('Value stored using local storage', key, value);
          }
          else if($.cookie !== undefined) {
            $.cookie(key, value, options);
            module.debug('Value stored using cookie', key, value, options);
          }
          else {
            module.error(error.noCookieStorage);
            return;
          }
          if(key == settings.key.count) {
            module.check.limit(value);
          }
        },
        retrieve: function(key, value) {
          var
            storedValue
          ;
          if(settings.storageMethod == 'localstorage' && window.localStorage !== undefined) {
            storedValue = window.localStorage.getItem(key);
          }
          // get by cookie
          else if($.cookie !== undefined) {
            storedValue = $.cookie(key);
          }
          else {
            module.error(error.noCookieStorage);
          }
          if(storedValue == 'undefined' || storedValue == 'null' || storedValue === undefined || storedValue === null) {
            storedValue = undefined;
          }
          return storedValue;
        },

        setting: function(name, value) {
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

$.fn.visit.settings = {

  name          : 'Visit',

  debug         : false,
  verbose       : true,
  performance   : true,

  namespace     : 'visit',

  increment     : false,
  surpass       : false,
  count         : false,
  limit         : false,

  delimiter     : '&',
  storageMethod : 'localstorage',

  key           : {
    count : 'visit-count',
    ids   : 'visit-ids'
  },

  expires       : 30,
  domain        : false,
  path          : '/',

  onLimit       : function() {},
  onChange      : function() {},

  error         : {
    method          : 'The method you called is not defined',
    missingPersist  : 'Using the persist setting requires the inclusion of PersistJS',
    noCookieStorage : 'The default storage cookie requires $.cookie to be included.'
  }

};

})( jQuery, window , document );

/*! jquery.cookie v1.4.1 | MIT */
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?a(require("jquery")):a(jQuery)}(function(a){function b(a){return h.raw?a:encodeURIComponent(a)}function c(a){return h.raw?a:decodeURIComponent(a)}function d(a){return b(h.json?JSON.stringify(a):String(a))}function e(a){0===a.indexOf('"')&&(a=a.slice(1,-1).replace(/\\"/g,'"').replace(/\\\\/g,"\\"));try{return a=decodeURIComponent(a.replace(g," ")),h.json?JSON.parse(a):a}catch(b){}}function f(b,c){var d=h.raw?b:e(b);return a.isFunction(c)?c(d):d}var g=/\+/g,h=a.cookie=function(e,g,i){if(void 0!==g&&!a.isFunction(g)){if(i=a.extend({},h.defaults,i),"number"==typeof i.expires){var j=i.expires,k=i.expires=new Date;k.setTime(+k+864e5*j)}return document.cookie=[b(e),"=",d(g),i.expires?"; expires="+i.expires.toUTCString():"",i.path?"; path="+i.path:"",i.domain?"; domain="+i.domain:"",i.secure?"; secure":""].join("")}for(var l=e?void 0:{},m=document.cookie?document.cookie.split("; "):[],n=0,o=m.length;o>n;n++){var p=m[n].split("="),q=c(p.shift()),r=p.join("=");if(e&&e===q){l=f(r,g);break}e||void 0===(r=f(r))||(l[q]=r)}return l};h.defaults={},a.removeCookie=function(b,c){return void 0===a.cookie(b)?!1:(a.cookie(b,"",a.extend({},c,{expires:-1})),!a.cookie(b))}});