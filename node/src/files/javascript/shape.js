semantic.shape = {};

// ready event
semantic.shape.ready = function() {

  // selector cache
  var 
    $demo            = $('.demo'),
    $dogDemo         = $('.dog.shape'),
    $directionButton = $('.direction .button'),
    $shapeButton     = $('.shape.buttons .button'),
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
  $demo
    .shape({
      debug: true,
      verbose: true
    })
  ;
  $directionButton
    .on('click', handler.rotate)
  ;
  $shapeButton
    .on('click', handler.changeShape)
  ;

  $dogDemo
    .shape()
  ;
  setInterval(function() {
    $dogDemo
      .filter('.one')
        .shape('flip.over')
        .end()
      .filter('.two')
        .shape('flip.left')
        .end()
      .filter('.three')
        .shape('flip.right')
        .end()
    ;
  }, 4000);
  
};


// attach ready event
$(document)
  .ready(semantic.shape.ready)
;