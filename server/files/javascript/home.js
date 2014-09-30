semantic.home = {};

// ready event
semantic.home.ready = function() {

  var
    $themeDropdown = $('.theme.dropdown'),
    $header        = $('.masthead'),
    $ui            = $header.find('h1 b'),
    $phrase        = $header.find('h1 span'),
    $download      = $header.find('.download'),
    handler
  ;

  handler = {
    introduction: function() {
      // zoom out
      setTimeout(function() {
        $header
          .removeClass('zoomed')
        ;
      }, 1500);
      $ui.typed({
        replaceBaseText : true,
        strings         : [
          $ui.data('text')
        ],
        showCursor      : false,
        typeSpeed       : 120,
        backSpeed       : 120,
        backDelay       : 500
      });
      setTimeout(function() {
        $('.masthead .library').transition('scale up', 1000);
      }, 6400);
    }
  };


  $('.masthead')
    .visibility({
      onPassing: handler.introduction
    })
  ;

  $themeDropdown
    .dropdown('setting', 'transition', 'drop')
    .dropdown('setting', 'duration', 350)
    .dropdown('setting', 'action', 'activate')
  ;

  $('.card .dimmer')
    .dimmer({
      on: 'hover'
    })
  ;

  window.Transifex.live.onTranslatePage(function(name){
    name = $('.language.dropdown .item[data-value=' + name + ']').text();
    $('.language.dropdown > .text').html(name);
  });


  $('.demo .ui.accordion')
    .accordion()
  ;

  $('.demo .ui.dropdown')
    .dropdown()
  ;
  $('.demo .ui.checkbox')
    .checkbox()
  ;
  $('.ui.sidebar')
    .sidebar('setting', 'transition', 'scale down')
  ;

};


// attach ready event
$(document)
  .ready(semantic.home.ready)
;