/** # Semantic UI
* Version: 0.1
* http://github.com/quirkyinc/semantic
*
*
* Copyright 2013 Contributors
* Released under the MIT license
* http://opensource.org/licenses/MIT
*
* Released: 09/21/2013
*/
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

    className       = settings.className,
    namespace       = settings.namespace,
    selector        = settings.selector,
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
        $title   = $module.find(selector.title),
        $icon    = $module.find(selector.icon),
        $content = $module.find(selector.content),

        element  = this,
        instance = $module.data(moduleNamespace),
        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing accordion with bound events', $module);
          // initializing
          $title
            .on('click' + eventNamespace, module.event.click)
          ;
          module.instantiate();
        },

        instantiate: function() {
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

        event: {
          click: function() {
            module.verbose('Title clicked', this);
            var
              $activeTitle = $(this),
              index        = $title.index($activeTitle)
            ;
            module.toggle(index);
          },
          resetStyle: function() {
            module.verbose('Resetting styles on element', this);
            $(this)
              .removeAttr('style')
              .children()
                .removeAttr('style')
            ;
          }
        },

        toggle: function(index) {
          module.debug('Toggling content content at index', index);
          var
            $activeTitle   = $title.eq(index),
            $activeContent = $activeTitle.next($content),
            contentIsOpen  = $activeContent.is(':visible')
          ;
          if(contentIsOpen) {
            if(settings.collapsible) {
              module.close(index);
            }
            else {
              module.debug('Cannot close accordion content collapsing is disabled');
            }
          }
          else {
            module.open(index);
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

$.fn.accordion.settings = {
  name        : 'Accordion',
  namespace   : 'accordion',

  debug       : true,
  verbose     : true,
  performance : true,

  exclusive   : true,
  collapsible : true,

  onOpen      : function(){},
  onClose     : function(){},
  onChange    : function(){},

  error: {
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

  /*  ******************************
  API
  Author: Jack Lukic
  Notes: First Commit May 08, 2012

  These are modules which bind API functionality to the DOM

  Requires: nada

  Initialization:
  $('.button')
    .apiButton({
      success: function() {}
    })
  ;

  in our example api is automapped to an object literal
  @ quirky.config.endpoint.api

  HTML:
  <div class="button" action="follow" data-id="5">

  URL        : quirky.config.endpoint.api.follow
  Given Value: /follow/{$id}/
  Sent Value : /follow/5/

  (4 ways to map api endpoint, each will be looked for in succession)
  url mapping order:
    first  : defined in plugin init as url (arbitrary url)
    second : defined in plugin init as action (action in obj literal grouping 'api')
    third  : defined in data-url
    fourth : defined in data-action

  beforeSend:
  this callback can be used to modify request settings before XHR
  it also can be used to look for for pre-conditions to prevent API
  call by returning "false"

******************************  */

;(function ( $, window, document, undefined ) {

  $.api = $.fn.api = function(parameters) {

    var
      settings       = $.extend(true, {}, $.api.settings, parameters),

      // if this keyword isn't a jQuery object, create one
      context        = (typeof this != 'function')
        ? this
        : $('<div/>'),
      // context defines the element used for loading/error state
      $context       = (settings.stateContext)
        ? $(settings.stateContext)
        : $(context),
      // module is the thing that initiates the api action, can be independent of context
      $module = typeof this == 'object'
        ? $(context)
        : $context,

      element         = this,
      time            = new Date().getTime(),
      performance     = [],

      moduleSelector  = $module.selector || '',
      moduleNamespace = settings.namespace + '-module',

      className       = settings.className,
      metadata        = settings.metadata,
      error           = settings.error,

      instance        = $module.data(moduleNamespace),

      query           = arguments[0],
      methodInvoked   = (instance !== undefined && typeof query == 'string'),
      queryArguments  = [].slice.call(arguments, 1),

      module,
      invokedResponse
    ;

    module = {
      initialize: function() {
        var
          runSettings,

          loadingTimer   = new Date().getTime(),
          loadingDelay,

          promise,
          url,

          formData       = {},
          data,

          ajaxSettings   = {},
          xhr
        ;

        // serialize parent form if requested!
        if(settings.serializeForm && $(this).toJSON() !== undefined) {
          formData = module.get.formData();
          module.debug('Adding form data to API Request', formData);
          $.extend(true, settings.data, formData);
        }

        // let beforeSend change settings object
        runSettings = $.proxy(settings.beforeSend, $module)(settings);

        // check for exit conditions
        if(runSettings !== undefined && !runSettings) {
          module.error(error.beforeSend);
          module.reset();
          return;
        }

        // get real url from template
        url = module.get.url( module.get.templateURL() );

        // exit conditions reached from missing url parameters
        if( !url ) {
          module.error(error.missingURL);
          module.reset();
          return;
        }

        // promise handles notification on api request, so loading min. delay can occur for all notifications
        promise =
          $.Deferred()
            .always(function() {
              if(settings.stateContext) {
                $context
                  .removeClass(className.loading)
                ;
              }
              $.proxy(settings.complete, $module)();
            })
            .done(function(response) {
              module.debug('API request successful');
              // take a stab at finding success state if json
              if(settings.dataType == 'json') {
                if (response.error !== undefined) {
                  $.proxy(settings.failure, $context)(response.error, settings, $module);
                }
                else if ($.isArray(response.errors)) {
                  $.proxy(settings.failure, $context)(response.errors[0], settings, $module);
                }
                else {
                  $.proxy(settings.success, $context)(response, settings, $module);
                }
              }
              // otherwise
              else {
                $.proxy(settings.success, $context)(response, settings, $module);
              }
            })
            .fail(function(xhr, status, httpMessage) {
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
                      catch(error) {
                        module.error(error.JSONParse);
                      }
                    }
                  }
                  $context
                    .removeClass(className.loading)
                    .addClass(className.error)
                  ;
                  // show error state only for duration specified in settings
                  if(settings.errorLength > 0) {
                    setTimeout(function(){
                      $context
                        .removeClass(className.error)
                      ;
                    }, settings.errorLength);
                  }
                  module.debug('API Request error:', errorMessage);
                  $.proxy(settings.failure, $context)(errorMessage, settings, this);
                }
                else {
                  module.debug('Request Aborted (Most likely caused by page change)');
                }
              }
            })
        ;

        // look for params in data
        $.extend(true, ajaxSettings, settings, {
          success    : function(){},
          failure    : function(){},
          complete   : function(){},
          type       : settings.method || settings.type,
          data       : data,
          url        : url,
          beforeSend : settings.beforeXHR
        });

        if(settings.stateContext) {
          $context
            .addClass(className.loading)
          ;
        }

        if(settings.progress) {
          module.verbose('Adding progress events');
          $.extend(true, ajaxSettings, {
            xhr: function() {
              var
                xhr = new window.XMLHttpRequest()
              ;
              xhr.upload.addEventListener('progress', function(event) {
                var
                  percentComplete
                ;
                if (event.lengthComputable) {
                  percentComplete = Math.round(event.loaded / event.total * 10000) / 100 + '%';
                  $.proxy(settings.progress, $context)(percentComplete, event);
                }
              }, false);
              xhr.addEventListener('progress', function(event) {
                var
                  percentComplete
                ;
                if (event.lengthComputable) {
                  percentComplete = Math.round(event.loaded / event.total * 10000) / 100 + '%';
                  $.proxy(settings.progress, $context)(percentComplete, event);
                }
              }, false);
              return xhr;
            }
          });
        }

        module.verbose('Creating AJAX request with settings: ', ajaxSettings);
        xhr =
          $.ajax(ajaxSettings)
            .always(function() {
              // calculate if loading time was below minimum threshold
              loadingDelay = ( settings.loadingLength - (new Date().getTime() - loadingTimer) );
              settings.loadingDelay = loadingDelay < 0
                ? 0
                : loadingDelay
              ;
            })
            .done(function(response) {
              var
                context = this
              ;
              setTimeout(function(){
                promise.resolveWith(context, [response]);
              }, settings.loadingDelay);
            })
            .fail(function(xhr, status, httpMessage) {
              var
                context = this
              ;
              // page triggers abort on navigation, dont show error
              if(status != 'abort') {
                setTimeout(function(){
                  promise.rejectWith(context, [xhr, status, httpMessage]);
                }, settings.loadingDelay);
              }
              else {
                $context
                  .removeClass(className.error)
                  .removeClass(className.loading)
                ;
              }
            })
        ;
        if(settings.stateContext) {
          $module
            .data(metadata.promise, promise)
            .data(metadata.xhr, xhr)
          ;
        }
      },

      get: {
        formData: function() {
          return $module
            .closest('form')
              .toJSON()
          ;
        },
        templateURL: function() {
          var
            action = $module.data(settings.metadata.action) || settings.action || false,
            url
          ;
          if(action) {
            module.debug('Creating url for: ', action);
            if(settings.api[action] !== undefined) {
              url = settings.api[action];
            }
            else {
              module.error(error.missingAction);
            }
          }
          // override with url if specified
          if(settings.url) {
            url = settings.url;
            module.debug('Getting url', url);
          }
          return url;
        },
        url: function(url, urlData) {
          var
            urlVariables
          ;
          if(url) {
            urlVariables = url.match(settings.regExpTemplate);
            urlData      = urlData || settings.urlData;

            if(urlVariables) {
              module.debug('Looking for URL variables', urlVariables);
              $.each(urlVariables, function(index, templateValue){
                var
                  term      = templateValue.substr( 2, templateValue.length - 3),
                  termValue = ($.isPlainObject(urlData) && urlData[term] !== undefined)
                    ? urlData[term]
                    : ($module.data(term) !== undefined)
                      ? $module.data(term)
                      : urlData[term]
                ;
                module.verbose('Looking for variable', term, $module, $module.data(term), urlData[term]);
                // remove optional value
                if(termValue === false) {
                  module.debug('Removing variable from URL', urlVariables);
                  url = url.replace('/' + templateValue, '');
                }
                // undefined condition
                else if(termValue === undefined || !termValue) {
                  module.error(error.missingParameter + term);
                  url = false;
                  return false;
                }
                else {
                  url = url.replace(templateValue, termValue);
                }
              });
            }
          }
          return url;
        }
      },

      // reset api request
      reset: function() {
        $module
          .data(metadata.promise, false)
          .data(metadata.xhr, false)
        ;
        $context
          .removeClass(className.error)
          .removeClass(className.loading)
        ;
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
          clearTimeout(module.performance.timer);
          time = false;
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

    return (invokedResponse !== undefined)
      ? invokedResponse
      : this
    ;
  };

  // handle DOM attachment to API functionality
  $.fn.apiButton = function(parameters) {
    $(this)
      .each(function(){
        var
          // if only function passed it is success callback
          $module  = $(this),
          selector = $(this).selector || '',

          settings = ( $.isFunction(parameters) )
            ? $.extend(true, {}, $.api.settings, $.fn.apiButton.settings, { stateContext: this, success: parameters })
            : $.extend(true, {}, $.api.settings, $.fn.apiButton.settings, { stateContext: this}, parameters),
          module
        ;
        module = {
          initialize: function() {
            if(settings.context && selector !== '') {
              $(settings.context)
                .on(selector, 'click.' + settings.namespace, module.click)
              ;
            }
            else {
              $module
                .on('click.' + settings.namespace, module.click)
              ;
            }
          },
          click: function() {
            if(!settings.filter || $(this).filter(settings.filter).size() === 0) {
              $.proxy( $.api, this )(settings);
            }
          }
        };
        module.initialize();
      })
    ;
    return this;
  };

  $.api.settings = {
    name  : 'API',
    namespace   : 'api',

    debug       : true,
    verbose     : true,
    performance : true,

    api         : {},

    beforeSend  : function(settings) {
      return settings;
    },
    beforeXHR   : function(xhr) {},
    success     : function(response) {},
    complete    : function(response) {},
    failure     : function(errorCode) {},
    progress    : false,

    error : {
      missingAction    : 'API action used but no url was defined',
      missingURL       : 'URL not specified for the API action',
      missingParameter : 'Missing an essential URL parameter: ',

      timeout          : 'Your request timed out',
      error            : 'There was an error with your request',
      parseError       : 'There was an error parsing your request',
      JSONParse        : 'JSON could not be parsed during error handling',
      statusMessage    : 'Server gave an error: ',
      beforeSend       : 'The before send function has aborted the request',
      exitConditions   : 'API Request Aborted. Exit conditions met'
    },

    className: {
      loading : 'loading',
      error   : 'error'
    },

    metadata: {
      action  : 'action',
      promise : 'promise',
      xhr     : 'xhr'
    },

    regExpTemplate: /\{\$([A-z]+)\}/g,

    action        : false,
    url           : false,
    urlData       : false,
    serializeForm : false,

    stateContext  : false,

    method        : 'get',
    data          : {},
    dataType      : 'json',
    cache         : true,

    loadingLength : 200,
    errorLength   : 2000

  };

  $.fn.apiButton.settings = {
    filter       : '.disabled, .loading',
    context      : false,
    stateContext : false
  };

})( jQuery, window , document );
/*  ******************************
  Colorizer
  Author: Jack Lukic
  Notes: First Commit June 06, 2012

  Tooltip Wrapper for loading
  colorizes of ideations, concepts and users

  Will eventually rewrite to use own tooltip lib

******************************  */

;(function ( $, window, document, undefined ) {

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
                console.info(settings.moduleName + ': ' + message, variableName);
              }
              else {
                console.info(settings.moduleName + ': ' + message);
              }
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
    name     : 'Image Colorizer',
    debug          : true,
    namespace      : 'colorize',

    onDraw: function(overlayContext, imageName, colorName, color) {},

    // whether to block execution while updating canvas
    async: true,
    // object containing names and default values of color regions
    colors: {},

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

/*  ******************************
  Form Validation Components
  Author: Jack Lukic
  Notes: First Commit April 08, 2012

  Refactored May 28, 2013

  Allows you to validate forms based on a form validation object
  Form validation objects are bound by either data-validate="" metadata, or form id or name tags

******************************  */

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
    invokedResponse
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
          $submit
            .on('click' + eventNamespace, module.submit)
          ;
          $field
            .on(module.get.changeEvent() + eventNamespace, module.event.field.change)
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
          module.verbose('Destroying previous module', instance);
          $module
            .off(eventNamespace)
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
              if(!event.ctrlKey && key == keyCode.enter && $field.is(selector.input) ) {
                module.debug('Enter key pressed, submitting form');
                $submit
                  .addClass(className.down)
                ;
                $field
                  .one('keyup' + eventNamespace, module.event.field.keyup)
                ;
                event.preventDefault();
                return false;
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
              if( $fieldGroup.hasClass(className.error) ) {
                module.debug('Revalidating field', $field,  module.get.validation($field));
                module.validate.field( module.get.validation($field) );
              }
              else if(settings.on == 'change') {
                module.validate.field( module.get.validation($field) );
              }
            }
          }

        },

        get: {
          changeEvent: function() {
            return (document.createElement('input').oninput !== undefined)
              ? 'input'
              : (document.createElement('input').onpropertychange !== undefined)
                ? 'propertychange'
                : 'keyup'
            ;
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
          prompt: function(field, errors) {
            var
              $field       = module.get.field(field.identifier),
              $fieldGroup  = $field.closest($group),
              $prompt      = $fieldGroup.find(selector.prompt),
              promptExists = ($prompt.size() !== 0)
            ;
            module.verbose('Adding inline error', field);
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
                if(settings.transition && $.fn.transition !== undefined) {
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
              if(settings.transition && $.fn.transition !== undefined) {
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

        validate: {

          form: function(event) {
            var
              allValid = true
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
              $module
                .removeClass(className.error)
                .addClass(className.success)
              ;
              $.proxy(settings.onSuccess, this)(event);
            }
            else {
              module.debug('Form has errors');
              $module.addClass(className.error);
              if(!settings.inline) {
                module.add.errors(formErrors);
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
              module.add.prompt(field, fieldErrors);
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
              value         = $field.val(),

              bracketRegExp = /\[(.*?)\]/i,
              bracket       = bracketRegExp.exec(type),
              isValid       = true,
              ancillary,
              functionType
            ;
            // if bracket notation is used, pass in extra parameters
            if(bracket !== undefined && bracket !== null) {
              ancillary    = bracket[1];
              functionType = type.replace(bracket[0], '');
              isValid      = $.proxy(settings.rules[functionType], $module)(value, ancillary);
            }
            // normal notation
            else {
              isValid = (type == 'checked')
                ? $field.filter(':checked').size() > 0
                : settings.rules[type](value)
              ;
            }
            return isValid;
          }
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

$.fn.form.settings = {

  name              : 'Form',
  namespace         : 'form',

  debug             : true,
  verbose           : true,
  performance       : true,


  keyboardShortcuts : true,
  on                : 'submit',
  inline            : false,

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
    empty: function(value) {
      return !(value === undefined || '' === value);
    },
    email: function(value){
      var
        emailRegExp = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?")
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
      else if($form.find('[name=' + fieldIdentifier +']').size() > 0) {
        matchingValue = $form.find('[name=' + fieldIdentifier + ']').val();
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
    }
  }

};

})( jQuery, window , document );

/*  ******************************
  Module
  State
  Change text based on state context
  Hover/down/Active/Inactive
  Author: Jack Lukic
  Last revision: May 2012

  State text module is used to apply text to a given node
  depending on the elements "state"

  State is either defined as "active" or "inactive" depending
  on the returned value of a test function

  Usage:

  $button
    .state({
      states: {
        active: true
      },
      text: {
        inactive: 'Follow',
        active  : 'Following',
        enable  : 'Add',
        disable : 'Remove'
      }
    })
  ;

  "Follow", turns to "Add" on hover, then "Following" on active
  and finally "Remove" on active hover

  This plugin works in correlation to API module and will, by default,
  use deffered object accept/reject to determine state.

******************************  */

;(function ( $, window, document, undefined ) {

$.fn.state = function(parameters) {
  var
    $allModules     = $(this),
    settings        = $.extend(true, {}, $.fn.state.settings, parameters),

    moduleSelector  = $allModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    // shortcuts
    error         = settings.error,
    metadata      = settings.metadata,
    className     = settings.className,
    namespace     = settings.namespace,
    states        = settings.states,
    text          = settings.text,

    eventNamespace  = '.' + namespace,
    moduleNamespace = namespace + '-module',


    invokedResponse
  ;
  $allModules
    .each(function() {
      var
        $module       = $(this),

        element       = this,
        instance      = $module.data(moduleNamespace),

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
            if( module.allows('hover') ) {
              $(element, settings.context)
                .on(moduleSelector, 'mouseenter' + eventNamespace, module.enable.hover)
                .on(moduleSelector, 'mouseleave' + eventNamespace, module.disable.hover)
              ;
            }
            if( module.allows('down') ) {
              $(element, settings.context)
                .on(moduleSelector, 'mousedown' + eventNamespace, module.enable.down)
                .on(moduleSelector, 'mouseup'   + eventNamespace, module.disable.down)
              ;
            }
            if( module.allows('focus') ) {
              $(element, settings.context)
                .on(moduleSelector, 'focus' + eventNamespace, module.enable.focus)
                .on(moduleSelector, 'blur'  + eventNamespace, module.disable.focus)
              ;
            }
            $(settings.context)
              .on(moduleSelector, 'mouseenter' + eventNamespace, module.change.text)
              .on(moduleSelector, 'mouseleave' + eventNamespace, module.reset.text)
              .on(moduleSelector, 'click'      + eventNamespace, module.toggle.state)
            ;
          }
          else {
            if( module.allows('hover') ) {
              $module
                .on('mouseenter' + eventNamespace, module.enable.hover)
                .on('mouseleave' + eventNamespace, module.disable.hover)
              ;
            }
            if( module.allows('down') ) {
              $module
                .on('mousedown' + eventNamespace, module.enable.down)
                .on('mouseup'   + eventNamespace, module.disable.down)
              ;
            }
            if( module.allows('focus') ) {
              $module
                .on('focus' + eventNamespace, module.enable.focus)
                .on('blur'  + eventNamespace, module.disable.focus)
              ;
            }
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

        enable: {
          state: function(state) {
            if(module.allows(state)) {
              $module.addClass( className[state] );
            }
          },
          // convenience
          focus: function() {
            $module.addClass(className.focus);
          },
          hover: function() {
            $module.addClass(className.hover);
          },
          down: function() {
            $module.addClass(className.down);
          },
        },

        disable: {
          state: function(state) {
            if(module.allows(state)) {
              $module.removeClass( className[state] );
            }
          },
          // convenience
          focus: function() {
            $module.removeClass(className.focus);
          },
          hover: function() {
            $module.removeClass(className.hover);
          },
          down: function() {
            $module.removeClass(className.down);
          },
        },

        toggle: {
          state: function() {
            var
              apiRequest = $module.data(metadata.promise)
            ;
            if( module.allows('active') && module.is.enabled() ) {
              module.refresh();
              if(apiRequest !== undefined) {
                module.listenTo(apiRequest);
              }
              else {
                module.change.state();
              }
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
              if( module.is.active() ) {
                if(text.hover) {
                  module.verbose('Changing text to hover text', text.hover);
                  module.update.text(text.hover);
                }
                else if(text.disable) {
                  module.verbose('Changing text to disable text', text.disable);
                  module.update.text(text.disable);
                }
              }
              else {
                if(text.hover) {
                  module.verbose('Changing text to hover text', text.disable);
                  module.update.text(text.hover);
                }
                else if(text.enable){
                  module.verbose('Changing text to enable text', text.enable);
                  module.update.text(text.enable);
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
          }
          $.proxy(settings.onActivate, element)();
        },

        deactivate: function() {
          if($.proxy(settings.deactivateTest, element)() ) {
            module.debug('Setting state to inactive');
            $module
              .removeClass(className.active)
            ;
            module.update.text(text.inactive);
          }
          $.proxy(settings.onDeactivate, element)();
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
          text: function(text, duration) {
            var
              previousText = module.get.text()
            ;
            module.debug('Flashing text message', text, duration);
            text     = text     || settings.text.flash;
            duration = duration || settings.flashDuration;
            module.update.text(text);
            setTimeout(function(){
              module.update.text(previousText);
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

$.fn.state.settings = {

  // module info
  name : 'State',

  // debug output
  debug      : true,

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
  flashDuration : 3000,

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
    focus   : 'focus',
    hover   : 'hover',
    down    : 'down',
    active  : 'active',
    loading : 'loading'
  },

  selector: {
    // selector for text node
    text: false
  },

  defaults : {
    input: {
      hover   : true,
      focus   : true,
      down    : true,
      loading : false,
      active  : false
    },
    button: {
      hover   : true,
      focus   : false,
      down    : true,
      active  : true,
      loading : true
    }
  },

  states     : {
    hover   : true,
    focus   : true,
    down    : true,
    loading : false,
    active  : false
  },

  text     : {
    flash    : false,
    hover    : false,
    active   : false,
    inactive : false,
    enable   : false,
    disable  : false
  }

};



})( jQuery, window , document );

/*  ******************************
  Module -  Chat Room
  Author: Jack Lukic
  Notes: First Commit Aug 8, 2012

  Designed as a simple modular chat component
******************************  */

;(function ($, window, document, undefined) {

$.fn.chatroom = function(parameters) {
  var
    settings  = $.extend(true, {}, $.fn.chatroom.settings, parameters),

    className = settings.className,
    namespace = settings.namespace,
    selector  = settings.selector,
    error     = settings.error,

    // hoist arguments
    moduleArguments = arguments || false
  ;
  $(this)
    .each(function() {
      var
        $module         = $(this),

        $expandButton   = $module.find(selector.expandButton),
        $userListButton = $module.find(selector.userListButton),

        $userList       = $module.find(selector.userList),
        $room           = $module.find(selector.room),
        $userCount      = $module.find(selector.userCount),

        $log            = $module.find(selector.log),
        $message        = $module.find(selector.message),

        $messageInput   = $module.find(selector.messageInput),
        $messageButton  = $module.find(selector.messageButton),

        instance        = $module.data('module'),

        html            = '',
        users           = {},

        channel,
        loggedInUser,

        message,
        count,

        height,

        pusher,
        module
      ;

      module = {

        width: {
          log      : $log.width(),
          userList : $userList.outerWidth()
        },

        initialize: function() {

          // check error conditions
          if(Pusher === undefined) {
            module.error(error.pusher);
          }
          if(settings.key === undefined || settings.channelName === undefined) {
            module.error(error.key);
            return false;
          }
          else if( !(settings.endpoint.message || settings.endpoint.authentication) ) {
            module.error(error.endpoint);
            return false;
          }

          // define pusher
          pusher                       = new Pusher(settings.key);
          Pusher.channel_auth_endpoint = settings.endpoint.authentication;

          channel = pusher.subscribe(settings.channelName);

          channel.bind('pusher:subscription_succeeded', module.user.list.create);
          channel.bind('pusher:subscription_error', module.error);
          channel.bind('pusher:member_added', module.user.joined);
          channel.bind('pusher:member_removed', module.user.left);
          channel.bind('update_messages', module.message.receive);

          $.each(settings.customEvents, function(label, value) {
            channel.bind(label, value);
          });

          // bind module events
          $userListButton
            .on('click.' +  namespace, module.event.toggleUserList)
          ;
          $expandButton
            .on('click.'   +  namespace, module.event.toggleExpand)
          ;
          $messageInput
            .on('keydown.' +  namespace, module.event.input.keydown)
            .on('keyup.'   +  namespace, module.event.input.keyup)
          ;
          $messageButton
            .on('mouseenter.' +  namespace, module.event.hover)
            .on('mouseleave.' +  namespace, module.event.hover)
            .on('click.' +  namespace, module.event.submit)
          ;
          // scroll to bottom of chat log
          $log
            .animate({
              scrollTop: $log.prop('scrollHeight')
            }, 400)
          ;
          $module
            .data('module', module)
            .addClass(className.loading)
          ;

        },

        // refresh module
        refresh: function() {
          // reset width calculations
          $userListButton
            .removeClass(className.active)
          ;
          module.width = {
            log      : $log.width(),
            userList : $userList.outerWidth()
          };
          if( $userListButton.hasClass(className.active) ) {
            module.user.list.hide();
          }
          $module.data('module', module);
        },

        user: {

          updateCount: function() {
            if(settings.userCount) {
              users = $module.data('users');
              count = 0;
              $.each(users, function() {
                count++;
              });
              $userCount
                .html( settings.templates.userCount(count) )
              ;
            }
          },

          // add user to user list
          joined: function(member) {
            users = $module.data('users');
            if(member.id != 'anonymous' && users[ member.id ] === undefined ) {
              users[ member.id ] = member.info;
              if(settings.randomColor && member.info.color === undefined) {
                member.info.color = settings.templates.color(member.id);
              }
              html = settings.templates.userList(member.info);
              if(member.info.isAdmin) {
                $(html)
                  .prependTo($userList)
                ;
              }
              else {
                $(html)
                  .appendTo($userList)
                ;
              }
              if(settings.partingMessages) {
                $log
                  .append( settings.templates.joined(member.info) )
                ;
                module.message.scroll.test();
              }
              module.user.updateCount();
            }
          },

          // remove user from user list
          left: function(member) {
            users = $module.data('users');
            if(member !== undefined && member.id !== 'anonymous') {
              delete users[ member.id ];
              $module
                .data('users', users)
              ;
              $userList
                .find('[data-id='+ member.id + ']')
                  .remove()
              ;
              if(settings.partingMessages) {
                $log
                  .append( settings.templates.left(member.info) )
                ;
                module.message.scroll.test();
              }
              module.user.updateCount();
            }
          },

          list: {

            // receives list of members and generates user list
            create: function(members) {
              users = {};
              members.each(function(member) {
                if(member.id !== 'anonymous' && member.id !== 'undefined') {
                  if(settings.randomColor && member.info.color === undefined) {
                    member.info.color = settings.templates.color(member.id);
                  }
                  // sort list with admin first
                  html = (member.info.isAdmin)
                    ? settings.templates.userList(member.info) + html
                    : html + settings.templates.userList(member.info)
                  ;
                  users[ member.id ] = member.info;
                }
              });
              $module
                .data('users', users)
                .data('user', users[members.me.id] )
                .removeClass(className.loading)
              ;
              $userList
                .html(html)
              ;
              module.user.updateCount();
              $.proxy(settings.onJoin, $userList.children())();
            },

            // shows user list
            show: function() {
              $log
                .animate({
                  width: (module.width.log - module.width.userList)
                }, {
                  duration : settings.speed,
                  easing   : settings.easing,
                  complete : module.message.scroll.move
                })
              ;
            },

            // hides user list
            hide: function() {
              $log
                .stop()
                .animate({
                  width: (module.width.log)
                }, {
                  duration : settings.speed,
                  easing   : settings.easing,
                  complete : module.message.scroll.move
                })
              ;
            }

          }

        },

        message: {

          // handles scrolling of chat log
          scroll: {
            test: function() {
              height = $log.prop('scrollHeight') - $log.height();
              if( Math.abs($log.scrollTop() - height) < settings.scrollArea) {
                module.message.scroll.move();
              }
            },

            move: function() {
              height = $log.prop('scrollHeight') - $log.height();
              $log
                .scrollTop(height)
              ;
            }
          },

          // sends chat message
          send: function(message) {
            if( !module.utils.emptyString(message) ) {
              $.api({
                url    : settings.endpoint.message,
                method : 'POST',
                data   : {
                  'message': {
                    content   : message,
                    timestamp : new Date().getTime()
                  }
                }
              });
            }
          },

          // receives chat response and processes
          receive: function(response) {
            message      = response.data;
            users        = $module.data('users');
            loggedInUser = $module.data('user');
            if(users[ message.userID] !== undefined) {
              // logged in user's messages already pushed instantly
              if(loggedInUser === undefined || loggedInUser.id != message.userID) {
                message.user = users[ message.userID ];
                module.message.display(message);
              }
            }
          },

          // displays message in chat log
          display: function(message) {
            $log
              .append( settings.templates.message(message) )
            ;
            module.message.scroll.test();
            $.proxy(settings.onMessage, $log.children().last() )();
          }

        },

        expand: function() {
          $module
            .addClass(className.expand)
          ;
          $.proxy(settings.onExpand, $module )();
          module.refresh();
        },

        contract: function() {
          $module
            .removeClass(className.expand)
          ;
          $.proxy(settings.onContract, $module )();
          module.refresh();
        },

        event: {

          input: {

            keydown: function(event) {
              if(event.which == 13) {
                $messageButton
                  .addClass(className.down)
                ;
              }
            },

            keyup: function(event) {
              if(event.which == 13) {
                $messageButton
                  .removeClass(className.down)
                ;
                module.event.submit();
              }
            }

          },

          // handles message form submit
          submit: function() {
            var
              message      = $messageInput.val(),
              loggedInUser = $module.data('user')
            ;
            if(loggedInUser !== undefined && !module.utils.emptyString(message)) {
              module.message.send(message);
              // display immediately
              module.message.display({
                user: loggedInUser,
                text: message
              });
              module.message.scroll.move();
              $messageInput
                .val('')
              ;

            }
          },

          // handles button click on expand button
          toggleExpand: function() {
            if( !$module.hasClass(className.expand) ) {
              $expandButton
                .addClass(className.active)
              ;
              module.expand();
            }
            else {
              $expandButton
                .removeClass(className.active)
              ;
              module.contract();
            }
          },

          // handles button click on user list button
          toggleUserList: function() {
            if( !$log.is(':animated') ) {
              if( !$userListButton.hasClass(className.active) ) {
                $userListButton
                  .addClass(className.active)
                ;
                module.user.list.show();
              }
              else {
                $userListButton
                  .removeClass('active')
                ;
                module.user.list.hide();
              }
            }

          }
        },

        utils: {

          emptyString: function(string) {
            if(typeof string == 'string') {
              return (string.search(/\S/) == -1);
            }
            return false;
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
          if(moduleSelector) {
            title += ' \'' + moduleSelector + '\'';
          }
          title += ' ' + '(' + $allDropdowns.size() + ')';
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
          query    = query.split(/[\. ]/);
          maxDepth = query.length - 1;
          $.each(query, function(depth, value) {
            if( $.isPlainObject( instance[value] ) && (depth != maxDepth) ) {
              instance = instance[value];
            }
            else if( instance[value] !== undefined ) {
              found = instance[value];
            }
            else {
              module.error(error.method);
            }
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

  $.fn.chatroom.settings = {

    name            : 'Chat',
    debug           : false,
    namespace       : 'chat',

    channel         : 'present-chat',

    onJoin          : function(){},
    onMessage       : function(){},
    onExpand        : function(){},
    onContract      : function(){},

    customEvents    : {},

    partingMessages : false,
    userCount       : true,
    randomColor     : true,

    speed           : 300,
    easing          : 'easeOutQuint',

    // pixels from bottom of chat log that should trigger auto scroll to bottom
    scrollArea      : 9999,

    endpoint        : {
      message        : false,
      authentication : false
    },

    error: {
      method   : 'The method you called is not defined',
      endpoint : 'Please define a message and authentication endpoint.',
      key      : 'You must specify a pusher key and channel.',
      pusher   : 'You must include the Pusher library.'
    },

    className   : {
      expand  : 'expand',
      active  : 'active',
      hover   : 'hover',
      down    : 'down',
      loading : 'loading'
    },

    selector    : {
      userCount      : '.actions .message',
      userListButton : '.actions .list.button',
      expandButton   : '.actions .expand.button',
      room           : '.room',
      userList       : '.room .list',
      log            : '.room .log',
      message        : '.room .log .message',
      author         : '.room log .message .author',
      messageInput   : '.talk input',
      messageButton  : '.talk .send.button'
    },

    templates: {

      userCount: function(number) {
        return number + ' users in chat';
      },

      color: function(userID) {
        var
          colors = [
            '#000000',
            '#333333',
            '#666666',
            '#999999',
            '#CC9999',
            '#CC6666',
            '#CC3333',
            '#993333',
            '#663333',
            '#CC6633',
            '#CC9966',
            '#CC9933',
            '#999966',
            '#CCCC66',
            '#99CC66',
            '#669933',
            '#669966',
            '#33A3CC',
            '#336633',
            '#33CCCC',
            '#339999',
            '#336666',
            '#336699',
            '#6666CC',
            '#9966CC',
            '#333399',
            '#663366',
            '#996699',
            '#993366',
            '#CC6699'
          ]
        ;
        return colors[ Math.floor( Math.random() * colors.length) ];
      },

      message: function(message) {
        var
          html = ''
        ;
        if(message.user.isAdmin) {
          message.user.color = '#55356A';
          html += '<div class="admin message">';
          html += '<span class="quirky ui flag team"></span>';
        }
        /*
        else if(message.user.isPro) {
          html += '<div class="indent message">';
          html += '<span class="quirky ui flag pro"></span>';
        }
        */
        else {
          html += '<div class="message">';
        }
        html += '<p>';
        if(message.user.color !== undefined) {
          html += '<span class="author" style="color: ' + message.user.color + ';">' + message.user.name + '</span>: ';
        }
        else {
          html += '<span class="author">' + message.user.name + '</span>: ';
        }
        html += ''
          +   message.text
          + ' </p>'
          + '</div>'
        ;
        return html;
      },

      joined: function(member) {
        return (typeof member.name !== undefined)
          ? '<div class="status">' + member.name + ' has joined the chat.</div>'
          : false
        ;
      },
      left: function(member) {
        return (typeof member.name !== undefined)
          ? '<div class="status">' + member.name + ' has left the chat.</div>'
          : false
        ;
      },

      userList: function(member) {
        var
          html = ''
        ;
        if(member.isAdmin) {
          member.color = '#55356A';
        }
        html +=  ''
          + '<div class="user" data-id="' + member.id + '">'
          + ' <div class="image">'
          + '   <img src="' + member.avatarURL + '">'
          + ' </div>'
        ;
        if(member.color !== undefined) {
          html += ' <p><a href="/users/' + member.id + '" target="_blank" style="color: ' + member.color + ';">' + member.name + '</a></p>';
        }
        else {
          html += ' <p><a href="/users/' + member.id + '" target="_blank">' + member.name + '</a></p>';
        }
        html += '</div>';
        return html;
      }

    }

  };

})( jQuery, window , document );

/*  ******************************
  Semantic Module: Checkbox
  Author: Jack Lukic
  Notes: First Commit March 25, 2013

  Simple plug-in which maintains the state for ui checkbox
  This can be done without javascript, only in instances
  where each checkbox is assigned a unique ID. This provides a separate
  programmatic option when that is not possible.

******************************  */

;(function ( $, window, document, undefined ) {

$.fn.checkbox = function(parameters) {
  var
    $allModules    = $(this),

    settings       = $.extend(true, {}, $.fn.checkbox.settings, parameters),

    className      = settings.className,
    namespace      = settings.namespace,
    error          = settings.error,

    eventNamespace  = '.' + namespace,
    moduleNamespace = 'module-' + namespace,

    moduleSelector = $allModules.selector || '',

    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),
    invokedResponse
  ;

  $allModules
    .each(function() {
      var
        $module         = $(this),
        $label          = $(this).next(settings.selector.label).first(),
        $input          = $(this).find(settings.selector.input),

        selector        = $module.selector || '',
        instance        = $module.data(moduleNamespace),

        element         = this,
        module
      ;

      module      = {

        initialize: function() {
          module.verbose('Initializing checkbox', settings);
          if(settings.context && selector !== '') {
            module.verbose('Adding delegated events');
            $(element, settings.context)
              .on(selector, 'click' + eventNamespace, module.toggle)
              .on(selector + ' + ' + settings.selector.label, 'click' + eventNamespace, module.toggle)
            ;
          }
          else {
            $module
              .on('click' + eventNamespace, module.toggle)
              .data(moduleNamespace, module)
            ;
            $label
              .on('click' + eventNamespace, module.toggle)
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
          module.verbose('Destroying previous module');
          $module
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        is: {
          radio: function() {
            return $module.hasClass(className.radio);
          }
        },

        can: {
          disable: function() {
            return (typeof settings.required === 'boolean')
              ? settings.required
              : !module.is.radio()
            ;
          }
        },

        enable: function() {
          module.debug('Enabling checkbox');
          $input
            .prop('checked', true)
          ;
          $.proxy(settings.onChange, $input.get())();
          $.proxy(settings.onEnable, $input.get())();
        },

        disable: function() {
          module.debug('Disabling checkbox');
          $input
            .prop('checked', false)
          ;
          $.proxy(settings.onChange, $input.get())();
          $.proxy(settings.onDisable, $input.get())();
        },

        toggle: function(event) {
          module.verbose('Determining new checkbox state');
          if($input.prop('checked') === undefined || !$input.prop('checked')) {
            module.enable();
          }
          else if( module.can.disable() ) {
            module.disable();
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

$.fn.checkbox.settings = {

  name  : 'Checkbox',
  namespace   : 'checkbox',

  verbose     : true,
  debug       : true,
  performance : true,

  // delegated event context
  context     : false,
  required    : 'auto',

  onChange    : function(){},
  onEnable    : function(){},
  onDisable   : function(){},

  error     : {
    method   : 'The method you called is not defined.'
  },

  selector : {
    input  : 'input',
    label  : 'label'
  },

  className : {
    radio  : 'radio'
  }

};

})( jQuery, window , document );

/*  ******************************
  Semantic Module: Dimmer
  Author: Jack Lukic
  Notes: First Commit May 30, 2013

  Simple plug-in which maintains the state for ui dimmer

******************************  */

;(function ( $, window, document, undefined ) {

$.fn.dimmer = function(parameters) {
  var
    $allModules     = $(this),

    settings        = ( $.isPlainObject(parameters) )
      ? $.extend(true, {}, $.fn.dimmer.settings, parameters)
      : $.fn.dimmer.settings,

    selector        = settings.selector,
    namespace       = settings.namespace,
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
    clickEvent      = ('ontouchstart' in document.documentElement)
      ? 'touchstart'
      : 'click',

    invokedResponse
  ;

  $allModules
    .each(function() {
      var
        $module      = $(this),
        $dimmer      = $module.children(selector.dimmer).first(),

        element      = this,
        instance     = $dimmer.data(moduleNamespace),
        module
      ;

      module      = {

        initialize: function() {
          if( module.is.dimmer() ) {
            $dimmer = $module;
            $module = $dimmer.parent();
            module.debug('Module initialized as dimmer', settings);
          }
          else {
            if( module.has.dimmer() ) {
              $dimmer = $module.children(selector.dimmer).first();
              module.debug('Module initialized with found dimmer', settings);
            }
            else {
              module.create();
              module.debug('Module initialized with created dimmer', settings);
            }
            if(settings.on == 'hover') {
              $module
                .on('mouseenter' + eventNamespace, module.show)
                .on('mouseleave' + eventNamespace, module.hide)
              ;
            }
            else if(settings.on == 'click') {
              $module
                .on(clickEvent + eventNamespace, module.toggle)
              ;
            }
          }
          if(settings.closable) {
            $dimmer
              .on(clickEvent, module.event.click)
            ;
          }
          module.set.dimmable();
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module');
          instance = module;
          $dimmer
            .data(moduleNamespace, instance)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module');
          $module
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

        create: function() {
          $dimmer = settings.template.dimmer();
          $dimmer
            .appendTo($module)
          ;
          if(module.is.page()) {
            module.set.pageDimmer();
          }
        },

        animate: {
          show: function(callback) {
            callback = callback || function(){};
            module.set.dimmed();
            if($.fn.transition !== undefined) {
              $dimmer
                .transition(settings.transition + ' in', settings.duration, function() {
                  module.set.active();
                  callback();
                })
              ;
            }
            else {
              module.verbose('Showing dimmer animation with javascript');
              $dimmer
                .stop()
                .css({
                  opacity : 0,
                  width   : '100%',
                  height  : '100%'
                })
                .fadeTo(settings.duration, 1, function() {
                  $dimmer.removeAttr('style');
                  module.set.active();
                  callback();
                })
              ;
            }
          },
          hide: function(callback) {
            callback = callback || function(){};
            module.remove.dimmed();
            if($.fn.transition !== undefined) {
              module.verbose('Hiding dimmer with css');
              $dimmer
                .transition(settings.transition + ' out', settings.duration, function() {
                  module.remove.active();
                  callback();
                })
              ;
            }
            else {
              module.verbose('Hiding dimmer with javascript');
              $dimmer
                .stop()
                .fadeOut(settings.duration, function() {
                  $dimmer.removeAttr('style');
                  module.remove.active();
                  callback();
                })
              ;
            }
          }
        },

        has: {
          dimmer: function() {
            return ( $module.children(selector.dimmer).size() > 0 );
          }
        },

        is: {
          active: function() {
            return $dimmer.hasClass(className.active);
          },
          animating: function() {
            return ( $dimmer.is(':animated') || $dimmer.hasClass(className.transition) );
          },
          dimmer: function() {
            return $module.is(selector.dimmer);
          },
          page: function () {
            return $module.is('body');
          },
          dimmable: function() {
            return $module.is(selector.dimmable);
          },
          enabled: function() {
            return !$module.hasClass(className.disabled);
          },
          disabled: function() {
            return $module.hasClass(className.disabled);
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
            $dimmer
              .removeClass(className.transition)
              .addClass(className.active)
            ;
          },
          dimmable: function() {
            $module
              .addClass(className.dimmable)
            ;
          },
          dimmed: function() {
            $module.addClass(className.dimmed);
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
              .removeClass(className.transition)
              .removeClass(className.active)
            ;
          },
          dimmed: function() {
            $module.removeClass(className.dimmed);
          },
          disabled: function() {
            $dimmer.removeClass(className.disabled);
          }
        },

        show: function(callback) {
          module.debug('Showing dimmer', $dimmer);
          if( !(module.is.active() || module.is.animating() ) && module.is.enabled() ) {
            module.animate.show(callback);
            $.proxy(settings.onShow, element)();
            $.proxy(settings.onChange, element)();
          }
          else {
            module.debug('Dimmer is already shown or disabled');
          }
        },

        hide: function(callback) {
          if( module.is.active() && !module.is.animating() ) {
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
          if( !module.is.active() ) {
            module.show();
          }
          else {
            module.hide();
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

$.fn.dimmer.settings = {

  name        : 'Dimmer',
  namespace   : 'dimmer',

  verbose     : true,
  debug       : true,
  performance : true,

  transition  : 'fade',

  on          : false,
  closable    : true,
  duration    : 500,

  onChange    : function(){},
  onShow      : function(){},
  onHide      : function(){},

  error   : {
    method   : 'The method you called is not defined.'
  },

  selector: {
    dimmable : '.ui.dimmable',
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
    dimmable   : 'ui dimmable',
    dimmed     : 'dimmed',
    disabled   : 'disabled',
    pageDimmer : 'page',
    hide       : 'hide',
    show       : 'show',
    transition : 'transition'
  }

};

})( jQuery, window , document );
/*  ******************************
   Semantic dropdown: Dropdown
   Author: Jack Lukic
   Notes: First Commit May 25, 2013

******************************  */

;(function ( $, window, document, undefined ) {

$.fn.dropdown = function(parameters) {
  var
    $allDropdowns = $(this),
    $document     = $(document),

    settings        = ( $.isPlainObject(parameters) )
      ? $.extend(true, {}, $.fn.dropdown.settings, parameters)
      : $.fn.dropdown.settings,

    className         = settings.className,
    metadata          = settings.metadata,
    namespace         = settings.namespace,
    selector          = settings.selector,
    error             = settings.error,

    eventNamespace    = '.' + namespace,
    dropdownNamespace = 'module-' + namespace,
    dropdownSelector  = $allDropdowns.selector || '',

    time              = new Date().getTime(),
    performance       = [],

    query             = arguments[0],
    methodInvoked     = (typeof query == 'string'),
    queryArguments    = [].slice.call(arguments, 1),
    invokedResponse
  ;

  $allDropdowns
    .each(function() {
      var
        $dropdown     = $(this),
        $item         = $dropdown.find(selector.item),
        $text         = $dropdown.find(selector.text),
        $input        = $dropdown.find(selector.input),

        $menu         = $dropdown.children(selector.menu),

        isTouchDevice = ('ontouchstart' in document.documentElement),

        element       = this,
        instance      = $dropdown.data(dropdownNamespace),
        dropdown
      ;

      dropdown      = {

        initialize: function() {
          dropdown.debug('Initializing dropdown', settings);
          if(isTouchDevice) {
            $dropdown
              .on('touchstart' + eventNamespace, dropdown.event.test.toggle)
            ;
          }
          else if(settings.on == 'click') {
            $dropdown
              .on('click' + eventNamespace, dropdown.event.test.toggle)
            ;
          }
          else if(settings.on == 'hover') {
            $dropdown
              .on('mouseenter' + eventNamespace, dropdown.delay.show)
              .on('mouseleave' + eventNamespace, dropdown.delay.hide)
            ;
          }
          else {
            $dropdown
              .on(settings.on + eventNamespace, dropdown.toggle)
            ;
          }
          if(settings.action == 'form') {
            dropdown.set.selected();
          }
          $item
            .on('mouseenter' + eventNamespace, dropdown.event.item.mouseenter)
            .on('mouseleave' + eventNamespace, dropdown.event.item.mouseleave)
            .on(dropdown.get.selectEvent() + eventNamespace, dropdown.event.item.click)
          ;
          dropdown.instantiate();
        },

        instantiate: function() {
          dropdown.verbose('Storing instance of dropdown', dropdown);
          $dropdown
            .data(dropdownNamespace, dropdown)
          ;
        },

        destroy: function() {
          dropdown.verbose('Destroying previous dropdown for', $dropdown);
          $item
            .off(eventNamespace)
          ;
          $dropdown
            .off(eventNamespace)
            .removeData(dropdownNamespace)
          ;
        },

        event: {

          stopPropagation: function(event) {
            event.stopPropagation();
          },

          test: {
            toggle: function(event) {
              dropdown.determine.intent(event, dropdown.toggle);
              event.stopImmediatePropagation();
            },
            hide: function(event) {
              dropdown.determine.intent(event, dropdown.hide);
              event.stopPropagation();
            }
          },

          item: {

            mouseenter: function(event) {
              var
                $currentMenu = $(this).find(selector.menu),
                $otherMenus  = $(this).siblings(selector.item).children(selector.menu)
              ;
              if( $currentMenu.size() > 0 ) {
                clearTimeout(dropdown.itemTimer);
                dropdown.itemTimer = setTimeout(function() {
                  dropdown.animate.hide(false, $otherMenus);
                  dropdown.verbose('Showing sub-menu', $currentMenu);
                  dropdown.animate.show(false,  $currentMenu);
                }, settings.delay.show * 2);
              }
            },

            mouseleave: function(event) {
              var
                $currentMenu = $(this).find(selector.menu)
              ;
              if($currentMenu.size() > 0) {
                clearTimeout(dropdown.itemTimer);
                dropdown.itemTimer = setTimeout(function() {
                  dropdown.verbose('Hiding sub-menu', $currentMenu);
                  dropdown.animate.hide(false,  $currentMenu);
                }, settings.delay.hide);
              }
            },

            click: function (event) {
              var
                $choice = $(this),
                text    = $choice.data(metadata.text)  || $choice.text(),
                value   = $choice.data(metadata.value) || text
              ;
              if( $choice.find(selector.menu).size() === 0 ) {
                dropdown.verbose('Adding active state to selected item');
                $item
                  .removeClass(className.active)
                ;
                $choice
                  .addClass(className.active)
                ;
                dropdown.determine.selectAction(text, value);
                $.proxy(settings.onChange, element)(value, text);
                event.stopPropagation();
              }
            }

          },

          resetStyle: function() {
            $(this).removeAttr('style');
          }

        },

        determine: {
          selectAction: function(text, value) {
            dropdown.verbose('Determining action', settings.action);
            if( $.isFunction( dropdown[settings.action] ) ) {
              dropdown.verbose('Triggering preset action', settings.action);
              dropdown[ settings.action ](text, value);
            }
            else if( $.isFunction(settings.action) ) {
              dropdown.verbose('Triggering user action', settings.action);
              settings.action(text, value);
            }
            else {
              dropdown.error(error.action);
            }
          },
          intent: function(event, callback) {
            dropdown.debug('Determining whether event occurred in dropdown', event.target);
            callback = callback || function(){};
            if( $(event.target).closest($menu).size() === 0 ) {
              dropdown.verbose('Triggering event', callback);
              callback();
            }
            else {
              dropdown.verbose('Event occurred in dropdown, canceling callback');
            }
          }
        },

        bind: {
          intent: function() {
            dropdown.verbose('Binding hide intent event to document');
            $document
              .on(dropdown.get.selectEvent(), dropdown.event.test.hide)
            ;
          }
        },

        unbind: {
          intent: function() {
            dropdown.verbose('Removing hide intent event from document');
            $document
              .off(dropdown.get.selectEvent())
            ;
          }
        },

        nothing: function() {},

        changeText: function(text, value) {
          dropdown.set.text(text);
          dropdown.hide();
        },

        updateForm: function(text, value) {
          dropdown.set.text(text);
          dropdown.set.value(value);
          dropdown.hide();
        },

        get: {
          selectEvent: function() {
            return (isTouchDevice)
              ? 'touchstart'
              : 'click'
            ;
          },
          text: function() {
            return $text.text();
          },
          value: function() {
            return $input.val();
          },
          item: function(value) {
            var
              $selectedItem
            ;
            value = value || $input.val();
            $item
              .each(function() {
                if( $(this).data(metadata.value) == value ) {
                  $selectedItem = $(this);
                }
              })
            ;
            return $selectedItem || false;
          }
        },

        set: {
          text: function(text) {
            dropdown.debug('Changing text', text, $text);
            $text.removeClass(className.placeholder);
            $text.text(text);
          },
          value: function(value) {
            dropdown.debug('Adding selected value to hidden input', value, $input);
            $input.val(value);
          },
          active: function() {
            $dropdown.addClass(className.active);
          },
          visible: function() {
            $dropdown.addClass(className.visible);
          },
          selected: function(value) {
            var
              $selectedItem = dropdown.get.item(value),
              selectedText
            ;
            if($selectedItem) {
              dropdown.debug('Setting selected menu item to', $selectedItem);
              selectedText = $selectedItem.data(metadata.text) || $selectedItem.text();
              $item
                .removeClass(className.active)
              ;
              $selectedItem
                .addClass(className.active)
              ;
              dropdown.set.text(selectedText);
            }
          }
        },

        remove: {
          active: function() {
            $dropdown.removeClass(className.active);
          },
          visible: function() {
            $dropdown.removeClass(className.visible);
          }
        },

        is: {
          visible: function($subMenu) {
            return ($subMenu)
              ? $subMenu.is(':animated, :visible')
              : $menu.is(':animated, :visible')
            ;
          },
          hidden: function($subMenu) {
            return ($subMenu)
              ? $subMenu.is(':not(:animated, :visible)')
              : $menu.is(':not(:animated, :visible)')
            ;
          }
        },

        can: {
          click: function() {
            return (isTouchDevice || settings.on == 'click');
          },
          show: function() {
            return !$dropdown.hasClass(className.disabled);
          }
        },

        animate: {
          show: function(callback, $subMenu) {
            var
              $currentMenu = $subMenu || $menu
            ;
            callback = callback || function(){};
            if( dropdown.is.hidden($currentMenu) ) {
              dropdown.verbose('Doing menu show animation', $currentMenu);
              if(settings.transition == 'none') {
                callback();
              }
              else if($.fn.transition !== undefined) {
                $currentMenu.transition({
                  animation : settings.transition + ' in',
                  duration  : settings.duration,
                  complete  : callback,
                  queue     : false
                })
              }
              else if(settings.transition == 'slide down') {
                $currentMenu
                  .hide()
                  .clearQueue()
                  .children()
                    .clearQueue()
                    .css('opacity', 0)
                    .delay(50)
                    .animate({
                      opacity : 1
                    }, settings.duration, 'easeOutQuad', dropdown.event.resetStyle)
                    .end()
                  .slideDown(100, 'easeOutQuad', function() {
                    $.proxy(dropdown.event.resetStyle, this)();
                    callback();
                  })
                ;
              }
              else if(settings.transition == 'fade') {
                $currentMenu
                  .hide()
                  .clearQueue()
                  .fadeIn(settings.duration, function() {
                    $.proxy(dropdown.event.resetStyle, this)();
                    callback();
                  })
                ;
              }
              else {
                dropdown.error(error.transition);
              }
            }
          },
          hide: function(callback, $subMenu) {
            var
              $currentMenu = $subMenu || $menu
            ;
            callback = callback || function(){};
            if(dropdown.is.visible($currentMenu) ) {
              dropdown.verbose('Doing menu hide animation', $currentMenu);
              if($.fn.transition !== undefined) {
                $currentMenu.transition({
                  animation : settings.transition + ' out',
                  duration  : settings.duration,
                  complete  : callback,
                  queue     : false
                })
              }
              else if(settings.transition == 'none') {
                callback();
              }
              else if(settings.transition == 'slide down') {
                $currentMenu
                  .show()
                  .clearQueue()
                  .children()
                    .clearQueue()
                    .css('opacity', 1)
                    .animate({
                      opacity : 0
                    }, 100, 'easeOutQuad', dropdown.event.resetStyle)
                    .end()
                  .delay(50)
                  .slideUp(100, 'easeOutQuad', function() {
                    $.proxy(dropdown.event.resetStyle, this)();
                    callback();
                  })
                ;
              }
              else if(settings.transition == 'fade') {
                $currentMenu
                  .show()
                  .clearQueue()
                  .fadeOut(150, function() {
                    $.proxy(dropdown.event.resetStyle, this)();
                    callback();
                  })
                ;
              }
              else {
                dropdown.error(error.transition);
              }
            }
          }
        },

        show: function() {
          dropdown.debug('Checking if dropdown can show');
          if( dropdown.is.hidden() ) {
            dropdown.hideOthers();
            dropdown.set.active();
            dropdown.animate.show(dropdown.set.visible);
            if( dropdown.can.click() ) {
              dropdown.bind.intent();
            }
            $.proxy(settings.onShow, element)();
          }
        },

        hide: function() {
          if( dropdown.is.visible() ) {
            dropdown.debug('Hiding dropdown');
            if( dropdown.can.click() ) {
              dropdown.unbind.intent();
            }
            dropdown.remove.active();
            dropdown.animate.hide(dropdown.remove.visible);
            $.proxy(settings.onHide, element)();
          }
        },

        delay: {
          show: function() {
            dropdown.verbose('Delaying show event to ensure user intent');
            clearTimeout(dropdown.timer);
            dropdown.timer = setTimeout(dropdown.show, settings.delay.show);
          },
          hide: function() {
            dropdown.verbose('Delaying hide event to ensure user intent');
            clearTimeout(dropdown.timer);
            dropdown.timer = setTimeout(dropdown.hide, settings.delay.hide);
          }
        },

        hideOthers: function() {
          dropdown.verbose('Finding other dropdowns to hide');
          $allDropdowns
            .not($dropdown)
              .has(selector.menu + ':visible')
              .dropdown('hide')
          ;
        },

        toggle: function() {
          dropdown.verbose('Toggling menu visibility');
          if( dropdown.is.hidden() ) {
            dropdown.show();
          }
          else {
            dropdown.hide();
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
              $.extend(true, dropdown, name);
            }
            else {
              dropdown[name] = value;
            }
          }
          else {
            return dropdown[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              dropdown.performance.log(arguments);
            }
            else {
              dropdown.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              dropdown.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              dropdown.performance.log(arguments);
            }
            else {
              dropdown.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              dropdown.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          dropdown.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          dropdown.error.apply(console, arguments);
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
            clearTimeout(dropdown.performance.timer);
            dropdown.performance.timer = setTimeout(dropdown.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(dropdown.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(dropdownSelector) {
              title += ' \'' + dropdownSelector + '\'';
            }
            title += ' ' + '(' + $allDropdowns.size() + ')';
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
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              if( $.isPlainObject( instance[value] ) && (depth != maxDepth) ) {
                instance = instance[value];
              }
              else if( instance[value] !== undefined ) {
                found = instance[value];
              }
              else {
                dropdown.error(error.method);
              }
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
          dropdown.initialize();
        }
        invokedResponse = dropdown.invoke(query);
      }
      else {
        if(instance !== undefined) {
          dropdown.destroy();
        }
        dropdown.initialize();
      }
    })
  ;

  return (invokedResponse)
    ? invokedResponse
    : this
  ;
};

$.fn.dropdown.settings = {

  name        : 'Dropdown',
  namespace   : 'dropdown',

  verbose     : true,
  debug       : true,
  performance : true,

  on          : 'click',
  action      : 'hide',

  delay: {
    show: 200,
    hide: 300
  },

  transition : 'slide down',
  duration   : 250,

  onChange : function(){},
  onShow   : function(){},
  onHide   : function(){},

  error   : {
    action    : 'You called a dropdown action that was not defined',
    method    : 'The method you called is not defined.',
    transition : 'The requested transition was not found'
  },

  metadata: {
    text  : 'text',
    value : 'value'
  },

  selector : {
    menu  : '.menu',
    item  : '.menu > .item',
    text  : '> .text',
    input : '> input[type="hidden"]'
  },

  className : {
    active      : 'active',
    placeholder : 'default',
    disabled    : 'disabled',
    visible     : 'visible'
  }

};

})( jQuery, window , document );
/*  ******************************
  Modal
  Author: Jack Lukic
  Notes: First Commit May 14, 2012

  Manages modal state and
  stage dimming

******************************  */

;(function ( $, window, document, undefined ) {

$.fn.modal = function(parameters) {
  var
    $allModals     = $(this),
    $document      = $(document),

    settings        = ( $.isPlainObject(parameters) )
      ? $.extend(true, {}, $.fn.modal.settings, parameters)
      : $.fn.modal.settings,

    selector        = settings.selector,
    className       = settings.className,
    namespace       = settings.namespace,
    error           = settings.error,

    eventNamespace  = '.' + namespace,
    moduleNamespace = 'module-' + namespace,
    moduleSelector  = $allModals.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    invokedResponse
  ;

  $allModals
    .each(function() {
      var
        $modal       = $(this),
        $context     = $(settings.context),
        $otherModals = $allModals.not($modal),
        $closeButton = $modal.find(selector.closeButton),

        $dimmer,

        element      = this,
        instance     = $modal.data(moduleNamespace),
        modal
      ;

      modal  = {

        initialize: function() {
          modal.verbose('Attaching events');
          $closeButton
            .on('click', modal.event.close)
          ;
          modal.cache.sizes();

          modal.verbose('Creating dimmer');
          $context
            .dimmer({
              closable: settings.closable,
              duration: settings.duration,
              onShow: function() {
                modal.add.keyboardShortcuts();
                $.proxy(settings.onShow, this)();
              },
              onHide: function() {
                if($modal.is(':visible')) {
                  $context.off('.dimmer');
                  modal.hide();
                  $.proxy(settings.onHide, this)();
                }
                modal.remove.keyboardShortcuts();
              }
            })
          ;
          $dimmer = $context.children(selector.dimmer);
          if( $modal.parent()[0] !== $dimmer[0] ) {
            modal.debug('Moving element inside dimmer', $context);
            $modal = $modal
              .detach()
              .appendTo($dimmer)
            ;
          }
          modal.instantiate();
        },

        instantiate: function() {
          modal.verbose('Storing instance of modal');
          instance = modal;
          $modal
            .data(moduleNamespace, instance)
          ;
        },

        destroy: function() {
          modal.verbose('Destroying previous modal');
          $modal
            .off(eventNamespace)
          ;
        },

        event: {
          close: function() {
            modal.verbose('Close button pressed');
            $context.dimmer('hide');
          },
          keyboard: function(event) {
            var
              keyCode   = event.which,
              escapeKey = 27
            ;
            if(keyCode == escapeKey) {
              modal.debug('Escape key pressed hiding modal');
              $context.dimmer('hide');
              event.preventDefault();
            }
          },
          resize: function() {
            modal.cache.sizes();
            if( $modal.is(':visible') ) {
              modal.set.type();
              modal.set.position();
            }
          }
        },

        toggle: function() {
          if( modal.is.active() ) {
            modal.hide();
          }
          else {
            modal.show();
          }
        },

        show: function() {
          modal.debug('Showing modal');
          modal.set.type();
          modal.set.position();
          modal.hideAll();
          if(settings.transition && $.fn.transition !== undefined) {
            $modal
              .transition(settings.transition + ' in', settings.duration, modal.set.active)
            ;
          }
          else {
            $modal
              .fadeIn(settings.duration, settings.easing, modal.set.active)
            ;
          }
          modal.debug('Triggering dimmer');
          $context.dimmer('show');
        },

        hide: function() {
          modal.debug('Hiding modal');
          // remove keyboard detection
          $document
            .off('keyup.' + namespace)
          ;
          if(settings.transition && $.fn.transition !== undefined) {
            $modal
              .transition(settings.transition + ' out', settings.duration, modal.remove.active)
            ;
          }
          else {
            $modal
              .fadeOut(settings.duration, settings.easing, modal.remove.active)
            ;
          }
        },

        hideAll: function() {
          $otherModals
            .filter(':visible')
            .modal('hide')
          ;
        },

        add: {
          keyboardShortcuts: function() {
            modal.verbose('Adding keyboard shortcuts');
            $document
              .on('keyup' + eventNamespace, modal.event.keyboard)
            ;
          }
        },

        remove: {
          active: function() {
            $modal.removeClass(className.active);
          },
          keyboardShortcuts: function() {
            modal.verbose('Removing keyboard shortcuts');
            $document
              .off('keyup' + eventNamespace)
            ;
          }
        },

        cache: {
          sizes: function() {
            modal.cache = {
              height        : $modal.outerHeight() + settings.offset,
              contextHeight : (settings.context == 'body')
                ? $(window).height()
                : $context.height()
            };
            console.log($modal);
            modal.debug('Caching modal and container sizes', modal.cache);
          }
        },

        can: {
          fit: function() {
            return (modal.cache.height < modal.cache.contextHeight);
          }
        },

        is: {
          active: function() {
            return $modal.hasClass(className.active);
          }
        },

        set: {
          active: function() {
            $modal.addClass('active');
          },
          type: function() {
            if(modal.can.fit()) {
              modal.verbose('Modal fits on screen');
              $modal.removeClass(className.scrolling);
            }
            else {
              modal.verbose('Modal cannot fit on screen setting to scrolling');
              $modal.addClass(className.scrolling);
            }
          },
          position: function() {
            modal.verbose('Centering modal on page', modal.cache.height / 2);
            if(modal.can.fit()) {
              $modal
                .css({
                  marginTop: -(modal.cache.height / 2)
                })
              ;
            }
            else {
              $modal
                .css({
                  top: $context.prop('scrollTop')
                })
              ;
            }
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
              $.extend(true, modal, name);
            }
            else {
              modal[name] = value;
            }
          }
          else {
            return modal[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              modal.performance.log(arguments);
            }
            else {
              modal.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              modal.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              modal.performance.log(arguments);
            }
            else {
              modal.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              modal.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          modal.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          modal.error.apply(console, arguments);
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
            clearTimeout(modal.performance.timer);
            modal.performance.timer = setTimeout(modal.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(modal.performance.timer);
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
                modal.error(error.method);
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
          modal.initialize();
        }
        invokedResponse = modal.invoke(query);
      }
      else {
        if(instance !== undefined) {
          modal.destroy();
        }
        modal.initialize();
      }
    })
  ;

  return (invokedResponse !== undefined)
    ? invokedResponse
    : this
  ;
};

$.fn.modal.settings = {

  name        : 'Modal',
  namespace   : 'modal',
  verbose     : true,
  debug       : true,
  performance : true,

  offset      : 0,
  transition  : 'scale',
  duration    : 500,
  easing      : 'easeOutExpo',

  closable    : true,
  context     : 'body',

  onShow      : function(){},
  onHide      : function(){},

  selector    : {
    closeButton : '.close, .actions .button',
    dimmer: '.ui.dimmer'
  },
  error : {
    method : 'The method you called is not defined.'
  },
  className : {
    scrolling : 'scrolling'
  },
};


})( jQuery, window , document );
/*  ******************************
  Nag
  Author: Jack Lukic
  Notes: First Commit July 19, 2012

  Simple fixed position nag
******************************  */

;(function ($, window, document, undefined) {

$.fn.nag = function(parameters) {
  var
    $allModules     = $(this),
    settings        = $.extend(true, {}, $.fn.nag.settings, parameters),

    className       = settings.className,
    selector        = settings.selector,
    error           = settings.error,
    namespace       = settings.namespace,

    eventNamespace  = '.' + namespace,
    moduleNamespace = namespace + '-module',
    moduleSelector  = $allModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),
    invokedResponse
  ;
  $(this)
    .each(function() {
      var
        $module         = $(this),

        $close          = $module.find(selector.close),
        $context        = $(settings.context),


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
          // calculate module offset once
          moduleOffset  = $module.offset();
          moduleHeight  = $module.outerHeight();
          contextWidth  = $context.outerWidth();
          contextHeight = $context.outerHeight();
          contextOffset = $context.offset();

          $module
            .data(moduleNamespace, module)
          ;
          $close
            .on('click' + eventNamespace, module.dismiss)
          ;
          // lets avoid javascript if we dont need to reposition
          if(settings.context == window && settings.position == 'fixed') {
            $module
              .addClass(className.fixed)
            ;
          }
          if(settings.sticky) {
            module.verbose('Adding scroll events');
            // retrigger on scroll for absolute
            if(settings.position == 'absolute') {
              $context
                .on('scroll' + eventNamespace, module.event.scroll)
                .on('resize' + eventNamespace, module.event.scroll)
              ;
            }
            // fixed is always relative to window
            else {
              $(window)
                .on('scroll' + eventNamespace, module.event.scroll)
                .on('resize' + eventNamespace, module.event.scroll)
              ;
            }
            // fire once to position on init
            $.proxy(module.event.scroll, this)();
          }

          if(settings.displayTime > 0) {
            setTimeout(module.hide, settings.displayTime);
          }
          if(module.should.show()) {
            if( !$module.is(':visible') ) {
              module.show();
            }
          }
          else {
            module.hide();
          }
        },

        destroy: function() {
          module.verbose('Destroying instance');
          $module
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
          if(settings.sticky) {
            $context
              .off(eventNamespace)
            ;
          }
        },

        refresh: function() {
          module.debug('Refreshing cached calculations');
          moduleOffset  = $module.offset();
          moduleHeight  = $module.outerHeight();
          contextWidth  = $context.outerWidth();
          contextHeight = $context.outerHeight();
          contextOffset = $context.offset();
        },

        show: function() {
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

        stick: function() {
          module.refresh();

          if(settings.position == 'fixed') {
            var
              windowScroll = $(window).prop('pageYOffset') || $(window).scrollTop(),
              fixedOffset = ( $module.hasClass(className.bottom) )
                ? contextOffset.top + (contextHeight - moduleHeight) - windowScroll
                : contextOffset.top - windowScroll
            ;
            $module
              .css({
                position : 'fixed',
                top      : fixedOffset,
                left     : contextOffset.left,
                width    : contextWidth - settings.scrollBarWidth
              })
            ;
          }
          else {
            $module
              .css({
                top : yPosition
              })
            ;
          }
        },
        unStick: function() {
          $module
            .css({
              top : ''
            })
          ;
        },
        dismiss: function(event) {
          if(settings.storageMethod) {
            module.storage.set(settings.storedKey, settings.storedValue);
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
            if(module.storage.get(settings.storedKey) != settings.storedValue) {
              module.debug('Stored value is not set, can show nag', module.storage.get(settings.storedKey));
              return true;
            }
            module.debug('Stored value is set, cannot show nag', module.storage.get(settings.storedKey));
            return false;
          },
          stick: function() {
            yOffset   = $context.prop('pageYOffset') || $context.scrollTop();
            yPosition = ( $module.hasClass(className.bottom) )
              ? (contextHeight - $module.outerHeight() ) + yOffset
              : yOffset
            ;
            // absolute position calculated when y offset met
            if(yPosition > moduleOffset.top) {
              return true;
            }
            else if(settings.position == 'fixed') {
              return true;
            }
            return false;
          }
        },

        storage: {

          set: function(key, value) {
            module.debug('Setting stored value', key, value, settings.storageMethod);
            if(settings.storageMethod == 'local' && window.store !== undefined) {
              window.store.set(key, value);
            }
            // store by cookie
            else if($.cookie !== undefined) {
              $.cookie(key, value);
            }
            else {
              module.error(error.noStorage);
            }
          },
          get: function(key) {
            module.debug('Getting stored value', key, settings.storageMethod);
            if(settings.storageMethod == 'local' && window.store !== undefined) {
              return window.store.get(key);
            }
            // get by cookie
            else if($.cookie !== undefined) {
              return $.cookie(key);
            }
            else {
              module.error(error.noStorage);
            }
          }

        },

        event: {
          scroll: function() {
            if(timer !== undefined) {
              clearTimeout(timer);
            }
            timer = setTimeout(function() {
              if(module.should.stick() ) {
                requestAnimationFrame(module.stick);
              }
              else {
                module.unStick();
              }
            }, settings.lag);
          }
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

$.fn.nag.settings = {

  name      : 'Nag',

  verbose         : true,
  debug           : true,
  performance     : true,

  namespace       : 'Nag',

  // allows cookie to be overriden
  persist        : false,

  // set to zero to manually dismiss, otherwise hides on its own
  displayTime    : 0,

  animation   : {
    show: 'slide',
    hide: 'slide'
  },

  // method of stickyness
  position       : 'fixed',
  scrollBarWidth : 18,

  // type of storage to use
  storageMethod  : 'cookie',

  // value to store in dismissed localstorage/cookie
  storedKey      : 'nag',
  storedValue    : 'dismiss',

  // need to calculate stickyness on scroll
  sticky         : false,

  // how often to check scroll event
  lag            : 0,

  // context for scroll event
  context        : window,

  error: {
    noStorage  : 'Neither $.cookie or store is defined. A storage solution is required for storing state',
    method    : 'The method you called is not defined.'
  },

  className     : {
    bottom      : 'bottom',
    fixed       : 'fixed'
  },

  selector      : {
    close: '.icon.close'
  },

  speed         : 500,
  easing        : 'easeOutQuad',

  onHide: function() {}

};

})( jQuery, window , document );

/*  ******************************
  Semantic Module: Popup
  Author: Jack Lukic
  Notes: May 30, 2013

  Simple plug-in to display popups

******************************  */

;(function ($, window, document, undefined) {

$.fn.popup = function(parameters) {
  var
    $allModules     = $(this),

    settings        = ( $.isPlainObject(parameters) )
      ? $.extend(true, {}, $.fn.popup.settings, parameters)
      : $.fn.popup.settings,

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
        $module         = $(this),

        $window         = $(window),
        $offsetParent   = $module.offsetParent(),
        $popup          = (settings.inline)
          ? $module.next(settings.selector.popup)
          : $window.children(settings.selector.popup).last(),

        searchDepth     = 0,

        eventNamespace  = '.' + settings.namespace,
        moduleNamespace = settings.namespace + '-module',

        selector        = settings.selector,
        className       = settings.className,
        error           = settings.error,
        metadata        = settings.metadata,
        namespace       = settings.namespace,

        element         = this,
        instance        = $module.data(moduleNamespace),
        module
      ;

      module = {

        // binds events
        initialize: function() {
          module.debug('Initializing module', $module);
          if(settings.on == 'hover') {
            $module
              .on('mouseenter' + eventNamespace, module.event.mouseenter)
              .on('mouseleave' + eventNamespace, module.event.mouseleave)
            ;
          }
          else {
            $module
              .on(settings.on + '' + eventNamespace, module.event[settings.on])
            ;
          }
          $window
            .on('resize' + eventNamespace, module.event.resize)
          ;
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
          $popup        = (settings.inline)
            ? $module.next(selector.popup)
            : $window.children(selector.popup).last()
          ;
          $offsetParent = $module.offsetParent();
        },

        destroy: function() {
          module.debug('Destroying previous module');
          $module
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        event: {
          mouseenter:  function(event) {
            var element = this;
            module.timer = setTimeout(function() {
              $.proxy(module.toggle, element)();
              if( $(element).hasClass(className.visible) ) {
                event.stopPropagation();
              }
            }, settings.delay);
          },
          mouseleave:  function() {
            clearTimeout(module.timer);
            if( $module.is(':visible') ) {
              module.hide();
            }
          },
          click: function(event) {
            $.proxy(module.toggle, this)();
            if( $(this).hasClass(className.visible) ) {
              event.stopPropagation();
            }
          },
          resize: function() {
            if( $popup.is(':visible') ) {
              module.position();
            }
          }
        },

        // generates popup html from metadata
        create: function() {
          module.debug('Creating pop-up html');
          var
            html      = $module.data(metadata.html)      || settings.html,
            variation = $module.data(metadata.variation) || settings.variation,
            title     = $module.data(metadata.title)     || settings.title,
            content   = $module.data(metadata.content)   || $module.attr('title') || settings.content
          ;
          if(html || content || title) {
            if(!html) {
              html = settings.template({
                title   : title,
                content : content
              });
            }
            $popup = $('<div/>')
              .addClass(className.popup)
              .addClass(variation)
              .html(html)
            ;
            if(settings.inline) {
              module.verbose('Inserting popup element inline');
              $popup
                .insertAfter($module)
              ;
            }
            else {
              module.verbose('Appending popup element to body');
              $popup
                .appendTo( $('body') )
              ;
            }
            $.proxy(settings.onInit, $popup)();
          }
          else {
            module.error(error.content);
          }
        },

        remove: function() {
          module.debug('Removing popup');
          $popup
            .remove()
          ;
        },

        get: {
          offstagePosition: function() {
            var
              boundary  = {
                top    : $(window).scrollTop(),
                bottom : $(window).scrollTop() + $(window).height(),
                left   : 0,
                right  : $(window).width()
              },
              popup     = {
                width    : $popup.width(),
                height   : $popup.outerHeight(),
                position : $popup.offset()
              },
              offstage  = {},
              offstagePositions = []
            ;
            if(popup.position) {
              offstage = {
                top    : (popup.position.top < boundary.top),
                bottom : (popup.position.top + popup.height > boundary.bottom),
                right  : (popup.position.left + popup.width > boundary.right),
                left   : (popup.position.left < boundary.left)
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

        // determines popup state
        toggle: function() {
          $module = $(this);
          module.debug('Toggling pop-up');
          // refresh state of module
          module.refresh();
          if( !$module.hasClass(className.visible) ) {
            module.hideAll();
            module.show();
          }
          else {
            module.hide();
          }
        },

        position: function(position, arrowOffset) {
          var
            windowWidth  = $(window).width(),
            windowHeight = $(window).height(),
            width        = $module.outerWidth(),
            height       = $module.outerHeight(),
            popupWidth   = $popup.width(),
            popupHeight  = $popup.outerHeight(),

            offset       = (settings.inline)
              ? $module.position()
              : $module.offset(),
            parentWidth  = (settings.inline)
              ? $offsetParent.outerWidth()
              : $window.outerWidth(),
            parentHeight = (settings.inline)
              ? $offsetParent.outerHeight()
              : $window.outerHeight(),

            positioning,
            offstagePosition
          ;
          position    = position    || $module.data(metadata.position)    || settings.position;
          arrowOffset = arrowOffset || $module.data(metadata.arrowOffset) || settings.arrowOffset;
          module.debug('Calculating offset for position', position);
          switch(position) {
            case 'top left':
              positioning = {
                top    : 'auto',
                bottom :  parentHeight - offset.top + settings.distanceAway,
                left   : offset.left + arrowOffset
              };
            break;
            case 'top center':
              positioning = {
                bottom :  parentHeight - offset.top + settings.distanceAway,
                left   : offset.left + (width / 2) - (popupWidth / 2) + arrowOffset,
                top    : 'auto',
                right  : 'auto'
              };
            break;
            case 'top right':
              positioning = {
                bottom :  parentHeight - offset.top + settings.distanceAway,
                right  :  parentWidth - offset.left - width - arrowOffset,
                top    : 'auto',
                left   : 'auto'
              };
            break;
            case 'left center':
              positioning = {
                top    :  offset.top + (height / 2) - (popupHeight / 2),
                right  : parentWidth - offset.left + settings.distanceAway - arrowOffset,
                left   : 'auto',
                bottom : 'auto'
              };
            break;
            case 'right center':
              positioning = {
                top    :  offset.top + (height / 2) - (popupHeight / 2),
                left   : offset.left + width + settings.distanceAway + arrowOffset,
                bottom : 'auto',
                right  : 'auto'
              };
            break;
            case 'bottom left':
              positioning = {
                top    :  offset.top + height + settings.distanceAway,
                left   : offset.left + arrowOffset,
                bottom : 'auto',
                right  : 'auto'
              };
            break;
            case 'bottom center':
              positioning = {
                top    :  offset.top + height + settings.distanceAway,
                left   : offset.left + (width / 2) - (popupWidth / 2) + arrowOffset,
                bottom : 'auto',
                right  : 'auto'
              };
            break;
            case 'bottom right':
              positioning = {
                top    :  offset.top + height + settings.distanceAway,
                right  : parentWidth - offset.left - width - arrowOffset,
                left   : 'auto',
                bottom : 'auto'
              };
            break;
          }
          // true width on popup, avoid rounding error
          $.extend(positioning, {
            width: $popup.width() + 1
          });
          // tentatively place on stage
          $popup
            .removeAttr('style')
            .removeClass('top right bottom left center')
            .css(positioning)
            .addClass(position)
            .addClass(className.loading)
          ;
          // check if is offstage
          offstagePosition = module.get.offstagePosition();
          // recursively find new positioning
          if(offstagePosition) {
            module.debug('Element is outside boundaries ', offstagePosition);
            if(searchDepth < settings.maxSearchDepth) {
              position = module.get.nextPosition(position);
              searchDepth++;
              module.debug('Trying new position: ', position);
              return module.position(position);
            }
            else {
              module.error(error.recursion);
              searchDepth = 0;
              return false;
            }
          }
          else {
            module.debug('Position is on stage', position);
            searchDepth = 0;
            return true;
          }
        },

        show: function() {
          module.debug('Showing pop-up', settings.transition);
          if($popup.size() === 0) {
            module.create();
          }
          module.position();
          $module
            .addClass(className.visible)
          ;
          $popup
            .removeClass(className.loading)
          ;
          if(settings.transition && $.fn.transition !== undefined) {
            $popup
              .transition(settings.transition + ' in', settings.duration)
            ;
          }
          else {
            $popup
              .stop()
              .fadeIn(settings.duration, settings.easing)
            ;
          }
          if(settings.on == 'click' && settings.clicktoClose) {
            module.debug('Binding popup close event');
            $(document)
              .on('click.' + namespace, module.gracefully.hide)
            ;
          }
          $.proxy(settings.onShow, $popup)();
        },

        hideAll: function() {
          $(selector.popup)
            .filter(':visible')
              .popup('hide')
          ;
        },

        hide: function() {
          $module
            .removeClass(className.visible)
          ;
          if($popup.is(':visible') ) {
            module.debug('Hiding pop-up');
            if(settings.transition && $.fn.transition !== undefined) {
              $popup
                .transition(settings.transition + ' out', settings.duration)
              ;
            }
            else {
              $popup
                .stop()
                .fadeOut(settings.duration, settings.easing)
              ;
            }
          }
          if(settings.on == 'click' && settings.clicktoClose) {
            $(document)
              .off('click.' + namespace)
            ;
          }
          $.proxy(settings.onHide, $popup)();
          if(!settings.inline) {
            module.remove();
          }
        },

        gracefully: {
          hide: function(event) {
            // don't close on clicks inside popup
            if( $(event.target).closest(selector.popup).size() === 0) {
              module.hide();
            }
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
              if($allModules.size() > 1) {
              title += ' ' + '(' + $allModules.size() + ')';
            }
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

$.fn.popup.settings = {

  name     : 'Popup',
  debug          : true,
  verbose        : true,
  performance    : true,
  namespace      : 'popup',

  onInit         : function(){},
  onShow         : function(){},
  onHide         : function(){},

  variation      : '',
  content        : false,
  html           : false,
  title          : false,

  on             : 'hover',
  clicktoClose   : true,

  position       : 'top center',
  delay          : 150,
  inline         : true,

  duration       : 150,
  easing         : 'easeOutQuint',
  transition     : 'scale',

  distanceAway   : 0,
  arrowOffset    : 0,
  maxSearchDepth : 10,

  error: {
    content   : 'Your popup has no content specified',
    method    : 'The method you called is not defined.',
    recursion : 'Popup attempted to reposition element to fit, but could not find an adequate position.'
  },

  metadata: {
    arrowOffset : 'arrowOffset',
    content     : 'content',
    html        : 'html',
    position    : 'position',
    title       : 'title',
    variation   : 'variation'
  },

  className   : {
    popup       : 'ui popup',
    visible     : 'visible',
    loading     : 'loading'
  },

  selector    : {
    popup    : '.ui.popup'
  },

  template: function(text) {
    var html = '';
    if(typeof text !== undefined) {
      if(typeof text.title !== undefined && text.title) {
        html += '<div class="header">' + text.title + '</div class="header">';
      }
      if(typeof text.content !== undefined && text.content) {
        html += '<div class="content">' + text.content + '</div>';
      }
    }
    return html;
  }

};

})( jQuery, window , document );

/*  ******************************
  Star Review
  Author: Jack Lukic
  Notes: First Commit Sep 04, 2012

  Simple rating module
******************************  */

;(function ($, window, document, undefined) {

$.fn.rating = function(parameters) {
  var
    $allModules     = $(this),
    moduleSelector  = $allModules.selector || '',

    settings        = $.extend(true, {}, $.fn.rating.settings, parameters),

    namespace       = settings.namespace,
    className       = settings.className,
    metadata        = settings.metadata,
    selector        = settings.selector,
    error           = settings.error,

    eventNamespace  = '.' + namespace,
    moduleNamespace = 'module-' + namespace,

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
        $icon    = $module.find(selector.icon),

        element  = this,
        instance = $module.data(moduleNamespace),
        module
      ;

      module = {

        initialize: function() {
          module.verbose('Initializing rating module');
          if(settings.interactive) {
            $icon
              .bind('mouseenter' + eventNamespace, module.event.mouseenter)
              .bind('mouseleave' + eventNamespace, module.event.mouseleave)
              .bind('click' + eventNamespace, module.event.click)
            ;
          }
          if(settings.initialRating) {
            module.debug('Setting initial rating');
            module.setRating(settings.initialRating);
          }
          if( $module.data(metadata.rating) ) {
            module.debug('Rating found in metadata');
            module.setRating( $module.data(metadata.rating) );
          }
          $module
            .addClass(className.active)
          ;
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Instantiating module', settings);
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          $module
            .removeData(moduleNamespace)
          ;
          $icon
            .off(eventNamespace)
          ;
        },

        setRating: function(rating) {
          var
            $activeIcon = $icon.eq(rating - 1)
          ;
          module.verbose('Setting current rating to', rating);
          $module
            .removeClass(className.hover)
          ;
          $icon
            .removeClass(className.hover)
          ;
          $activeIcon
            .nextAll()
              .removeClass(className.active)
          ;
          $activeIcon
            .addClass(className.active)
              .prevAll()
              .addClass(className.active)
          ;
          $.proxy(settings.onRate, element)();
        },

        event: {
          mouseenter: function() {
            var
              $activeIcon = $(this)
            ;
            $activeIcon
              .nextAll()
                .removeClass(className.hover)
            ;
            $module
              .addClass(className.hover)
            ;
            $activeIcon
              .addClass(className.hover)
                .prevAll()
                .addClass(className.hover)
            ;
          },
          mouseleave: function() {
            $module
              .removeClass(className.hover)
            ;
            $icon
              .removeClass(className.hover)
            ;
          },
          click: function() {
            var
              $activeIcon = $(this)
            ;
            module.setRating( $icon.index($activeIcon) + 1);
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

$.fn.rating.settings = {

  name          : 'Rating',
  namespace     : 'rating',

  verbose     : true,
  debug       : true,
  performance : true,

  initialRating : 0,
  interactive   : true,
  onRate        : function(){},

  error       : {
    method : 'The method you called is not defined'
  },

  metadata: {
    rating: 'rating'
  },

  className : {
    active  : 'active',
    hover   : 'hover',
    loading : 'loading'
  },

  selector  : {
    icon : '.icon'
  }

};

})( jQuery, window , document );

/*  ******************************
  Search Prompt
  Author: Jack Lukic

  Designed to be used as an autocomplete
  or to deliver quick inline search results
******************************  */

;(function ($, window, document, undefined) {

$.fn.search = function(source, parameters) {
  var
    $allModules     = $(this),
    settings        = $.extend(true, {}, $.fn.search.settings, parameters),


    className       = settings.className,
    selector        = settings.selector,
    error           = settings.error,
    namespace       = settings.namespace,

    eventNamespace  = '.' + namespace,
    moduleNamespace = namespace + '-module',
    moduleSelector  = $allModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),
    invokedResponse
  ;
  $(this)
    .each(function() {
      var
        $module       = $(this),
        $prompt       = $module.find(selector.prompt),
        $searchButton = $module.find(selector.searchButton),
        $results      = $module.find(selector.results),
        $result       = $module.find(selector.result),
        $category     = $module.find(selector.category),

        element       = this,
        instance      = $module.data(moduleNamespace),

        module
      ;
      module = {

        initialize: function() {
          module.verbose('Initializing module');
          var
            prompt = $prompt[0],
            inputEvent   = (prompt.oninput !== undefined)
              ? 'input'
              : (prompt.onpropertychange !== undefined)
                ? 'propertychange'
                : 'keyup'
          ;
          // attach events
          $prompt
            .on('focus' + eventNamespace, module.event.focus)
            .on('blur' + eventNamespace, module.event.blur)
            .on('keydown' + eventNamespace, module.handleKeyboard)
          ;
          if(settings.automatic) {
            $prompt
              .on(inputEvent + eventNamespace, module.search.throttle)
            ;
          }
          $searchButton
            .on('click' + eventNamespace, module.search.query)
          ;
          $results
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
        },
        event: {
          focus: function() {
            $module
              .addClass(className.focus)
            ;
            module.results.show();
          },
          blur: function() {
            module.search.cancel();
            $module
              .removeClass(className.focus)
            ;
            module.results.hide();
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
              if( $result.filter('.' + activeClass).exists() ) {
                $.proxy(module.results.select, $result.filter('.' + activeClass) )();
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
            var
              searchTerm    = $prompt.val(),
              numCharacters = searchTerm.length
            ;
            clearTimeout(module.timer);
            if(numCharacters >= settings.minCharacters)  {
              module.timer = setTimeout(module.search.query, settings.searchThrottle);
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
              if(typeof source == 'object') {
                module.search.local(searchTerm);
              }
              else {
                module.search.remote(searchTerm);
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
              $.each(source, function(label, thing) {
                if(typeof thing[field] == 'string' && ($.inArray(thing, results) == -1) && ($.inArray(thing, fullTextResults) == -1) ) {
                  if( searchRegExp.test( thing[field] ) ) {
                    results.push(thing);
                  }
                  else if( fullTextRegExp.test( thing[field] ) ) {
                    fullTextResults.push(thing);
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
                stateContext  : $module,
                url           : source,
                urlData: { query: searchTerm },
                success       : function(response) {
                  searchHTML = module.results.generate(response);
                  module.search.cache.write(searchTerm, searchHTML);
                  module.results.add(searchHTML);
                },
                failure      : module.error
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
                response.results = $.makeArray(response.results).slice(0, settings.maxResults);
              }
              if(response.results.length > 0) {
                if($.isFunction(template)) {
                  html = template(response);
                }
                else {
                  module.error(error.noTemplate, false);
                }
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
              $results
                .stop()
                .fadeIn(200)
              ;
              $.proxy(settings.onResultsOpen, $results)();
            }
          },
          hide: function() {
            if($results.filter(':visible').size() > 0) {
              $results
                .stop()
                .fadeOut(200)
              ;
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
                href   = $link.attr('href') || false,
                target = $link.attr('target') || false
              ;
              module.results.hide();
              $prompt
                .val(title)
              ;
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

$.fn.search.settings = {

  name     : 'Search Module',
  namespace      : 'search',

  debug          : true,
  verbose        : true,
  performance    : true,

  // onSelect default action is defined in module
  onSelect       : 'default',
  onResultsAdd   : 'default',

  onSearchQuery  : function(){},
  onResults      : function(response){},

  onResultsOpen  : function(){},
  onResultsClose : function(){},

  automatic      : 'true',
  type           : 'simple',
  minCharacters  : 3,
  searchThrottle : 300,
  maxResults     : 7,
  cache          : true,

  searchFields    : [
    'title',
    'description'
  ],

  // api config
  apiSettings: {

  },

  className: {
    active  : 'active',
    down    : 'down',
    focus   : 'focus',
    empty   : 'empty',
    loading : 'loading'
  },

  error : {
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
    result       : '.result'
  },

  templates: {
    message: function(message, type) {
      var
        html = ''
      ;
      if(message !== undefined && type !== undefined) {
        html +=  ''
          + '<div class="message ' + type +'">'
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
    categories: function(response) {
      var
        html = ''
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
              html  += '<a href="' + result.url + '"></a>';
              if(result.image !== undefined) {
                html+= ''
                  + '<div class="image">'
                  + ' <img src="' + result.image + '">'
                  + '</div>'
                ;
              }
              html += '<div class="info">';
              if(result.price !== undefined) {
                html+= '<div class="price">' + result.price + '</div>';
              }
              if(result.title !== undefined) {
                html+= '<div class="title">' + result.title + '</div>';
              }
              if(result.description !== undefined) {
                html+= '<div class="description">' + result.description + '</div>';
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
        if(response.resultPage) {
          html += ''
          + '<a href="' + response.resultPage.url + '" class="all">'
          +   response.resultPage.text
          + '</a>';
        }
        return html;
      }
      return false;
    },
    simple: function(response) {
      var
        html = ''
      ;
      if(response.results !== undefined) {

        // each result
        $.each(response.results, function(index, result) {
          html  += '<a class="result" href="' + result.url + '">';
          if(result.image !== undefined) {
            html+= ''
              + '<div class="image">'
              + ' <img src="' + result.image + '">'
              + '</div>'
            ;
          }
          html += '<div class="info">';
          if(result.price !== undefined) {
            html+= '<div class="price">' + result.price + '</div>';
          }
          if(result.title !== undefined) {
            html+= '<div class="title">' + result.title + '</div>';
          }
          if(result.description !== undefined) {
            html+= '<div class="description">' + result.description + '</div>';
          }
          html  += ''
            + '</div>'
            + '</a>'
          ;
        });

        if(response.resultPage) {
          html += ''
          + '<a href="' + response.resultPage.url + '" class="all">'
          +   response.resultPage.text
          + '</a>';
        }
        return html;
      }
      return false;
    }
  }
};

})( jQuery, window , document );
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
        $sides        = $module.find(selector.sides),
        $side         = $module.find(selector.side),

        // private variables
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
          if(settings.useCSS) {
            if(module.get.transitionEvent()) {
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
                .one(module.get.transitionEvent(), callback)
              ;
            }
            else {
              callback();
            }
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
            .removeClass(className.css)
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
          animating: function() {
            return $module.hasClass(className.animating);
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

        set: {

          defaultSide: function() {
            $activeSide = $module.find('.' + settings.className.active);
            $nextSide   = ( $activeSide.next(selector.side).size() > 0 )
              ? $activeSide.next(selector.side)
              : $module.find(selector.side).first()
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
            $.proxy(settings.onChange, $nextSide)();
            module.set.defaultSide();
          }
        },

        flip: {

          up: function() {
            module.debug('Flipping up', $nextSide);
            if( !module.is.animating() ) {
              module.stage.above();
              module.animate( module.get.transform.up() );
            }
            else {
              module.queue('flip up');
            }
          },

          down: function() {
            module.debug('Flipping down', $nextSide);
            if( !module.is.animating() ) {
              module.stage.below();
              module.animate( module.get.transform.down() );
            }
            else {
              module.queue('flip down');
            }
          },

          left: function() {
            module.debug('Flipping left', $nextSide);
            if( !module.is.animating() ) {
              module.stage.left();
              module.animate(module.get.transform.left() );
            }
            else {
              module.queue('flip left');
            }
          },

          right: function() {
            module.debug('Flipping right', $nextSide);
            if( !module.is.animating() ) {
              module.stage.right();
              module.animate(module.get.transform.right() );
            }
            else {
              module.queue('flip right');
            }
          },

          over: function() {
            module.debug('Flipping over', $nextSide);
            if( !module.is.animating() ) {
              module.stage.behind();
              module.animate(module.get.transform.over() );
            }
            else {
              module.queue('flip over');
            }
          },

          back: function() {
            module.debug('Flipping back', $nextSide);
            if( !module.is.animating() ) {
              module.stage.behind();
              module.animate(module.get.transform.back() );
            }
            else {
              module.queue('flip back');
            }
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
                .off(eventNamespace)
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
            if(!settings.overlay) {
              module.pushPage();
            }
            module.set.active();
          }
          else {
            module.debug('Sidebar is already visible');
          }
        },

        hide: function() {
          if(module.is.open()) {
            if(!settings.overlay) {
              module.pullPage();
              module.remove.pushed();
            }
            module.remove.active();
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

        pushPage: function() {
          var
            direction = module.get.direction(),
            distance  = (module.is.vertical())
              ? $module.outerHeight()
              : $module.outerWidth()
          ;
          if(settings.useCSS) {
            module.debug('Using CSS to animate body');
            module.add.bodyCSS(direction, distance);
            module.set.pushed();
          }
          else {
            module.animatePage(direction, distance, module.set.pushed);
          }
        },

        pullPage: function() {
          var
            direction = module.get.direction()
          ;
          if(settings.useCSS) {
            module.debug('Resetting body position css');
            module.remove.bodyCSS();
          }
          else {
            module.debug('Resetting body position using javascript');
            module.animatePage(direction, 0);
          }
          module.remove.pushed();
        },

        animatePage: function(direction, distance) {
          var
            animateSettings = {}
          ;
          animateSettings['padding-' + direction] = distance;
          module.debug('Using javascript to animate body', animateSettings);
          $body
            .animate(animateSettings, settings.duration, module.set.pushed)
          ;
        },

        add: {
          bodyCSS: function(direction, distance) {
            var
              style
            ;
            if(direction !== className.bottom) {
              style = ''
                + '<style title="' + namespace + '">'
                + 'body.pushed {'
                + '  margin-' + direction + ': ' + distance + 'px !important;'
                + '}'
                + '</style>'
              ;
            }
            $head.append(style);
            module.debug('Adding body css to head', $style);
          }
        },

        remove: {
          bodyCSS: function() {
            module.debug('Removing body css styles', $style);
            module.refresh();
            $style.remove();
          },
          active: function() {
            $module.removeClass(className.active);
          },
          pushed: function() {
            module.verbose('Removing body push state', module.get.direction());
            $body
              .removeClass(className[ module.get.direction() ])
              .removeClass(className.pushed)
            ;
          }
        },

        set: {
          active: function() {
            $module.addClass(className.active);
          },
          pushed: function() {
            module.verbose('Adding body push state', module.get.direction());
            $body
              .addClass(className[ module.get.direction() ])
              .addClass(className.pushed)
            ;
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
            else {
              return className.left;
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

  name   : 'Sidebar',
  namespace    : 'sidebar',

  verbose      : true,
  debug        : true,
  performance  : true,

  useCSS       : true,
  overlay      : false,
  duration     : 300,

  side         : 'left',

  onChange     : function(){},
  onShow       : function(){},
  onHide       : function(){},

  className: {
    active : 'active',
    pushed : 'pushed',
    top    : 'top',
    left   : 'left',
    right  : 'right',
    bottom : 'bottom'
  },

  error   : {
    method   : 'The method you called is not defined.',
    notFound : 'There were no elements that matched the specified selector'
  }

};

})( jQuery, window , document );
/*  ******************************
  Module - Tabs
  Author: Jack Lukic
  Notes: First Commit Aug 15, 2012

  History based tab navigation
******************************  */

;(function ($, window, document, undefined) {

  $.fn.tab = function(parameters) {

    var
      settings        = $.extend(true, {}, $.fn.tab.settings, parameters),

      $module         = $(this),
      $tabs           = $(settings.context).find(settings.selector.tabs),

      moduleSelector  = $module.selector || '',

      cache           = {},
      firstLoad       = true,
      recursionDepth  = 0,

      activeTabPath,
      parameterArray,
      historyEvent,

      element         = this,
      time            = new Date().getTime(),
      performance     = [],

      className       = settings.className,
      metadata        = settings.metadata,
      error           = settings.error,

      eventNamespace  = '.' + settings.namespace,
      moduleNamespace = settings.namespace + '-module',

      instance        = $module.data(moduleNamespace),

      query           = arguments[0],
      methodInvoked   = (instance !== undefined && typeof query == 'string'),
      queryArguments  = [].slice.call(arguments, 1),

      module,
      invokedResponse
    ;

    module = {

      initialize: function() {
        module.debug('Initializing Tabs', $module);
        // attach history events
        if(settings.history) {
          if( $.address === undefined ) {
            module.error(error.state);
            return false;
          }
          else if(settings.path === false) {
            module.error(error.path);
            return false;
          }
          else {
            if(settings.auto) {
              settings.apiSettings = {
                url: settings.path + '/{$tab}'
              };
            }
            module.verbose('Address library found adding state change event');
            $.address
              .state(settings.path)
              .unbind('change')
              .bind('change', module.event.history.change)
            ;
          }
        }
        // attach events if navigation wasn't set to window
        if( !$.isWindow( element ) ) {
          $module
            .on('click' + eventNamespace, module.event.click)
          ;
        }
        module.instantiate();
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
          .off(eventNamespace)
        ;
      },

      event: {
        click: function() {
          module.debug('Navigation clicked');
          var
            tabPath = $(this).data(metadata.tab)
          ;
          if(tabPath !== undefined) {
            if(settings.history) {
              $.address.value(tabPath);
            }
            else {
              module.changeTab(tabPath);
            }
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

      changeTab: function(tabPath) {
        var
          pushStateAvailable = (window.history && window.history.pushState),
          shouldIgnoreLoad   = (pushStateAvailable && settings.ignoreFirstLoad && firstLoad),
          remoteContent      = (settings.auto || $.isPlainObject(settings.apiSettings) ),
          // only get default path if not remote content
          pathArray = (remoteContent && !shouldIgnoreLoad)
            ? module.utilities.pathToArray(tabPath)
            : module.get.defaultPathArray(tabPath),
          tabPath   = module.utilities.arrayToPath(pathArray)
        ;
        module.deactivate.all();
        $.each(pathArray, function(index, tab) {
          var
            currentPathArray   = pathArray.slice(0, index + 1),
            currentPath        = module.utilities.arrayToPath(currentPathArray),

            isTab              = module.is.tab(currentPath),
            isLastIndex        = (index + 1 == pathArray.length),

            $tab               = module.get.tabElement(currentPath),
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
              $.proxy(settings.onTabLoad, $tab)(currentPath, parameterArray, historyEvent);
            }
          }
          else {
            module.error(error.missingTab, tab);
            return false;
          }
        });
      },

      content: {

        fetch: function(tabPath, fullTabPath) {
          var
            $tab             = module.get.tabElement(tabPath),
            fullTabPath      = fullTabPath || tabPath,
            cachedContent    = module.cache.read(fullTabPath),
            apiSettings      = {
              dataType     : 'html',
              stateContext : $tab,
              success      : function(response) {
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
            existingRequest = ( request && request.state() === 'pending' )
          ;
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
            module.debug('Retrieving remote content', fullTabPath);
            $.api( $.extend(true, { headers: { 'X-Remote': true } }, settings.apiSettings, apiSettings) );
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
          $tab.addClass(className.active);
        },
        navigation: function(tabPath) {
          var
            $navigation = module.get.navElement(tabPath)
          ;
          module.verbose('Activating tab navigation for', $navigation, tabPath);
          $navigation.addClass(className.active);
        }
      },

      deactivate: {
        all: function() {
          module.deactivate.navigation();
          module.deactivate.tabs();
        },
        navigation: function() {
          $module
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
          return $module.eq(0).data(metadata.tab) || $tabs.eq(0).data(metadata.tab);
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
            $defaultNav = $module.filter('[data-' + metadata.tab + '^="' + tabPath + '/"]').eq(0),
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
            module.debug('No default tabs found for', tabPath);
          }
          recursionDepth = 0;
          return tabPath;
        },
        navElement: function(tabPath) {
          tabPath = tabPath || activeTabPath;
          return $module.filter('[data-' + metadata.tab + '="' + tabPath + '"]');
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

    return (invokedResponse !== undefined)
      ? invokedResponse
      : this
    ;

  };

  // shortcut for tabbed content with no defined navigation
  $.tab = function(settings) {
    $(window).tab(settings);
  };

  $.fn.tab.settings = {

    name        : 'Tab',
    verbose     : true,
    debug       : true,
    performance : true,
    namespace   : 'tab',

    // only called first time a tab's content is loaded (when remote source)
    onTabInit   : function(tabPath, parameterArray, historyEvent) {},
    // called on every load
    onTabLoad   : function(tabPath, parameterArray, historyEvent) {},

    templates   : {
      determineTitle: function(tabArray) {}
    },

    // uses pjax style endpoints fetching content from same url with remote-content headers
    auto            : false,

    history         : false,
    path            : false,

    context         : 'body',

    // max depth a tab can be nested
    maxDepth        : 25,
    // dont load content on first load
    ignoreFirstLoad : true,
    // load tab content new every tab click
    alwaysRefresh   : false,
    // cache the content requests to pull locally
    cache           : true,
    // settings for api call
    apiSettings     : false,

    error: {
      api        : 'You attempted to load content without API module',
      noContent  : 'The tab you specified is missing a content url.',
      method     : 'The method you called is not defined',
      state      : 'The state library has not been initialized',
      missingTab : 'Tab cannot be found',
      path       : 'History enabled, but no path was specified',
      recursion  : 'Max recursive depth reached'
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
      tabs : '.tab'
    }

  };

})( jQuery, window , document );

/*  ******************************
  Semantic Module: Transition
  Author: Jack Lukic
  Notes: First Commit March 25, 2013

  A module for controlling css animations

******************************  */

;(function ( $, window, document, undefined ) {

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

    invokedResponse
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
        module
      ;

      module = {

        initialize: function() {
          // get settings
          settings        = module.get.settings.apply(element, moduleArguments);
          module.verbose('Converted arguments into settings object', settings);

          // set shortcuts
          error           = settings.error;
          className       = settings.className;
          namespace       = settings.namespace;
          metadata        = settings.metadata;
          moduleNamespace = 'module-' + namespace;

          animationEnd    = module.get.animationEvent();
          animationName   = module.get.animationName();

          instance        = $module.data(moduleNamespace);

          if(instance === undefined) {
            module.instantiate();
          }
          if(methodInvoked) {
            methodInvoked = module.invoke(query);
          }
          // no internal method was found matching query or query not made
          if(methodInvoked === false) {
            module.animate();
          }
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
          ;
        },

        animate: function(overrideSettings) {
          settings = overrideSettings || settings;
          module.debug('Preparing animation', settings.animation);
          if(module.is.animating()) {
            if(settings.queue) {
              module.queue(settings.animation);
            }
            return false;
          }
          module.save.conditions();
          module.set.duration(settings.duration);
          module.set.animating();
          module.repaint();
          $module
            .addClass(className.transition)
            .addClass(settings.animation)
            .one(animationEnd, module.complete)
          ;
          if(!module.has.direction() && module.can.transition()) {
            module.set.direction();
          }
          if(!module.can.animate()) {
            module.restore.conditions();
            module.error(error.noAnimation);
            return false;
          }
          module.show();
          module.debug('Starting tween', settings.animation, $module.attr('class'));
        },

        queue: function(animation) {
          module.debug('Queueing animation of', animation);
          instance.queuing = true;
          $module
            .one(animationEnd, function() {
              instance.queuing = false;
              module.animate.apply(this, settings);
            })
          ;
        },

        complete: function () {
          module.verbose('CSS animation complete', settings.animation);
          if(!module.is.looping()) {
            if($module.hasClass(className.outward)) {
              module.restore.conditions();
              module.hide();
            }
            else if($module.hasClass(className.inward)) {
              module.restore.conditions();
              module.show();
            }
            else {
              module.restore.conditions();
            }
            module.remove.animating();
          }
          $.proxy(settings.complete, this)();
        },

        repaint: function(fakeAssignment) {
          module.verbose('Forcing repaint event');
          fakeAssignment = element.offsetWidth;
        },

        has: {
          direction: function(animation) {
            animation = animation || settings.animation;
            if( $module.hasClass(className.inward) || $module.hasClass(className.outward) ) {
              return true;
            }
          }
        },

        set: {

          animating: function() {
            $module.addClass(className.animating);
          },

          direction: function() {
            if($module.is(':visible')) {
              module.debug('Automatically determining the direction of animation', 'Outward');
              $module
                .addClass(className.outward)
                .removeClass(className.inward)
              ;
            }
            else {
              module.debug('Automatically determining the direction of animation', 'Inward');
              $module
                .addClass(className.inward)
                .removeClass(className.outward)
              ;
            }
          },

          looping: function() {
            module.debug('Transition set to loop');
            $module
              .addClass(className.looping)
            ;
          },

          duration: function(duration) {
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
                'animation-duration': duration
              })
            ;
          }
        },

        save: {
          conditions: function() {
            module.cache = {
              className : $module.attr('class'),
              style     : $module.attr('style')
            };
            module.verbose('Saving original attributes', module.cache);
          }
        },

        restore: {
          conditions: function() {
            if(typeof module.cache === undefined) {
              module.error(error.cache);
              return false;
            }
            if(module.cache.className) {
              $module.attr('class', module.cache.className);
            }
            else {
              $module.removeAttr('class');
            }
            if(module.cache.style) {
              $module.attr('style', module.cache.style);
            }
            else {
              $module.removeAttr('style');
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

          looping: function() {
            module.debug('Transitions are no longer looping');
            $module
              .removeClass(className.looping)
            ;
            module.repaint();
          }

        },

        get: {

          settings: function(animation, duration, complete) {
            // single settings object
            if($.isPlainObject(animation)) {
              return $.extend(true, {}, $.fn.transition.settings, animation);
            }
            // all arguments provided
            else if(typeof complete == 'function') {
              return $.extend(true, {}, $.fn.transition.settings, {
                animation : animation,
                complete  : complete,
                duration  : duration
              });
            }
            // only duration provided
            else if(typeof duration == 'string' || typeof duration == 'number') {
              return $.extend(true, {}, $.fn.transition.settings, {
                animation : animation,
                duration  : duration
              });
            }
            // duration is actually settings object
            else if(typeof duration == 'object') {
              return $.extend(true, {}, $.fn.transition.settings, duration, {
                animation : animation
              });
            }
            // duration is actually callback
            else if(typeof duration == 'function') {
              return $.extend(true, {}, $.fn.transition.settings, {
                animation : animation,
                complete  : duration
              });
            }
            // only animation provided
            else {
              return $.extend(true, {}, $.fn.transition.settings, {
                animation : animation
              });
            }
            return $.fn.transition.settings;
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
                module.verbose('Determining animation vendor name property', animations[animation]);
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
                module.verbose('Determining animation vendor end event', animations[animation]);
                return animations[animation];
              }
            }
            return false;
          }

        },

        can: {
          animate: function() {
            if($module.css(animationName) !== 'none') {
              module.debug('CSS definition found');
              return true;
            }
            else {
              module.debug('Unable to find css definition');
              return false;
            }
          },
          transition: function() {
            var
              $clone           = $('<div>').addClass( $module.attr('class') ).appendTo($('body')),
              currentAnimation = $clone.css(animationName),
              inAnimation      = $clone.addClass(className.inward).css(animationName)
            ;
            if(currentAnimation != inAnimation) {
              module.debug('In/out transitions exist');
              $clone.remove();
              return true;
            }
            else {
              module.debug('Static animation found');
              $clone.remove();
              return false;
            }
          }
        },

        is: {
          animating: function() {
            return $module.hasClass(className.animating);
          },
          looping: function() {
            return $module.hasClass(className.looping);
          },
          visible: function() {
            return $module.is(':visible');
          }
        },

        hide: function() {
          module.verbose('Hiding element');
          $module
            .removeClass(className.visible)
            .addClass(className.transition)
            .addClass(className.hidden)
          ;
        },
        show: function() {
          module.verbose('Showing element');
          $module
            .removeClass(className.hidden)
            .addClass(className.transition)
            .addClass(className.visible)
          ;
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
          return found || false;
        }
      };
      module.initialize();
    })
  ;
  return (invokedResponse !== undefined)
    ? invokedResponse
    : this
  ;
};

$.fn.transition.settings = {

  // module info
  name   : 'Transition',

  // debug content outputted to console
  debug        : true,

  // verbose debug output
  verbose      : true,

  // performance data output
  performance  : true,

  // event namespace
  namespace    : 'transition',

  // animation complete event
  complete     : function() {},

  // animation duration (useful only with future js animations)
  animation    : 'fade',
  duration     : '700ms',

  // queue up animations
  queue        : true,

  className    : {
    transition : 'ui transition',
    animating  : 'animating',
    looping    : 'looping',
    loading    : 'loading',
    disabled   : 'disabled',
    hidden     : 'hidden',
    visible    : 'visible',
    inward     : 'in',
    outward    : 'out'
  },

  // possible errors
  error: {
    noAnimation : 'There is no css animation matching the one you specified.',
    method      : 'The method you called is not defined'
  }

};


})( jQuery, window , document );

/*  ******************************
  Module - Video Component
  Author: Jack Lukic
  Notes: First Commit June 30, 2012

  This is a video playlist and video embed plugin which helps
  provide helpers for adding embed code for vimeo and youtube and
  abstracting event handlers for each library

******************************  */

;(function ($, window, document, undefined) {

$.fn.video = function(parameters) {

  var
    $allModules     = $(this),

    settings        = ( $.isPlainObject(parameters) )
      ? $.extend(true, {}, $.fn.video.settings, parameters)
      : $.fn.video.settings,

    moduleSelector  = $allModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    selector        = settings.selector,
    className       = settings.className,
    error           = settings.error,
    metadata        = settings.metadata,
    namespace       = settings.namespace,

    eventNamespace  = '.' + namespace,
    moduleNamespace = namespace + '-module',

    invokedResponse
  ;

  $allModules
    .each(function() {
      var
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

        destroy: function() {
          module.verbose('Destroying previous instance of video');
          $module
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
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

        generate: {
          // generates iframe html
          html: function(source, id, url) {
            module.debug('Generating embed html');
            var
              width = (settings.width == 'auto')
                ? $module.width()
                : settings.width,
              height = (settings.height == 'auto')
                ? $module.height()
                : settings.height,
              html
            ;
            if(source && id) {
              if(source == 'vimeo') {
                html = ''
                  + '<iframe src="http://player.vimeo.com/video/' + id + '?=' + module.generate.url(source) + '"'
                  + ' width="' + width + '" height="' + height + '"'
                  + ' frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>'
                ;
              }
              else if(source == 'youtube') {
                html = ''
                  + '<iframe src="http://www.youtube.com/embed/' + id + '?=' + module.generate.url(source) + '"'
                  + ' width="' + width + '" height="' + height + '"'
                  + ' frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>'
                ;
              }
            }
            else if(url) {
              html = ''
                + '<iframe src="' + url + '"'
                + ' width="' + width + '" height="' + height + '"'
                + ' frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>'
              ;
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
              autoplay = (settings.autoplay)
                ? 1
                : 0,
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
                +      'enablejsapi=' + api
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

$.fn.video.settings = {

  name  : 'Video',
  namespace   : 'video',

  debug       : true,
  verbose     : true,
  performance : true,


  metadata    : {
    source : 'source',
    id     : 'id',
    url    : 'url'
  },

  onPlay   : function(){},
  onReset  : function(){},
  onChange : function(){},

  // callbacks not coded yet (needs to use jsapi)
  onPause  : function() {},
  onStop   : function() {},

  width    : 'auto',
  height   : 'auto',

  autoplay : false,
  color    : '#442359',
  hd       : true,
  showUI   : false,
  api      : true,

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


})( jQuery, window , document );
