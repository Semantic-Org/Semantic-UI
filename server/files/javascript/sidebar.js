semantic.sidebar = {};

// ready event
semantic.sidebar.ready = function() {

  // selector cache
  var
    // alias
    handler
  ;


  $('.left.sidebar')
    .sidebar()
  ;
  $('.transition.example')
    .find('.button')
      .on('click', function() {
        var
          transition = $(this).data('transition')
        ;
        $('.left.sidebar')
          .sidebar('setting', {
            transition       : transition,
            mobileTransition : transition
          })
          .sidebar('toggle')
        ;
      })
  ;


};


// attach ready event
$(document)
  .ready(semantic.sidebar.ready)
;