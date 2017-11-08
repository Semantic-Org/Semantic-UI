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

    $('.animation.dropdown')
      .dropdown({
        onChange: function(value) {
          $('.standard.test.modal')
            .modal('setting', 'transition', value)
            .modal('show')
          ;
        }
      })
    ;
    $('.ui.checkbox')
      .checkbox()
    ;


};


// attach ready event
$(document)
  .ready(semantic.modal.ready)
;