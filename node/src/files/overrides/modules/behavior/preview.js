/*  ******************************
  Previews - Quirky Preview Component
  Author: Jack Lukic
  Notes: First Commit June 06, 2012

  Tooltip Wrapper for loading
  previews of ideations, concepts and users

  Will eventually rewrite to use own tooltip lib

******************************  */

;(function ( $, window, document, undefined ) {

  $.fn.preview = function(parameters) {
    var
      settings        = $.extend(true, {}, $.fn.preview.settings, parameters),
      // hoist arguments
      moduleArguments = arguments || false
    ;
    $(this)
      .each(function() {

        var
          $module   = $(this),

          namespace = settings.namespace,
          instance  = $module.data('module-' + settings.namespace),
          module
        ;

        settings.className = (settings.className == 'auto')
          ? ( typeof $.fn.preview.settings.classNames[settings.type] !== undefined)
            ? $.fn.preview.settings.classNames[settings.type]
            : $.fn.preview.settings.classNames.standard
          : settings.className
        ;

        module = {
          initialize: function() {
            var
              throbberContent = '<div class="ui throbber center"></div>'
            ;
            $module
              .data('module', 'module-' + settings.namespace)
              .data('content', throbberContent)
              .on('mouseenter.' + namespace, module.throttle)
              .on('mouseleave.' + namespace, module.disable)
              .popover(settings)
            ;
          },

          throttle: function() {
            if(typeof module.timer !== undefined) {
              clearTimeout(module.timer);
            }
            module.timer = setTimeout(module.prepare, settings.delay);
          },

          prepare: function() {
            var
              title           = $module.data('title')   || false,
              content         = $module.data('content') || false,
              apiRequest      = $module.data('promise') || false,
              action          = (settings.action)
                ? settings.action
                : settings.type
            ;
            // if no content lets ajax
            if(!apiRequest) {

              // make sure we're not already requesting this
              if($module.data('id') !== undefined) {
                $.api({
                  action       : action,
                  handleState  : settings.handleState,
                  dataType     : 'json',
                  stateContext : $module,
                  error        : function(error) {
                    console.log('Error thrown making request:' + error);
                  },
                  success      : function(response) {
                    var
                      popover = $module.data('popover'),
                      content,
                      data,
                      title
                    ;
                    module.debug('Server response was successful');
                    // user tooltip case
                    if(typeof settings.create[settings.type] == 'function') {
                      module.debug('Creating html content');
                      content = settings.create[settings.type](response);

                      // prevents fade-in doubling
                      if(popover !== undefined) {
                        popover.options.animation = false;
                      }
                      $module
                        .data('content', content)
                        .data('popover', popover)
                        .popover('show')
                      ;
                      module.debug('Showing popup');
                      popover.options.animation = settings.animation;
                      $module
                        .data('popover', popover)
                      ;
                    }
                    else {
                      module.disable();
                    }
                  }
                });
              }
            }
            else {
              $module.popover('enable');
            }
          },
          disable: function() {
            if(typeof module.timer !== undefined) {
              clearTimeout(module.timer);
            }
            // they moused away before popover appeared, dont show it while their mouse is elsewhere
            $module
              .popover('disable')
            ;
          },

          debug: function(message) {
            if(settings.debug) {
              console.info(settings.moduleName + ': ' + message);
            }
          },
          error: function(errorMessage) {
            console.warn(settings.moduleName + ': ' + errorMessage);
          },
          invoke: function(methodName, context, methodArguments) {
            var
              method
            ;
            methodArguments = methodArguments || Array.prototype.slice.call( arguments, 2 );
            if(typeof methodName == 'string' && instance !== undefined) {
              methodName = methodName.split('.');
              $.each(methodName, function(index, name) {
                if( $.isPlainObject( instance[name] ) ) {
                  instance = instance[name];
                  return true;
                }
                else if( $.isFunction( instance[name] ) ) {
                  method = instance[name];
                  return true;
                }
                module.error(settings.errors.method);
                return false;
              });
            }
            if ( $.isFunction( method ) ) {
              return method.apply(context, methodArguments);
            }
            // return retrieved variable or chain
            return method;
          }

        };

        if(instance !== undefined && moduleArguments) {
          // simpler than invoke realizing to invoke itself (and losing scope due prototype.call()
          if(moduleArguments[0] == 'invoke') {
            moduleArguments = Array.prototype.slice.call( moduleArguments, 1 );
          }
          return module.invoke(moduleArguments[0], this, Array.prototype.slice.call( moduleArguments, 1 ) );
        }
        // initializing
        module.initialize();
      })
    ;
    return this;
  };

  $.fn.preview.settings = {

    moduleName     : 'Preview Popup',
    debug          : true,
    namespace      : 'preview',

    type           : 'idea',
    action         : false,
    handleState    : 'true',

    className      : 'auto',

    classNames: {
      standard       : 'summary',
      idea           : 'pictoral idea',
      user           : 'user summary',

      product        : 'product',
      productSummary : 'product summary'
    },
    placement : 'top',

    animation : true,
    delay     : 400
  };

  // creates tooltip from server response
  $.fn.preview.settings.create = {
    user: function(response) {
      var
        user    = response.user,
        content = ''
      ;
      content += ''
        + "<div class='image'>"
        + " <img src='" + user.avatar +"'>"
        + "</div>"
        + "<h2>" + user.name +"</h2>"
      ;
      if(user.location) {
        content += "<h3>" + user.location + "</h3>";
      }
      content += ""
        + "<table>"
        + "  <tr class='odd'><td class='label'>Member Since:</td><td>" + user.createdAt +"</td></tr>"
        + "  <tr><td class='label'>Ideas Submitted:</td><td>" + user.ideas + "</td></tr>"
        + "  <tr class='odd'><td class='label'>Total Influence:</td><td>" + user.totalInfluence +"</td></tr>"
        + "</table>"
      ;
      if(user.admin) {
        content += "<div class='ui flag team'>";
      }
      else if(user.pro) {
        content += "<div class='ui flag pro'>";
      }
      return content;
    },
    // flat json
    productSummary: function(response) {
      var
        product = response.product,
        content = '',
        stateName
      ;
      // pretty names for states
      switch(product.state) {
        case 'presales':
          stateName = 'Presales';
        break;
        case 'sales':
          stateName = 'On Sale Now';
        break;
        case 'development':
          stateName = "We're working on it";
        break;
        case 'hoed':
          stateName = "We're working on it";
        break;
        case 'tooling':
          stateName = "We're making it";
        break;
        case 'quote':
          stateName = "We're making it";
        break;
        case 'in_production':
          stateName = "We're making it";
        break;
      }
      if(product.state == 'development') {
        content += ''
          + "<hgroup>"
          + "  <div class='image'></div>"
          + "  <h2>" + product.name +"</h2>"
          + "  <h4>" + stateName + "</h4>"
          + "</hgroup>"
        ;
      }
      else {
        content += ''
          + "<hgroup>"
          + "  <div class='image'>"
        ;
        if(product.images.icon !== undefined && product.images.icon !== '') {
          content += "    <img src='" + product.images.icon +"'>";
        }
        content += ''
          + "  </div>"
          + "  <h2>" + product.name +"</h2>"
        ;
        if(product.tagline !== undefined) {
          content += "<h3>" + product.tagline +"</h3>";
        }
        if(stateName !== undefined) {
          content += "<h4>" + stateName + "</h4>";
        }
        content += ""
          + "</hgroup>"
        ;
        if(product.description.summary !== undefined) {
          content += "<p class='description'>" + product.description.summary + "</p>";
        }
      }
      return content;
    }
  };

})( jQuery, window , document );
