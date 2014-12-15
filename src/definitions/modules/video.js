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
