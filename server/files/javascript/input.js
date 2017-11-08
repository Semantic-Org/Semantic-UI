semantic.input = {};

// ready event
semantic.input.ready = function() {

  $('.main.container .ui.dropdown').dropdown();

};


// attach ready event
$(document)
  .ready(semantic.input.ready)
;