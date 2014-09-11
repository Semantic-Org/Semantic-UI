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
    .respondWith(method, '/api/follow/5209', [responseCode, headers, body])
  ;
};


// attach ready event
$(document)
  .ready(semantic.api.ready)
;