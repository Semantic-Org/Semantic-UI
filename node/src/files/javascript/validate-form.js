semantic.validateForm = {};

// ready event
semantic.validateForm.ready = function() {

  // selector cache
  var
    $dogForm  = $('.dog.example .ui.form'),
    $form     = $('.ui.form').not($dogForm),
    $checkbox = $('.ui.checkbox'),
    // alias
    handler
  ;

  // event handlers
  handler = {

  };

  $checkbox
    .checkbox()
  ;

  $dogForm
    .form({
      dog: {
        identifier: 'dog',
        rules: [
          {
            type: 'empty',
            prompt: 'You must have a dog to add'
          },
          {
            type: 'is[fluffy dog]',
            prompt: 'I only want you to add fluffy dogs!'
          },
          {
            type: 'not[mean]',
            prompt: 'Why would you add a mean dog to the list?'
          }
        ]
      }
    })
  ;

  $form
    .form()
  ;

};


// attach ready event
$(document)
  .ready(semantic.validateForm.ready)
;