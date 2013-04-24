semantic.table = {};

// ready event
semantic.table.ready = function() {

  // selector cache
  var 
    $sortTable = $('.sortable.table'),
    // alias
    handler
  ;

  $sortTable
    .tablesort()
  ;
  
};


// attach ready event
$(document)
  .ready(semantic.table.ready)
;