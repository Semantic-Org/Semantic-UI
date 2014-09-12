semantic.card = {};

// ready event
semantic.card.ready = function() {

  // selector cache
  var
    $icon = $('.card .corner.label'),
    handler
  ;

  handler = {


  };

  $('.ui.rating')
    .rating()
  ;

  $icon
    .state()
  ;

};


// attach ready event
$(document)
  .ready(semantic.card.ready)
;