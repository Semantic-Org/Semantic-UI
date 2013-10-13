semantic.home = {};

// ready event
semantic.home.ready = function() {

  // selector cache
  var 
    $navigationItem = $('.demo .menu .item'),
    $oddballItem    = $navigationItem.filter('.oddball')
  ;

  $navigationItem
    .tab()
  ;
  $oddballItem
    .on('click', function() {
      $(this)
        .tab('deactivate all')
        .tab('activate tab', 'third')
        .tab('activate navigation', 'third')
      ;
    })
  ;
};


// attach ready event
$(document)
  .ready(semantic.home.ready)
;