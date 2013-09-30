semantic.dropdown = {};

// ready event
semantic.dropdown.ready = function() {

  // selector cache
  var
    $examples         = $('.example'),
    // alias
    handler
  ;

  // event handlers
  handler = {

  };

  $('.demo.menu')
    .first()
      .find('.item')
      .tab()
  ;

};


// attach ready event
$(document)
  .ready(semantic.dropdown.ready)
;