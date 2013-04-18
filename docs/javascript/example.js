// namespace
var shape = {
  handler: {}
};

// ready event
shape.ready = function() {

  // selector cache
  var 
    $ui              = $('.ui'),
    $swap            = $('.swap.button'),
    $menu            = $('.menu.button'),
    $demo            = $('.demo'),
    // alias
    handler
  ;

  // event handlers
  handler = {
    swapStyle: function() {
      $('head link')
        .each(function() {
          var
            href = $(this).attr('href')
          ;
          console.log (href, href.search('flat') );
          if( href.search('flat') > -1 ) {
            console.log('zz');
            $(this).attr('href', href.replace('flat', 'shaded'));
          }
          else {
            console.log('aaa');
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

  $swap
    .on('click', handler.swapStyle)
  ;

  $menu
    .sidr({
      name: 'menu'
    })
  ;

};


// attach ready event
$(document)
  .ready(shape.ready)
;