semantic.button = {};

// ready event
semantic.button.ready = function() {

  // selector cache
  var
    $buttons = $('.ui.buttons .button'),
    $toggle  = $('.main .ui.toggle.button'),
    $follow  = $('.follow.example .button'),
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

  $follow
    .state({
      text: {
        inactive : 'Follow',
        active   : 'Following'
      }
    })
  ;

  $toggle
    .state({
      text: {
        inactive : 'Vote',
        active   : 'Voted'
      }
    })
  ;

};


// attach ready event
$(document)
  .ready(semantic.button.ready)
;