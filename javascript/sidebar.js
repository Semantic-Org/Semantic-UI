semantic.sidebar = {};

// ready event
semantic.sidebar.ready = function() {

  // selector cache
  var
    // alias
    handler
  ;

  $('.variation .button')
    .on('click', function() {
      $(this)
        .toggleClass('active')
        .siblings()
        .removeClass('active')
      ;
      $('.sidebar')
        .filter($(this).data('variation') ).first()
        .sidebar('toggle')
      ;
    })
  ;
  $('.styled.sidebar').first()
    .sidebar('attach events', '.styled.example .button')
  ;

  $('.floating.sidebar').first()
    .sidebar('attach events', '.floating.example .button')
  ;


};


// attach ready event
$(document)
  .ready(semantic.sidebar.ready)
;