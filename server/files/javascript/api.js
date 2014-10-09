
/* Define API endpoints once globally */
$.fn.api.settings.debug = true;
$.fn.api.settings.api = {
  'get user'      : '/user/{id}',
  'get followers' : '/followers/{id}?results={count}',
  'follow user'   : '/follow/{id}',
  'add user'      : '/add/{id}',
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
  server.autoRespondAfter = 500;

  server
    .respondWith(/\/follow\/(\d+)/, [responseCode, headers, body])
  ;
};


// attach ready event
$(document)
  .ready(semantic.api.ready)
;