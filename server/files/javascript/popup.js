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

  $('.fluid.example > .button')
    .popup({
      hoverable: true,
      delay: {
        show: 100,
        hide: 500
      }
    })
  ;
  $('.fitted.example > .button')
    .popup({
      hoverable: true,
      delay: {
        show: 100,
        hide: 500
      }
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