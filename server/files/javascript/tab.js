semantic.dropdown = {};

// ready event
semantic.dropdown.ready = function() {


  $.fn.api.settings.mockResponse = function(settings) {
    var response = {
      first  : '<h3 class="ui header">AJAX Tab One</h3><img class="ui wireframe image" src="/images/wireframe/paragraph.png"><img class="ui wireframe image" src="/images/wireframe/paragraph.png">',
      second : '<h3 class="ui header">AJAX Tab Two</h3><img class="ui wireframe image" src="/images/wireframe/paragraph.png"><img class="ui wireframe image" src="/images/wireframe/paragraph.png">',
      third  : '<h3 class="ui header">AJAX Tab Three</h3><img class="ui wireframe image" src="/images/wireframe/paragraph.png"><img class="ui wireframe image" src="/images/wireframe/paragraph.png">'
    };
    return response[settings.urlData.tab];
  };

  $('.first.example .menu .item')
    .tab({
      context: '.first.example'
    })
  ;

  $('.history.example .menu .item')
    .tab({
      context : '.history.example',
      history : true,
      path    : '/modules/tab.html'
    })
  ;

  $('.paths.example .menu .item')
    .tab({
      context: '.paths.example'
    })
  ;

  $('.context.example #context1 .menu .item')
    .tab({
      context: $('.context.example #context1')
    })
  ;
  $('.context.example #context2 .menu .item')
    .tab({
      // special keyword works same as above
      context: 'parent'
    })
  ;

  $('.dynamic.example .menu .item')
    .tab({
      apiSettings: {
        loadingDuration: 300
      },
      cache   : false,
      context : 'parent',
      auto    : true,
      history : false,
      path    : '/'
    })
  ;

  $('.eval.example .menu .item')
    .tab({
      // faking api request
      apiSettings: {
        mockResponse    : function(settings) {
          var response = {
            first  : '<script>alert("JS Fired Once");</script>AJAX Tab One',
            second : '<script>alert("JS Fired Once");</script>AJAX Tab Two',
            third  : '<script>alert("JS Fired Once");</script>AJAX Tab Three'
          };
          return response[settings.urlData.tab];
        }
      },
      context : 'parent',
      auto    : true,
      path    : '/'
    })
  ;

};


// attach ready event
$(document)
  .ready(semantic.dropdown.ready)
;
