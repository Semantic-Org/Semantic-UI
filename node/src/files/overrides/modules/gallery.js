/*********************************
  Module - Gallery Component
  Author: Jack Lukic
  Notes: First Commit Sep 04, 2012

  Stub for future more complex
  photo gallery
******************************  */

;(function ($, window, document, undefined) {

  $.fn.gallery = function(parameters) {
    var
      settings = $.extend(true, {}, $.fn.gallery.settings, parameters),
      // hoist arguments
      moduleArguments = arguments || false
    ;


    $(this)
      .each(function(galleryIndex) {
        var
          $module            = $(this),
          $imageHolder       = $module.find(settings.selector.imageHolder),
          $image             = $module.find(settings.selector.image),
          $thumbnail         = $module.find(settings.selector.thumbnail),

          $arrow             = $module.find(settings.selector.arrow),
          $leftArrow         = $module.find(settings.selector.leftArrow),
          $rightArrow        = $module.find(settings.selector.rightArrow),

          photoSwipeInstance = settings.photoSwipe.instance + $.fn.gallery.instance,
          instance           = $module.data('module'),
          className          = settings.className,

          module
        ;
        // This counter keeps track across all plugin usage of number of instance (photoswipe crap)
        $.fn.gallery.instance = $.fn.gallery.instance + 1;

        module = {

          settings: settings,

          initialize: function() {
            // expandable with states
            if( $.fn.state !== undefined ) {
              $image
                .state()
              ;
              $thumbnail
                .state()
              ;
              $arrow
                .state()
              ;
            }
            $image
              .on('click', settings.onImageClick)
            ;
            $leftArrow
              .on('click', module.previous)
            ;
            $rightArrow
              .on('click', module.next)
            ;
            if(settings.primaryImage) {
              $thumbnail
                .on('click', module.event.thumbnail.click)
              ;
            }
            $module
              .data('module', module)
            ;
            module.photoSwipe.initialize();
          },

          // refresh selector cache
          refresh: function() {
            $image     = $module.find(settings.selector.image);
            $thumbnail = $module.find(settings.selector.thumbnail);
          },

          loading: {
            start: function() {
              $module
                .addClass(className.loading)
              ;
            },
            end: function() {
              $module
                .removeClass(className.loading)
              ;
            }
          },

          changeImage: function(image) {
            $image
              .attr('src', image)
            ;
          },

          previous: function() {
            var
              $activeThumbnail = $thumbnail.filter('.' + className.active),
              lastIndex        = ($thumbnail.size() - 1),
              activeIndex      = $thumbnail.index($activeThumbnail),
              newIndex = (activeIndex === 0)
                ? (settings.loop)
                  ? lastIndex
                  : activeIndex
                : (activeIndex - 1)
            ;
            if(newIndex !== activeIndex) {
              $thumbnail
                .eq(newIndex)
                  .trigger('click')
              ;
            }
          },
          next: function() {
            var
              $activeThumbnail = $thumbnail.filter('.' + className.active),
              lastIndex        = ($thumbnail.size() - 1),
              activeIndex      = $thumbnail.index($activeThumbnail),
              newIndex = (activeIndex === lastIndex)
                ? (settings.loop)
                  ? 0
                  : activeIndex
                : (activeIndex + 1)
            ;
            if(newIndex !== activeIndex) {
              $thumbnail
                .eq(newIndex)
                  .trigger('click')
              ;
            }
          },

          photoSwipe: {
            initialize: function() {
              var
                $otherImages   = $thumbnail.not('.' + className.active),
                $galleryImages = (settings.primaryImage)
                  ? $image.add($otherImages.clone(false))
                  : $module,
                activeInstance
              ;
              if($.fn.photoSwipe !== undefined ) {
                activeInstance = window.Code.PhotoSwipe.getInstance(photoSwipeInstance);
                if (activeInstance !== undefined && activeInstance !== null) {
                  window.Code.PhotoSwipe.detatch(activeInstance);
                  module.debug('Removing active gallery instance');
                }
                $galleryImages
                  .photoSwipe(settings.photoSwipe.settings, photoSwipeInstance)
                ;
              }
              else {
                console.error(settings.errors.photoSwipe);
              }
            },
            setPrimaryImage: function(image) {
              module.utils.precache(image);
              $image
                .attr('data-zoom', image)
              ;
            }
          },

          event: {

            preventDefault: function(event) {
              event.preventDefault();
            },

            thumbnail: {
              click: function() {
                var
                  $selectedThumbnail = $(this),
                  image              = $selectedThumbnail.data('image'),
                  zoomImage          = $selectedThumbnail.data('zoom')
                ;
                if(image !== undefined) {
                  $selectedThumbnail
                    .addClass(className.active)
                    .siblings()
                      .removeClass(className.active)
                  ;
                  module.loading.start();
                  module.utils.precache(image, function() {

                    module.loading.end();
                    module.changeImage(image);

                    if(settings.photoSwipe.enabled && zoomImage !== undefined) {
                      module.photoSwipe.setPrimaryImage(zoomImage);
                      module.refresh();
                      module.photoSwipe.initialize();
                    }
                    // callback on load
                    $.proxy(settings.onLoad, $image)();
                  });
                }
                else {
                  module.error(settings.errors.image);
                }
                // callback
                settings.onThumbClick();
              }
            }
          },

          utils: {
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
  // instance counter
  $.fn.gallery.instance = 0;

  $.fn.gallery.settings = {

    moduleName   : 'Gallery',
    debug        : false,

    primaryImage : true,
    loop         : true,

    onLoad       : function(){},
    onThumbClick : function(){},
    onImageClick : function(){},

    errors: {
      image      : 'No full sized image specified',
      photoSwipe : 'Photoswipe is not currently included in the page.',
      method     : 'The method you called is not defined'
    },

    className   : {
      loading : 'loading',
      active  : 'active',
      hover   : 'hover',
      down    : 'down'
    },

    selector    : {
      imageHolder : '.image',
      image       : '.image img',
      thumbnail   : '.thumbnails li',
      arrow       : '.arrow',
      leftArrow   : '.left.arrow',
      rightArrow  : '.right.arrow'
    },

    photoSwipe: {
      enabled  : true,
      instance : 'gallery',
      settings : {
        allowUserZoom                      : false,
        getImageSource                     : function(element) {
          return element.getAttribute('data-zoom');
        },
        captionAndToolbarAutoHideDelay     : 0,
        preventSlideshow                   : true,
        captionAndToolbarFlipPosition      : false,
        captionAndToolbarShowEmptyCaptions : false,
        imageScaleMethod                   : 'fitNoUpscale'
      }
    }


  };

})( jQuery, window , document );