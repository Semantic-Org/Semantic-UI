semantic.checkbox = {};

// ready event
semantic.checkbox.ready = function() {

  // selector cache
  var
    $indeterminate  = $('.indeterminate.example').find('.ui.checkbox'),
    $simpleCheckbox = $('.simple.example').find('.ui.checkbox'),
    $checkbox       = $('.example').not('.static').find('.ui.checkbox').not($simpleCheckbox),
    // alias
    handler
  ;

  // event handlers
  handler = {

  };

  $checkbox
    .checkbox()
  ;

  $indeterminate
    .checkbox('indeterminate')
  ;



};


// attach ready event
$(document)
  .ready(semantic.checkbox.ready)
;