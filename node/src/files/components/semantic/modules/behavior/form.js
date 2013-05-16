/*  ******************************
  Form Validation Components
  Author: Jack Lukic
  Notes: First Commit April 08, 2012

  Refactored Feb 22, 2012

  Allows you to validate forms based on a form validation object
  Form validation objects are bound by either data-validate="" metadata, or form id or name tags

******************************  */

;(function ( $, window, document, undefined ) {

$.fn.validateForm = function(fields, parameters) {
  var
    $allModules     = $(this),
    
    settings        = $.extend(true, {}, $.fn.validateForm.settings, parameters),
    // make arguments available
    query           = arguments[0],
    passedArguments = [].slice.call(arguments, 1),
    invokedResponse
  ;
  $allModules
    .each(function() {
      var
        $module       = $(this),
        $group        = $(this).find(settings.selector.group),
        $field        = $(this).find(settings.selector.field),
        $errorPrompt  = $(this).find(settings.selector.prompt),
        
        formErrors    = [],

        selector      = $module.selector || '',
        element       = this,
        instance      = $module.data('module-' + settings.namespace),
        methodInvoked = (typeof query == 'string'),
        
        namespace     = settings.namespace,
        metadata      = settings.metadata,
        className     = settings.className,
        errors        = settings.errors,
        module
      ;

      module      = {

        initialize: function() {
          module.verbose('Initializing form validation');
          if(fields !== undefined || !$.isEmptyObject(fields) ) {
            // add default text if set
            if($.fn.defaultText !== undefined) {
              $.each(fields, function(fieldName, field) {
                module.field.add.defaultText(field);
              });
            }
            // attach event handler
            $module
              .on('submit.' + namespace, module.validate.form)
            ;
          }
          else {
            module.error(errors.noFields, $module);
          }
        },

        destroy: function() {
          $module
            .off(namespace)
          ;
        },

        field: {
          find: function(identifier) {
            var 
              $field = $module.find(settings.selector.field)
            ;
            if( $field.filter('#' + identifier).size() > 0 ) {
              return $field.filter('#' + identifier);
            }
            else if( $field.filter('[name="' + identifier +'"]').size() > 0 ) {
              return $field.filter('[name="' + identifier +'"]');
            }
            else if( $field.filter('[data-' + metadata.validate + '="'+ identifier +'"]').size() > 0 ) {
              return $field.filter('[data-' + metadata.validate + '="'+ identifier +'"]');
            }
            return $('<input/>');
          },
          add: {
            defaultText: function(field) {
              var
                $field = module.field.find(field.identifier)
              ;
              if(field.defaultText !== undefined) {
                $field.defaultText(field.defaultText);
              }
            },
            error: function(field, errors) {
              var
                $field       = module.field.find(field.identifier),
                $errorGroup  = $field.closest($group),
                $errorPrompt = $group.find($errorPrompt),
                promptExists = ($errorPrompt.size() !== 0)
              ;
              $errorGroup
                .addClass(className.error)
              ;
              if(settings.inlineError) {
                // create message container on first invalid validation attempt
                if(!promptExists) {
                  $errorPrompt = $('<div />')
                    .addClass(className.prompt)
                    .insertBefore($field)
                  ;
                }
                // add prompt message
                $errorPrompt
                  .html(errors[0])
                  .fadeIn(settings.animateSpeed)
                ;
              }
            }
          },
          remove: {
            error: function(field) {
              var
                $field       = module.field.find(field.identifier),
                $errorGroup  = $field.closest($group),
                $errorPrompt = $group.find($errorPrompt)
              ;
              $errorGroup
                .removeClass(className.error)
              ;
              if(settings.inlineError) {
                $errorPrompt.hide();
              }
            }
          }
        },

        validate: {

          form: function(event) {
            var
              allValid = true
            ;
            // reset errors
            formErrors = [];
            $.each(fields, function(fieldName, field){
              // form is invalid after first bad field, but keep checking
              if( !( module.validate.field(field) ) ) {
                allValid = false;
              }
            });
            // Evaluate form callbacks
            return (allValid)
              ? $.proxy(settings.onSuccess, this)(event)
              : $.proxy(settings.onFailure, this)(formErrors)
            ;
          },

          // takes a validation object and returns whether field passes validation
          field: function(field) {
            var
              $field      = module.field.find(field.identifier),
              fieldValid  = true,
              fieldErrors = []
            ;
            if(field.rules !== undefined) {
              // iterate over all validation types for a certain field
              $.each(field.rules, function(index, rule) {
                if( !( module.validate.rule(field, rule) ) ) {
                  module.debug('Field is invalid', field.identifier, rule.type);
                  fieldErrors.push(rule.prompt);
                  fieldValid = false;
                }
              });
            }
            if(fieldValid) {
              module.field.remove.error(field, fieldErrors);
              settings.onValid($field);
            }
            else {
              formErrors = formErrors.concat(fieldErrors);
              module.field.add.error(field, fieldErrors);
              $.proxy(settings.onInvalid, $field)(fieldErrors);
              return false;
            }
            return true;
          },

          // takes validation rule and returns whether field passes rule
          rule: function(field, validation) {
            var
              $field        = module.field.find(field.identifier),
              type          = validation.type,
              defaultText   = (field.defaultText !== undefined)
                ? field.defaultText
                : false,
              value         = ($field.val() == defaultText)
                ? ''
                : $field.val(),

              bracketRegExp = /\[(.*?)\]/i,
              bracket       = bracketRegExp.exec(type),
              isValid       = true,
              ancillary,
              functionType
            ;
            // if bracket notation is used, pass in extra parameters
            if(bracket !== undefined && bracket != null) {
              ancillary    = bracket[1];
              functionType = type.replace(bracket[0], '');
              isValid      = $.proxy(settings.rules[functionType], $module)(value, ancillary);
            }
            // normal notation
            else {
              isValid = (type == 'checked') 
                ? $field.filter(':checked').size() > 0
                : settings.rules[type](value)
              ;
            }
            return isValid;
          }
        },

        /* standard module */
        setting: function(name, value) {
          if(value === undefined) {
            return settings[name];
          }
          settings[name] = value;
        },
        verbose: function() {
          if(settings.verbose) {
            module.debug.apply(this, arguments);
          }
        },
        debug: function() {
          var
            output    = [],
            message   = settings.moduleName + ': ' + arguments[0],
            variables = [].slice.call( arguments, 1 ),
            log       = console.info || console.log || function(){}
          ;
          log = Function.prototype.bind.call(log, console);
          if(settings.debug) {
            output.push(message);
            log.apply(console, output.concat(variables) );
          }
        },
        error: function() {
          var
            output       = [],
            errorMessage = settings.moduleName + ': ' + arguments[0],
            variables    = [].slice.call( arguments, 1 ),
            log          = console.warn || console.log || function(){}
          ;
          log = Function.prototype.bind.call(log, console);
          if(settings.debug) {
            output.push(errorMessage);
            output.concat(variables);
            log.apply(console, output.concat(variables) );
          }
        },
        invoke: function(query, context, passedArguments) {
          var
            maxDepth,
            found
          ;
          passedArguments = passedArguments || [].slice.call( arguments, 2 );
          if(typeof query == 'string' && instance !== undefined) {
            query    = query.split('.');
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              if( $.isPlainObject( instance[value] ) && (depth != maxDepth) ) {
                instance = instance[value];
                return true;
              }
              else if( instance[value] !== undefined ) {
                found = instance[value];
                return true;
              }
              module.error(errors.method);
              return false;
            });
          }
          if ( $.isFunction( found ) ) {
            return found.apply(context, passedArguments);
          }
          // return retrieved variable or chain
          return found;
        }
      };

      // check for invoking internal method
      if(methodInvoked) {
        invokedResponse = module.invoke(query, this, passedArguments);
      }
      // otherwise initialize
      else {
        module.initialize();
      }

    })
  ;
  // chain or return queried method
  return (invokedResponse !== undefined)
    ? invokedResponse
    : this
  ;
};

