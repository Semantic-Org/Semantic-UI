// namespace
window.semantic = {
  handler: {}
};

// ready event
semantic.ready = function() {

  // selector cache
  var
    $ui          = $('.ui').not('.hover, .down'),
    $swap        = $('.swap'),
    $menu        = $('.menu.button'),
    $demo        = $('.demo'),
    $waypoints   = $('h2'),

    $exampleCode = $('.example i.code'),

    $peek        = $('.peek'),
    $peekMenu    = $peek.find('li'),
    $code        = $('div.code'),

    // alias
    handler
  ;

  // event handlers
  handler = {

    createCode: function() {
      var
        $example   = $(this).closest('.example'),
        $shape     = $example.find('.shape.module'),
        $demo      = $example.find('.demo'),
        $annotated = $example.find('.annotated'),
        $code      = $annotated.find('.code'),
        code       = $demo.get(0).innerHTML
      ;
      // add source if doesnt exist and initialize
      if($annotated.size() === 0) {
        $annotated = $('<div/>')
          .addClass('annotated')
          .appendTo($example)
        ;
      }
      if( $code.size() === 0) {
        code = code.replace('^(\s+)', '$1$1');
        console.log(code);
        $code = $('<div/>')
          .data('type', 'html')
          .addClass('code')
          .text(code)
            .appendTo($annotated)
        ;
        $.proxy(handler.initializeCode, $code)();
      }
      if( $demo.is(':visible') ) {
        $demo.hide();
        $annotated.fadeIn(500);
      }
      else {
        $annotated.hide();
        $demo.fadeIn(500);
      }
    },

    removeIndents: function(code) {

    },

    initializeCode: function() {
      var
        $code         = $(this),
        contentType   = $code.data('type') || 'javascript',
        editor        = ace.edit($code[0]),
        editorSession = editor.getSession(),
        padding       = 0,
        codeHeight    = editor.getSession().getScreenLength() * (editor.renderer.lineHeight + padding)  + editor.renderer.scrollBar.getWidth()
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
      $('head link.ui')
        .each(function() {
          var
            href = $(this).attr('href')
          ;
          if( href.search('flat') > -1 ) {
            $(this).attr('href', href.replace('flat', 'shaded'));
          }
          else {
            $(this).attr('href', href.replace('shaded', 'flat'));
          }
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

  $exampleCode
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