$(document)
  .ready(function() {
      // add popup to show name
      $('.ui:not(.container, .grid)').each(function() {
        $(this)
          .popup({
            on        : 'hover',
            variation : 'small inverted',
            exclusive : true,
            content   : $(this).attr('class')
          })
        ;
      });
  })
;
