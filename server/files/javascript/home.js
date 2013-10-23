semantic.home = {};

// ready event
semantic.home.ready = function() {

  // selector cache
  var
    $navigationItem = $('.demo .menu .item'),
    $oddballItem    = $navigationItem.filter('.oddball')
  ;
  $.fn.transition.settings.debug = true;
  $('.kitten.image')
    .transition('internal', 'debug', function() {
      $('.console')
        .append(arguments[0] + "\n")
        // scroll to bottom
        .prop('scrollTop', $('.console').prop('scrollHeight') )
      ;
    })
  ;

  $navigationItem
    .tab()
  ;
  $oddballItem
    .on('click', function() {
      $(this)
        .tab('deactivate all')
        .tab('activate tab', 'third')
        .tab('activate navigation', 'third')
      ;
    })
  ;
};


// attach ready event
$(document)
  .ready(semantic.home.ready)
;