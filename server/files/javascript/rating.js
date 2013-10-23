semantic.dropdown = {};

// ready event
semantic.dropdown.ready = function() {

  $('.ui.rating')
    .rating()
  ;

};


// attach ready event
$(document)
  .ready(semantic.dropdown.ready)
;