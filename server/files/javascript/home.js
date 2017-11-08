semantic.home = {};

// ready event
semantic.home.ready = function() {

  var
    $themeDropdown = $('.theme.dropdown'),
    $header        = $('.masthead'),
    $ui            = $header.find('h1 b'),
    $phrase        = $header.find('h1 span'),
    $download      = $header.find('.download'),
    $library       = $header.find('.library'),
    $cursor        = $header.find('.typed-cursor'),
    $version       = $header.find('.version'),
    $themeButton   = $('.theming .source.button'),
    $themeGrid     = $('.theming .source.grid'),

    handler
  ;

  handler = {
    getRandomInt: function(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    introduction: function() {
      var
        background = 'bg' + handler.getRandomInt(1, 14)
      ;
      // zoom out
      $header
        .addClass(background)
        .removeClass('zoomed')
      ;
    },
    changeLogo: function() {
      var
        $logo = $('.following .logo'),
        $nextSide = $logo.find('.'+ $(this).data('site') +'.side'),
        directions = [
          'up',
          'left',
          'down',
          'right'
        ],
        direction = directions[Math.floor(Math.random() * directions.length)]
      ;
      if($nextSide.length > 0) {
        clearTimeout(handler.timer);
        handler.timer = setTimeout(function() {
          $logo
            .shape('set next side', $nextSide)
            .shape('flip ' +  direction)
          ;
        }, 50);
      }
    },
    returnLogo: function() {
      var
        $logo = $('.following .logo'),
        $nextSide = $logo.find('.ui.side')
      ;
      clearTimeout(handler.timer);
      handler.timer = setTimeout(function() {
        $logo
          .shape('set next side', $nextSide)
          .shape('flip over')
        ;
      }, 500);

    },

    less: {

      parseFile: function(content) {
        var
          variables = {},
          lines = content.match(/^\s*(@[\s|\S]+?;)/gm),
          name,
          value
        ;
        if(lines) {
          $.each(lines, function(index, line) {
            // clear whitespace
            line = $.trim(line);
            // match variables only
            if(line[0] == '@') {
              name = line.match(/^@(.+?):/);
              value = line.match(/:\s*([\s|\S]+?;)/);
              if( ($.isArray(name) && name.length >= 2) && ($.isArray(value) && value.length >= 2) ) {
                name = name[1];
                value = value[1];
                variables[name] = value;
              }
            }
          });
        }
        console.log(variables);
        return variables;
      },

      changeTheme: function(theme) {
        var
          $themeDropdown     = $(this),
          $variableCode      = $('.variable.code'),
          $overrideCode      = $('.override.code'),
          $existingVariables = $variableCode.closest('.existing'),
          $existingOverrides  = $overrideCode.closest('.existing'),

          variableURL = '/src/themes/{$theme}/{$type}s/{$element}.variables',
          overrideURL = '/src/themes/{$theme}/{$type}s/{$element}.overrides',
          urlData     = {
            theme   : typeof(theme === 'string')
              ? theme.toLowerCase()
              : theme,
            type    : $themeDropdown.data('type'),
            element : $themeDropdown.data('element')
          }
        ;
        if($existingVariables.length > 0) {
          $variableCode = $('<div class="ui variable code" data-type="less" data-preserve="true" />');
          $variableCode
            .insertAfter($existingVariables)
          ;
          $existingVariables.remove();
          console.log($variableCode);
        }

        if($existingOverrides.length > 0) {
          $overrideCode = $('<div class="ui override code" data-type="less" data-preserve="true" />');
          $overrideCode
            .insertAfter($existingOverrides)
          ;
          $existingOverrides.remove();
          console.log($overrideCode);
        }

        $themeDropdown
          .api({
            on       : 'now',
            url      : variableURL,
            dataType : 'text',
            urlData  : urlData,
            onSuccess: function(content) {
              window.less.modifyVars( handler.less.parseFile(content) );
              $themeDropdown
                .api({
                  on       : 'now',
                  url      : overrideURL,
                  dataType : 'text',
                  urlData  : urlData,
                  onSuccess: function(content) {
                    if( $('style.override').length > 0 ) {
                      $('style.override').remove();
                    }
                    $('<style>' + content + '</style>')
                      .addClass('override')
                      .appendTo('body')
                    ;
                    $('.sticky').sticky('refresh');

                    $overrideCode.html(content);
                    $.proxy(semantic.handler.initializeCode, $overrideCode[0])();
                  }
                })
              ;
              $variableCode.html(content);
              $.proxy(semantic.handler.initializeCode, $variableCode[0])();
            }
          })
        ;
      }
    },
    showThemeButton: function(value, text) {
      if(!$themeButton.transition('is visible')) {
        $themeButton.transition('scale in');
      }
      $.proxy(handler.less.changeTheme, this)(value);
    },
    createDemos: function() {
      $('.demo.menu .item, .demo.buttons .button')
        .on('click', function() {
          if(!$(this).hasClass('dropdown')) {
            $(this)
              .addClass('active')
              .closest('.ui.menu, .ui.buttons')
              .find('.item, .button')
                .not($(this))
                .removeClass('active')
            ;
          }
        })
      ;
      $('.example .message .close')
        .on('click', function() {
          $(this).closest('.message').transition('scale out');
        })
      ;
    },
    toggleTheme: function() {
      $(this).toggleClass('active');
      $themeGrid.toggleClass('visible');
    }
  };

  // intro
  handler.introduction();

  if($(window).width() > 600) {
    $('body')
      .visibility({
        offset         : -10,
        observeChanges : false,
        once           : false,
        continuous     : false,
        onTopPassed: function() {
          requestAnimationFrame(function() {
            $('.following.bar')
              .addClass('light fixed')
              .find('.menu')
                .removeClass('inverted')
            ;
            $('.following .additional.item')
              .transition('scale in', 750)
            ;
          });
        },
        onTopPassedReverse: function() {
          requestAnimationFrame(function() {
            $('.following.bar')
              .removeClass('light fixed')
              .find('.menu')
                .addClass('inverted')
                .find('.additional.item')
                  .transition('hide')
            ;
          });
        }
      })
    ;
  }
  $('.additional.item')
    .popup({
      delay: {
        show: 200,
        hide: 50
      },
      position: 'bottom center'
    })
  ;

  $('.email.stripe form')
    .form({
      fields: {
        email: {
          identifier : 'email',
          rules: [
            {
              type   : 'empty',
              prompt : 'Please enter an e-mail'
            },
            {
              type   : 'email',
              prompt : 'Please enter a valid e-mail address'
            }
          ]
        }
      }
    })
  ;



  $themeDropdown
    .dropdown('setting', 'transition', 'drop')
    .dropdown('setting', 'duration', 350)
    .dropdown('setting', 'action', 'activate')
    .dropdown('setting', 'onChange', handler.showThemeButton)
  ;

  $themeButton
    .on('click', handler.toggleTheme)
  ;


  // demos
  $('.demo .checkbox')
    .checkbox()
  ;
  $('.demo .accordion')
    .accordion()
  ;
  $('.demo .dimmer')
    .dimmer({
      on: 'hover'
    })
  ;
  $('.demo .ui.dropdown')
    .dropdown()
  ;

  if(window.Transifex !== undefined) {
    window.Transifex.live.onTranslatePage(function(countryCode){
      var fullName = $('.language.dropdown .item[data-value=' + countryCode + ']').eq(0).text();
      $('.language.dropdown > .text').html(fullName);
    });
  }

  $('.ui.sidebar')
    .sidebar('setting', {
      transition: 'overlay'
    })
  ;

  handler.createDemos();

};


// attach ready event
$(document)
  .ready(semantic.home.ready)
;
