
$.fn.api.settings.debug = true;

/* Define API endpoints once globally */
$.fn.api.settings.api = {
  'get followers' : '/followers/{id}?results={count}',
  'create user'   : '/create',
  'follow user'   : '/follow/{id}',
  'search'        : '/search/?query={value}'
};

semantic.api = {};
// ready event
semantic.api.ready = function() {

  var
    headers = {
      'Content-Type': 'application/json'
    },
    method = 'GET',
    responseCode = 200,
    body   = '{ "success": "true" }',
    server = sinon.fakeServer.create()
  ;

  server.autoRespond = true;
  server.autoRespondAfter = 600;

  server
    .respondWith(/\/follow\/(\d+)/, [responseCode, headers, body])
  ;
  server
    .respondWith(/\/create\/(.*)/, [responseCode, headers, body])
  ;
  server
    .respondWith(/\/search\/(.*)/, [responseCode, headers, body])
  ;

  $('form .ui.dropdown')
    .dropdown()
  ;

};


// attach ready event
$(document)
  .ready(semantic.api.ready)
;