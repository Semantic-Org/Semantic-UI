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
    .dropdown('setting', 'transition', 'drop')
    .dropdown('setting', 'duration', 350)
    .dropdown('setting', 'action', 'activate')
  ;

  // zoom out
  $header
    .removeClass('zoomed')
  ;

  window.Transifex.live.onTranslatePage(function(name){
    name = $('.language.dropdown .item[data-value=' + name + ']').text();
    $('.language.dropdown > .text').html(name);
  });

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
  }, 5000);

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