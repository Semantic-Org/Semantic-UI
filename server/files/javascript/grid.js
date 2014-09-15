semantic.grid = {};

// ready event
semantic.grid.ready = function() {

  $('.animation.checkbox')
    .checkbox({
      onChecked: function() {
        $('body').addClass('animated');
      },
      onUnchecked: function() {
        $('body').removeClass('animated');
      }
    })
  ;

};


// attach ready event
$(document)
  .ready(semantic.grid.ready)
;