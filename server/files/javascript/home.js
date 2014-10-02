semantic.home = {};

// ready event
semantic.home.ready = function() {

  var
    $themeDropdown = $('.theme.dropdown'),
    $header        = $('.masthead'),
    $ui            = $header.find('h1 b'),
    $phrase        = $header.find('h1 span'),
    $download      = $header.find('.download'),
    $library       = $header.find('.library'),
    $version       = $header.find('.version'),
    handler
  ;

  handler = {
    endAnimation: function() {
      $header
        .addClass('stopped')
      ;
    },
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
        $library.transition('scale in', 1000);
      }, 6400);
      setTimeout(function() {
        $version.transition('fade', 600);
      }, 7000);
    }
  };


  $('.masthead')
    .visibility({
      onPassing      : handler.introduction,
      onBottomPassed : handler.endAnimation
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

  window.Transifex.live.onTranslatePage(function(countryCode){
    var fullName = $('.language.dropdown .item[data-value=' + countryCode + ']').eq(0).text();
    $('.language.dropdown > .text').html(fullName);
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
    .sidebar('setting', 'transition', 'slide along')
  ;

};


// attach ready event
$(document)
  .ready(semantic.home.ready)
;