semantic.dropdown = {};

// ready event
semantic.dropdown.ready = function() {

  // selector cache
  var
    // alias
    handler
  ;

  // event handlers
  handler = {

  };

  $('.first.example .menu .item')
    .tab({
      context: '.first.example'
    })
  ;

  $('.history.example .menu .item')
    .tab({
      context : '.history.example',
      history : true,
      path    : '/modules/tab.html'
    })
  ;

  $('.dynamic.example .menu .item')
    .tab({
      context : '.dynamic.example',
      auto    : true,
      path    : '/modules/tab.html'
    })
  ;

};


// attach ready event
$(document)
  .ready(semantic.dropdown.ready)
;