$(document)
  .ready(function() {

    $('.filter.menu .item')
      .tab()
    ;

    $('.left.column .menu .item')
      .on('click', function() {
        $(this)
          .addClass('active')
          .closest('.ui.menu')
            .find('.item').not(this)
            .removeClass('active')
        ;
        event.stopPropagation();
      })
    ;

    $('.list .item')
      .on('click',  function() {
        $(this)
          .addClass('active')
          .siblings()
          .removeClass('active')
        ;
      })
    ;

  })
;