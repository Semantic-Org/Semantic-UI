/*
 * Sidr
 * https://github.com/artberri/sidr
 *
 * Copyright (c) 2013 Alberto Varela
 * Licensed under the MIT license.
 */

;(function( $ ){

  var sidrMoving = false,
      sidrOpened = false;

  // Private methods
  var privateMethods = {
    // Check for valids urls
    // From : http://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-an-url
    isUrl: function (str) {
      var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
      if(!pattern.test(str)) {
        return false;
      } else {
        return true;
      }
    },
    // Loads the content into the menu bar
    loadContent: function($menu, content) {
      $menu.html(content);
    },
    // Add sidr prefixes
    addPrefix: function($element) {
      var elementId = $element.attr('id'),
          elementClass = $element.attr('class');

      if(typeof elementId === 'string' && '' !== elementId) {
        $element.attr('id', elementId.replace(/([A-Za-z0-9_.\-]+)/g, 'sidr-id-$1'));
      }
      if(typeof elementClass === 'string' && '' !== elementClass && 'sidr-inner' !== elementClass) {
        $element.attr('class', elementClass.replace(/([A-Za-z0-9_.\-]+)/g, 'sidr-class-$1'));
      }
      $element.removeAttr('style');
    },
    execute: function(action, name, callback) {
      // Check arguments
      if(typeof name === 'function') {
        callback = name;
        name = 'sidr';
      }
      else if(!name) {
        name = 'sidr';
      }

      // Declaring
      var $menu = $('#' + name),
          $body = $($menu.data('body')),
          $html = $('html'),
          menuWidth = $menu.outerWidth(true),
          speed = $menu.data('speed'),
          side = $menu.data('side'),
          bodyAnimation,
          menuAnimation,
          scrollTop;

      // Open Sidr
      if('open' === action || ('toogle' === action && !$menu.is(':visible'))) {
        // Check if we can open it
        if( $menu.is(':visible') || sidrMoving ) {
          return;
        }

        // If another menu opened close first
        if(sidrOpened !== false) {
          methods.close(sidrOpened, function() {
            methods.open(name);
          });

          return;
        }

        // Lock sidr
        sidrMoving = true;

        // Left or right?
        if(side === 'left') {
          bodyAnimation = {left: menuWidth + 'px'};
          menuAnimation = {left: '0px'};
        }
        else {
          bodyAnimation = {right: menuWidth + 'px'};
          menuAnimation = {right: '0px'};
        }

        // Prepare page
        scrollTop = $html.scrollTop();
        $html.css('overflow-x', 'hidden').scrollTop(scrollTop);

        // Open menu
        $body.css({
          position: 'absolute',
          width: $body.width()
        }).animate(bodyAnimation, speed);
        $menu.css('display', 'block').animate(menuAnimation, speed, function() {
          sidrMoving = false;
          sidrOpened = name;
          // Callback
          if(typeof callback === 'function') {
            callback(name);
          }
        });
      }
      // Close Sidr
      else {
        // Check if we can close it
        if( !$menu.is(':visible') || sidrMoving ) {
          return;
        }

        // Lock sidr
        sidrMoving = true;

        // Right or left menu?
        if(side === 'left') {
          bodyAnimation = {left: 0};
          menuAnimation = {left: '-' + menuWidth + 'px'};
        }
        else {
          bodyAnimation = {right: 0};
          menuAnimation = {right: '-' + menuWidth + 'px'};
        }

        // Close menu
        scrollTop = $html.scrollTop();
        $html.removeAttr('style').scrollTop(scrollTop);
        $body.animate(bodyAnimation, speed);
        $menu.animate(menuAnimation, speed, function() {
          $menu.removeAttr('style');
          $body.removeAttr('style');
          $('html').removeAttr('style');
          sidrMoving = false;
          sidrOpened = false;
          // Callback
          if(typeof callback === 'function') {
            callback(name);
          }
        });
      }
    }
  };

  // Sidr public methods
  var methods = {
    open: function(name, callback) {
      privateMethods.execute('open', name, callback);
    },
    close: function(name, callback) {
      privateMethods.execute('close', name, callback);
    },
    toogle: function(name, callback) {
      privateMethods.execute('toogle', name, callback);
    }
  };

  $.sidr = function( method ) {

    if ( methods[method] ) {
      return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'function' ||  typeof method === 'string'  || ! method ) {
      return methods.toogle.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.sidr' );
    }

  };

  $.fn.sidr = function( options ) {

    var settings = $.extend( {
      name          : 'sidr', // Name for the 'sidr'
      speed         : 200,    // Accepts standard jQuery effects speeds (i.e. fast, normal or milliseconds)
      side          : 'left', // Accepts 'left' or 'right'
      source        : null,   // Override the source of the content.
      renaming      : true,   // The ids and classes will be prepended with a prefix when loading existent content
      body          : 'body'  // Page container selector,
    }, options);

    var name = settings.name,
        $sideMenu = $('#' + name);

    // If the side menu do not exist create it
    if( $sideMenu.length === 0 ) {
      $sideMenu = $('<div />')
        .attr('id', name)
        .appendTo($('body'));
    }

    // Adding styles and options
    $sideMenu
      .addClass('sidr')
      .addClass(settings.side)
      .data({
        speed          : settings.speed,
        side           : settings.side,
        body           : settings.body
      });

    // The menu content
    if(typeof settings.source === 'function') {
      var newContent = settings.source(name);
      privateMethods.loadContent($sideMenu, newContent);
    }
    else if(typeof settings.source === 'string' && privateMethods.isUrl(settings.source)) {
      $.get(settings.source, function(data) {
        privateMethods.loadContent($sideMenu, data);
      });
    }
    else if(typeof settings.source === 'string') {
      var htmlContent = '',
          selectors   = settings.source.split(',');

      $.each(selectors, function(index, element) {
        htmlContent += '<div class="sidr-inner">' + $(element).html() + '</div>';
      });

      // Renaming ids and classes
      if(settings.renaming) {
        var $htmlContent = $('<div />').html(htmlContent);
        $htmlContent.find('*').each(function(index, element) {
          var $element = $(element);
          privateMethods.addPrefix($element);
        });
        htmlContent = $htmlContent.html();
      }
      privateMethods.loadContent($sideMenu, htmlContent);
    }
    else if(settings.source !== null) {
      $.error('Invalid Sidr Source');
    }

    return this.each(function(){

      var $this = $(this),
          data = $this.data('sidr');

      // If the plugin hasn't been initialized yet
      if ( ! data ) {
        $this.data('sidr', name);
        $this.click(function(e) {
          e.preventDefault();
          methods.toogle(name);
        });
      }
    });
  };

})( jQuery );