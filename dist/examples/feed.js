$(document)
  .ready(function() {

    $('.filter.menu .item')
      .tab()
    ;

    $('.ui.rating')
      .rating({
        clearable: true
      })
    ;

    $('.ui.sidebar')
      .sidebar('attach events', '.launch.button')
    ;

    $('.ui.dropdown')
      .dropdown()
    ;

  })
;