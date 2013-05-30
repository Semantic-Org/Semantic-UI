semantic.dimmer = {};

// ready event
semantic.dimmer.ready = function() {

  // selector cache
  var
    $examples   = $('.example'),
    $showButton = $examples.find('.show.button'),
    $hideButton = $examples.find('.hide.button'),
    // alias
    handler
  ;

  // event handlers
  handler = {
    show: function() {
      console.log($(this).closest('.example'));
      $(this)
        .closest('.example')
        .dimmer('show')
      ;
    },
    hide: function() {
      $(this)
        .closest('.example')
        .dimmer('hide')
      ;
    }
  };

  $showButton
    .on('click', handler.show)
  ;
  $hideButton
    .on('click', handler.hide)
  ;
};


// attach ready event
$(document)
  .ready(semantic.dimmer.ready)
;