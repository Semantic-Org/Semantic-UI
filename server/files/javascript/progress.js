semantic.progress = {};

// ready event
semantic.progress.ready = function() {

  var
    $progress         = $('.definition  .ui.progress').not('.success, .error, .warning, .indicating'),
    $indicating       = $('.definition .ui.indicating.progress'),
    $indicatingButton = $('.definition .indicating.example .button'),
    $stateProgress    = $('.definition .ui.success.progress, .ui.warning.progress, .ui.error.progress')
  ;

  setTimeout(function() {

    $indicatingButton
      .on('click', function() {
        var
          $progress = $(this).closest('.example').find('.progress')
        ;
        if( $(this).hasClass('increment') ) {
          $progress.progress('increment');
        }
        else {
          $progress.progress('decrement');
        }
      })
    ;

    $indicating
      .progress({
        label : false,
        total : 10,
        text  : {
          active: '{percent}% Funded',
          success: 'Project Funded!'
        }
      })
    ;

    $progress
      .progress({
        showActivity: false,
        random: {
          min: 10,
          max: 90
        }
      })
      .progress('increment')
    ;

    $stateProgress
      .progress('set progress', 100)
    ;

  }, 300);

};


// attach ready event
$(document)
  .ready(semantic.progress.ready)
;