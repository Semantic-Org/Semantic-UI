// namespace
window.semantic = {
  handler: {}
};

// ready event
semantic.ready = function() {

  // selector cache
  var
    $ui          = $('.ui').not('.hover, .down'),
    $swap        = $('.theme.menu .item'),
    $menu        = $('.menu.button'),
    $demo        = $('.demo'),
    $waypoints   = $('h2'),

    $example     = $('.example'),

    $peek        = $('.peek'),
    $peekMenu    = $peek.find('li'),
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
        $shape     = $example.find('.shape.module'),
        $demo      = $example.children().slice(3).not('.annotated, .ignore'),
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

      editorSession.setMode('ace/mode/'+ contentType);
      editorSession.setTabSize(2);
      editorSession.setUseSoftTabs(true);


      $(this).height(codeHeight + 'px');
      editor.resize();

    },

    peek: function() {
      $('html, body')
        .stop()
        .animate({
          scrollTop: $waypoints.eq( $peekMenu.index( $(this) ) ).offset().top - 90
        }, 500, function(){
          $(this).addClass('active').siblings().removeClass('active');
        })
      ;
      $('html')
        .one('scroll', function() {
          $('html,body').stop();
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

  $waypoints
    .waypoint({
      continuous : false,
      offset     : 215,
      handler    : function(direction) {
        var
          index = (direction == 'down')
            ? $waypoints.index(this)
            : ($waypoints.index(this) - 1 >= 0)
              ? ($waypoints.index(this) - 1)
              : 0
        ;
        $peekMenu
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

  $swap
    .on('click', handler.swapStyle)
  ;

  $menu
    .sidr({
      name: 'menu'
    })
  ;

  $peek
    .waypoint('sticky', {
      offset: 80,
      stuckClass: 'stuck'
    })
  ;
  $peekMenu
    .state()
    .on('click', handler.peek)
  ;

};


// attach ready event
$(document)
  .ready(semantic.ready)
;