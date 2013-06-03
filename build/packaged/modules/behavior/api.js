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

      action         = $module.data(settings.metadata.action) || settings.action || false,

      className      = settings.className,
      metadata       = settings.metadata,
      errors         = settings.errors,
      module
    ;

    module = {
      initialize: function() {
        var
          exitConditions = false,

          runSettings,

          loadingTimer   = new Date().getTime(),
          loadingDelay,

          promise,
          url,
          urlVariables,

          formData       = {},
          data,

          ajaxSettings   = {},
          xhr,

          errors = settings.errors
        ;

        // serialize parent form if requested!
        if(settings.serializeForm && $(this).toJSON() !== undefined) {
          formData = $module
            .closest('form')
              .toJSON()
          ;
          $.extend(true, settings.data, formData);
          module.debug('Adding form data to API Request', formData);
        }

        // let beforesend change settings object
        runSettings = $.proxy(settings.beforeSend, $module)(settings);

        // check for exit conditions
        if(runSettings !== undefined && !runSettings) {
          module.error(errors.beforeSend);
          module.reset();
          return;
        }

        if(action) {
          module.debug('Initializing API Request for: ', action);
          if(settings.api[action] !== undefined) {
            url = settings.api[action];
          }
          else {
            module.error(errors.missingAction);
          }
        }
        // override with url if specified
        if(settings.url) {
          url = settings.url;
          module.debug('Using specified url: ', url);
        }

        if(!url) {
          module.error(errors.missingURL);
          module.reset();
        }

        // replace url data in url
        urlVariables = url.match(settings.regExpTemplate);

        if(urlVariables) {
          module.debug('Looking for URL variables', urlVariables);
          $.each(urlVariables, function(index, templateValue){
            var
              term      = templateValue.substr( 2, templateValue.length - 3),
              termValue = ($.isPlainObject(parameters.urlData) && parameters.urlData[term] !== undefined)
                ? parameters.urlData[term]
                : ($module.data(term) !== undefined)
                  ? $module.data(term)
                  : settings.urlData[term]
            ;
            module.verbose('Looking for variable', term, $module, $module.data(term), settings.urlData[term]);
            // remove optional value
            if(termValue === false) {
              module.debug('Removing variable from URL', urlVariables);
              url = url.replace('/' + templateValue, '');
            }
            // undefined condition
            else if(termValue === undefined || !termValue) {
              module.error(errors.missingParameter + term);
              exitConditions = true;
            }
            else {
              url = url.replace(templateValue, termValue);
            }
          });
        }

        // exit conditions reached from missing url parameters
        if( exitConditions ) {
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
                errorMessage = (settings.errors[status] !== undefined)
                  ? settings.errors[status]
                  : httpMessage,
                response
              ;
              // let em know unless request aborted
              if(xhr !== undefined) {
                // readyState 4 = done, anything less is not really sent
                if(xhr.readyState !== undefined && xhr.readyState == 4) {
                  
                  // if http status code returned and json returned error, look for it
                  if( xhr.status != 200 && httpMessage !== undefined && httpMessage !== '') {
                    module.error(errors.statusMessage + httpMessage);
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
                        module.error(errors.JSONParse);
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
        module.error(errors.exitConditions);
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
      }
    };

    module.initialize();
    return this;
  };

  // handle DOM attachment to API functionality
  $.fn.apiButton = function(parameters) {
    $(this)
      .each(function(){
        var
          // if only function passed it is success callback
          $module  = $(this),
          element  = this,
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
    moduleName : 'API Module',
    namespace  : 'api',

    verbose    : true,
    debug      : true,

    api        : {},

    beforeSend : function(settings) { 
      return settings; 
    },
    beforeXHR  : function(xhr) {},

    success    : function(response) {},
    complete   : function(response) {},
    failure    : function(errorCode) {},
    progress   : false,

    errors     : {
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