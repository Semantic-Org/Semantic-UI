semantic.message = {};

// ready event
semantic.message.ready = function() {


  $('.message .close').on('click', function() {
    $(this).closest('.message').transition('fade');
  });

};


// attach ready event
$(document)
  .ready(semantic.message.ready)
;