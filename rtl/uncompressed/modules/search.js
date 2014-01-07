/*
 * # Semantic - Search
 * http://github.com/jlukic/semantic-ui/
 *
 *
 * Copyright 2013 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

$.fn.search = function(source, parameters) {
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