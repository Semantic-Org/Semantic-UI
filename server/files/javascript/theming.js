semantic.theming = {};

// ready event
semantic.theming.ready = function() {

  var
    $defaultTheme = $('.variable.grid .code')
  ;

  // selector cache
  var handler = {

  };

  $('.main .ui.checkbox')
    .checkbox()
  ;

  $('.load.button')
    .dropdown({
      fireOnInit: true,
      onChange: function(theme) {
        $(this)
          .api({
            on        : 'now',
            dataType  : 'text',
            action    : 'getVariables',
            urlData   : {
              theme: theme
            },
            onSuccess : function(response) {
              if(theme == 'default') {
                $defaultTheme
                  .html(response)
                ;
                $.proxy(semantic.handler.createCode, $defaultTheme);
              }
            }
          })
        ;
      }
    })
  ;


};


// attach ready event
$(document)
  .ready(semantic.theming.ready)
;