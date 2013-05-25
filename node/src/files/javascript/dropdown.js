semantic.dropdown = {};

// ready event
semantic.dropdown.ready = function() {

  // selector cache
  var 
    $hover  = $('.hover .ui.dropdown'),
    $select = $('.ui.dropdown').not($hover),
    // alias
    handler
  ;

  // event handlers
  handler = {
    
  };

  $select
    .dropdown()
  ;
  $hover
    .dropdown({
      on: 'hover'
    })
  ;
  
};


// attach ready event
$(document)
  .ready(semantic.dropdown.ready)
;