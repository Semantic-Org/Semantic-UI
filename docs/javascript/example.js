// namespace
var shape = {
  handler: {}
};

// ready event
shape.ready = function() {

  // selector cache
  var 
    $ui        = $('.ui'),
    $swap      = $('.swap'),
    $menu      = $('.menu.button'),
    $demo      = $('.demo'),
    $waypoints = $('h2'),
    
    $peek      = $('.peek'),
    $peekMenu  = $peek.find('li'),
    // alias
    handler
  ;

  // event handlers
  handler = {

    peek: function() {
      $('html, body')
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
      offset     : 220,
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
  .ready(shape.ready)
;