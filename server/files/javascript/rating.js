semantic.rating = {};

// ready event
semantic.rating.ready = function() {
  $('.ui.rating')
    .each(function() {
      if( $(this).closest('.code').size() === 0) {
        $(this)
          .rating({
            initialRating: 3
          })
        ;
      }
    })
  ;

};


// attach ready event
$(document)
  .ready(semantic.rating.ready)
;