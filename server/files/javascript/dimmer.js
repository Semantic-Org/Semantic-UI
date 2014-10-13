semantic.dimmer = {};

// ready event
semantic.dimmer.ready = function() {

  // selector cache
  var
    $pageDimmer = $('.demo.page.dimmer'),
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
        .children('.segment:not(.instructive)')
          .dimmer('show')
      ;
    },
    hide: function() {
      $(this)
        .closest('.example')
        .children('.segment:not(.instructive)')
          .dimmer('hide')
      ;
    },
    page: function() {
      $('body > .demo.page.dimmer')
        .dimmer('show')
      ;
    }
  };

  $pageDimmer
    .dimmer()
  ;

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