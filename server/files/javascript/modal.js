semantic.modal = {};

// ready event
semantic.modal.ready = function() {

  // selector cache
  var
    // alias
    handler
  ;

  // event handlers
  handler = {

  };

    $('.selection')
      .dropdown({
        onChange: function(value) {
          $('.test.modal')
            .modal('setting', 'transition', value)
            .modal('show')
          ;
        }
      })
    ;


};


// attach ready event
$(document)
  .ready(semantic.modal.ready)
;