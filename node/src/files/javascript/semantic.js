// namespace
window.semantic = {
  handler: {}
};

// Allow for console.log to not break IE
if (typeof window.console == "undefined" || typeof window.console.log == "undefined") {
  window.console = {
    log  : function() {},
    info : function(){},
    warn : function(){}
  };
}
if(typeof window.console.group == 'undefined' || typeof window.console.groupEnd == 'undefined' || typeof window.console.groupCollapsed == 'undefined') {
  window.console.group = function(){};
  window.console.groupEnd = function(){};
  window.console.groupCollapsed = function(){};
}
if(typeof window.console.markTimeline == 'undefined') {
  window.console.markTimeline = function(){};
}
window.console.clear = function(){};

// ready event
semantic.ready = function() {

  // selector cache
  var
    $ui           = $('.ui').not('.hover, .down'),
    $swap         = $('.theme.menu .item'),
    $menu         = $('.sidebar'),
    $sortTable    = $('.sortable.table'),
    $demo         = $('.demo'),
    $waypoints    = $('.main.container').children('h2'),

    $menuPopup    = $('.ui.main.menu .popup.item'),

    $example      = $('.example'),
    $shownExample = $example.filter('.shown'),

    $developer    = $('.developer.item'),
    $designer     = $('.designer.item'),

    $increaseFont = $('.font .increase'),
    $decreaseFont = $('.font .decrease'),

    $peek         = $('.peek'),
    $peekItem     = $peek.children('.menu').children('a.item'),
    $peekSubItem  = $peek.find('.item .menu .item'),
    $code         = $('div.code'),

    // alias
    handler
  ;

  // event handlers
  handler = {

    createIcon: function() {
      $example
        .each(function(){
          $('<i/>')
            .addClass('icon code')
            .prependTo( $(this) )
          ;
        })
      ;
    },

    font: {

      increase: function() {
        var
          $container = $(this).parent().prev('.ui.segment'),
          fontSize   = parseInt( $container.css('font-size'), 10)
        ;
        $container
          .css('font-size', fontSize + 1)
        ;
      },
      decrease: function() {
        var
          $container = $(this).parent().prev('.ui.segment'),
          fontSize   = parseInt( $container.css('font-size'), 10)
        ;
        $container
          .css('font-size', fontSize - 1)
        ;
      }
    },

    developerMode: function() {
      $developer.addClass('active');
      $designer.removeClass('active');
      $example
        .each(function() {
          $.proxy(handler.createCode, $(this))('developer');
        })
      ;
    },
    designerMode: function() {
      $designer.addClass('active');
      $developer.removeClass('active');
      $example
        .each(function() {
          $.proxy(handler.createCode, $(this))('designer');
        })
      ;
    },

    createCode: function(type) {
      var
        $example   = $(this).closest('.example'),
        $header    = $example.children('.ui.header:first-of-type, p:first-of-type'),
        $demo      = $example.children().not($header).not('i.code:first-child, .annotated, br, .ignore'),
        $annotated = $example.find('.annotated'),
        $code      = $annotated.find('.code'),
        whiteSpace = new RegExp('\\n\\s{4}', 'g'),
        code       = ''
      ;
      // if ui has wrapper use that
      // if($demo.filter('.ui').size() === 0) {
      //   $demo = $example.children().eq(3).children();
      // }
      // add source if doesnt exist and initialize
      if($annotated.size() === 0) {
        $annotated = $('<div/>')
          .addClass('annotated')
          .appendTo($example)
        ;
      }
      if( $code.size() === 0) {
        $demo
          .each(function(){
            if($(this).not('br')) {
              code += $(this).get(0).outerHTML + "\n";
            }
          })
        ;
        // code  = $.trim(code.replace(whiteSpace, '\n'));
        $code = $('<div/>')
          .data('type', 'html')
          .addClass('code')
          .html(code)
            .appendTo($annotated)
        ;
        $.proxy(handler.initializeCode, $code)();
      }
      if( ($demo.first().is(':visible') || type == 'developer') && type != 'designer' ) {
        $demo.hide();
        $header.show();
        $annotated.fadeIn(500);
      }
      else {
        $annotated.hide();
        if($demo.size() > 1) {
          $demo.show();
        }
        else {
          $demo.fadeIn(500);
        }
      }
    },

    initializeCode: function() {
      var
        $code       = $(this),
        code        = $code.html(),
        contentType = $code.data('type') || 'javascript',
        whiteSpace  = new RegExp('\\n\\s{4}', 'g'),
        padding     = 4,
        editor,
        editorSession,
        codeHeight
      ;

      // trim whitespace
      code = $.trim(code.replace(whiteSpace, '\n'));
      $code.text(code);

      if($code.hasClass('evaluated')) {
        eval(code);
      }

      // initialize
      editor        = ace.edit($code[0]);
      editorSession = editor.getSession();

      editor.setTheme('ace/theme/github');
      editor.setShowPrintMargin(false);
      editor.setReadOnly(true);
      editor.renderer.setShowGutter(false);
      editor.setHighlightActiveLine(false);
      editorSession.setUseWrapMode(true);

      editorSession.setMode('ace/mode/'+ contentType);
      editorSession.setTabSize(2);
      editorSession.setUseSoftTabs(true);

      codeHeight    = editor.session.getScreenLength() * (editor.renderer.lineHeight)  + editor.renderer.scrollBar.getWidth() + padding;

      $(this).height(codeHeight + 'px');
      editor.resize();

    },

    movePeek: function() {
      if( $('.stuck .peek').size() > 0 ) {
        $('.peek')
          .toggleClass('pushed')
        ;
      }
      else {
        $('.peek')
          .removeClass('pushed')
        ;
      }
    },

    menu: {
      mouseenter: function() {
        $(this)
          .stop()
          .animate({
            width: '120px'
          }, 300, function() {
            $(this).find('.text').show();
          })
        ;
      },
      mouseleave: function(event) {
        $(this).find('.text').hide();
        $(this)
          .stop()
          .animate({
            width: '10px'
          }, 300)
        ;
      }

    },

    peek: function() {
      var
        $body     = $('html, body'),
        $header   = $(this),
        $menu     = $header.parent(),
        $group    = $menu.children(),
        $headers  = $group.add( $group.find('.menu .item') )
        $waypoint = $waypoints.eq( $group.index( $header ) ),
        offset    = $waypoint.offset().top - 80
      ;
      if(!$header.hasClass('active') ) {
        $menu
          .addClass('animating')
        ;
        $headers
          .removeClass('active')
        ;
        $body
          .stop()
          .animate({
            scrollTop: offset
          }, 500, function() {
            $menu
              .removeClass('animating')
            ;
            $headers
              .removeClass('active')
            ;
            $header
              .addClass('active')
            ;
          })
          .one('scroll', function() {
            $body.stop();
          })
        ;
      }
    },

    peekSub: function() {
      var
        $body           = $('html, body'),
        $subHeader      = $(this),
        $header         = $subHeader.parents('.item'),
        $menu           = $header.parent(),
        $subHeaderGroup = $header.find('.item'),
        $headerGroup    = $menu.children(),
        $waypoint       = $('h2').eq( $headerGroup.index( $header ) )
        $subWaypoint    = $waypoint.nextAll('h3').eq( $subHeaderGroup.index($subHeader) ),
        offset          = $subWaypoint.offset().top - 80
      ;
      $menu
        .addClass('animating')
      ;
      $headerGroup
        .removeClass('active')
      ;
      $subHeaderGroup
        .removeClass('active')
      ;
      $body
        .stop()
        .animate({
          scrollTop: offset
        }, 500, function() {
          $menu
            .removeClass('animating')
          ;
          $subHeader
            .addClass('active')
          ;
        })
        .one('scroll', function() {
          $body.stop();
        })
      ;
    },

    swapStyle: function() {
      var
        theme = $(this).data('theme')
      ;
      $(this)
        .addClass('active')
        .siblings()
          .removeClass('active')
      ;
      $('head link.ui')
        .each(function() {
          var
            href         = $(this).attr('href'),
            subDirectory = href.split('/')[3],
            newLink      = href.replace(subDirectory, theme)
          ;
          $(this)
            .attr('href', newLink)
          ;
        })
      ;
    }
  };

  // attach events
  if($.fn.tablesort !== undefined) {
    $sortTable
      .tablesort()
    ;
  }

  if(window.ace !== undefined) {
    $code
      .each(handler.initializeCode)
    ;
  }

  handler.createIcon();
  $example
    .find('i.code')
      .on('click', handler.createCode)
  ;

  $shownExample
    .each(handler.createCode)
  ;

  $swap
    .on('click', handler.swapStyle)
  ;

  $increaseFont
    .on('click', handler.font.increase)
  ;
  $decreaseFont
    .on('click', handler.font.decrease)
  ;

  $developer
    .on('click', handler.developerMode)
  ;
  $designer
    .on('click', handler.designerMode)
  ;

  $menuPopup
    .popup({
      position: 'bottom center',
      className: {
        popup: 'ui popup'
      }
    })
  ;

  $menu
    .sidr({
      name: 'menu'
    })
    .filter('.button')
      .on('click', handler.movePeek)
      .on('mouseenter', handler.menu.mouseenter)
      .on('mouseleave', handler.menu.mouseleave)
  ;

  $waypoints
    .waypoint({
      continuous : false,
      offset     : 100,
      handler    : function(direction) {
        var
          index = (direction == 'down')
            ? $waypoints.index(this)
            : ($waypoints.index(this) - 1 >= 0)
              ? ($waypoints.index(this) - 1)
              : 0
        ;
        $peekItem
          .removeClass('active')
          .eq( index )
            .addClass('active')
        ;
      }
    })
  ;
  $('body')
    .waypoint({
      handler: function(direction) {
        if(direction == 'down') {
          $peekItem
            .removeClass('active')
            .eq( $peekItem.size() - 1 )
              .addClass('active')
          ;
        }
      },
      offset: 'bottom-in-view'
     })
  ;
  $peek
    .waypoint('sticky', {
      offset     : 85,
      stuckClass : 'stuck'
    })
  ;
  $peekItem
    .state('destroy')
    .on('click', handler.peek)
  ;
  $peekSubItem
    .on('click', handler.peekSub)
  ;

};


// attach ready event
$(document)
  .ready(semantic.ready)
;