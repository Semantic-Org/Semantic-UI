semantic.accordion = {};

// ready event
semantic.accordion.ready = function() {

  // selector cache
  var
    $popup = $('.main .ui[data-content], .main .ui[data-html], .main i[data-content], .main i[data-html]'),
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