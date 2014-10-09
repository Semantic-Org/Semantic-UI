
/* Define API endpoints once globally */
$.fn.api.settings.debug = true;
/* Define API endpoints once globally */
$.fn.api.settings.api = {
  'get followers' : '/followers/{id}?results={count}',
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
  server.autoRespondAfter = 300;

  server
    .respondWith(/\/follow\/(\d+)/, [responseCode, headers, body])
  ;
  server
    .respondWith(/\/search\/(.*)/, [responseCode, headers, body])
  ;
};


// attach ready event
$(document)
  .ready(semantic.api.ready)
;