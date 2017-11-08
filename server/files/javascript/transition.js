semantic.transition = {};

// ready event
semantic.transition.ready = function() {

  // selector cache
  var
    $tab = $('.main.container .secondary.menu .item'),
    handler
  ;

  // event handlers
  handler = {

  };


  $tab
    .tab({
      context: 'parent'
    })
  ;

};


// attach ready event
$(document)
  .ready(semantic.transition.ready)
;