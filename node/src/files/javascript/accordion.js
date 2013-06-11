semantic.accordion = {};

// ready event
semantic.accordion.ready = function() {

  // selector cache
  var 
    $accordion = $('.ui.accordion'),
    // alias
    handler
  ;
  $accordion
    .accordion()
  ;
  
};


// attach ready event
$(document)
  .ready(semantic.accordion.ready)
;