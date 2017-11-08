semantic.visiblity = {};

// ready event
semantic.visiblity.ready = function() {

  // selector cache
  var
    $pageTabs           = $('.masthead.tab.segment .stackable.menu .item'),
    $firstColumn        = $('.first.example .main.column'),
    $firstSegment       = $('.first.example .demo.segment'),
    $firstSticky        = $('.first.example .grid .sticky'),

    $secondColumn       = $('.second.example .main.column'),
    $secondSegment      = $('.second.example .demo.segment'),
    $secondSticky       = $('.second.example .grid .sticky'),
    $settingsCheckboxes = $('.second.example .checkbox'),
    $log                = $('.second.example .console'),
    $clearButton        = $('.second.example .clear.button'),

    handler
  ;

  // event handlers
  handler = {
    clearConsole: function() {
      $log.empty();
    },
    updateTable: function(calculations) {
      $.each(calculations, function(name, value) {
        var
          value = (typeof value == 'integer')
            ? parseInt(value, 10)
            : value.toString(),
          $td
        ;
        if(name == 'pixelsPassed' || name == 'width' || name == 'height') {
          value = parseInt(value, 10) + 'px';
        }
        else if(name == 'percentagePassed') {
          value = parseInt(value * 100, 10) + '%';
        }
        $td = $('.first.example .grid .sticky tr.'+ name +' td:last-child');
        if($td.html() !== value) {
          if(value == 'true' || value == 'false') {
            $td.removeClass('highlight').addClass('highlight');
            setTimeout(function(){ $td.removeClass('highlight'); }, 2000);
          }
          $td.html(value);
        }
      });
    }
  };

  $pageTabs.tab('setting', 'onLoad', function() {
    $('.ui.sticky')
      .sticky('refresh')
    ;
    $(this).find('.visibility.example .overlay, .visibility.example .demo.segment, .visibility.example .items img')
      .visibility('refresh')
    ;
  });

  $firstSticky
    .sticky({
      observeChanges : false,
      pushing        : true,
      context        : $firstColumn,
      offset         : 60
    })
  ;

  $clearButton
    .on('click', handler.clearConsole)
  ;

  $firstSegment
    .visibility({
      once           : false,
      continuous     : true,
      observeChanges : false,
      onUpdate       : handler.updateTable
    })
  ;

  $secondSegment
    .visibility({
      onOnScreen: function() {
        $log.append('<div class="highlight">onOnScreen fired</div>');
        $log.scrollTop(999999);
      },
      onOffScreen: function() {
        $log.append('<div class="highlight">onOffScreen fired</div>');
        $log.scrollTop(999999);
      },
      onTopVisible: function() {
        $log.append('<div class="highlight">onTopVisible fired</div>');
        $log.scrollTop(999999);
      },
      onBottomVisible: function() {
        $log.append('<div class="highlight">onBottomVisible fired</div>');
        $log.scrollTop(999999);
      },
      onPassing: function() {
        $log.append('<div class="highlight">onPassing fired</div>');
        $log.scrollTop(999999);
      },
      onTopPassed: function() {
        $log.append('<div class="highlight">onTopPassed fired</div>');
        $log.scrollTop(999999);
      },
      onBottomPassed: function() {
        $log.append('<div class="highlight">onBottomPassed fired</div>');
        $log.scrollTop(999999);
      },
      onTopVisibleReverse: function() {
        $log.append('<div class="highlight">onTopVisibleReverse fired</div>');
        $log.scrollTop(999999);
      },
      onBottomVisibleReverse: function() {
        $log.append('<div class="highlight">onBottomVisibleReverse fired</div>');
        $log.scrollTop(999999);
      },
      onPassingReverse: function() {
        $log.append('<div class="highlight">onPassingReverse fired</div>');
        $log.scrollTop(999999);
      },
      onTopPassedReverse: function() {
        $log.append('<div class="highlight">onTopPassedReverse fired</div>');
        $log.scrollTop(999999);
      },
      onBottomPassedReverse: function() {
        $log.append('<div class="highlight">onBottomPassedReverse fired</div>');
        $log.scrollTop(999999);
      }
    })
  ;

  $settingsCheckboxes
    .checkbox({
      onChecked: function() {
        var setting = $(this).attr('name');
        $secondSegment.visibility('setting', setting, true);
      },
      onUnchecked: function() {
        var setting = $(this).attr('name');
        $secondSegment.visibility('setting', setting, false);
      }
    })
  ;

  $secondSticky
    .sticky({
      observeChanges : false,
      pushing        : true,
      context        : $secondColumn,
      offset         : 60
    })
  ;

};

var count = 1;
window.loadFakeContent = function() {
  // load fake content
  var
    $segment = $('.infinite .demo.segment'),
    $loader  = $segment.find('.inline.loader'),
    $content = $('<h3 class="ui header">Loaded Content #' + count + '</h3><img class="ui wireframe image" src="/images/wireframe/paragraph.png"><img class="ui wireframe image" src="/images/wireframe/paragraph.png"><img class="ui wireframe image" src="/images/wireframe/paragraph.png">')
  ;
  if(count <= 5) {
    $loader.addClass('active');
    setTimeout(function() {
      $loader
        .removeClass('active')
        .before($content)
      ;
      $('.ui.sticky')
        .sticky('refresh')
      ;
      $('.visibility.example > .overlay, .visibility.example > .demo.segment, .visibility.example .items img')
        .visibility('refresh')
      ;
    }, 1000);
  }
  count++;
}

// attach ready event
$(document)
  .ready(semantic.visiblity.ready)
;