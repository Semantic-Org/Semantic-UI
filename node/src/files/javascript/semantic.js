// namespace
window.semantic = {
  handler: {}
};

// ready event
semantic.ready = function() {

  // selector cache
  var
    $ui          = $('.ui').not('.hover, .down'),
    $checkbox    = $('.ui.checkbox'),
    $swap        = $('.theme.menu .item'),
    $menu        = $('.sidebar'),
    $sortTable   = $('.sortable.table'),
    $demo        = $('.demo'),
    $waypoints   = $('h2'),
    
    $menuPopup   = $('.ui.main.menu .popup.item'),

    $example     = $('.example'),
    
    $peek        = $('.peek'),
    $peekItem    = $peek.children('.menu').children('a.item'),
    $peekSubItem = $peek.find('.item .menu .item'),
    $code        = $('div.code'),

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

    createCode: function() {
      var
        $example   = $(this).closest('.example'),
        $demo      = $example.children().not('p, h4, i.code, .annotated, .ignore'),
        $annotated = $example.find('.annotated'),
        $code      = $annotated.find('.code'),
        whiteSpace = new RegExp('\\n\\s{4}', 'g'),
        code = ''
      ;
      // if ui has wrapper use that
      if($demo.filter('.ui').size() === 0) {
        $demo = $example.children().eq(3).children();
      }
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
            if($(this).hasClass('ui')) {
              code += $(this).get(0).outerHTML + "\n";
            }
          })
        ;
        code  = $.trim(code.replace(whiteSpace, '\n'));
        $code = $('<div/>')
          .data('type', 'html')
          .addClass('code')
          .text(code)
            .appendTo($annotated)
        ;
        $.proxy(handler.initializeCode, $code)();
      }
      if( $demo.first().is(':visible') ) {
        $demo.hide();
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
        $code         = $(this),
        contentType   = $code.data('type') || 'javascript',
        editor        = ace.edit($code[0]),
        editorSession = editor.getSession(),
        padding       = 4,
        codeHeight    = editor.getSession().getScreenLength() * (editor.renderer.lineHeight)  + editor.renderer.scrollBar.getWidth() + padding
      ;
      editor.setTheme('ace/theme/github');
      editor.setShowPrintMargin(false);
      editor.setReadOnly(true);
      editor.renderer.setShowGutter(false);
      editor.setHighlightActiveLine(false);
      editorSession.setUseWrapMode(true);

      editorSession.setMode('ace/mode/'+ contentType);
      editorSession.setTabSize(2);
      editorSession.setUseSoftTabs(true);


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
        $menu
          .stop()
          .animate({
            width: '105px'
          }, 300, function() {
            $menu.find('.text').show();
          })
        ;
      },
      mouseleave: function(event) {
        $menu.find('.text').hide();
        $menu
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
        $waypoint = $('h2').eq( $group.index( $header ) ),
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
      console.log($subHeader, $headerGroup, $header, $waypoint, $subWaypoint, $subHeaderGroup.index($subHeader))
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
          console.log(theme, newLink);
          $(this)
            .attr('href', newLink)
          ;
        })
      ;
    }
  };

  // attach events
  $ui
    .state()
  ;
  if($.fn.tablesort !== undefined) {
    $sortTable
      .tablesort()
    ;
  }

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

  $checkbox
    .checkbox()
  ;

  $swap
    .on('click', handler.swapStyle)
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
    .on('mouseenter', handler.menu.mouseenter)
    .on('mouseleave', handler.menu.mouseleave)
    .sidr({
      name: 'menu'
    })
    .on('click', handler.movePeek)
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