semantic.validateForm = {};

// ready event
semantic.validateForm.ready = function() {

  // selector cache
  var
    $codeDropdown = $('.existing.code .dropdown'),
    $dropdown     = $('.main.container .ui.dropdown').not($codeDropdown),
    // alias
    handler
  ;

  // event handlers
  handler = {

  };

  $dropdown
    .dropdown()
  ;

};


// attach ready event
$(document)
  .ready(semantic.validateForm.ready)
;
