semantic.sticky = {};

// ready event
semantic.sticky.ready = function() {

  // selector cache
  var
    // alias
    handler
  ;

  // event handlers
  handler = {

  };


  $('.main.container .pushing.example')
    .each(function() {
      var
        $sticky      = $(this).find('.ui.sticky').not('.segment > .sticky'),
        $context     = $(this).find('.segment')
      ;
      $sticky
        .sticky({
          context: $context,
          offset: 15,
          pushing: true
        })
      ;
    })
  ;

  $('.main.container .inline.example')
    .each(function() {
      var
        $inlineSticky = $(this).find('.segment .ui.sticky'),
        $context      = $(this).find('.segment')
      ;
      if($inlineSticky.length > 0) {
        $inlineSticky
          .sticky({
            context: $context,
            offset: 15
          })
        ;
      }
    })
  ;

  $('.main.container .sticky.example')
    .each(function() {
      var
        $sticky      = $(this).find('.ui.sticky').not('.segment > .sticky'),
        $context     = $(this).find('.segment')
      ;
      $sticky
        .sticky({
          context: $context,
          offset: 15
        })
      ;
    })
  ;

};


// attach ready event
$(document)
  .ready(semantic.sticky.ready)
;

$(window).load(function() {
  $('.main.container .sticky.example .sticky').sticky('refresh');
  $('.main.container .pushing.example .sticky').sticky('refresh');
});
