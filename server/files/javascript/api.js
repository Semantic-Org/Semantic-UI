
$.fn.api.settings.debug = true;

/* Define API endpoints once globally */
$.extend($.fn.api.settings.api, {
  'get followers' : '/followers/{id}?results={count}',
  'create user'   : '/create',
  'follow user'   : '/follow/{id}',
  'search'        : '/search/?query={value}'
});

semantic.api = {};
// ready event
semantic.api.ready = function() {

  $.fn.api.settings.responseAsync = function(settings, callback) {
    setTimeout(function() {
      callback({
        "success": "true"
      });
    }, 500);
  };


  $('.response.example .ui.search')
    .search({
      type          : 'category',
      minCharacters : 3,
      apiSettings   : {
        responseAsync : false,
        onFailure     : function() {
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


  $('.test.example .ui.button')
    .api()
  ;
  $('.test.example .ui.input input')
    .api({
      stateContext: '.test.example .ui.input'
    })
  ;

  $('form .ui.dropdown')
    .dropdown()
  ;

};


// attach ready event
$(document)
  .ready(semantic.api.ready)
;
