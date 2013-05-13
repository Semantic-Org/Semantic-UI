/*  ******************************
  Animation
  Author: Jack Lukic
  Notes: First Commit May 24, 2012

  A collection of FX/Animations

******************************  */

;(function ( $, window, document, undefined ) {


  // handles simplification of animation settings
  $.animationSettings = function(settings, duration, easing, complete) {
    // no parameters
    if(duration === undefined) {
      settings = settings;
    }
    // duration is actually settings object
    else if(typeof duration == 'object') {
      settings = $.extend({} , settings, duration);
    }
    // easing is actually complete callback
    else if(typeof easing == 'function') {
      settings = $.extend({} , settings, {
        duration: duration,
        complete: easing
      });
    }
    // easing is actually settings
    else if(typeof easing == 'object') {
      settings = $.extend(true, {} , settings, {duration: duration}, easing);
    }
    //
    else {
      settings = $.extend({} , settings, {
        duration : duration,
        easing   : easing,
        complete : complete
      });
    }
    return settings;
  };

    /*  ******************************
               Pop In -
        Animates one at a time
              scaling in
  ******************************  */

  $.fn.popIn = function(duration, easing, complete) {
    var
      settings       = $.animationSettings($.fn.popIn.settings, duration, easing, complete),

      $this          = $(this),
      totalElements  = $this.size(),
      currentElement = 0,
      callback = function() {
        var
          elementsDoneAnimating = ($this.filter(':animated').size() == 0)
        ;
        currentElement++;
        $(this)
          .css('transform', '')
          .removeClass(settings.className.init)
        ;
        $.proxy(settings.eachComplete, this)();
        if(currentElement == totalElements) {
          $.proxy(settings.complete, $this)();
        }
      },
      animate = function(index) {
        $(this)
          .delay(settings.delay * index)
          .animate({
            opacity   : settings.endOpacity,
            transform : 'scale('+ settings.endScale +')'
          }, settings.duration, settings.easing, callback)
        ;
      }
    ;
    if(settings.isLegacyBrowser) {
      $this
        .show()
      ;
    }
    else {
      $this
        .addClass(settings.className.init)
        .show()
        .css({
          opacity   : settings.startOpacity,
          transform : 'scale('+ settings.startScale +')'
        })
        .each(animate)
      ;
    }
    return $(this);
  };

  $.fn.popOut = function(duration, easing, complete) {
    var
      parameters = $.animationSettings($.fn.popIn.settings, duration, easing, complete),
      // flip some defaults
      defaults   = {
        complete: function() {
          $(this).hide();
          $.proxy(parameters.complete, this)();
        },
        startOpacity : parameters.endOpacity,
        endOpacity   : 0,
        startScale   : parameters.endScale,
        endScale     : parameters.startScale
      },
      settings = $.extend(true, {}, parameters, defaults)
    ;
    $(this)
      .popIn(settings)
    ;
  };

  $.fn.popIn.settings = {

    // legacy browser
    isLegacyBrowser: false,

    // class given until animation ends
    className: {
      init    : 'init'
    },
    // duration of each animation
    duration     : 450,
    // easing for animation
    easing       : 'easeOutExpo',
    // delay before each
    delay        : 100,

    startOpacity : 0,
    endOpacity   : 1,

    startScale   : 0.7,
    endScale     : 1,
    // called after each element completes
    eachComplete : function(){},
    // called after entire chain of animation completes
    complete     : function(){}
  };


  $.fn.kenBurns = function(duration, easing, complete) {
    var
      settings = $.animationSettings($.fn.kenBurns.settings, duration, easing, complete),
      module = {

        randomPosition: function(starting, rangeMin, rangeMax) {
          var
            rangeMax = (rangeMax !== undefined)
              ? rangeMax
              : rangeMin,
            number   = Math.random() * ((starting + rangeMax) - (starting - rangeMin) ) + (starting - rangeMin)
          ;
          return parseInt(number, 10);
        },

        animate: function() {
          var
            startingPosition = {},
            endingPosition   = {},
            startingScale,
            endingScale
          ;

          startingPosition = (settings.useStartPosition)
            ? {
                x: parseInt( $(this).css('background-position-x'), 10),
                y: parseInt( $(this).css('background-position-y'), 10)
              }
            : {
                x: module.randomPosition(50, settings.xRange),
                y: module.randomPosition(50, settings.yRange)
              }
          ;
          // determine direction of animation based on origin position
          endingPosition.x = (startingPosition.x > 50)
            ? module.randomPosition(startingPosition.x, settings.xMaxTravelDistance, -settings.xMinTravelDistance)
            : module.randomPosition(startingPosition.x, -settings.xMinTravelDistance, settings.xMaxTravelDistance)
          ;
          endingPosition.y = (startingPosition.y > 50)
            ? module.randomPosition(startingPosition.y, settings.yMaxTravelDistance, -settings.yMinTravelDistance)
            : module.randomPosition(startingPosition.y, -settings.yMinTravelDistance, settings.yMaxTravelDistance)
          ;

          /*console.log(startingPosition.x + '% ' + startingPosition.y + '%');
          console.log(endingPosition.x + '% ' + endingPosition.y + '%');*/

          $(this)
            .css({
              backgroundPosition: startingPosition.x + '%',
              backgroundPositionY: startingPosition.y + '%'
            })
            .stop()
            .animate({
              backgroundPosition: endingPosition.x + '%',
              backgroundPositionY: endingPosition.y + '%'
            }, settings.duration, settings.easing, settings.complete)
          ;
        }

      }
    ;
    if(!settings.isLegacyBrowser) {
      $(this)
        .each(module.animate)
      ;
    }
    return $(this);
  };

  $.fn.kenBurns.settings = {

    // legacy browser
    isLegacyBrowser    : false,

    // duration of animation
    duration           : 10000,
    // easing for animation
    easing             : 'linear',
    useStartPosition   : false,

    xRange             : 40,
    yRange             : 20,

    xMinTravelDistance : 30,
    xMaxTravelDistance : 60,

    yMinTravelDistance : 20,
    yMaxTravelDistance : 40,

    // not yet implemented, need css hook for background-size
    scale              : 0.1,

    // called after entire chain of animation completes
    complete         : function(){}
  };


})( jQuery, window , document );