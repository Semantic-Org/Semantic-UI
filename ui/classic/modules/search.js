/*  ******************************
  Search Prompt
  Author: Jack Lukic
  Notes: First Commit July 19, 2012

  Designed to be used as an autocomplete
  or to deliver quick inline search results
******************************  */

;(function ($, window, document, undefined) {

$.fn.searchPrompt = function(source, parameters) {
  var
    settings = $.extend(true, {}, $.fn.searchPrompt.settings, parameters),
    // make arguments available
    query           = arguments[0],
    passedArguments = [].slice.call(arguments, 1),
    invokedResponse
  ;
  $(this)
    .each(function() {
      var
        $module        = $(this),
        $searchPrompt  = $module.find(settings.selector.searchPrompt),
        $searchButton  = $module.find(settings.selector.searchButton),
        $searchResults = $module.find(settings.selector.searchResults),
        $result        = $module.find(settings.selector.result),
        $category      = $module.find(settings.selector.category),
        $emptyResult   = $module.find(settings.selector.emptyResult),
        $resultPage    = $module.find(settings.selector.resultPage),

        element        = this,
        selector       = $module.selector || '',
        instance       = $module.data('module-' + settings.namespace),
        methodInvoked  = (instance !== undefined && typeof query == 'string'),

        className      = settings.className,
        namespace      = settings.namespace,
        errors         = settings.errors,
        module
      ;
      module = {

        initialize: function() {
          var
            searchPrompt = $searchPrompt[0],
            inputEvent   = (searchPrompt.oninput !== undefined)
              ? 'input'
              : (searchPrompt.onpropertychange !== undefined)
                ? 'propertychange'
                : 'keyup'
          ;
          // attach events
          $searchPrompt
            .on('focus.' + namespace, module.event.focus)
            .on('blur.' + namespace, module.event.blur)
            .on('keydown.' + namespace, module.handleKeyboard)
          ;
          if(settings.automatic) {
            $searchPrompt
              .on(inputEvent + '.' + namespace, module.search.throttle)
            ;
          }
          $searchButton
            .on('click.' + namespace, module.search.query)
          ;
          $searchResults
            .on('click.' + namespace, settings.selector.result, module.results.select)
          ;
          $module
            .data('module-' + namespace, module)
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
            $result       = $module.find(settings.selector.result),
            $category     = $module.find(settings.selector.category),
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
            $searchPrompt
              .trigger('blur')
            ;
          }
          // result shortcuts
          if($searchResults.filter(':visible').size() > 0) {
            if(keyCode == keys.enter) {
              if( $result.filter('.' + activeClass).exists() ) {
                $.proxy(module.results.select, $result.filter('.' + activeClass) )();
                event.preventDefault();
                return false;
              }
            }
            else if(keyCode == keys.upArrow) {
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
              module.search.query();
              $searchButton
                .addClass(className.down)
              ;
              $searchPrompt
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
              xhr.abort();
            }
          },
          throttle: function(event) {
            var
              searchTerm    = $searchPrompt.val(),
              numCharacters = searchTerm.length,
              timer
            ;
            clearTimeout($module.data('timer'));
            if(numCharacters >= settings.minCharacters)  {
              timer = setTimeout(module.search.query, settings.searchThrottle);
              $module
                .data('timer', timer)
              ;
            }
            else {
              module.results.hide();
            }
          },
          query: function() {
            var
              searchTerm = $searchPrompt.val(),
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
              searchResults   = [],
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
                if(typeof thing[field] == 'string' && ($.inArray(thing, searchResults) == -1) && ($.inArray(thing, fullTextResults) == -1) ) {
                  if( searchRegExp.test( thing[field] ) ) {
                    searchResults.push(thing);
                  }
                  else if( fullTextRegExp.test( thing[field] ) ) {
                    fullTextResults.push(thing);
                  }
                }
              });
            });
            searchHTML = module.results.generate({
              results: $.merge(searchResults, fullTextResults)
            });
            $module
              .removeClass(className.loading)
            ;
            module.search.cache.write(searchTerm, searchHTML);
            module.results.add(searchHTML);
          },
          remote: function(searchTerm) {
            var
              xhr     = ($module.data('xhr') !== undefined)
                ? $module.data('xhr')
                : false,
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
            // api attaches xhr event to context, use this to prevent overlapping queries
            if( xhr && xhr.state() != 'resolved') {
              xhr.abort();
            }
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
                  module.error(errors.noTemplate, false);
                }
              }
            }
            else {
              html = module.message(errors.noResults, 'empty');
            }
            $.proxy(settings.onSearchResults, $module)(response);
            return html;
          },
          add: function(html) {
            if(settings.onResultsAdd == 'default' || $.proxy(settings.onResultsAdd, $searchResults)(html) == 'default') {
              $searchResults
                .html(html)
              ;
            }
            module.results.show();
          },
          show: function() {
            if( ($searchResults.filter(':visible').size() === 0) && ($searchPrompt.filter(':focus').size() > 0) && $searchResults.html() !== '') {
              $searchResults
                .stop()
                .fadeIn(200)
              ;
              $.proxy(settings.onResultsOpen, $searchResults)();
            }
          },
          hide: function() {
            if($searchResults.filter(':visible').size() > 0) {
              $searchResults
                .stop()
                .fadeOut(200)
              ;
              $.proxy(settings.onResultsClose, $searchResults)();
            }
          },
          followLink: function() {

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
                href   = $link.attr('href'),
                target = $link.attr('target')
              ;
              try {
                module.results.hide();
                $searchPrompt
                  .val(title)
                ;
                if(target == '_blank' || event.ctrlKey) {
                  window.open(href);
                }
                else {
                  window.location.href = (href);
                }
              }
              catch(error) {}
            }
          }
        },

        /* standard module */
        setting: function(name, value) {
          if(value === undefined) {
            return settings[name];
          }
          settings[name] = value;
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
        // displays mesage visibly in search results
        message: function(text, type) {
          type = type || 'standard';
          module.results.add( settings.templates.message(text, type) );
          return settings.templates.message(text, type);
        },
        // update view with error message
        error: function(errorMessage, escalate) {
          // show user error message
          escalate = (escalate !== undefined)
            ? escalate
            : true
          ;
          console.warn(settings.moduleName + ': ' + errorMessage);
          if(escalate && errorMessage !== undefined) {
            module.message(errorMessage, 'error');
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
              module.error(errors.method);
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
        invokedResponse = module.invoke(query, element, passedArguments);
      }
      // otherwise initialize
      else {
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

  $.fn.searchPrompt.settings = {

    moduleName      : 'Search Module',
    debug           : true,
    namespace       : 'search',

    // onSelect default action is defined in module
    onSelect        : 'default',
    onResultsAdd    : 'default',

    onSearchQuery   : function(){},
    onSearchResults : function(response){},

    onResultsOpen   : function(){},
    onResultsClose  : function(){},

    automatic       : 'true',
    type            : 'simple',
    minCharacters   : 3,
    searchThrottle  : 300,
    maxResults      : 7,
    cache           : true,

    searchFields    : ['title', 'description'],

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

    errors : {
      noResults   : 'Your search returned no results',
      logging     : 'Error in debug logging, exiting.',
      noTemplate  : 'A valid template name was not specified.',
      serverError : 'There was an issue with querying the server.',
      method      : 'The method you called is not defined.'
    },

    selector : {
      searchPrompt  : '.prompt',
      searchButton  : '.search.button',
      searchResults : '.results',

      category      : '.category',
      result        : '.result',

      emptyResult   : '.results .message',
      resultPage    : '.results .page'
    },

    templates: {
      message: function(message, type) {
        var
          html = ''
        ;
        if(message !== undefined && type !== undefined) {
          html +=  ''
            + '<div class="message ' + type +'">'
            + '<div class="text">'
          ;
          // message type
          if(type == 'empty') {
            html += ''
              + '<h2>No Results</h2>'
              + '<p>' + message + '</p>'
            ;
          }
          else {
            html += ' <div class="text">' + message + '</div>';
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
                + '<ul>'
              ;
              // each item inside category
              $.each(category.results, function(index, result) {
                html  += '<li class="result">';
                html  += '<a href="' + result.url + '"></a>';
                if(result.image !== undefined) {
                  html+= ''
                    + '<div class="image">'
                    + ' <img src="' + result.image + '">'
                    + '</div>'
                  ;
                }
                html += (result.image !== undefined)
                  ? '<div class="indented info">'
                  : '<div class="info">'
                ;
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
                  + '</li>'
                ;
              });
              html  += ''
                + '</ul>'
                + '</div>'
              ;
            }
          });
          if(response.resultPage) {
            html += ''
            + '<a href="' + response.resultPage.url + '" class="result-page">'
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
          html += '<ul>';
          // each result
          $.each(response.results, function(index, result) {
            html  += '<li class="result">';

            if(result.url !== undefined) {
              html  += '<a href="' + result.url + '"></a>';
            }
            if(result.image !== undefined) {
              html+= ''
                + '<div class="image">'
                + ' <img src="' + result.image + '">'
                + '</div>'
              ;
            }
            html += (result.image !== undefined)
              ? '<div class="indented info">'
              : '<div class="info">'
            ;
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
              + '</li>'
            ;
          });
          html += '</ul>';

          if(response.resultPage) {
            html += ''
            + '<a href="' + response.resultPage.url + '" class="result-page">'
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