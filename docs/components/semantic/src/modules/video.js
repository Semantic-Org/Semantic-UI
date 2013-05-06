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
      settings = $.extend(true, {}, $.fn.video.settings, parameters),
      // make arguments available
      moduleArguments = arguments || false,
      invokedResponse
    ;

    $(this)
      .each(function() {
        var
          $module      = $(this),
          $placeholder = $module.find(settings.selector.placeholder),
          $playButton  = $module.find(settings.selector.playButton),
          $embed       = $module.find(settings.selector.embed),

          element       = this,
          instance      = $module.data('module-' + settings.namespace),
          methodInvoked = (typeof parameters == 'string'),

          namespace    = settings.namespace,
          metadata     = settings.metadata,
          className    = settings.className,

          module
        ;

        module = {

          initialize: function() {
            module.debug('Initializing video');
            $placeholder
              .off('.video')
              .on('click.' + namespace, module.play)
            ;
            $playButton
              .off('.video')
              .on('click.' + namespace, module.play)
            ;
            $module
              .data('module-' + namespace, module)
            ;
          },

          // sets new video
          change: function(source, flv) {
            module.debug('Changing video to ', flv);
            $module
              .data(metadata.source, source)
              .data(metadata.flv, flv)
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
              source = $module.data(metadata.source),
              flv    = $module.data(metadata.flv)
            ;
            $embed
              .html( module.generate.html(source, flv) )
            ;
            $module
              .addClass(className.active)
            ;
            settings.onPlay();
          },

          generate: {
            // generates iframe html
            html: function(source, flv) {
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
              if(source == 'vimeo') {
                html = ''
                  + '<iframe src="http://player.vimeo.com/video/' + flv + '?=' + module.generate.url(source) + '"'
                  + ' width="' + width + '" height="' + height + '"'
                  + ' frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>'
                ;
              }
              else if(source == 'youtube') {
                html = ''
                  + '<iframe src="http://www.youtube.com/embed/' + flv + '?=' + module.generate.url(source) + '"'
                  + ' width="' + width + '" height="' + height + '"'
                  + ' frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>'
                ;
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

          /* standard module */
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
                module.error(settings.errors.method);
                return false;
              });
            }
            if ( $.isFunction( method ) ) {
              return method.apply(context, methodArguments);
            }
            // return retrieved variable or chain
            return method;
          }
        };
        // check for invoking internal method
        if(methodInvoked) {
          invokedResponse = module.invoke(moduleArguments[0], this, Array.prototype.slice.call( moduleArguments, 1 ) );
        }
        // otherwise initialize
        else {
          if(instance) {
            module.destroy();
          }
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


  $.fn.videoPlaylist = function(video, parameters) {
    var
      $allModules = $(this),
      $video      = $(video),
      $iframe     = $video.find('.embed iframe'),

      settings    = $.extend({}, $.fn.videoPlaylist.settings, parameters, true)
    ;
    $allModules
      .each(function() {
        var
          $element    = $(this),

          metadata    = settings.metadata,
          namespace   = settings.namespace,
          className   = settings.className,

          module       = {
            initialize: function() {
              $element
                .on('click.' + namespace , module.changeVideo)
              ;
            },
            changeVideo: function() {
              var
                flv         = $element.data(metadata.flv)         || false,
                source      = $element.data(metadata.source)      || false,
                placeholder = $element.data(metadata.placeholder) || false
              ;
              if(flv && source) {
                $video
                  .data(metadata.source, source)
                  .data(metadata.flv, flv)
                ;
                if(settings.showPlaceholder) {
                  $video
                    .removeClass(className.active)
                    .find($.fn.video.selector.placeholder)
                      .attr('src', placeholder)
                  ;
                }
                else {
                  try {
                    $video
                      .video('play')
                    ;
                  }
                  catch(error) {
                    console.warn('Video Playlist Module: ' + settings.error.init);
                  }
                }
                $allModules
                  .removeClass(className.active)
                ;
                $element
                  .addClass(className.active)
                ;
              }
            }
          }
        ;
        module.initialize();
      })
    ;

    if(settings.playFirst) {
      $allModules
        .eq(0)
        .trigger('click')
      ;
      // we all like a good hack
      if($iframe.size() > 0) {
        $iframe
          .attr('src', $iframe.attr('src').replace('autoplay=1', 'autoplay=0') )
        ;
      }

    }

  };

  $.fn.video.settings = {

    moduleName  : 'Video',
    namespace   : 'video',
    debug       : false,
    
    metadata    : {
      source      : 'source',
      flv         : 'flv'
    },
    
    onPlay      : function(){},
    onReset     : function(){},
    onChange    : function(){},
    
    // callbacks not coded yet (needs to use jsapi)
    play        : function() {},
    pause       : function() {},
    stop        : function() {},
    
    width       : 'auto',
    height      : 'auto',
    
    autoplay    : false,
    color       : '#442359',
    hd          : true,
    showUI      : false,
    api         : true,
    
    errors      : {
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

  $.fn.videoPlaylist.settings = {
    moduleName      : 'Video Playlist',
    namespace       : 'videoPlaylist',

    source          : 'vimeo',
    showPlaceholder : false,
    playFirst       : true,

    metadata: {
      flv         : 'flv',
      source      : 'source',
      placeholder : 'placeholder'
    },

    errors: {
      init   : 'The video player you specified was not yet initialized'
    },

    className : {
      active  : 'active'
    }

  };

})( jQuery, window , document );
