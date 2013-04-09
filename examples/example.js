// namespace
var shape = {
  handler: {}
};

// ready event
shape.ready = function() {

  // selector cache
  var 
    $demo            = $('.demo'),
    $ui              = $('.ui'),
    $directionButton = $('.direction .button'),
    $shapeButton     = $('.shape .button'),
    // alias
    handler
  ;

  // event handlers
  handler = {
    rotate: function() {
      var
        direction = $(this).data('direction') || false,
        animation = $(this).data('animation') || false
      ;
      if(direction && animation) {
        $('.active.side')
          .next()
          .attr('class', direction + ' side')
        ;
        $demo
          .shape(animation + '.' + direction)
        ;
      }
    },

    removeShape: function(){
      var
        shape = $(this).data('shape') || false
      ;
      if(shape) {
        $demo
          .removeClass(shape)
        ;
      }
    },

    changeShape: function() {
      var
        $shape       = $(this),
        $otherShapes = $shape.siblings(),
        shape        = $shape.data('shape')
      ;
      $shape
        .addClass('active')
      ;
      $otherShapes
        .removeClass('active')
        .each(handler.removeShape)
      ;
      $demo
        .addClass(shape)
      ;
    }
  };

  // attach events
  $ui
    .state()
  ;
  $demo
    .shape()
  ;
  $directionButton
    .on('click', handler.rotate)
  ;
  $shapeButton
    .on('click', handler.changeShape)
  ;

};


// attach ready event
$(document)
  .ready(shape.ready)
;