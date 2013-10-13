semantic.accordion = {};

// ready event
semantic.accordion.ready = function() {

  // selector cache
  var
    $popup = $('.example .heart.icon'),
    // alias
    handler
  ;
  $popup
    .popup({
      className: {
        popup: 'ignored ui popup'
      }
    })
  ;

};


// attach ready event
$(document)
  .ready(semantic.accordion.ready)
;