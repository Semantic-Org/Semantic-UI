semantic.validateForm = {};

// ready event
semantic.validateForm.ready = function() {

  // selector cache
  var
    $dogForm    = $('.dog.example .ui.form'),
    $inlineForm = $('.inline.example .ui.form'),
    $form       = $('.ui.form').not($dogForm).not($inlineForm),
    $checkbox   = $('.ui.checkbox'),
    // alias
    handler
  ;

  // event handlers
  handler = {

  };
  $checkbox
    .checkbox()
  ;

  $.fn.form.settings.defaults = {
    firstName: {
      identifier  : 'first-name',
      rules: [
        {
          type   : 'empty',
          prompt : 'Please enter your first name'
        }
      ]
    },
    lastName: {
      identifier  : 'last-name',
      rules: [
        {
          type   : 'empty',
          prompt : 'Please enter your last name'
        }
      ]
    },
    username: {
      identifier : 'username',
      rules: [
        {
          type   : 'empty',
          prompt : 'Please enter a username'
        }
      ]
    },
    email: {
      identifier : 'email',
      rules: [
        {
          type   : 'empty',
          prompt : 'Please enter your email'
        },
        {
          type   : 'email',
          prompt : 'Please enter a valid email'
        }
      ]
    },
    password: {
      identifier : 'password',
      rules: [
        {
          type   : 'empty',
          prompt : 'Please enter a password'
        },
        {
          type   : 'length[6]',
          prompt : 'Your password must be at least 6 characters'
        }
      ]
    },
    passwordConfirm: {
      identifier : 'password-confirm',
      rules: [
        {
          type   : 'empty',
          prompt : 'Please confirm your password'
        },
        {
          identifier : 'password-confirm',
          type       : 'match[password]',
          prompt     : 'Please verify password matches'
        }
      ]
    },
    terms: {
      identifier : 'terms',
      rules: [
        {
          type   : 'checked',
          prompt : 'You must agree to the terms and conditions'
        }
      ]
    }
  };


  $inlineForm
    .form({}, {
      inline : true,
      on: 'blur'
    })
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
            type: 'contains[fluffy]',
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