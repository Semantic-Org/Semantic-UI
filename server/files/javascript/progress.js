semantic.progress = {};

// ready event
semantic.progress.ready = function() {

  var
    $progress         = $('.definition  .ui.progress').not('.success, .error, .warning, .indicating'),
    $indicating       = $('.definition .ui.indicating.progress'),
    $buttons          = $('.example .increment.button, .example .decrement.button'),
    $stateProgress    = $('.definition .ui.success.progress, .ui.warning.progress, .ui.error.progress')
  ;

  setTimeout(function() {

    $buttons
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
        label   : false,
        total   : 10,
        value   : Math.floor(Math.random() * 5) + 1,
        text    : {
          active  : '{percent}% Funded',
          success : 'Project Funded!'
        }
      })
    ;

    $progress
      .each(function() {
        $(this)
          .progress({
            showActivity : false,
            random       : {
              min : 5,
              max : 15
            },
            percent      : Math.floor(Math.random() * 60) + 5
          })
        ;
      })
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