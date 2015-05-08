/*!
 * # Semantic UI - Video
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2015 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

"use strict";

$.fn.embed = function(parameters) {

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
          ? $.extend(true, {}, $.fn.embed.settings, parameters)
          : $.extend({}, $.fn.embed.settings),

        selector        = settings.selector,
        className       = settings.className,
        sources         = settings.sources,
        error           = settings.error,
        metadata        = settings.metadata,
        regExp          = settings.regExp,
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
          module.debug('Initializing embed');
          module.create();
          module.bind.events();
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
          module.verbose('Destroying previous instance of embed');
          module.reset();
          $module
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
        },

        refresh: function() {
          module.verbose('Refreshing selector cache');
          $placeholder    = $module.find(selector.placeholder);
          $playButton     = $module.find(selector.playButton);
          $embed          = $module.find(selector.embed);
        },

        bind: {
          events: function() {
            if( module.is.video() ) {
              module.debug('Adding video play events');
              $module
                .on('click' + eventNamespace, selector.placeholder, module.play)
                .on('click' + eventNamespace, selector.playButton, module.play)
              ;
            }
          }
        },

        create: function() {
          if(module.is.video()) {
            module.createVideo();
          }
        },

        createVideo: function() {
          var
            image = $module.data(metadata.image),
            html  = templates.video(image),
            url   = module.get.url()
          ;
          $module.html(html);
          module.refresh();
          $embed
            .html( module.generate.html(url) )
          ;
          if(!image && settings.autoplay) {
            module.show();
          }
          module.debug('Creating html for video element', html);
        },

        // sets new embed
        change: function(source, id, url) {
          module.debug('Changing video to ', source, id, url);
          $module
            .data(metadata.source, source)
            .data(metadata.id, id)
            .data(metadata.url, url)
          ;
          module.createVideo();
          settings.onChange.call(element);
        },

        // clears embed
        reset: function() {
          module.debug('Clearing embed and showing placeholder');
          module.remove.active();
          module.remove.embed();
          module.hide();
          settings.onReset.call(element);
        },

        // shows current embed
        show: function() {
          module.debug('Showing embed');
          module.set.active();
          settings.onDisplay.call(element);
        },

        hide: function() {
          module.debug('Hiding embed');
          module.remove.active();
        },

        get: {
          source: function(url) {
            var
              matchedSource = false
            ;
            url = url || module.get.url();
            $.each(sources, function(name, source) {
              if(source.regExp.match(url)) {
                matchedSource = name;
                return false;
              }
            });
            return matchedSource;
          },
          id: function() {
            return (settings.id !== undefined)
              ? settings.id
              : ($module.data(metadata.id) !== undefined)
                ? $module.data(metadata.id)
                : module.determine.id()
            ;
          },
          url: function() {
            return (settings.url !== undefined)
              ? settings.url
              : ($module.data(metadata.url) !== undefined)
                ? $module.data(metadata.url)
                : module.determine.url()
            ;
          }
        },

        determine: {
          id: function(url) {
            url = url || module.get.url();
            if(url.match(regExp.youtube)) {
              return url.match(regExp.youtube)[1];
            }
            else if(url.match(regExp.vimeo)) {
              return url.match(regExp.vimeo)[2];
            }
            return false;
          },
          url: function(id, source) {
            if(module.has.sourceURL()) {

            }
          }
        },


        set: {
          active: function() {
            $module.addClass(className.active);
          }
        },

        remove: {
          active: function() {
            $module.removeClass(className.active);
          },
          embed: function() {
            $embed.empty();
          }
        },

        encode: {
          parameters: function(parameters) {
            var
              urlString = [],
              index
            ;
            for (index in parameters) {
              urlString.push( encodeURIComponent(index) + '=' + encodeURIComponent( parameters[index] ) );
            }
            return urlString.join('&amp;');
          }
        },

        generate: {
          html: function(url) {
            module.debug('Generating embed html');
            var
              source = module.get.source(),
              html,
              parameters
            ;
            url = module.get.url(url);
            if(url) {
              parameters = module.generate.parameters(source);
              html       = templates.iframe(url, parameters);
            }
            else {
              module.error(error.noURL);
            }
            return html;
          },
          parameters: function(source, extraParameters) {
            var
              sourceParameters = (sources[source].parameters !== undefined)
                ? sources[source].parameters(settings)
                : {},
              parameters
            ;
            if(extraParameters) {
              parameters = $.extend({}, sourceParameters, extraParameters);
            }
            parameters = settings.onEmbed(parameters);
            return module.encode.parameters(parameters);
          }
        },

        has: {
          sourceURL: function() {

          }
        },

        is: {
          autoplay: function() {
            return (settings.autoplay === 'auto')
              ? ($module.data('image') !== undefined)
              : settings.autoplay
            ;
          },
          video: function() {

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
            module.performance.timer = setTimeout(module.performance.display, 500);
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
            if($allModules.length > 1) {
              title += ' ' + '(' + $allModules.length + ')';
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
          instance.invoke('destroy');
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

$.fn.embed.settings = {

  name        : 'Embed',
  namespace   : 'embed',

  debug       : false,
  verbose     : false,
  performance : true,

  source   : false,
  url      : false,
  id       : false,

  // standard video settings
  autoplay : 'auto',
  color    : '#444444',
  hd       : true,
  showUI   : false,

  sources: {
    youtube: {
      name     : 'youtube',
      type     : 'video',
      regExp   : /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/,
      template : '//www.youtube.com/embed/{$id}',
      parameters: function(settings) {
        return {
          autohide       : !settings.showUI,
          autoplay       : settings.autoplay,
          color          : settings.colors || undefined,
          hq             : settings.hd,
          jsapi          : settings.api,
          modestbranding : 1
        };
      }
    },
    vimeo: {
      name     : 'vimeo',
      type     : 'video',
      regExp   : /(?:https?:\/\/)?(?:www\.)?vimeo.com\/(\d+)($|\/)/,
      template : '//www.youtube.com/embed/{$id}',
      parameters: function(settings) {
        return {
          api      : settings.api,
          autoplay : settings.autoplay,
          byline   : settings.showUI,
          color    : settings.colors || undefined,
          portrait : settings.showUI,
          title    : settings.showUI
        };
      }
    }
  },

  onDisplay : function() {},
  onReset   : function() {},
  onChange  : function() {},
  onEmbed   : function(parameters) {
    return parameters;
  },

  width    : 'auto',
  height   : 'auto',

  // additional parameters to include with the embed
  parameters: false,

  // callbacks not coded yet (needs to use jsapi)
  api      : true,
  onPause  : function() {},
  onStop   : function() {},

  metadata    : {
    id     : 'id',
    image  : 'image',
    source : 'source',
    url    : 'url'
  },

  error : {
    noURL  : 'No URL specified',
    method : 'The method you called is not defined'
  },

  className : {
    active : 'active'
  },

  selector : {
    embed       : '.embed',
    placeholder : '.placeholder',
    playButton  : '.play'
  }
};

$.fn.embed.settings.templates = {
  iframe: function(url, parameters) {
    return ''
      + '<iframe src="' + url + '?=' + parameters + '"'
      + ' width="100%" height="100%"'
      + ' frameborder="0" scrolling="no" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>'
    ;
  },
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
