semantic.sidebar = {};

// ready event
semantic.sidebar.ready = function() {

  // selector cache
  var
    // alias
    handler
  ;

  $('.ui.sidebar .ui.dropdown')
    .dropdown({
      on: 'hover'
    })
  ;

  $('.left.sidebar')
    .sidebar()
  ;

  $('.left.example')
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

  $('.direction.example')
    .find('.button')
      .on('click', function() {
        var
          direction = $(this).data('direction')
        ;
        $('.' + direction + '.sidebar')
          .sidebar('toggle')
        ;
      })
  ;



};


// attach ready event
$(document)
  .ready(semantic.sidebar.ready)
;