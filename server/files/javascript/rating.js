semantic.dropdown = {};

// ready event
semantic.dropdown.ready = function() {

  $('.ui.rating')
    .rating({
      initialRating: 3
    })
  ;

};


// attach ready event
$(document)
  .ready(semantic.dropdown.ready)
;