semantic.customize = {};

// ready event
semantic.customize.ready = function() {

  var
    $accordion = $('.main.container .ui.accordion'),
    $choice    = $('.download .item'),
    $popup     = $('.main.container [data-content]'),
    $checkbox  = $('.download .item .checkbox'),
    handler = {}
  ;

  $choice
    .on('click', function() {
      $(this)
        .find($checkbox)
          .checkbox('toggle')
      ;
    })
  ;

  $checkbox
    .checkbox()
  ;

  $accordion
    .accordion({
      exclusive: false,
      onChange: function() {
        $('.ui.sticky').sticky('refresh');
      }
    })
  ;


  $popup
    .popup()
  ;


};


// attach ready event
$(document)
  .ready(semantic.customize.ready)
;