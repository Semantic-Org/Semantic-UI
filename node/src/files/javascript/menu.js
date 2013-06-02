semantic.menu = {};

// ready event
semantic.menu.ready = function() {

  // selector cache
  var 
    $menuItem = $('.menu a.item, .menu .link.item'),
    // alias
    handler = {

      activate: function() {
        if(!$(this).hasClass('dropdown')) {
          $(this)
            .addClass('active')
            .closest('.ui.menu')
            .find('.item')
              .not($(this))
              .removeClass('active')
          ;
        }
      }

    }
  ;

  $menuItem
    .on('click', handler.activate)
  ;
  
};


// attach ready event
$(document)
  .ready(semantic.menu.ready)
;