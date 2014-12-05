describe("UI Modal", function() {

  $.fn.dimmer.settings.debug = false;

  moduleTests({
    module  : 'modal',
    element : '.ui.modal'
  });

});