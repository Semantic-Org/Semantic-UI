/*  ******************************
  Module - Simple Tab Navigation
  Author: Jack Lukic
  Notes: First Commit Aug 15, 2012

  History based tab navigation
******************************  */

;(function ($, window, document, undefined) {

  $.fn.tabNavigation = function(parameters) {

    var
      settings        = $.extend(true, {}, $.fn.tabNavigation.settings, parameters),
      
      $module         = $(this),
      $tabs           = $(settings.context).find(settings.selector.tabs),
      
      firstLoad       = true,
      cache           = {},
      recursionDepth  = 0,
      
      activeTabPath,
      parameterArray,
      historyEvent,
      
      element         = this,
      time            = new Date().getTime(),
      performance     = [],
      moduleSelector  = $module.selector || '',

      eventNamespace  = '.' + settings.namespace,
      moduleNamespace = 'module-' + settings.namespace,
      
      className       = settings.className,
      metadata        = settings.metadata,
      namespace       = settings.namespace,
      errors          = settings.errors,
      
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
            module.error(errors.state);
            return false;
          }
          else if(settings.path === false) {
            module.error(errors.path);
            return false;
          }
          else {
            module.verbose('Address library found adding state change event');
            $.address
              .state(settings.path)
              .change(module.event.history.change)
            ;
          }
        }
        // attach events if navigation wasn't set to window
        if( !$.isWindow( $module.get(0) ) ) {
          $module
            .on('click.' + eventNamespace, module.event.click)
          ;
        }
        $module
          .data(moduleNamespace, module)
        ;
      },

      destroy: function() {
        module.debug('Destroying tabs', $module);
        $module
          .off('.' + namespace)
        ;
      },

      event: {
        click: function() {
          module.debug('Navigation clicked');
          var
            tabPath = $(this).data(metadata.tab)
          ;
          if(tabPath !== undefined) {
            if(tabPath !== activeTabPath) {
              if(settings.history) {
                $.address.value(tabPath);
              }
              else {
                module.change(tabPath);
              }
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
              module.change(tabPath);
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
          module.change(activeTabPath);
        }
      },

      cache: {
        read: function(tabPath) {
          return (tabPath !== undefined)
            ? cache[tabPath]
            : cache
          ;
        },
        add: function(tabPath, content) {
          tabPath = tabPath || activeTabPath;
          module.debug('Adding cached content for', tabPath);
          cache[tabPath] = content;
        },
        remove: function(tabPath) {
          tabPath = tabPath || activeTabPath;
          module.debug('Removing cached content for', tabPath);
          delete cache[tabPath];
        }
      },

      change: function(tabPath) {
        var
          pathArray = module.get.defaultPathArray(tabPath)
        ;
        module.deactivate.all();
        $.each(pathArray, function(index, tab) {
          var
            currentPathArray   = pathArray.slice(0, index + 1),
            currentPath        = module.utils.arrayToPath(currentPathArray),
            
            isLastTab          = (module.utils.last(pathArray) == currentPath),
            isTab              = module.is.tab(currentPath),
            isParam            = !(isTab),

            pushStateAvailable = (window.history && window.history.pushState),
            shouldIgnoreLoad   = (pushStateAvailable && settings.ignoreFirstLoad && firstLoad),
            remoteContent      = $.isPlainObject(settings.apiSettings),
            
            $tab               = module.get.tabElement(currentPath)
          ;
          module.verbose('Looking for tab', tab);
          if(isParam) {
            module.verbose('Tab is not found, assuming it is a parameter', tab);
            return true;
          }
          else if(isTab) {
            // scope up
            module.verbose('Tab was found', tab);
            activeTabPath = currentPath;
            parameterArray = module.utils.filterArray(pathArray, currentPathArray);
            if(isLastTab && remoteContent) {
              if(!shouldIgnoreLoad) {
                module.activate.navigation(currentPath);
                module.content.fetch(currentPath, settings.onTabLoad);
              }
              else {
                module.debug('Ignoring remote content on first tab load', currentPath);
                firstLoad = false;
                cache[tabPath] = $tab.html();
                module.activate.all(currentPath);
                $.proxy(settings.onTabInit, $tab)(currentPath, parameterArray, historyEvent);
              }
            }
            else {
              module.debug('Opened tab', currentPath);
              module.activate.all(currentPath);
              $.proxy(settings.onTabLoad, $tab)(currentPath, parameterArray, historyEvent);
            }

          }
        });
      },

      content: {
        
        fetch: function(tabPath) {
          var
            $tab             = module.get.tabElement(tabPath),
            cachedContent    = cache[tabPath] || false,
            apiSettings      = {
              dataType     : 'html',
              stateContext : $tab,
              success      : function(response) {
                cache[tabPath] = response;
                module.content.update(tabPath, response);
                if(tabPath == activeTabPath) {
                  module.debug('Content loaded', tabPath);
                  module.activate.tab(tabPath);
                }
                else {
                  module.debug('Content loaded in background', tabPath);
                }
                $.proxy(settings.onTabInit, $tab)(tabPath, parameterArray, historyEvent);
              },
              urlData: { tab: tabPath }
            },
            request         = $tab.data(metadata.promise) || false,
            existingRequest = ( request && request.state() === 'pending' )
          ;
          if(settings.cache && cachedContent) {
            module.debug('Showing existing content', tabPath);
            // module.content.update(tabPath, cachedContent);
            module.activate.tab(tabPath);
            $.proxy(settings.onTabLoad, $tab)(tabPath, parameterArray, historyEvent);
          }
          else if(existingRequest) {
            module.debug('Content is already loading', tabPath);
            $tab
              .addClass(className.loading)
            ;
          }
          else if($.api !== undefined) {
            module.debug('Retrieving content', tabPath);
            $.api( $.extend(true, {}, settings.apiSettings, apiSettings) );
          }
          else {
            module.error(errors.api);
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
            $nav = module.get.navElement(tabPath)
          ;
          module.verbose('Activating tab navigation for', $nav);
          $nav.addClass(className.active);
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
          return ( module.get.tabElement(tabName).size() > 0 );
        }
      },

      get: {
        initialPath: function() {
          return $module.eq(0).data(metadata.tab) || $tabs.eq(0).data(metadata.tab);
        },
        // adds default tabs to tab path
        defaultPathArray: function(tabPath) {
          return module.utils.pathToArray( module.get.defaultPath(tabPath) );
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
            module.error(errors.recursion);
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
          tabPathArray   = module.utils.pathToArray(tabPath);
          lastTab        = module.utils.last(tabPathArray);
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

      utils: {
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
        module.error = Function.prototype.bind.call(console.error, console, settings.moduleName + ':');
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
              'Arguments'      : message[1] || '',
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
          time        = false;
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
          query    = query.split('.');
          maxDepth = query.length - 1;
          $.each(query, function(depth, value) {
            if( $.isPlainObject( instance[value] ) && (depth != maxDepth) ) {
              instance = instance[value];
            }
            else if( instance[value] !== undefined ) {
              found = instance[value];
            }
            else {
              module.error(errors.method);
            }
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

    return (invokedResponse !== undefined)
      ? invokedResponse
      : this
    ;

  };

  // shortcut for tabbed content with no defined navigation
  $.tabNavigation = function(settings) {
    $(window).tabNavigation(settings);
  };

  $.fn.tabNavigation.settings = {

    moduleName      : 'Tab Module',
    verbose         : true,
    debug           : true,
    performance     : true,
    namespace       : 'tab',

    // only called first time a tab's content is loaded (when remote source)
    onTabInit       : function(tabPath, parameterArray, historyEvent) {},
    // called on every load
    onTabLoad       : function(tabPath, parameterArray, historyEvent) {},

    templates: {
      determineTitle: function(tabArray) {}
    },
    
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

    errors: {
      api        : 'You attempted to load content without API module',
      noContent  : 'The tab you specified is missing a content url.',
      method     : 'The method you called is not defined',
      state      : 'The state library has not been initialized',
      missingTab : 'Missing tab: ',
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