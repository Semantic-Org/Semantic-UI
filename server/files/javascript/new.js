semantic.new = {};

// ready event
semantic.new.ready = function() {

  // selector cache
  var handler = {

    activate: function() {
      if(!$(this).hasClass('dropdown browse')) {
        $(this)
          .addClass('active')
          .closest('.ui.menu')
          .find('.item')
            .not($(this))
            .removeClass('active')
        ;
      }
    }

  };

  $('.bug.accordion')
    .accordion()
  ;

  // tab refresh
  $('.masthead.tab.segment .stackable.menu .item')
    .tab('setting', 'onLoad', function() {
      semantic.handler.refreshSticky();
      $(this).find('.memory.example .demo').visibility('refresh');
      $(this).find('.overlay')
        .visibility('refresh')
      ;
    })
  ;

  // 2.2
  $('.faster.example .ui.multiple.dropdown')
    .dropdown({
      debug: true,
      verbose: true,
      allowAdditions: true,
      onChange: function() {
        console.log('onChange');
      }
    })
  ;

  // form
  $('.depends.example .ui.checkbox')
    .checkbox()
  ;


  // 2.1

  $('.mapping.example .ui.search')
    .search({
      apiSettings: {
        url: '//api.github.com/search/repositories?q={query}',
        cache: true
      },
      fields: {
        results : 'items',
        title   : 'name',
        url     : 'html_url'
      }
    })
  ;

  $('.fields.example .ui.search')
    .search({
      source: [
      {
        mustard: 'Title #1',
        pickle: 'thing'
      },
      {
        mustard: 'Title #2',
        pickle: 'another thing'
      },
      {
        mustard: 'Title #3',
        pickle: 'thing 100'
      }
    ],
    fields: {
      title   : 'mustard'
    },
    searchFields: ['pickle']
    })
  ;

  $('.validation.example')
    .form({
      inline: true,
      fields: {
        firstName: {
          identifier  : 'first-name',
          rules: [
            {
              type   : 'empty',
              prompt : 'Please enter your first name'
            }
          ]
        },
        lastName: {
          identifier  : 'last-name',
          rules: [
            {
              type   : 'empty',
              prompt : 'Please enter your last name'
            }
          ]
        },
        terms: {
          identifier : 'terms',
          rules: [
            {
              type   : 'checked',
              prompt : 'You must agree to the terms and conditions'
            }
          ]
        }
      }
    })
  ;



  /// 2.0

  // form
  $('.form.example .ui.dropdown')
    .dropdown()
  ;
  // form
  $('.form.example')
    .form({
      inline: true,
      fields: {
        firstName: {
          identifier : 'shipping[first-name]',
          rules: [
            {
              type   : 'isExactly[Suzy]',
              prompt : 'Your name must be "Suzy"'
            }
          ]
        }
      }
    })
  ;

  // dimmer
  $('.blurring.example .card .dimmer')
    .dimmer({
      on: 'hover'
    })
    .find('.button')
      .state({
        text: {
          active : 'Sent!'
        }
      })
  ;

  // checkbox
  $('.indeterminate.example .master.checkbox')
    .checkbox({
      onChecked: function() {
        var
          $childCheckbox  = $(this).closest('.checkbox').siblings('.list').find('.checkbox')
        ;
        $childCheckbox.checkbox('check');
      },
      onUnchecked: function() {
        var
          $childCheckbox  = $(this).closest('.checkbox').siblings('.list').find('.checkbox')
        ;
        $childCheckbox.checkbox('uncheck');
      }
    })
  ;
  $('.indeterminate.example .child.checkbox')
    .checkbox({
      fireOnInit : true,
      onChange   : function() {
        var
          $listGroup      = $(this).closest('.list'),
          $parentCheckbox = $listGroup.closest('.item').children('.checkbox'),
          $checkbox       = $listGroup.find('.checkbox'),
          allChecked      = true,
          allUnchecked    = true
        ;
        $checkbox.each(function() {
          if( $(this).checkbox('is checked') ) {
            allUnchecked = false;
          }
          else {
            allChecked = false;
          }
        });
        if(allChecked) {
          $parentCheckbox.checkbox('set checked');
        }
        else if(allUnchecked) {
          $parentCheckbox.checkbox('set unchecked');
        }
        else {
          $parentCheckbox.checkbox('set indeterminate');
        }
      }
    })
  ;

  // api
  $('.mock.example .button')
    .api({
      loadingDuration: 500,
      // lets just pretend this always works
      mockResponse: {
        success: true
      }
    })
    .state({
      text: {
        inactive   : 'Off',
        active     : 'On'
      }
    })
  ;

  $('.async.example .button')
    .api({
      // lets wait a half second then try your luck
      mockResponseAsync: function(settings, callback) {
        var
          luckyPerson = (Math.random() < 0.5),
          response    = (luckyPerson)
            ? { success: true }
            : { success: false, message: 'You are not lucky' }
        ;
        setTimeout(function() {
          callback(response);
        }, 500);
      },
      successTest: function(response) {
        return response && response.success;
      },
      onFailure: function (response) {
        alert(response.message);
      }
    })
    .state({
      text: {
        inactive : 'Off',
        active   : 'On'
      }
    })
  ;


  $('.external.example .ui.search')
    .search({
      type          : 'category',
      minCharacters : 3,
      apiSettings   : {
        onFailure: function() {
          $(this).search('display message', '<b>Hold off a few minutes</b> <div class="ui divider"></div> GitHub rate limit exceeded for anonymous search.');
        },
        onResponse: function(githubResponse) {
          var
            response = {
              results : {}
            }
          ;
          if(githubResponse.items.length === 0) {
            // no results
            return response;
          }
          $.each(githubResponse.items, function(index, item) {
            var
              language  = item.language || 'Unknown',
              maxLength = 200,
              description
            ;
            if(index >= 8) {
              // only show 8 results
              return false;
            }
            // Create new language category
            if(response.results[language] === undefined) {
              response.results[language] = {
                name    : language,
                results : []
              };
            }
            description = (item.description < maxLength)
                ? item.description
                : item.description.substr(0, maxLength) + '...'
            ;
            description = $.fn.search.settings.templates.escape(description);
            // Add result to category
            response.results[language].results.push({
              title       : item.name,
              description : description,
              url         : item.html_url
            });
          });
          return response;
        },
        url: '//api.github.com/search/repositories?q={query}'
      }
    })
  ;

  // visiblity
  $('.visibility.example .overlay')
    .visibility({
      silent : true,
      type   : 'fixed',
      offset : 15 // give some space from top of screen
    })
  ;


  // menu
  $('.main.container .menu a.item, .main.container .menu .link.item').not('.dropdown.item')
    .on('click', handler.activate)
  ;

  $('.ui.menu .browse.item')
    .popup({
      popup     : '.classes.popup',
      hoverable : true,
      position  : 'bottom left',
      delay     : {
        show: 300,
        hide: 800
      }
    })
  ;
  $('.main.container .ui.menu .ui.search')
    .search({
      type: 'category',
      apiSettings: {
        action: 'categorySearch'
      }
    })
  ;

  // dropdowns
  $('.dropdown.example .ui.dropdown').dropdown();
  $('.user.example .ui.dropdown').dropdown({
    allowAdditions: true
  });

  $('.remote.example .ui.dropdown')
    .dropdown({
      apiSettings: {
        url: '//api.semantic-ui.com/tags/{query}'
      }
    })
  ;

};


// attach ready event
$(document)
  .ready(semantic.new.ready)
;
