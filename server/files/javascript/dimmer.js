semantic.dimmer = {};

// ready event
semantic.dimmer.ready = function() {

  // selector cache
  var
    $examples   = $('.example'),
    $showButton = $examples.find('.show.button'),
    $pageButton = $examples.find('.page.button'),
    $hideButton = $examples.find('.hide.button'),
    // alias
    handler
  ;

  // event handlers
  handler = {
    show: function() {
      $(this)
        .closest('.example')
        .find('.segment')
          .dimmer('show')
      ;
    },
    hide: function() {
      $(this)
        .closest('.example')
        .find('.segment')
          .dimmer('hide')
      ;
    },
    page: function() {
      $('body > .page')
        .dimmer('show')
      ;
    }
  };
  
  $pageButton
    .on('click', handler.page)
  ;
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