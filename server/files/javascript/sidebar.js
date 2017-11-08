semantic.sidebar = {};

// ready event
semantic.sidebar.ready = function() {

  // selector cache
  var
    // alias
    handler
  ;

  $('.ui.sidebar .ui.dropdown')
    .dropdown({
      on: 'hover'
    })
  ;

  $('.help.icon')
    .popup()
  ;

  $('.demo.sidebar')
    .sidebar()
  ;

  $('.main.container .checkbox')
    .checkbox()
  ;

  $('.left.example')
    .find('.button')
      .on('click', function() {
        var
          transition = $(this).data('transition')
        ;
        $('.left.demo.sidebar')
          .not('.styled')
          .sidebar('setting', {
            transition       : transition,
            mobileTransition : transition
          })
        ;
        $('.left.demo.sidebar').not('.styled').sidebar('toggle');
      })
  ;

  $('.direction.example')
    .find('.buttons .button')
      .on('click', function() {
        var
          direction = $(this).data('direction')
        ;
        $(this).addClass('active').siblings().removeClass('active');
        if(direction === 'top' || direction === 'bottom') {
          $('.horizontal.button').addClass('disabled');
        }
        else {
          $('.horizontal.button').removeClass('disabled');
        }
      })
      .end()
      .children('.button')
      .on('click', function() {
        var
          transition = $(this).data('transition'),
          direction  = $('.direction.example .buttons .button.active').data('direction'),
          dimPage    = $('.direction.example .dim').checkbox('is checked')
        ;
        if( $(this).filter('.disabled').length === 0) {
          $('.' + direction + '.demo.sidebar')
            .not('.styled')
            .sidebar('setting', {
              dimPage          : dimPage,
              transition       : transition,
              mobileTransition : transition
            })
          ;
          $('.' + direction + '.demo.sidebar').not('.styled').sidebar('toggle');
        }

      })
  ;



};


// attach ready event
$(document)
  .ready(semantic.sidebar.ready)
;
