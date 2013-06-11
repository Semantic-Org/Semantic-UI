semantic.home = {};

// ready event
semantic.home.ready = function() {

  // selector cache
  var 
    $navigationItem = $('.demo .menu .item'),
    $oddballItem    = $navigationItem.filter('.oddball'),
    // alias
    handler
  ;

  $navigationItem
    .tabNavigation({
      history: true,
      path: '/'
    })
  ;
  $oddballItem
    .on('click', function() {
      $(this)
        .tabNavigation('deactivate.all')
        .tabNavigation('activate.tab', 'third')
        .tabNavigation('activate.navigation', 'third')
      ;
    })
  ;
};


// attach ready event
$(document)
  .ready(semantic.home.ready)
;