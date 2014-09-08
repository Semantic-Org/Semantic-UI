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
        settings        = $.extend(true, {}, $.fn.api.settings, parameters),

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
          if(module.is.loading() && !settings.allowMultiple) {
            module.debug('Request cancelled previous request is still pending');
            return;
          }
          // pass element metadata to url (value, text)
          if(settings.defaultData) {
            $.extend(true, settings.urlData, module.get.defaultData());
          }

          // Add form content
          if(settings.serializeForm !== false || $module.is('form')) {
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
            module.debug('API url resolved to', url);
          }

          // exit conditions reached, missing url parameters
          if( !url ) {
            if($module.is('form')) {
              module.debug('No url or action specified, defaulting to form action');
              url = $module.attr('action');
            }
            else {
              module.error(error.missingURL);
              return;
            }
          }

          // add loading state
          module.set.loading();

          // look for jQuery ajax parameters in settings
          ajaxSettings = $.extend(true, {}, settings, {
            type       : settings.method || settings.type,
            data       : data,
            url        : url,
            beforeSend : settings.beforeXHR,
            success    : function() {},
            failure    : function() {},
            complete   : function() {}
          });

          module.verbose('Creating AJAX request with settings', ajaxSettings);

          // request provides a wrapper around xhr
          module.request = module.create.request();
          module.xhr = module.create.xhr();

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
              $.proxy(settings.onComplete, $context)(response, $module);
            },
            done: function(response) {
              module.debug('API request received', response);
              if(settings.dataType == 'json') {
                if( $.isFunction(settings.successTest) ) {
                  module.debug('Checking JSON', settings.successTest, response);
                  if( settings.onSuccess(response) ) {
                    $.proxy(settings.onSuccess, $context)(response, $module);
                  }
                  else {
                    module.debug('JSON test specified by user and response failed', response);
                    $.proxy(settings.onFailure, $context)(response, $module);
                  }
                }
                else {
                  $.proxy(settings.onSuccess, $context)(response, $module);
                }
              }
              else {
                $.proxy(settings.onSuccess, $context)(response, $module);
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
                      catch(er) {
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
                  $.proxy(settings.onFailure, $context)(errorMessage, $module);
                }
                else {
                  $.proxy(settings.onAbort, $context)(errorMessage, $module);
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
            if(runSettings.success !== undefined) {
              module.debug('Legacy success callback detected', runSettings);
              module.error(error.legacyParameters);
              runSettings.onSuccess = runSettings.success;
            }
            if(runSettings.failure !== undefined) {
              module.debug('Legacy failure callback detected', runSettings);
              module.error(error.legacyParameters);
              runSettings.onFailure = runSettings.failure;
            }
            if(runSettings.complete !== undefined) {
              module.debug('Legacy complete callback detected', runSettings);
              module.error(error.legacyParameters);
              runSettings.onComplete = runSettings.complete;
            }
            return runSettings;
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
            if(settings.serializeForm == 'json') {
              if($(this).toJSON === undefined ) {
                module.error(error.missingSerialize);
                return;
              }
              formData = $form.toJSON();
            }
            else {
              formData = $form.serialize();
            }
            module.debug('Retrieving form data', formData);
            return formData;
          },
          templateURL: function(action) {
            var
              url
            ;
            action = action || $module.data(settings.metadata.action) || settings.action || false;
            if(action) {
              module.debug('Looking up url for action', action);
              if(settings.api[action] !== undefined) {
                url = settings.api[action];
                module.debug('Found template url', url);
              }
              else {
                module.error(error.missingAction, settings.action);
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
            time = new Date().getTime();
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

  debug           : true,
  verbose         : true,
  performance     : true,

  // event binding
  on              : 'auto',
  filter          : '.disabled, .loading',
  context         : false,
  stateContext    : false,

  // templating
  action          : false,

  regExp  : {
    required: /\{\$*[A-z0-9]+\}/g,
    optional: /\{\/\$*[A-z0-9]+\}/g,
  },

  // data
  url             : false,
  urlData         : false,
  serializeForm   : false,

  // ui
  defaultData     : true,
  throttle        : 100,
  allowMultiple   : false,

  // state
  loadingDuration : 0,
  errorDuration   : 2000,

  // jQ ajax
  method          : 'get',
  data            : {},
  dataType        : 'json',
  cache           : true,

  // callbacks
  beforeSend  : function(settings) { return settings; },
  beforeXHR   : function(xhr) {},

  onSuccess   : function(response, $module) {},
  onComplete  : function(response, $module) {},
  onFailure   : function(errorMessage, $module) {},
  onAbort     : function(errorMessage, $module) {},

  successText : function(response) { return true; },

  // errors
  error : {
    beforeSend        : 'The before send function has aborted the request',
    error             : 'There was an error with your request',
    exitConditions    : 'API Request Aborted. Exit conditions met',
    JSONParse         : 'JSON could not be parsed during error handling',
    legacyParameters  : 'You are using legacy API success callback names',
    missingAction     : 'API action used but no url was defined',
    missingSerialize  : 'Serializing a Form requires toJSON to be included',
    missingURL        : 'No URL specified for api event',
    parseError        : 'There was an error parsing your request',
    requiredParameter : 'Missing a required URL parameter: ',
    statusMessage     : 'Server gave an error: ',
    timeout           : 'Your request timed out'
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
    settings        = $.extend(true, {}, $.fn.state.settings, parameters),

    moduleSelector  = $allModules.selector || '',

    hasTouch        = ('ontouchstart' in document.documentElement),
    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    // shortcuts
    error           = settings.error,
    metadata        = settings.metadata,
    className       = settings.className,
    namespace       = settings.namespace,
    states          = settings.states,
    text            = settings.text,

    eventNamespace  = '.' + namespace,
    moduleNamespace = namespace + '-module',


    returnedValue
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
    active   : 'active',
    disabled : 'disabled',
    loading  : 'loading'
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
      active   : true
    }
  },

  states     : {
    disabled: true,
    loading : true,
    active  : true
  },

  text     : {
    disabled : false,
    flash    : false,
    hover    : false,
    active   : false,
    inactive : false,
    enable   : false,
    disable  : false
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

          module.reset();
          module.save.position();
          module.bindEvents();
          module.instantiate();

          if(settings.type == 'image') {
            module.setup.image();
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
          $window
            .off(eventNamespace)
          ;
          $context
            .off(eventNamespace)
          ;
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
              module.timer = setTimeout(module.checkVisibility, 200);
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
          }
        },

        set: {
          image: function(src) {
            var
              offScreen = (module.cache.screen.bottom + settings.offset < module.cache.element.top)
            ;
            $module
              .attr('src', src)
            ;
            if(offScreen) {
              $module.show();
            }
            else {
              if($.fn.transition !== undefined) {
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
          module.cache = {
            occurred: {},
            screen  : {},
            element : {}
          };
        },

        checkVisibility: function() {
          module.verbose('Checking visibility of element', module.cache.element);
          module.save.scroll();
          module.save.direction();
          module.save.screenCalculations();
          module.save.elementCalculations();

          module.passed();
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
          if(callback && calculations.passing) {
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
          if(callback && calculations.topVisible) {
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
          if(callback && calculations.bottomVisible) {
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
          if(callback && calculations.topPassed) {
            module.execute(callback, callbackName);
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback === undefined) {
            return calculations.topPassed;
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
          if(callback && calculations.bottomPassed) {
            module.execute(callback, callbackName);
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback === undefined) {
            return calculations.bottomPassed;
          }
        },

        execute: function(callback, callbackName) {
          var
            calculations = module.get.elementCalculations(),
            screen       = module.get.screenCalculations()
          ;
          if(settings.continuous) {
            module.debug('Callback called continuously on valid', callbackName, calculations);
            $.proxy(callback, element)(calculations, screen);
          }
          else if(!module.get.occurred(callbackName)) {
            module.debug('Callback conditions met', callbackName, calculations);
            $.proxy(callback, element)(calculations, screen);
          }
          module.save.occurred(callbackName);
        },

        remove: {
          occurred: function(callback) {
            if(callback) {
              module.cache.occurred[callback] = false;
            }
            else {
              module.cache.occurred = {};
            }
          }
        },

        save: {
          occurred: function(callback) {
            if(callback) {
              module.cache.occurred[callback] = true;
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
              topVisible       : (screen.bottom > element.top),
              topPassed        : (screen.top > element.top),
              bottomVisible    : (screen.bottom > element.bottom),
              bottomPassed     : (screen.top > element.bottom),
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
              scroll = $context.scrollTop()
            ;
            if(module.cache.scroll === undefined) {
              module.cache.scroll = $context.scrollTop();
            }
            module.save.direction();
            $.extend(module.cache.screen, {
              top    : scroll - settings.offset,
              bottom : scroll - settings.offset + module.cache.screen.height
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

  name              : 'Visibility',
  namespace         : 'visibility',

  debug             : false,
  verbose           : false,
  performance       : true,

  offset            : 0,
  includeMargin     : false,

  context           : window,

  // visibility check delay in ms
  throttle          : false,

  // special visibility type
  type              : false,
  transition        : 'fade in',
  duration          : 500,

  // array of callbacks
  onPassed          : {},

  // standard callbacks
  onPassing         : false,
  onTopVisible      : false,
  onBottomVisible   : false,
  onTopPassed       : false,
  onBottomPassed    : false,

  once              : true,
  continuous        : false,

  // utility callbacks
  onRefresh         : function(){},
  onScroll          : function(){},

  // not used currently waiting for (DOM Mutations API adoption)
  // https://dvcs.w3.org/hg/domcore/raw-file/tip/Overview.html#mutation-observers
  watch             : true,
  watchedProperties : [
    'offsetWidth',
    'offsetHeight',
    'top',
    'left'
  ],

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
  path          : false,

  onLimit       : function() {},
  onChange      : function() {},

  error         : {
    method          : 'The method you called is not defined',
    missingPersist  : 'Using the persist setting requires the inclusion of PersistJS',
    noCookieStorage : 'The default storage cookie requires $.cookie to be included.'
  }

};

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
        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing accordion with bound events', $module);
          $title
            .on('click' + eventNamespace, module.event.click)
          ;
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

        event: {
          click: function() {
            $.proxy(module.toggle, this)();
          }
        },

        toggle: function(index) {
          var
            $activeTitle = (index)
              ? $title.eq(index)
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

        open: function(index) {
          var
            $activeTitle = (index)
              ? $title.eq(index)
              : $(this),
            $activeContent     = $activeTitle.next($content),
            currentlyAnimating = $activeContent.is(':animated')
          ;
          if(!currentlyAnimating) {
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
                $.proxy(settings.onOpen, $activeContent)();
                $.proxy(settings.onChange, $activeContent)();
              })
            ;
          }
        },

        close: function(index) {
          var
            $activeTitle = (index)
              ? $title.eq(index)
              : $(this),
            $activeContent = $activeTitle.next($content)
          ;
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
              $.proxy(settings.onClose, $activeContent)();
              $.proxy(settings.onChange, $activeContent)();
            })
          ;
        },

        closeOthers: function(index) {
          var
            $activeTitle = (index)
              ? $title.eq(index)
              : $(this),
            $parentTitles    = $activeTitle.parents(selector.content).prev(selector.title),
            $activeAccordion = $activeTitle.closest(selector.accordion),
            $openTitles      = $activeAccordion.find(selector.title + '.' + className.active + ':visible').not($parentTitles),
            $openContents    = $openTitles.next($content),
            contentIsOpen    = ($openTitles.size() > 0)
          ;

          if(contentIsOpen) {
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

  closeNested : true,
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
 * # Semantic - Chatroom
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

$.fn.chatroom = function(parameters) {
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
  $(this)
    .each(function() {
      var
        settings  = $.extend(true, {}, $.fn.chatroom.settings, parameters),

        className = settings.className,
        namespace = settings.namespace,
        selector  = settings.selector,
        error     = settings.error,

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
        element         = this,

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
              module.error(error.method, query);
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

  $.fn.chatroom.settings = {

    name            : 'Chat',
    namespace       : 'chat',

    debug           : false,

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
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

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
            $input
              .on('keydown' + eventNamespace, module.event.keydown)
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
          $input
            .off(eventNamespace, module.event.keydown)
          ;
          $label
            .off(eventNamespace)
          ;
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
          uncheck: function() {
            return (typeof settings.required === 'boolean')
              ? settings.required
              : !module.is.radio()
            ;
          }
        },

        check: function() {
          module.debug('Enabling checkbox', $input);
          $input
            .prop('checked', true)
            .trigger('change')
          ;
          $.proxy(settings.onChange, $input.get())();
          $.proxy(settings.onChecked, $input.get())();
        },

        uncheck: function() {
          module.debug('Disabling checkbox');
          $input
            .prop('checked', false)
            .trigger('change')
          ;
          $.proxy(settings.onChange, $input.get())();
          $.proxy(settings.onUnchecked, $input.get())();
        },

        toggle: function(event) {
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

  verbose     : true,
  debug       : true,
  performance : true,

  // delegated event context
  context     : false,
  required    : 'auto',

  onChange    : function(){},
  onChecked   : function(){},
  onUnchecked : function(){},

  error     : {
    method   : 'The method you called is not defined.'
  },

  selector : {
    input  : 'input[type=checkbox], input[type=radio]',
    label  : 'label'
  },

  className : {
    radio  : 'radio'
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
              $dimmer = $dimmable.children(selector.dimmer).first();
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

          if(settings.closable) {
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
          return $( settings.template.dimmer() ).appendTo($dimmable);
        },

        animate: {
          show: function(callback) {
            callback = $.isFunction(callback)
              ? callback
              : function(){}
            ;
            module.set.dimmed();
            if(settings.on != 'hover' && settings.useCSS && $.fn.transition !== undefined && $dimmer.transition('is supported')) {
              $dimmer
                .transition({
                  animation : settings.transition + ' in',
                  queue     : true,
                  duration  : module.get.duration(),
                  complete  : function() {
                    module.set.active();
                    callback();
                  }
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
            if(settings.on != 'hover' && settings.useCSS && $.fn.transition !== undefined && $dimmer.transition('is supported')) {
              module.verbose('Hiding dimmer with css');
              module.remove.dimmed();
              $dimmer
                .transition({
                  animation : settings.transition + ' out',
                  duration  : module.get.duration(),
                  queue     : true,
                  complete  : function() {
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
                  $dimmer.removeAttr('style');
                  module.remove.active();
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
            module.set.dimmed();
            $dimmer
              .removeClass(className.transition)
              .addClass(className.active)
            ;
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
              .removeClass(className.transition)
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

        show: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          module.debug('Showing dimmer', $dimmer, settings);
          if( !module.is.active() && module.is.enabled() ) {
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
          if( module.is.active() || module.is.animating() ) {
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

  transition  : 'fade',
  useCSS      : true,
  on          : false,
  closable    : true,

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
        $item           = $module.find(selector.item),
        $text           = $module.find(selector.text),
        $input          = $module.find(selector.input),

        $combo = ($module.prev().find(selector.text).size() > 0)
          ? $module.prev().find(selector.text)
          : $module.prev(),

        $menu           = $module.children(selector.menu),


        element         = this,
        instance        = $module.data(moduleNamespace),
        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing dropdown', settings);

          module.save.defaults();
          module.set.selected();

          if(hasTouch) {
            module.bind.touchEvents();
          }
          module.bind.mouseEvents();
          module.bind.keyboardEvents();
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
          $item
            .off(eventNamespace)
          ;
          $module
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        bind: {
          keyboardEvents: function() {
            module.debug('Binding keyboard events');
            $module
              .on('keydown' + eventNamespace, module.handleKeyboard)
            ;
            $module
              .on('focus' + eventNamespace, module.show)
            ;
          },
          touchEvents: function() {
            module.debug('Touch device detected binding touch events');
            $module
              .on('touchstart' + eventNamespace, module.event.test.toggle)
            ;
            $item
              .on('touchstart' + eventNamespace, module.event.item.mouseenter)
              .on('touchstart' + eventNamespace, module.event.item.click)
            ;
          },
          mouseEvents: function() {
            module.verbose('Mouse detected binding mouse events');
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
            $item
              .on('mouseenter' + eventNamespace, module.event.item.mouseenter)
              .on('mouseleave' + eventNamespace, module.event.item.mouseleave)
              .on('click'      + eventNamespace, module.event.item.click)
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

        handleKeyboard: function(event) {
          var
            $selectedItem = $item.filter('.' + className.selected),
            pressedKey    = event.which,
            keys          = {
              enter     : 13,
              escape    : 27,
              upArrow   : 38,
              downArrow : 40
            },
            selectedClass   = className.selected,
            currentIndex    = $item.index( $selectedItem ),
            hasSelectedItem = ($selectedItem.size() > 0),
            resultSize      = $item.size(),
            newIndex
          ;
          // close shortcuts
          if(pressedKey == keys.escape) {
            module.verbose('Escape key pressed, closing dropdown');
            module.hide();
          }
          // result shortcuts
          if(module.is.visible()) {
            if(pressedKey == keys.enter && hasSelectedItem) {
              module.verbose('Enter key pressed, choosing selected item');
              $.proxy(module.event.item.click, $item.filter('.' + selectedClass) )(event);
              event.preventDefault();
              return false;
            }
            else if(pressedKey == keys.upArrow) {
              module.verbose('Up key pressed, changing active item');
              newIndex = (currentIndex - 1 < 0)
                ? currentIndex
                : currentIndex - 1
              ;
              $item
                .removeClass(selectedClass)
                .eq(newIndex)
                  .addClass(selectedClass)
              ;
              event.preventDefault();
            }
            else if(pressedKey == keys.downArrow) {
              module.verbose('Down key pressed, changing active item');
              newIndex = (currentIndex + 1 >= resultSize)
                ? currentIndex
                : currentIndex + 1
              ;
              $item
                .removeClass(selectedClass)
                .eq(newIndex)
                  .addClass(selectedClass)
              ;
              event.preventDefault();
            }
          }
          else {
            if(pressedKey == keys.enter) {
              module.show();
            }
          }
        },

        event: {
          test: {
            toggle: function(event) {
              if( module.determine.intent(event, module.toggle) ) {
                event.preventDefault();
              }
            },
            touch: function(event) {
              module.determine.intent(event, function() {
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
              module.determine.intent(event, module.hide);
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
                  : $choice.text(),
                value   = ( $choice.data(metadata.value) !== undefined)
                  ? $choice.data(metadata.value)
                  : (typeof text === 'string')
                      ? text.toLowerCase()
                      : text,
                callback = function() {
                  module.determine.selectAction(text, value);
                  $.proxy(settings.onChange, element)(value, text);
                }
              ;
              if( $choice.find(selector.menu).size() === 0 ) {
                if(event.type == 'touchstart') {
                  $choice.one('click', callback);
                }
                else {
                  callback();
                }
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
          intent: function(event, callback) {
            module.debug('Determining whether event occurred in dropdown', event.target);
            callback = callback || function(){};
            if( $(event.target).closest($menu).size() === 0 ) {
              module.verbose('Triggering event', callback);
              callback();
              return true;
            }
            else {
              module.verbose('Event occurred in dropdown, canceling callback');
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
          },

          /* Deprecated */
          auto: function(text, value) {
            value = (value !== undefined)
              ? value
              : text
            ;
            module.set.selected(value);
            module.set.value(value);
            module.hide();
          },

          /* Deprecated */
          changeText: function(text, value) {
            value = (value !== undefined)
              ? value
              : text
            ;
            module.set.selected(value);
            module.hide();
          },

          /* Deprecated */
          updateForm: function(text, value) {
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
            strict = (value === '')
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
                      : $choice.text(),
                    optionValue   = ( $choice.data(metadata.value) !== undefined )
                      ? $choice.data(metadata.value)
                      : (typeof optionText === 'string')
                        ? optionText.toLowerCase()
                        : optionText
                  ;
                  if(strict) {
                    module.debug('Ambiguous dropdown value using strict type check', value);
                    if( optionValue === value ) {
                      $selectedItem = $(this);
                    }
                    else if( !$selectedItem && optionText === value ) {
                      $selectedItem = $(this);
                    }
                  }
                  else {
                    if( optionValue == value ) {
                      $selectedItem = $(this);
                    }
                    else if( !$selectedItem && optionText == value ) {
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
          scrollPosition: function() {
            var
              $activeItem  = module.get.item(),
              activeOffset = ($activeItem.size() > 0)
                ? $activeItem.position().top
                : false
            ;
            if(activeOffset) {
              module.debug('Scrolling to active item');
              $menu
                .scrollTop(activeOffset)
              ;
            }
          },
          text: function(text) {
            if(settings.action == 'combo') {
              module.debug('Changing combo button text', text, $combo);
              $combo
                .text(text)
              ;
            }
            else if(settings.action !== 'select') {
              module.debug('Changing text', text, $text);
              $text.removeClass(className.placeholder);
              $text.text(text);
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
            $module.addClass(className.active);
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
                : $selectedItem.text()
              ;
              $item
                .removeClass(className.active)
              ;
              $selectedItem
                .addClass(className.active)
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
          }
        },

        is: {
          selection: function() {
            return $module.hasClass(className.selection);
          },
          animated: function($subMenu) {
            return ($subMenu)
              ? $subMenu.is(':animated') || $subMenu.transition && $subMenu.transition('is animating')
              : $menu.is(':animated') || $menu.transition && $menu.transition('is animating')
            ;
          },
          visible: function($subMenu) {
            return ($subMenu)
              ? $subMenu.is(':visible')
              : $menu.is(':visible')
            ;
          },
          hidden: function($subMenu) {
            return ($subMenu)
              ? $subMenu.is(':not(:visible)')
              : $menu.is(':not(:visible)')
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
              $currentMenu = $subMenu || $menu
            ;
            callback = callback || function(){};
            if( module.is.hidden($currentMenu) ) {
              module.verbose('Doing menu show animation', $currentMenu);
              if(settings.transition == 'none') {
                callback();
              }
              else if($.fn.transition !== undefined && $module.transition('is supported')) {
                $currentMenu
                  .transition({
                    animation : settings.transition + ' in',
                    duration  : settings.duration,
                    complete  : callback,
                    queue     : false
                  })
                ;
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
                    }, settings.duration, 'easeOutQuad', module.event.resetStyle)
                    .end()
                  .slideDown(100, 'easeOutQuad', function() {
                    $.proxy(module.event.resetStyle, this)();
                    callback();
                  })
                ;
              }
              else if(settings.transition == 'fade') {
                $currentMenu
                  .hide()
                  .clearQueue()
                  .fadeIn(settings.duration, function() {
                    $.proxy(module.event.resetStyle, this)();
                    callback();
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
              $currentMenu = $subMenu || $menu
            ;
            callback = callback || function(){};
            if(module.is.visible($currentMenu) ) {
              module.verbose('Doing menu hide animation', $currentMenu);
              if($.fn.transition !== undefined && $module.transition('is supported')) {
                $currentMenu
                  .transition({
                    animation : settings.transition + ' out',
                    duration  : settings.duration,
                    complete  : callback,
                    queue     : false
                  })
                ;
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
                    }, 100, 'easeOutQuad', module.event.resetStyle)
                    .end()
                  .delay(50)
                  .slideUp(100, 'easeOutQuad', function() {
                    $.proxy(module.event.resetStyle, this)();
                    callback();
                  })
                ;
              }
              else if(settings.transition == 'fade') {
                $currentMenu
                  .show()
                  .clearQueue()
                  .fadeOut(150, function() {
                    $.proxy(module.event.resetStyle, this)();
                    callback();
                  })
                ;
              }
              else {
                module.error(error.transition);
              }
            }
          }
        },

        show: function() {
          module.debug('Checking if dropdown can show');
          if( module.is.hidden() ) {
            module.hideOthers();
            module.set.active();
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
          if( !module.is.animated() && module.is.visible() ) {
            module.debug('Hiding dropdown');
            if( module.can.click() ) {
              module.unbind.intent();
            }
            module.remove.active();
            module.animate.hide(module.remove.visible);
            $.proxy(settings.onHide, element)();
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

        hideOthers: function() {
          module.verbose('Finding other dropdowns to hide');
          $allModules
            .not($module)
              .has(selector.menu + ':visible')
              .dropdown('hide')
          ;
        },

        toggle: function() {
          module.verbose('Toggling menu visibility');
          if( module.is.hidden() ) {
            module.show();
          }
          else {
            module.hide();
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

  name        : 'Dropdown',
  namespace   : 'dropdown',

  debug       : false,
  verbose     : true,
  performance : true,

  on          : 'click',
  action      : 'activate',

  delay: {
    show  : 200,
    hide  : 300,
    touch : 50
  },

  transition : 'slide down',
  duration   : 250,

  onChange : function(value, text){},
  onShow   : function(){},
  onHide   : function(){},

  error   : {
    action    : 'You called a dropdown action that was not defined',
    method    : 'The method you called is not defined.',
    transition : 'The requested transition was not found'
  },

  metadata: {
    defaultText  : 'defaultText',
    defaultValue : 'defaultValue',
    text         : 'text',
    value        : 'value'
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
    visible     : 'visible',
    selected    : 'selected',
    selection   : 'selection'
  }

};

// Adds easing
$.extend( $.easing, {
  easeOutQuad: function (x, t, b, c, d) {
    return -c *(t/=d)*(t-2) + b;
  },
});


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
              closable : false,
              useCSS   : true,
              duration : {
                show     : settings.duration * 0.9,
                hide     : settings.duration * 1.1
              }
            })
          ;

          if(settings.detachable) {
            $dimmable.dimmer('add content', $module);
          }

          $dimmer = $dimmable
            .dimmer('get dimmer')
          ;

          $otherModals = $module.siblings(selector.modal);
          $allModals   = $otherModals.add($module);

          module.verbose('Attaching close events', $close);
          $close
            .on('click' + eventNamespace, module.event.close)
          ;
          $window
            .on('resize' + eventNamespace, module.event.resize)
          ;
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
          $close
            .off(eventNamespace)
          ;
          $context
            .dimmer('destroy')
          ;
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
            module.error(error.notFound);
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
          if( module.is.active() ) {
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
            module.cacheSizes();
            module.set.position();
            module.set.screenHeight();
            module.set.type();

            if( $otherModals.filter(':visible').size() > 0 && !settings.allowMultiple) {
              module.debug('Other modals visible, queueing show animation');
              module.hideOthers(module.showModal);
            }
            else {
              $.proxy(settings.onShow, element)();
              if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
                module.debug('Showing modal with css animations');
                $module
                  .transition(settings.transition + ' in', settings.duration, function() {
                    $.proxy(settings.onVisible, element)();
                    module.set.active();
                    callback();
                  })
                ;
              }
              else {
                module.debug('Showing modal with javascript');
                $module
                  .fadeIn(settings.duration, settings.easing, function() {
                    $.proxy(settings.onVisible, element)();
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
          if( !module.is.active() ) {
            module.debug('Dimmer is not visible cannot hide');
            return;
          }
          module.debug('Hiding dimmer');
          if(settings.closable) {
            $dimmer
              .off('click' + eventNamespace)
            ;
          }
          $dimmable.dimmer('hide', function() {
            if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
              $module
                .transition('reset')
              ;
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
          if( !module.is.active() ) {
            module.debug('Cannot hide modal it is not active');
            return;
          }
          module.debug('Hiding modal');
          module.remove.keyboardShortcuts();
          $.proxy(settings.onHide, element)();
          if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
            $module
              .transition(settings.transition + ' out', settings.duration, function() {
                $.proxy(settings.onHidden, element)();
                module.remove.active();
                module.restore.focus();
                callback();
              })
            ;
          }
          else {
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
            module.debug('Hiding other modals');
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
          if(modalHeight !== 0) {
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
          modernBrowser: function() {
            // appName for IE11 reports 'Netscape' can no longer use
            return !(window.ActiveXObject || "ActiveXObject" in window);
          }
        },

        set: {
          screenHeight: function() {
            if(module.cache.height > module.cache.pageHeight) {
              module.debug('Modal is taller than page content, resizing page height');
              $body
                .css('height', module.cache.height + settings.padding)
              ;
            }
          },
          active: function() {
            module.add.keyboardShortcuts();
            module.save.focus();
            $module
              .addClass(className.active)
            ;
            if(settings.closable) {
              $dimmer
                .off('click' + eventNamespace)
                .on('click' + eventNamespace, module.event.click)
              ;
            }
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

  allowMultiple : true,
  detachable    : true,
  closable      : true,
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

$.fn.nag = function(parameters) {
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
        settings        = $.extend(true, {}, $.fn.nag.settings, parameters),

        className       = settings.className,
        selector        = settings.selector,
        error           = settings.error,
        namespace       = settings.namespace,

        eventNamespace  = '.' + namespace,
        moduleNamespace = namespace + '-module',

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

$.fn.nag.settings = {

  name        : 'Nag',

  debug       : false,
  verbose     : true,
  performance : true,

  namespace   : 'Nag',

  // allows cookie to be overriden
  persist     : false,

  // set to zero to manually dismiss, otherwise hides on its own
  displayTime : 0,

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
          $popup = (settings.popup)
            ? $(settings.popup)
            : (settings.inline)
              ? $target.next(settings.selector.popup)
              : false
          ;
          $offsetParent   = (settings.popup)
            ? $popup.offsetParent()
            : (settings.inline)
              ? $target.offsetParent()
              : $body
          ;
        },

        destroy: function() {
          module.debug('Destroying previous module');
          if($popup && !settings.preserve) {
            module.remove();
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
              if( module.is.hidden() ) {
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
            if(settings.hoverable && module.cache === undefined ) {
              module.bind.popup();
            }
            $.proxy(settings.onCreate, $popup)();
          }
          else {
            module.error(error.content, element);
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
          callback = callback || function(){};
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
          callback = callback || function(){};
          $module
            .removeClass(className.visible)
          ;
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

        remove: function() {
          module.debug('Removing popup');
          $popup
            .remove()
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
            if(module.cache && module.cache.title) {
              $module.attr('title', module.cache.title);
              module.verbose('Restoring original attributes', module.cache.title);
            }
            return true;
          }
        },
        animate: {
          show: function(callback) {
            callback = callback || function(){};
            $module
              .addClass(className.visible)
            ;
            if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
              $popup
                .transition(settings.transition + ' in', settings.duration, function() {
                  module.bind.close();
                  $.proxy(callback, element)();
                })
              ;
            }
            else {
              $popup
                .stop()
                .fadeIn(settings.duration, settings.easing, function() {
                  module.bind.close();
                  $.proxy(callback, element)();
                })
              ;
            }
            $.proxy(settings.onShow, element)();
          },
          hide: function(callback) {
            callback = callback || function(){};
            module.debug('Hiding pop-up');
            if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
              $popup
                .transition(settings.transition + ' out', settings.duration, function() {
                  module.reset();
                  callback();
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
            $.proxy(settings.onHide, element)();
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
            module.verbose('Checking if outside viewable area', popup.position);
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
              windowWidth  = $(window).width(),
              windowHeight = $(window).height(),

              width        = $target.outerWidth(),
              height       = $target.outerHeight(),

              popupWidth   = $popup.width(),
              popupHeight  = $popup.outerHeight(),

              parentWidth  = $offsetParent.outerWidth(),
              parentHeight = $offsetParent.outerHeight(),

              distanceAway = settings.distanceAway,

              offset       = (settings.inline || settings.popup)
                ? $target.position()
                : $target.offset(),

              positioning,
              offstagePosition
            ;
            position    = position    || $module.data(metadata.position)    || settings.position;
            arrowOffset = arrowOffset || $module.data(metadata.offset)      || settings.offset;
            // adjust for margin when inline
            if(settings.inline || settings.popup) {
              if(position == 'left center' || position == 'right center') {
                arrowOffset  += parseInt( window.getComputedStyle(element).getPropertyValue('margin-top'), 10);
                distanceAway += -parseInt( window.getComputedStyle(element).getPropertyValue('margin-left'), 10);
              }
              else {
                arrowOffset  += parseInt( window.getComputedStyle(element).getPropertyValue('margin-left'), 10);
                distanceAway += parseInt( window.getComputedStyle(element).getPropertyValue('margin-top'), 10);
              }
            }
            module.debug('Calculating offset for position', position);
            switch(position) {
              case 'top left':
                positioning = {
                  top    : 'auto',
                  bottom : parentHeight - offset.top + distanceAway,
                  left   : offset.left + arrowOffset,
                  right  : 'auto'
                };
              break;
              case 'top center':
                positioning = {
                  bottom : parentHeight - offset.top + distanceAway,
                  left   : offset.left + (width / 2) - (popupWidth / 2) + arrowOffset,
                  top    : 'auto',
                  right  : 'auto'
                };
              break;
              case 'top right':
                positioning = {
                  bottom :  parentHeight - offset.top + distanceAway,
                  right  :  parentWidth - offset.left - width - arrowOffset,
                  top    : 'auto',
                  left   : 'auto'
                };
              break;
              case 'left center':
                positioning = {
                  top    : offset.top + (height / 2) - (popupHeight / 2) + arrowOffset,
                  right  : parentWidth - offset.left + distanceAway,
                  left   : 'auto',
                  bottom : 'auto'
                };
              break;
              case 'right center':
                positioning = {
                  top    : offset.top + (height / 2) - (popupHeight / 2) + arrowOffset,
                  left   : offset.left + width + distanceAway,
                  bottom : 'auto',
                  right  : 'auto'
                };
              break;
              case 'bottom left':
                positioning = {
                  top    : offset.top + height + distanceAway,
                  left   : offset.left + arrowOffset,
                  bottom : 'auto',
                  right  : 'auto'
                };
              break;
              case 'bottom center':
                positioning = {
                  top    : offset.top + height + distanceAway,
                  left   : offset.left + (width / 2) - (popupWidth / 2) + arrowOffset,
                  bottom : 'auto',
                  right  : 'auto'
                };
              break;
              case 'bottom right':
                positioning = {
                  top    : offset.top + height + distanceAway,
                  right  : parentWidth - offset.left  - width - arrowOffset,
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
            offstagePosition = module.get.offstagePosition();

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
                module.error(error.recursion);
                searchDepth = 0;
                module.reset();
                $popup.removeClass(className.loading);
                return false;
              }
            }
            else {
              module.debug('Position is on stage', position);
              searchDepth = 0;
              $popup.removeClass(className.loading);
              return true;
            }
          }

        },

        bind: {
          popup: function() {
            if(settings.hoverable) {
              module.verbose('Allowing hover events on popup to prevent closing');
              $popup
                .on('mouseenter', module.event.start)
                .on('mouseleave', module.event.end)
              ;
            }
          },
          close:function() {
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
            if(settings.on == 'click' && settings.closable) {
              module.verbose('Removing close event from document');
              $document
                .off('click' + eventNamespace)
              ;
            }
          }
        },

        is: {
          animating: function() {
            return ( $popup && $popup.is(':animated') || $popup.hasClass(className.animating) );
          },
          visible: function() {
            return $popup && $popup.is(':visible');
          },
          hidden: function() {
            return !module.is.visible();
          }
        },

        reset: function() {
          $popup
            .removeClass(className.visible)
          ;
          if(settings.preserve || settings.popup) {
            if($.fn.transition !== undefined) {
              $popup
                .transition('remove transition')
              ;
            }
          }
          else {
            module.remove();
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
  verbose        : false,
  performance    : false,
  namespace      : 'popup',

  onCreate       : function(){},
  onRemove       : function(){},
  onShow         : function(){},
  onHide         : function(){},

  variation      : '',
  content        : false,
  html           : false,
  title          : false,

  on             : 'hover',
  closable       : true,

  context        : 'body',
  position       : 'top left',
  delay          : {
    show : 50,
    hide : 0
  },

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
    content         : 'Your popup has no content specified',
    invalidPosition : 'The position you specified is not a valid position',
    method          : 'The method you called is not defined.',
    recursion       : 'Popup attempted to reposition element to fit, but could not find an adequate position.'
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
    animating   : 'animating',
    loading     : 'loading',
    popup       : 'ui popup',
    position    : 'top left center bottom right',
    visible     : 'visible'
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
            .removeClass(className.hover)
          ;
          $icon
            .removeClass(className.hover)
            .removeClass(className.active)
          ;
          if(rating > 0) {
            module.verbose('Setting current rating to', rating);
            $activeIcon
              .addClass(className.active)
                .prevAll()
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

  debug         : true,
  verbose       : true,
  performance   : true,

  initialRating : 0,
  interactive   : true,
  clearable     : 'auto',

  onRate        : function(rating){},

  error       : {
    method : 'The method you called is not defined'
  },

  metadata: {
    rating: 'rating'
  },

  className : {
    active   : 'active',
    disabled : 'disabled',
    hover    : 'hover',
    loading  : 'loading'
  },

  selector  : {
    icon : '.icon'
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
            module.results.show();
          },
          blur: function() {
            module.search.cancel();
            $module
              .removeClass(className.focus)
            ;
            module.timer = setTimeout(module.results.hide, settings.hideDelay);
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
              if($.isPlainObject(settings.source) || $.isArray(settings.source)) {
                module.search.local(searchTerm);
              }
              else if(settings.apiSettings) {
                module.search.remote(searchTerm);
              }
              else if($.api !== undefined && $.api.settings.api.search !== undefined) {
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
              $.each(settings.source, function(label, thing) {
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
                urlData: {
                  query: searchTerm
                },
                onSuccess : function(response) {
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
              if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
                module.debug('Showing results with css animations');
                $results
                  .transition(settings.transition + ' in', settings.duration)
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
              if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
                module.debug('Hiding results with css animations');
                $results
                  .transition(settings.transition + ' out', settings.duration)
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
                href   = $link.attr('href') || false,
                target = $link.attr('target') || false
              ;
              module.results.hide();
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

  // onSelect default action is defined in module
  onSelect       : 'default',
  onResultsAdd   : 'default',

  onSearchQuery  : function(){},
  onResults      : function(response){},

  onResultsOpen  : function(){},
  onResultsClose : function(){},

  source         : false,

  automatic      : 'true',
  type           : 'simple',
  hideDelay      : 300,
  minCharacters  : 3,
  searchThrottle : 300,
  maxResults     : 7,
  cache          : true,

  searchFields    : [
    'title',
    'description'
  ],

  transition : 'scale',
  duration   : 300,
  easing     : 'easeOutExpo',

  // api config
  apiSettings: false,

  className: {
    active  : 'active',
    down    : 'down',
    focus   : 'focus',
    empty   : 'empty',
    loading : 'loading'
  },

  error : {
    source      : 'No source or api action specified',
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
    categories: function(response) {
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
              html  += '<a href="' + result.url + '"></a>';
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

$.fn.shape = function(parameters) {
  var
    $allModules     = $(this),
    $body           = $('body'),

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
        nextSelector = false,
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
            module.repaint();
            $module
              .addClass(className.animating)
            ;
            $activeSide
              .addClass(className.hidden)
            ;
            $sides
              .css(propertyObject)
              .one(module.get.transitionEvent(), callback)
            ;
            module.set.duration(settings.duration);
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
            nextSelector = false;
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
              $nextSide   = (nextSelector)
                ? $clone.find(nextSelector)
                : ( $activeSide.next(selector.side).size() > 0 )
                  ? $activeSide.next(selector.side)
                  : $clone.find(selector.side).first(),
              newSize = {}
            ;
            $activeSide.removeClass(className.active);
            $nextSide.addClass(className.active);
            $clone.prependTo($body);
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
            nextSelector = selector;
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
            $.proxy(settings.onChange, $nextSide[0])();
            module.set.defaultSide();
          }
        },

        flip: {

          up: function() {
            module.debug('Flipping up', $nextSide);
            if( !module.is.animating() ) {
              module.set.stageSize();
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
              module.set.stageSize();
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
              module.set.stageSize();
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
              module.set.stageSize();
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
              module.set.stageSize();
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
        $style          = $('style[title=' + namespace + ']'),

        $sidebars       = $context.children(selector.sidebar),
        $pusher         = $context.children(selector.pusher),
        $page           = $pusher.children(selector.page),
        $fixed          = $pusher.find(selector.fixed),

        element         = this,
        instance        = $module.data(moduleNamespace),

        currentScroll,
        transitionEnd,

        module
      ;

      module      = {

        initialize: function() {
          module.debug('Initializing sidebar', $module);

          transitionEnd = module.get.transitionEvent();

          module.setup.context();

          // avoid locking rendering to change layout if included in onReady
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
          $module
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        event: {
          clickaway: function(event) {
            if( $module.find(event.target).size() === 0 && $(event.target).filter($module).size() === 0 ) {
              module.verbose('User clicked on dimmed page');
              module.hide();
            }
          },
          scroll: function(event) {
            if( $module.find(event.target).size() === 0 && $(event.target).filter($module).size() === 0 ) {
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
            $context
              .on('click' + eventNamespace, module.event.clickaway)
              .on('touchend' + eventNamespace, module.event.clickaway)
            ;
          }
        },
        unbind: {
          clickaway: function() {
            $context
              .off(eventNamespace)
            ;
            if(settings.scrollLock) {
              $(window).off('DOMMouseScroll' + eventNamespace);
            }
          }
        },

        refresh: function() {
          module.verbose('Refreshing selector cache');
          $context  = $(settings.context);
          $style    = $('style[title=' + namespace + ']');
          $sidebars = $context.children(selector.sidebar);
          $pusher   = $context.children(selector.pusher);
          $page     = $pusher.children(selector.page);
          $fixed    = $pusher.find(selector.fixed);
        },

        repaint: function() {
          module.verbose('Forcing repaint event');
          var fakeAssignment = $context[0].offsetWidth;
        },

        setup: {
          layout: function() {
            if( $context.find(selector.pusher).size() === 0 ) {
              module.debug('Adding wrapper element for sidebar');
              $pusher = $('<div class="pusher" />');
              $page   = $('<div class="page" />');
              $pusher.append($page);
              $context
                .children()
                  .not(selector.omitted)
                  .not($sidebars)
                  .wrapAll($pusher)
              ;
            }
            if($module.prevAll($page)[0] !== $page[0]) {
              module.debug('Moved sidebar to correct parent element');
              $module.detach().prependTo($context);
            }
            module.refresh();
          },
          context: function() {
            module.verbose('Adding pusshable class to wrapper');
            $context.addClass(className.pushable);
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
              .off(eventNamespace)
              .on('click' + eventNamespace, event)
            ;
          }
          else {
            module.error(error.notFound);
          }
        },

        show: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          module.debug('Showing sidebar', callback);
          if(module.is.closed()) {
            if(settings.overlay)  {
              settings.transition = 'overlay';
            }
            if(settings.transition !== 'overlay') {
              module.hideAll();
            }
            module.pushPage(function() {
              module.set.active();
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
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          module.debug('Hiding sidebar', callback);
          if(module.is.visible()) {
            module.pullPage(function() {
              $.proxy(callback, element)();
              $.proxy(settings.onHidden, element)();
            });
            $.proxy(settings.onChange, element)();
            $.proxy(settings.onHide, element)();
          }
        },

        hideAll: function() {
          var
            $visibleSidebars = $sidebars.find('.' + className.visible)
          ;
          $visibleSidebars
            .sidebar('hide')
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
            $transition = (settings.transition == 'safe')
              ? $context
              : (settings.transition == 'overlay')
                ? $module
                : $pusher,
            transition
          ;
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          transition = function() {
            module.set.visible();
            module.set.transition();
            module.set.direction();
            requestAnimationFrame(function() {
              module.set.inward();
              module.set.pushed();
            });
          };
          $transition
            .on(transitionEnd, function(event) {
              if( event.target == $transition[0] ) {
                $transition.off(transitionEnd);
                module.remove.inward();
                module.bind.clickaway();
                $.proxy(callback, element)();
              }
            })
          ;
          module.verbose('Adding context push state', $context);
          if(settings.transition === 'overlay') {
            requestAnimationFrame(transition);
          }
          else {
            if(module.is.mobile()) {
              $module.scrollTop(0);
              currentScroll = $(window).scrollTop();
              window.scrollTo(0, 0);
            }
            module.remove.allVisible();
            requestAnimationFrame(transition);
          }
        },

        pullPage: function(callback) {
          var
            $transition = (settings.transition == 'safe')
              ? $context
              : (settings.transition == 'overlay')
                ? $module
                : $pusher
          ;
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          module.verbose('Removing context push state', module.get.direction());
          module.unbind.clickaway();

          $transition
            .on(transitionEnd, function(event) {
              if( event.target == $transition[0] ) {
                $transition.off(transitionEnd);
                module.remove.transition();
                module.remove.direction();
                module.remove.outward();
                module.remove.visible();
                if(module.is.mobile() && settings.returnScroll) {
                  window.scrollTo(0, currentScroll);
                }
                $.proxy(callback, element)();
              }
            })
          ;
          requestAnimationFrame(function() {
            module.set.outward();
            module.remove.active();
            module.remove.pushed();
          });
        },

        set: {
          active: function() {
            $context.addClass(className.active);
          },
          direction: function(direction) {
            direction = direction || module.get.direction();
            $context.addClass(className[direction]);
          },
          visible: function() {
            $module.addClass(className.visible);
          },
          transition: function(transition) {
            transition = transition || ( module.is.mobile() )
              ? settings.mobileTransition
              : settings.transition
            ;
            $context.addClass(transition);
          },
          inward: function() {
            $context.addClass(className.inward);
          },
          outward: function() {
            $context.addClass(className.outward);
          },
          pushed: function() {
            $context.addClass(className.pushed);
          }
        },
        remove: {
          active: function() {
            $context.removeClass(className.active);
          },
          visible: function() {
            $module.removeClass(className.visible);
          },
          allVisible: function() {
            if($sidebars.hasClass(className.visible)) {
              module.debug('Other sidebars visible, hiding');
              $sidebars.removeClass(className.visible);
            }
          },
          transition: function(transition) {
            transition = transition || ( module.is.mobile() )
              ? settings.mobileTransition
              : settings.transition
            ;
            $context.removeClass(transition);
          },
          pushed: function() {
            $context.removeClass(className.pushed);
          },
          inward: function() {
            $context.removeClass(className.inward);
          },
          outward: function() {
            $context.removeClass(className.outward);
          },
          direction: function(direction) {
            direction = direction || module.get.direction();
            $context.removeClass(className[direction]);
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
          inward: function() {
            return $context.hasClass(className.inward);
          },
          outward: function() {
            return $context.hasClass(className.outward);
          },
          animating: function() {
            return module.is.inward() || module.is.outward();
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
        module.destroy();
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

  name             : 'Sidebar',
  namespace        : 'sidebar',

  debug            : false,
  verbose          : false,
  performance      : false,

  workaround       : false,
  transition       : 'overlay',
  mobileTransition : 'slide along',
  context          : 'body',
  exclusive        : true,

  scrollLock       : false,
  returnScroll     : false,

  onChange         : function(){},
  onShow           : function(){},
  onHide           : function(){},

  onHidden         : function(){},
  onVisible        : function(){},


  className        : {
    pushable : 'pushable',
    active   : 'active',
    visible  : 'visible',
    pushed   : 'pushed',
    inward   : 'show',
    outward  : 'hide'
  },

  selector: {
    sidebar : '.ui.sidebar',
    pusher  : '.pusher',
    fixed   : '.ui.fixed',
    page    : '.page',
    omitted : 'script, link, style, .ui.modal, .ui.nag, .ui.fixed'
  },

  error   : {
    method   : 'The method you called is not defined.',
    notFound : 'There were no elements that matched the specified selector'
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
          if( !$module.is(':visible') ) {
            module.error(error.visible, $module);
          }
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
          if(module.supports.sticky()) {
            // needs to enable native ios support
          }
          $window
            .on('resize' + eventNamespace, module.event.resize)
          ;
          $scroll
            .on('scroll' + eventNamespace, module.event.scroll)
          ;
          module.verbose('Initializing sticky', settings, $container);
          module.save.positions();
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
            .off('resize', module.event.resize)
            .off('scroll', module.event.scroll)
          ;
          $module
            .removeData(moduleNamespace)
          ;
        },

        observeChanges: function() {
          var
            context = $context[0]
          ;
          if(MutationObserver !== undefined) {
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
            requestAnimationFrame(module.refresh);
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
              fits : ( element.height < $window.height() ),
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
          currentOffset: function() {
            return ( module.is.top() )
                ? parseInt($module.css('top'), 10) || 0
                : parseInt($module.css('bottom'), 10) || 0
            ;
          },
          offsetChange: function(scroll) {
            scroll = scroll || $scroll.scrollTop();
            return (module.lastScroll)
              ? Math.abs(scroll - module.lastScroll)
              : 0
            ;
          },
          newOffset: function(scroll) {
            scroll = scroll || $scroll.scrollTop();
            var
              currentOffset = module.get.currentOffset(),
              delta         = module.get.offsetChange(scroll)
            ;
            return Math.abs(currentOffset - delta);
          }
        },

        set: {
          containerSize: function() {
            var
              tagName = $container.get(0).tagName
            ;
            if(tagName === 'HTML' || tagName == 'body') {
              module.error(error.container, tagName, $module);
              $container = $module.offsetParent();
            }
            else {
              module.debug('Settings container size', module.cache.context.height);
              $container.height(module.cache.context.height);
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
            scrollTop      = $scroll.scrollTop(),
            screen           = {
              top    : scrollTop + settings.offset,
              bottom : scrollTop + window.height + settings.offset
            },
            direction      = module.get.direction(scrollTop),
            currentOffset  = module.get.currentOffset(),
            newOffset      = module.get.newOffset(scrollTop),
            elementPassed  = (screen.bottom > element.top + element.height),
            fixedBottom     = (cache.element.height + screen.top)
          ;

          module.save.scroll(scrollTop);
          if(element.height !== 0) {

            if( module.is.fixed() ) {
              if(fits) {
                // if module is fixed top
                if(module.is.top()) {
                  if( screen.top < element.top ) {
                    module.unfix();
                  }
                  else if( fixedBottom > context.bottom ) {
                    module.debug('Top attached rail has reached bottom of container');
                    module.bindBottom();
                  }
                }
                // if module is fixed bottom
                if(module.is.bottom() ) {
                  // top edge
                  if( (screen.bottom - element.height) < element.top) {
                    module.unfix();
                  }
                  // bottom edge
                  else if(screen.bottom > context.bottom) {
                    module.debug('Bottom attached rail has reached bottom of container');
                    module.bindBottom();
                  }
                }
                if( fixedBottom > context.bottom ) {
                  module.bindBottom();
                }
              }
              else {
                if(screen.bottom > context.bottom) {
                  module.bindBottom();
                }
                else if(elementPassed) {
                  if(module.is.top() && direction == 'down') {
                    module.debug('Stuck content at bottom edge');
                    if(newOffset >= (element.height - window.height)) {
                      $module
                        .css('top', '')
                      ;
                      module.stickBottom();
                    }
                    else {
                      $module
                        .css('top', -newOffset)
                      ;
                    }
                  }
                  if(module.is.bottom() && direction == 'up') {
                    module.debug('Stuck content at top edge');
                    if(newOffset >= (element.height - window.height)) {
                      $module
                        .css('bottom', '')
                      ;
                      module.stickTop();
                    }
                    else {
                      $module
                        .css('bottom', -newOffset)
                      ;
                    }
                  }
                }
                else {
                  module.unfix();
                }
              }
            }
            else {
              // determine if needs to be bound
              if(screen.top + element.height > context.bottom) {
                module.bindBottom();
              }
              if(fits) {
                // fix to bottom of screen on way back up
                if(module.is.bottom() ) {
                  if(settings.pushing) {
                    if(module.is.bound() && screen.bottom < context.bottom ) {
                      module.stickBottom();
                    }
                  }
                  else {
                    if(module.is.bound() && screen.top < context.bottom - element.height) {
                      module.stickTop();
                    }
                  }
                }
                else if(screen.top >= element.top && screen.top < context.bottom - element.height) {
                  module.stickTop();
                }
              }
              else {
                if(elementPassed && screen.bottom < context.bottom ) {
                  module.stickBottom();
                }
              }
            }
          }
        },

        bindTop: function() {
          module.debug('Binding element to top of parent container');
          $module
            .css('left' , '')
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
          $module
            .css('left' , '')
            .removeClass(className.fixed)
            .removeClass(className.top)
            .addClass(className.bound)
            .addClass(className.bottom)
          ;
          $.proxy(settings.onBottom, element)();
          $.proxy(settings.onUnstick, element)();
        },

        stickTop: function() {
          module.debug('Fixing element to top of page');
          $module
            .css('left', module.cache.element.left)
            .removeClass(className.bound)
            .removeClass(className.bottom)
            .addClass(className.fixed)
            .addClass(className.top)
          ;
          $.proxy(settings.onStick, element)();
        },

        stickBottom: function() {
          module.debug('Sticking element to bottom of page');
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
          $module
            .removeClass(className.bound)
            .removeClass(className.top)
            .removeClass(className.bottom)
          ;
        },

        unfix: function() {
          module.debug('Removing fixed position on element');
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
                'Element'        : element,
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
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

  verbose       : false,
  debug         : false,
  performance   : false,

  pushing       : false,

  context       : false,
  scrollContext : window,
  offset        : 0,

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
    invalidContext : 'Context specified does not exist'
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
        $tabs              = $(selector.tabs),

        cache              = {},
        firstLoad          = true,
        recursionDepth     = 0,

        $context,
        activeTabPath,
        parameterArray,
        historyEvent,

        element         = this,
        instance        = $module.data(moduleNamespace)
      ;

      module = {

        initialize: function() {
          module.debug('Initializing tab menu item', $module);

          if(settings.context) {
            module.determineTabs();
            module.debug('Using only tabs inside context', settings.context, $tabs);
          }

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
          if(settings.context === 'parent') {
            if($module.closest('.' + className.ui).size() > 0) {
              $reference = $module.closest('.' + className.ui);
              module.verbose('Using closest UI element for determining parent', $reference);
            }
            else {
              $reference = $module;
            }
            $context = $reference.parent();
            module.verbose('Determining parent element for creating context', $context);
          }
          else {
            $context = $(settings.context);
            module.verbose('Using selector for tab context', settings.context, $context);
          }
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
            else {
              if(!settings.history) {
                module.error(error.missingTab, $module, currentPath);
              }
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

  name        : 'Tab',
  namespace   : 'tab',

  debug       : false,
  verbose     : false,
  performance : false,

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
  historyType     : 'hash',
  path            : false,

  context         : false,
  childrenOnly    : false,

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

  error: {
    api        : 'You attempted to load content without API module',
    method     : 'The method you called is not defined',
    missingTab : 'Activated tab cannot be found for this context.',
    noContent  : 'The tab you specified is missing a content url.',
    path       : 'History enabled, but no path was specified',
    recursion  : 'Max recursive depth reached',
    state      : 'The state library has not been initialized'
  },

  metadata : {
    tab    : 'tab',
    loaded : 'loaded',
    promise: 'promise'
  },

  className   : {
    loading : 'loading',
    active  : 'active',
    ui      : 'ui'
  },

  selector    : {
    tabs : '.ui.tab'
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

          instance        = $module.data(moduleNamespace) || module;

          if(methodInvoked) {
            methodInvoked = module.invoke(query);
          }
          // no internal method was found matching query or query not made
          if(methodInvoked === false) {
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
          delete instance.displayType;
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
          if(module.is.animating() && settings.queue) {
            if(!settings.allowRepeats && module.has.direction() && module.is.occuring() && instance.queuing !== true) {
              module.error(error.repeated);
            }
            else {
              module.queue(settings.animation);
            }
            return false;
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
          $module.off(animationEnd);
          module.restore.conditions();
          module.hide();
          module.remove.animating();
        },

        queue: function(animation) {
          module.debug('Queueing animation of', animation);
          instance.queuing = true;
          $module
            .one(animationEnd, function() {
              instance.queuing = false;
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
              module.remove.display();
              module.hide();
              $.proxy(settings.onHide, this)();
            }
            else if( module.is.inward() ) {
              module.verbose('Animation is outward, showing element');
              module.restore.conditions();
              module.show();
              $.proxy(settings.onShow, this)();
            }
            else {
              module.restore.conditions();
            }
            module.remove.duration();
            module.remove.animating();
          }
          $.proxy(settings.complete, this)();
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
            module.save.conditions();
            if(module.can.transition() && !module.has.direction()) {
              module.set.direction();
            }
            module.remove.hidden();
            module.set.display();
            $module
              .addClass(className.animating)
              .addClass(className.transition)
              .addClass(animation)
              .one(animationEnd, module.complete)
            ;
            module.set.duration(settings.duration);
            module.debug('Starting tween', settings.animation, $module.attr('class'));
          },

          display: function() {
            var
              style         = $module.css('style'),
              displayType   = module.get.displayType(),
              overrideStyle = style + ';display: ' + displayType + ' !important;'
            ;
            if(displayType !== 'block') {
              module.verbose('Setting final visibility to', displayType);
              $module
                .attr('style', overrideStyle)
              ;
            }
          },

          direction: function() {
            if($module.is(':visible')) {
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
          },

          hidden: function() {
            $module
              .addClass(className.transition)
              .addClass(className.hidden)
            ;
            requestAnimationFrame(function() {
              if($module.css('display') !== 'none') {
                module.verbose('Overriding default display to hide element')
                $module
                  .css('display', 'none')
                ;
              }
            })
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
            instance.displayType = displayType;
          },
          transitionExists: function(animation, exists) {
            $.fn.transition.exists[animation] = exists;
            module.verbose('Saving existence of transition', animation, exists);
          },
          conditions: function() {
            instance.cache = {
              className : $module.attr('class'),
              style     : $module.attr('style')
            };
            module.verbose('Saving original attributes', instance.cache);
          }
        },

        restore: {
          conditions: function() {
            if(instance.cache === undefined) {
              return false;
            }
            if(instance.cache.className) {
              $module.attr('class', instance.cache.className);
            }
            else {
              $module.removeAttr('class');
            }
            if(instance.cache.style) {
              $module.attr('style', instance.cache.style);
            }
            else {
              if(module.get.displayType() === 'block') {
                $module.removeAttr('style');
              }
            }
            if(module.is.looping()) {
              module.remove.looping();
            }
            module.verbose('Restoring original attributes', instance.cache);
          }
        },

        remove: {

          animating: function() {
            $module.removeClass(className.animating);
          },

          display: function() {
            if(instance.displayType !== undefined) {
              $module.css('display', '');
            }
          },

          duration: function() {
            $module
              .css({
                '-webkit-animation-duration' : '',
                '-moz-animation-duration'    : '',
                '-ms-animation-duration'     : '',
                '-o-animation-duration'      : '',
                'animation-duration'         : ''
              })
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

          settings: function(animation, duration, complete) {
            // single settings object
            if(typeof animation == 'object') {
              return $.extend(true, {}, $.fn.transition.settings, animation);
            }
            // all arguments provided
            else if(typeof complete == 'function') {
              return $.extend({}, $.fn.transition.settings, {
                animation : animation,
                complete  : complete,
                duration  : duration
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
                animation : animation,
                complete  : duration
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
            if(instance.displayType === undefined) {
              // create fake element to determine display state
              module.can.transition();
            }
            return instance.displayType;
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
                module.verbose('Determined animation vendor name property', animations[animation]);
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
                module.verbose('Determined animation vendor end event', animations[animation]);
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
          transition: function() {
            var
              elementClass     = $module.attr('class'),
              animation        = settings.animation,
              transitionExists = module.get.transitionExists(settings.animation),
              $clone,
              currentAnimation,
              inAnimation,
              displayType
            ;
            if( transitionExists === undefined || instance.displayType === undefined) {
              module.verbose('Determining whether animation exists');
              $clone = $('<div>').addClass( elementClass ).appendTo($('body'));
              currentAnimation = $clone
                .removeClass(className.inward)
                .removeClass(className.outward)
                .addClass(className.animating)
                .addClass(className.transition)
                .addClass(animation)
                .css(animationName)
              ;
              inAnimation = $clone
                .addClass(className.inward)
                .css(animationName)
              ;
              displayType = $clone
                .attr('class', elementClass)
                .show()
                .css('display')
              ;
              module.verbose('Determining final display state', displayType);
              if(currentAnimation != inAnimation) {
                module.debug('Transition exists for animation', animation);
                transitionExists = true;
              }
              else {
                module.debug('Static animation found', animation, displayType);
                transitionExists = false;
              }
              $clone.remove();
              module.save.displayType(displayType);
              module.save.transitionExists(animation, transitionExists);
            }
            return transitionExists;
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
            return ( $module.hasClass(animation) );
          },
          visible: function() {
            return $module.is(':visible');
          },
          supported: function() {
            return(animationName !== false && animationEnd !== false);
          }
        },

        hide: function() {
          module.verbose('Hiding element');
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
          return found || false;
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
  complete    : function() {},
  onShow      : function() {},
  onHide      : function() {},

  // whether animation can occur twice in a row
  allowRepeats : false,

  // animation duration
  animation  : 'fade',
  duration   : '500ms',

  // new animations will occur after previous ones
  queue       : true,

  className   : {
    animating  : 'animating',
    disabled   : 'disabled',
    hidden     : 'hidden',
    inward     : 'in',
    loading    : 'loading',
    looping    : 'looping',
    outward    : 'out',
    transition : 'ui transition',
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
        + '<i class="play sign icon"></i>'
        + '<img class="placeholder" src="' + image + '">'
      ;
    }
    html += '<div class="embed"></div>';
    return html;
  }
};


})( jQuery, window , document );
