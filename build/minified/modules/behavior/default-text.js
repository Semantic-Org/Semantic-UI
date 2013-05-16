/*  ******************************
  Default Text (Form)
  Author: Jack Lukic
  Notes: First Commit April 08, 2012

  Refactored Aug 13, 2012

  allows you to set a default text value which will be added and removed on form field focus

******************************  */
;(function ( $, window, document, undefined ) {

  $.fn.defaultText = function(parameters) {
    var
      // overload for shorthand to default value
      settings = (typeof parameters == 'string')
        ? $.extend({}, $.fn.defaultText.settings, { defaultValue: parameters })
        : $.extend(true, {}, $.fn.defaultText.settings, parameters)
    ;
    // overload function
    if(typeof parameters == 'string') {
      parameters = { defaultValue: parameters };
    }
    $.extend(settings, parameters);
    $(this)
      .each(function() {
        var
          $element = $(this),
          module   = {

            checkDefault: function() {
              if($element.val().toLowerCase() != settings.defaultValue.toLowerCase()) {
                $element.addClass(settings.filledClass);
              }
            },

            placeholder: {
              add: function(){
                if( $element.filter(settings.disabledClassList).size() === 0 ) {
                  if( $element.val() == settings.replaceValue ) {
                    if(settings.alwaysReplace) {
                      $element
                        .removeClass(settings.filledClass)
                        .val($element.attr('last'))
                        .removeAttr('last')
                      ;
                    }
                    else {
                      $element
                        .removeClass(settings.filledClass)
                        .val(settings.defaultValue)
                      ;
                    }
                  }
                  else {
                    $element
                      .addClass(settings.filledClass)
                    ;
                  }
                }
              },
              remove: function() {
                if( $element.filter(settings.disabledClassList).size() === 0 ) {
                  if(settings.alwaysReplace) {
                    $element
                      .attr('last', $element.val())
                      .val(settings.replaceValue)
                    ;
                  }
                  else {
                    if( $element.val().toLowerCase() == settings.defaultValue.toLowerCase() ) {
                      $element
                        .val(settings.replaceValue)
                      ;
                    }
                  }
                }
              }
            }
          }
        ;
        if(settings.defaultValue == 'auto') {
          settings.defaultValue = $(this).val();
        }
        $element
          .on('focus', module.placeholder.remove)
          .on('blur', module.placeholder.add)
        ;
        // check for user value on load
        module.checkDefault();
      })
    ;
    return this;
  };

  $.fn.defaultText.settings = {
    defaultValue      : 'auto',
    replaceValue      : '',
    alwaysReplace     : false,
    disabledClassList : '.readonly, .disabled',
    filledClass       : 'filled'
  };

})( jQuery, window , document );
