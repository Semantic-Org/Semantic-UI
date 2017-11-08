semantic.container = {};

// ready event
semantic.container.ready = function() {

  var
    $helpIcon = $('.main.container .help.icon'),
    $pageTabs = $('.masthead.tab.segment .menu .item')
  ;

  $pageTabs
    .tab({
      history     : true,
      onFirstLoad : function() {
        semantic.handler.makeCode();
      }
    })
  ;
  semantic.handler.makeCode();

  $helpIcon
    .popup()
  ;

};


// attach ready event
$(document)
  .ready(semantic.container.ready)
;