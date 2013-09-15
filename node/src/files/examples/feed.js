$(document)
  .ready(function() {

    var setActive = function(event) {
      $(this)
        .addClass('active')
        .closest('.ui.menu')
          .find('.item').not(this)
          .removeClass('active')
      ;
      event.stopPropagation();
    };

    $('.filter.menu .item')
      .tab()
    ;

    $('.left.column .menu .item')
      .on('click',  setActive)
    ;

    $('.list .item')
      .on('click',  setActive)
    ;

  })
;