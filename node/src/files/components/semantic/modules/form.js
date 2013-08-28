/*  ******************************
  Form Validation Components
  Author: Jack Lukic
  Notes: First Commit April 08, 2012

  Refactored May 28, 2013

  Allows you to validate forms based on a form validation object
  Form validation objects are bound by either data-validate="" metadata, or form id or name tags

******************************  */

;(function ( $, window, document, undefined ) {

$.fn.form = function(fields, parameters) {
  var
    $allModules     = $(this),
    $document       = $(document),
    
    settings        = $.extend(true, {}, $.fn.form.settings, parameters),

    eventNamespace  = '.' + settings.namespace,
    moduleNamespace = 'module-' + settings.namespace,

    selector        = $allModules.selector || '',
    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),
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

        element       = this,
        instance      = $module.data('module-' + settings.namespace),
        
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
            // attach event handler
            if(settings.on == 'submit') {
              $module
                .on('submit.' + namespace, module.validate.form)
              ;
            }
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

        refresh: function() {
          $field = $module.find(settings.selector.field);
        },

        field: {
          find: function(identifier) {
            module.refresh();
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
              value         = $field.val(),

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

        setting: function(name, value) {
          if(value !== undefined) {
            if( $.isPlainObject(name) ) {
              $.extend(true, settings, name);
            }
            else {
              settings[name] = value;
            }
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if(value !== undefined) {
            if( $.isPlainObject(name) ) {
              $.extend(true, module, name);
            }
            else {
              module[name] = value;
            }
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            module.performance.log(arguments[0]);
            module.debug = Function.prototype.bind.call(console.log, console, settings.moduleName + ':');
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            module.performance.log(arguments[0]);
            module.verbose = Function.prototype.bind.call(console.info, console, settings.moduleName + ':');
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.log, console, settings.moduleName + ':');
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime,
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({ 
                'Element'        : element,
                'Name'           : message, 
                'Execution Time' : executionTime
              });
              clearTimeout(module.performance.timer);
              module.performance.timer = setTimeout(module.performance.display, 100);
            }
          },
          display: function() {
            var
              title              = settings.moduleName,
              caption            = settings.moduleName + ': ' + selector + '(' + $allModules.size() + ' elements)',
              totalExecutionTime = 0
            ;
            if(selector) {
              title += 'Performance (' + selector + ')';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                $.each(performance, function(index, data) {
                  totalExecutionTime += data['Execution Time'];
                });
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  totalExecutionTime += data['Execution Time'];
                });
              }
              console.log('Total Execution Time:', totalExecutionTime +'ms');
              console.groupEnd();
              performance = [];
              time        = false;
            }
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            maxDepth,
            found
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
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
            module.verbose('Executing invoked function', found);
            return found.apply(context, passedArguments);
          }
          return found || false;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        invokedResponse = module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;
  return (invokedResponse)
    ? invokedResponse
    : this
  ;
};

$.fn.form.settings = {

  // module info
  moduleName : 'Validate Form Module',
  debug      : true,
  verbose    : false,
  namespace  : 'validate',

  animateSpeed : 150,
  inlineError  : false,

  on: 'submit',
  
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

  defaults: {
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
          type   : 'email',
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
