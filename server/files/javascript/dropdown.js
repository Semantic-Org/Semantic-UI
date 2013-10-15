semantic.dropdown = {};

// ready event
semantic.dropdown.ready = function() {

  // selector cache
  var
    $examples         = $('.example'),
    $hoverDropdown    = $examples.filter('.hover').find('.ui.dropdown'),
    $buttonDropdown   = $examples.filter('.button.example').find('.ui.dropdown'),
    $dropdown         = $examples.filter('.dropdown').find('.ui.dropdown:not(.simple)'),
    $transition       = $examples.filter('.transition').find('.ui.dropdown'),
    $transitionButton = $examples.filter('.transition').find('.ui.button').first(),
    // alias
    handler
  ;

  // event handlers
  handler = {

  };

  $transitionButton
    .on('click', function(event) {
      $transition.dropdown('toggle');
      event.stopImmediatePropagation();
    })
  ;

  $transition
    .dropdown({
      onChange: function(value) {
        $transition.dropdown('setting', 'transition', value);
      }
    })
  ;


  $dropdown
    .dropdown()
  ;
  $hoverDropdown
    .dropdown({
      on: 'hover',
      action: 'hide'
    })
  ;
  $buttonDropdown
    .dropdown({
      action: 'hide'
    })
  ;

};


// attach ready event
$(document)
  .ready(semantic.dropdown.ready)
;