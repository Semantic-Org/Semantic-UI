semantic.card = {};

// ready event
semantic.card.ready = function() {

  // selector cache
  var 
    $card = $('.ui.idea.cards .card, .ui.idea.card'),
    handler
  ;

  handler = {

    randomProgress: function(index) {
      var $this = $(this);
      setTimeout(function() {
        $this
          .find('.bar')
            .css('width', Math.floor(Math.random() * 100) + '%')
        ;
      }, index * 200);
    }

  };

  $card
    .each(handler.randomProgress)
    .card()
  ;
  
};


// attach ready event
$(document)
  .ready(semantic.card.ready)
;