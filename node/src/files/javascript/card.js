semantic.card = {};

// ready event
semantic.card.ready = function() {

  // selector cache
  var 
    $card = $('.ui.idea.cards .card, .ui.idea.card')
  ;

  $card
    .card()
  ;
  
};


// attach ready event
$(document)
  .ready(semantic.card.ready)
;