semantic.home = {};

// ready event
semantic.home.ready = function() {

  var
    $themeDropdown = $('.theme.dropdown'),
    $header        = $('.masthead'),
    $ui            = $header.find('h1 b'),
    $phrase        = $header.find('h1 span'),
    $download      = $header.find('.download')
  ;

  $themeDropdown
    .dropdown('setting', 'action', 'activate')
  ;

  // zoom out
  $header
    .removeClass('zoomed')
  ;

  setTimeout(function() {
    $ui.typed({
      replaceBaseText : true,
      strings         : window.semantic.config.type,
      showCursor      : false,
      typeSpeed       : 100,
      backSpeed       : 100,
      backDelay       : 1000
    });
  }, 0);

  $('.demo .ui.accordion')
    .accordion()
  ;

  $('.demo .ui.dropdown')
    .dropdown()
  ;
  $('.demo .ui.checkbox')
    .checkbox()
  ;

};


// attach ready event
$(document)
  .ready(semantic.home.ready)
;