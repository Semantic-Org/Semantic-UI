semantic.popup = {};

// ready event
semantic.popup.ready = function() {

  // selector cache
  var
    $popup = $('.main .ui[data-content], .main .ui[data-html], .main i[title], .main i[data-content], .main i[data-html]'),
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

  $('.fluid.example .button')
    .popup()
  ;
  $('.fitted.example .button')
    .popup({
      on: 'click'
    })
  ;

  $('.existing.example .rating')
    .rating()
  ;

  $('.existing.example .card')
    .popup({
      className: {
        popup: 'ignored ui popup'
      }
    })
  ;


};


// attach ready event
$(document)
  .ready(semantic.popup.ready)
;