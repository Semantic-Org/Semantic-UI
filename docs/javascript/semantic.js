// namespace
var semantic = {
  handler: {}
};

// ready event
semantic.ready = function() {

  // selector cache
  var 
    $ui        = $('.ui').not('.hover, .down'),
    $swap      = $('.swap'),
    $menu      = $('.menu.button'),
    $demo      = $('.demo'),
    $waypoints = $('h2'),
    
    $peek      = $('.peek'),
    $peekMenu  = $peek.find('li'),
    $code      = $('.code'),

    // alias
    handler
  ;

  // event handlers
  handler = {

    initializeCode: function() {
      var 
        $content      = $(this),
        contentType   = $content.data('type') || 'javascript',
        editor        = ace.edit($content[0]),
        editorSession = editor.getSession(),
        padding       = 3,
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