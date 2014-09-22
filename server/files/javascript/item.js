semantic.item = {};

// ready event
semantic.item.ready = function() {

  // selector cache
  $('.item .favorite.icon, .item .like.icon')
    .state()
  ;

};


// attach ready event
$(document)
  .ready(semantic.item.ready)
;