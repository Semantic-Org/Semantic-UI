semantic.accordion = {};

// ready event
semantic.accordion.ready = function() {

  // selector cache
  var
    $accordion     = $('.ui.accordion'),
    $menuAccordion = $('.ui.menu.accordion'),
    $checkbox      = $('.ui.checkbox'),
    // alias
    handler
  ;
  $accordion
    .accordion()
  ;
  $menuAccordion
    .accordion({
     exclusive: false
    })
  ;
  $checkbox
    .checkbox()
  ;

};


// attach ready event
$(document)
  .ready(semantic.accordion.ready)
;