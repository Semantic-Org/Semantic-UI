semantic.button = {};

// ready event
semantic.button.ready = function() {

  // selector cache
  var 
    $buttons = $('.ui.buttons .button'),
    $button  = $('.ui.button').not($buttons),
    // alias
    handler = {

      activate: function() {
        $(this)
          .addClass('active')
          .siblings()
          .removeClass('active')
        ;
      }

    }
  ;

  $buttons
    .on('click', handler.activate)
  ;

  $button
    .state({
      states: {
        active: true
      }
    })
  ;
  
};


// attach ready event
$(document)
  .ready(semantic.button.ready)
;