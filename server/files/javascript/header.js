semantic.header = {};

// ready event
semantic.header.ready = function() {

  // selector cache
  var
    $increaseFont     = $('.font .increase'),
    $decreaseFont     = $('.font .decrease'),

    // alias
    handler
  ;

  // event handlers
  handler = {
    font: {

      increase: function() {
        var
          $container = $(this).parent().next('.sizer'),
          fontSize   = parseInt( $container.css('font-size'), 10)
        ;
        $container
          .css('font-size', fontSize + 1)
        ;
      },
      decrease: function() {
        var
          $container = $(this).parent().next('.sizer'),
          fontSize   = parseInt( $container.css('font-size'), 10)
        ;
        $container
          .css('font-size', fontSize - 1)
        ;
      }
    }
  };

  $increaseFont
    .on('click', handler.font.increase)
  ;
  $decreaseFont
    .on('click', handler.font.decrease)
  ;

};


// attach ready event
$(document)
  .ready(semantic.header.ready)
;