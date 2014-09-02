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
  $('.animation.example')
    .find('.button')
      .on('click', function() {
        var
          animation = $(this).data('animation')
        ;
        $('.left.sidebar')
          .sidebar('setting', {
            animation: animation,
            mobileAnimation: animation
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