$.fn.validateForm.settings = {

  // module info
  moduleName : 'Validate Form Module',
  debug      : true,
  verbose    : false,
  namespace  : 'validate',

  animateSpeed : 150,
  inlineError  : false,
  
  onValid      : function() {},
  onInvalid    : function() {},
  onSuccess    : function() { return true; },
  onFailure    : function() { return false; },

  metadata : {
    validate: 'validate'
  },

  // errors
  errors: {
    method   : 'The method you called is not defined.',
    noFields : 'No validation object specified.'
  },


  selector : {
    group  : '.field',
    prompt : '.prompt',
    field  : 'input, textarea, select'
  },

  className : {
    error   : 'error',
    prompt  : 'prompt'
  },

  rules: {
    empty: function(value) {
      return !(value === undefined || '' === value);
    },
    email: function(value){
      var 
        emailRegExp = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?")
      ;
      return emailRegExp.test(value);
    },
    length: function(value, requiredLength) {
      return (value !== undefined)
        ? (value.length >= requiredLength)
        : false
      ;
    },
    not: function(value, notValue) {
      return (value != notValue);
    },
    maxLength: function(value, maxLength) {
      return (value !== undefined)
        ? (value.length <= maxLength)
        : false
      ;
    },
    match: function(value, matchingField) {
      // use either id or name of field
      var
        $form = $(this),
        matchingValue
      ;
      if($form.find('#' + matchingField).size() > 0) {
        matchingValue = $form.find('#' + matchingField).val();
      }
      else if($form.find('[name=' + matchingField +']').size() > 0) {
        matchingValue = $form.find('[name=' + matchingField + ']').val();
      }
      else if( $form.find('[data-validate="'+ matchingField +'"]').size() > 0 ) {
        matchingValue = $form.find('[data-validate="'+ matchingField +'"]').val();
      }
      return (matchingValue !== undefined)
        ? ( value.toString() == matchingValue.toString() )
        : false
      ;
    },
    url: function(value) {
      var 
        urlRegExp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
      ;
      return urlRegExp.test(value);
    }
  }

};

})( jQuery, window , document );
