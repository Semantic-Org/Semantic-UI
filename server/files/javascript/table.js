semantic.table = {};

// ready event
semantic.table.ready = function() {

  // selector cache
  var
    // alias
    handler
  ;

  $('.ui.checkbox').checkbox({
    onChecked: function() {
      $(this).closest('.table').find('.button').removeClass('disabled');
    }
  });

  $('.ui.rating')
    .rating({
      interactive: false
    })
  ;


};


// attach ready event
$(document)
  .ready(semantic.table.ready)
;