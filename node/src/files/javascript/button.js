semantic.button = {};

// ready event
semantic.button.ready = function() {

  // selector cache
  var 
    $buttons = $('.ui.buttons .button'),
    $toggle  = $('.ui.toggle.button'),
    $button  = $('.ui.button').not($buttons).not($toggle),
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

  $toggle
    .state({
      states: {
        active: true
      },
      text: {
        inactive : 'Vote',
        active   : 'Voted',
        disable  : 'Undo'
      }
    })
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