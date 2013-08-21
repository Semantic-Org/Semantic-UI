semantic.dropdown = {};

// ready event
semantic.dropdown.ready = function() {

  // selector cache
  var 
    $examples      = $('.example'),
    $hoverDropdown = $examples.filter('.hover').find('.ui.dropdown'),
    $formDropdown  = $examples.filter('.form').find('.ui.dropdown'),
    $dropdown      = $examples.filter('.dropdown').find('.ui.dropdown:not(.simple)'),
    // alias
    handler
  ;

  // event handlers
  handler = {
    
  };

  $dropdown
    .dropdown({
      activate: true
    })
  ;
  $formDropdown
    .dropdown({
      action: 'form'
    })
  ;
  $hoverDropdown
    .dropdown({
      on: 'hover'
    })
  ;
  
};


// attach ready event
$(document)
  .ready(semantic.dropdown.ready)
;