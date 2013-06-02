semantic.playground = {};

// ready event
semantic.playground.ready = function() {

  // selector cache
  var 
    $uiElements = $('.selection.dropdown'),
    // alias
    handler = {

      variations: {

        create: function() {

        },

        toggle: function() {

        }

      },

      preview: {

        update: function() {

        }

      },

      item: {

        highlight: function() {

        },
        insert: function() {

        },
        update: function() {

        },
        remove: function() {

        }

      },

      components: {

        add: function() {

        },
        remove: function() {

        }
      },

      activate: function() {
        if(!$(this).hasClass('dropdown')) {
          $(this)
            .addClass('active')
            .closest('.ui.playground')
            .find('.item')
              .not($(this))
              .removeClass('active')
          ;
        }
      }

    }
  ;


  $uiElements
    .dropdown({
      action: 'form',
      onChange: function() {
        $uiElements
          .not($(this))
          .find('.text')
            .html('---')
            .end()
          .find('input')
            .val('')
        ;
      }
    })
  ;
  
};


// attach ready event
$(document)
  .ready(semantic.playground.ready)
;